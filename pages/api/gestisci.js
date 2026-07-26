import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

export default async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('registrazioni_ore')
      .select('*')
      .order('data', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }

  if (req.method === 'PUT') {
    const { id, calendar_event_id, dipendente, ore_effettive, ore_backoffice, ore_trasferta, ore_straordinario, chiudi_consuntivo, stato } = req.body;

    let updatePayload = {};
    if (dipendente) updatePayload.dipendente = dipendente;
    if (stato) updatePayload.stato = stato;
    if (chiudi_consuntivo) updatePayload.stato = 'consuntivo';
    if (ore_effettive !== undefined) updatePayload.ore = ore_effettive;
    if (ore_backoffice !== undefined) updatePayload.ore_backoffice = ore_backoffice;
    if (ore_trasferta !== undefined) updatePayload.ore_trasferta = ore_trasferta;
    if (ore_straordinario !== undefined) updatePayload.ore_straordinario = ore_straordinario;

    const { data: updated, error } = await supabase
      .from('registrazioni_ore')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) return res.status(500).json({ error: error.message });

    if (calendar_event_id) {
      try {
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
        const calendarId = process.env.GOOGLE_CALENDAR_ID;

        if (clientEmail && privateKey && calendarId) {
          const auth = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/calendar']
          });
          const calendar = google.calendar({ version: 'v3', auth });

          const record = updated[0];
          const isDaAssegnare = !record.dipendente || record.dipendente.toLowerCase() === 'da assegnare';
          let tag = '⏳ [PIANIFICATO]';
          if (record.stato === 'consuntivo') tag = '✅ [SVOLTO]';
          if (isDaAssegnare) tag = '❓ [DA ASSEGNARE]';

          const newSummary = `${tag} ${record.dipendente} - ${record.cliente || 'Attività'} (${record.progetto || 'Dettagli'})`;

          await calendar.events.patch({
            calendarId,
            eventId: calendar_event_id,
            resource: { summary: newSummary }
          });
        }
      } catch (gErr) {
        console.warn("Aggiornamento Google Calendar fallito:", gErr);
      }
    }

    return res.status(200).json({ message: 'Aggiornato con successo', data: updated ? updated[0] : null });
  }

  if (req.method === 'DELETE') {
    const { id, calendar_event_id } = req.body;
    const { error } = await supabase
      .from('registrazioni_ore')
      .update({ stato: 'annullato' })
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });

    if (calendar_event_id) {
      try {
        const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
        const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
        const calendarId = process.env.GOOGLE_CALENDAR_ID;
        if (clientEmail && privateKey && calendarId) {
          const auth = new google.auth.JWT({
            email: clientEmail,
            key: privateKey,
            scopes: ['https://www.googleapis.com/auth/calendar']
          });
          const calendar = google.calendar({ version: 'v3', auth });
          await calendar.events.delete({ calendarId, eventId: calendar_event_id });
        }
      } catch (e) {}
    }

    return res.status(200).json({ message: 'Annullato' });
  }

  return res.status(405).json({ message: 'Metodo non consentito' });
}
