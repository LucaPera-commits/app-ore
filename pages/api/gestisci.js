import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// HELPER PER CONNESSIONE GOOGLE CALENDAR
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
  // Disabilita la cache lato Vercel
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
      
      // 1. Preleva la scheda attuale da Supabase
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

      // 2. Aggiorna il database Supabase
      const { error: updateErr } = await supabase
        .from('ore_registrate')
        .update(updateData)
        .eq('id', id);

      if (updateErr) throw updateErr;

      // 3. SE VIENE APPROVATA (stato passa a 'pianificato'): PUBBLICA SU GOOGLE CALENDAR
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

      return res.status(200).json({ message: 'Aggiornato con successo' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;

      // Recupera calendar_event_id prima di eliminare da Supabase
      const { data: item } = await supabase
        .from('ore_registrate')
        .select('calendar_event_id')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('ore_registrate')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Se l'evento era presente su Google Calendar, rimuovilo
      if (item && item.calendar_event_id) {
        const googleObj = getGoogleCalendarClient();
        if (googleObj) {
          const { calendar, calendarId } = googleObj;
          try {
            await calendar.events.delete({
              calendarId,
              eventId: item.calendar_event_id
            });
          } catch (calErr) {
            console.error("Errore cancellazione Google Calendar:", calErr);
          }
        }
      }

      return res.status(200).json({ message: 'Eliminato con successo' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: 'Metodo non consentito' });
}
