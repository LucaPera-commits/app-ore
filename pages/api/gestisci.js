import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  let calendar = null;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'info@zoeanna.it';
  try {
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      const auth = new google.auth.JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/calendar'],
        subject: 'info@zoeanna.it'
      });
      calendar = google.calendar({ version: 'v3', auth });
    }
  } catch (e) {}

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('ore_lavorative').select('*').eq('stato', 'pianificato').order('data', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    const { id, calendar_event_id, ore_effettive, ore_backoffice } = req.body;
    
    // Aggiorna DB includendo le ore di backoffice modificate
    await supabase.from('ore_lavorative').update({ 
      stato: 'consuntivo', 
      ore: ore_effettive,
      ore_backoffice: ore_backoffice || 0 
    }).eq('id', id);

    // Aggiorna Calendar
    if (calendar && calendar_event_id) {
      try {
        const ev = await calendar.events.get({ calendarId, eventId: calendar_event_id });
        let newSummary = ev.data.summary.replace('⏳ [PIANIFICATO]', '✅ [CHIUSO]');
        newSummary = newSummary.replace(/\([0-9.]+h\)/, `(${ore_effettive}h)`); // Aggiorna le ore nel titolo
        
        let newDesc = ev.data.description || '';
        if (ore_backoffice > 0) newDesc += `\n🏠 Ore Backoffice Consuntivate: ${ore_backoffice}h`;

        await calendar.events.patch({ calendarId, eventId: calendar_event_id, requestBody: { summary: newSummary, description: newDesc } });
      } catch (e) {}
    }
    return res.status(200).json({ success: true, message: 'Evento chiuso a consuntivo!' });
  }

  if (req.method === 'DELETE') {
    const { id, calendar_event_id } = req.body;
    await supabase.from('ore_lavorative').delete().eq('id', id);
    if (calendar && calendar_event_id) {
      try { await calendar.events.delete({ calendarId, eventId: calendar_event_id, sendUpdates: 'all' }); } catch (e) {}
    }
    return res.status(200).json({ success: true, message: 'Evento annullato!' });
  }
}
