import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getGoogleCalendar() {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) return null;
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar']
  });
  return google.calendar({ version: 'v3', auth });
}

export default async function handler(req, res) {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (req.method === 'GET') {
    const mode = req.query.mode;
    let query = supabase.from('ore_lavorative').select('*').order('data', { ascending: false });
    
    if (mode !== 'all') {
      query = query.eq('stato', 'pianificato');
    }
    
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // MODIFICA / RIASSEGNAZIONE / CONSUNTIVAZIONE
  if (req.method === 'PUT') {
    const { id, calendar_event_id, ore_effettive, ore_backoffice, ore_trasferta, dipendente, chiudi_consuntivo } = req.body;
    
    const payload = {};

    // Se si sta eseguendo la chiusura definitiva (Consuntivo)
    if (chiudi_consuntivo) {
      payload.stato = 'consuntivo';
      if (ore_effettive !== undefined) payload.ore = ore_effettive;
      if (ore_backoffice !== undefined) payload.ore_backoffice = ore_backoffice;
      if (ore_trasferta !== undefined) payload.ore_trasferta = ore_trasferta;
    } 

    if (dipendente) payload.dipendente = dipendente;

    // 1. Aggiorna il database Supabase
    const { data: updatedData, error: dbError } = await supabase
      .from('ore_lavorative')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (dbError) return res.status(500).json({ error: dbError.message });

    const itemFinale = updatedData || {};
    const dipendenteFinale = payload.dipendente || itemFinale.dipendente;
    const statoFinale = payload.stato || itemFinale.stato;

    // 2. Aggiorna Google Calendar in tempo reale
    if (calendar_event_id && calendarId) {
      try {
        const calendar = await getGoogleCalendar();
        if (calendar) {
          const eventRes = await calendar.events.get({ calendarId, eventId: calendar_event_id });
          let nuovoTitolo = eventRes.data.summary || '';

          // Rimuove eventuali emoji o tag precedenti per ricostruire il titolo pulito
          nuovoTitolo = nuovoTitolo.replace(/^(✅ |❌ )/g, '').trim();
          nuovoTitolo = nuovoTitolo.replace(/\s*\[.*?\]/g, '').trim();

          // Aggiunge il nuovo tag nome se assegnato a un tecnico
          if (dipendenteFinale && dipendenteFinale !== 'Da Assegnare') {
            const primoNome = dipendenteFinale.split(' ')[0]; // Prende ad es. "Luca"
            nuovoTitolo = `${nuovoTitolo} [${primoNome}]`;
          }

          // Aggiunge la spunta verde se l'intervento è chiuso
          if (statoFinale === 'consuntivo') {
            nuovoTitolo = `✅ ${nuovoTitolo}`;
          }

          await calendar.events.patch({
            calendarId,
            eventId: calendar_event_id,
            requestBody: { summary: nuovoTitolo }
          });
        }
      } catch (calError) {
        console.error("Errore modifica Calendar:", calError);
      }
    }

    return res.status(200).json({ message: 'Aggiornato con successo' });
  }

  // ELIMINAZIONE / ANNULLAMENTO
  if (req.method === 'DELETE') {
    const { id, calendar_event_id } = req.body;
    
    const { error: dbError } = await supabase.from('ore_lavorative').delete().eq('id', id);
    if (dbError) return res.status(500).json({ error: dbError.message });

    if (calendar_event_id && calendarId) {
      try {
        const calendar = await getGoogleCalendar();
        if (calendar) {
          const eventRes = await calendar.events.get({ calendarId, eventId: calendar_event_id });
          let nuovoTitolo = eventRes.data.summary || '';
          nuovoTitolo = nuovoTitolo.replace(/^(✅ |❌ )/g, '').trim();
          
          await calendar.events.patch({
            calendarId,
            eventId: calendar_event_id,
            requestBody: { summary: `❌ [ANNULLATO] ${nuovoTitolo}` }
          });
        }
      } catch (calError) {
        console.error("Errore annullamento Calendar:", calError);
      }
    }

    return res.status(200).json({ message: 'Eliminato con successo' });
  }

  return res.status(405).json({ message: 'Metodo non consentito' });
}
