import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const calendarId = process.env.GOOGLE_CALENDAR_ID;

async function getGoogleCalendar() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (!clientEmail || !privateKey || !calendarId) return null;

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  return google.calendar({ version: 'v3', auth });
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const { mode } = req.query;
      if (mode === 'all') {
        const { data, error } = await supabase
          .from('eventi_ore')
          .select('*')
          .order('data', { ascending: false });
        if (error) return res.status(500).json({ message: error.message });
        return res.status(200).json(data);
      } else {
        const { data, error } = await supabase
          .from('eventi_ore')
          .select('*')
          .neq('stato', 'annullato')
          .order('data', { ascending: true });
        if (error) return res.status(500).json({ message: error.message });
        return res.status(200).json(data);
      }
    }

    if (req.method === 'PUT') {
      const { id, calendar_event_id, ore_effettive, ore_backoffice, ore_trasferta, dipendente, chiudi_consuntivo } = req.body;

      if (!id) return res.status(400).json({ message: "ID mancante" });

      const updateData = {};
      if (chiudi_consuntivo) {
        updateData.stato = 'consuntivo';
        if (ore_effettive !== undefined) updateData.ore = ore_effettive;
        if (ore_backoffice !== undefined) updateData.ore_backoffice = ore_backoffice;
        if (ore_trasferta !== undefined) updateData.ore_trasferta = ore_trasferta;
      }
      if (dipendente) updateData.dipendente = dipendente;

      const { data: updatedDb, error: dbError } = await supabase
        .from('eventi_ore')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (dbError) return res.status(500).json({ message: dbError.message });

      // Sincronizza l'assegnazione e lo stato direttamente su Google Calendar
      if (calendar_event_id && calendarId) {
        try {
          const calendar = await getGoogleCalendar();
          if (calendar) {
            const eventRes = await calendar.events.get({ calendarId, eventId: calendar_event_id });
            let summary = eventRes.data.summary || '';
            
            let titoloPulito = summary
              .replace(/^(✅ |❌ |❓ )/g, '')
              .replace(/^\[.*?\]\s*/, '')
              .trim();

            const dip = dipendente || updatedDb.dipendente;
            let nuovoSummary = (dip && dip !== 'Da Assegnare') ? `[${dip}] ${titoloPulito}` : titoloPulito;

            if (updatedDb.stato === 'consuntivo' || chiudi_consuntivo) {
              nuovoSummary = `✅ ${nuovoSummary}`;
            }

            await calendar.events.patch({
              calendarId,
              eventId: calendar_event_id,
              requestBody: { summary: nuovoSummary }
            });
          }
        } catch (calError) {
          console.error("Errore aggiornamento Calendar:", calError);
        }
      }

      return res.status(200).json({ message: "Attività aggiornata con successo", data: updatedDb });
    }

    if (req.method === 'DELETE') {
      const { id, calendar_event_id } = req.body;
      if (!id) return res.status(400).json({ message: "ID mancante" });

      const { error: dbError } = await supabase
        .from('eventi_ore')
        .update({ stato: 'annullato' })
        .eq('id', id);

      if (dbError) return res.status(500).json({ message: dbError.message });

      if (calendar_event_id && calendarId) {
        try {
          const calendar = await getGoogleCalendar();
          if (calendar) {
            const eventRes = await calendar.events.get({ calendarId, eventId: calendar_event_id });
            let nuovoTitolo = (eventRes.data.summary || '').replace(/^(✅ |❌ )/g, '').trim();

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

      return res.status(200).json({ message: "Attività annullata e archiviata." });
    }

    return res.status(405).json({ message: "Metodo non consentito" });
  } catch (err) {
    return res.status(500).json({ message: "Errore server interno", error: err.message });
  }
}
