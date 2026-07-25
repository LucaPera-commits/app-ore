import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// CONNESSORE GOOGLE CALENDAR API
function getGoogleCalendarClient() {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!clientEmail || !privateKey || !calendarId) return null;

    if (privateKey.includes('\\n')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    const auth = new google.auth.JWT(
      clientEmail,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/calendar']
    );

    return { calendar: google.calendar({ version: 'v3', auth }), calendarId };
  } catch (err) {
    console.error("Errore inizializzazione Google Calendar:", err);
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('ore_registrate')
        .select('*')
        .order('data', { ascending: false });

      if (error) return res.status(500).json({ message: error.message });
      return res.status(200).json(data || []);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, ore_effettive, ore_backoffice, ore_trasferta, ore_straordinario, dipendente, chiudi_consuntivo, stato } = req.body;
      
      const { data: item, error: fetchErr } = await supabase
        .from('ore_registrate')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !item) {
        return res.status(404).json({ message: 'Scheda non trovata' });
      }

      let updateData = {};
      if (chiudi_consuntivo) {
        updateData = {
          ore: ore_effettive,
          ore_backoffice: ore_backoffice || 0,
          ore_trasferta: ore_trasferta || 0,
          ore_straordinario: ore_straordinario || 0,
          dipendente: dipendente || item.dipendente,
          stato: 'consuntivo'
        };
      } else if (stato) {
        updateData = { stato };
      } else if (dipendente) {
        updateData = { dipendente };
      }

      const { error: updateErr } = await supabase
        .from('ore_registrate')
        .update(updateData)
        .eq('id', id);

      if (updateErr) throw updateErr;

      // 1. APPROVAZIONE: SE PASSA A 'pianificato' DA 'in_approvazione', CREA L'EVENTO SU GOOGLE CALENDAR
      if (stato === 'pianificato' && item.stato === 'in_approvazione') {
        const googleObj = getGoogleCalendarClient();
        if (googleObj) {
          const { calendar, calendarId } = googleObj;
          const dipNome = dipendente || item.dipendente;
          const projNome = item.progetto || 'Ferie/Permesso';
          
          const summary = `🏖️ ${dipNome} - ${projNome}`;

          const eventResource = {
            summary,
            description: `Assenza approvata da Luca Pera tramite BW Solutions APP.\nDipendente: ${dipNome}\nOre: ${item.ore || 8}h\nNote: ${item.note || 'Nessuna'}`,
            start: { date: item.data },
            end: { date: item.data }
          };

          try {
            const calRes = await calendar.events.insert({
              calendarId,
              requestBody: eventResource
            });

            if (calRes.data && calRes.data.id) {
              await supabase
                .from('ore_registrate')
                .update({ calendar_event_id: calRes.data.id })
                .eq('id', id);
            }
          } catch (calErr) {
            console.error("Errore creazione evento Google Calendar:", calErr);
          }
        }
      }

      // 2. CAMBIO STATO AD 'annullato': SE ESISTEVA L'EVENTO GOOGLE CALENDAR, RIMUOVILO SUBITO
      if (stato === 'annullato' && item.calendar_event_id) {
        const googleObj = getGoogleCalendarClient();
        if (googleObj) {
          const { calendar, calendarId } = googleObj;
          try {
            await calendar.events.delete({
              calendarId,
              eventId: item.calendar_event_id
            });
            await supabase
              .from('ore_registrate')
              .update({ calendar_event_id: null })
              .eq('id', id);
          } catch (calErr) {
            console.error("Errore rimosso da Google Calendar:", calErr);
          }
        }
      }

      return res.status(200).json({ message: 'Aggiornato con successo' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id, calendar_event_id } = req.body;

      // Recupera la scheda da Supabase per verificare se possiede un ID evento Google
      const { data: item } = await supabase
        .from('ore_registrate')
        .select('calendar_event_id')
        .eq('id', id)
        .single();

      const eventIdToDelete = (item && item.calendar_event_id) || calendar_event_id;

      // Rimuove dal Database interno
      const { error } = await supabase
        .from('ore_registrate')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // 3. RIMOZIONE DA GOOGLE CALENDAR (se presente)
      if (eventIdToDelete) {
        const googleObj = getGoogleCalendarClient();
        if (googleObj) {
          const { calendar, calendarId } = googleObj;
          try {
            await calendar.events.delete({
              calendarId,
              eventId: eventIdToDelete
            });
          } catch (calErr) {
            // Tolleranza in caso l'evento fosse già stato rimosso a mano da Google
            console.log("Evento non presente su Google Calendar o già rimosso.");
          }
        }
      }

      return res.status(200).json({ message: 'Eliminato e sincronizzato con Google Calendar' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: 'Metodo non consentito' });
}
