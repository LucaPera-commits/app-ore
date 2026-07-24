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

  // GET: Recupera attività
  if (req.method === 'GET') {
    const { mode } = req.query;
    let query = supabase.from('ore_lavorative').select('*').order('data', { ascending: false });
    
    // Se mode non è 'all', recupera solo quelle da consuntivare o pianificate
    if (mode !== 'all') {
      query = query.eq('stato', 'pianificato').order('data', { ascending: true });
    }
    
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // PUT: Chiusura consuntivo
  if (req.method === 'PUT') {
    const { id, calendar_event_id, ore_effettive, ore_backoffice, ore_trasferta } = req.body;
    
    await supabase.from('ore_lavorative').update({ 
      stato: 'consuntivo', 
      ore: ore_effettive,
      ore_backoffice: ore_backoffice || 0,
      ore_trasferta: ore_trasferta || 0 
    }).eq('id', id);

    if (calendar && calendar_event_id) {
      try {
        const ev = await calendar.events.get({ calendarId, eventId: calendar_event_id });
        let newSummary = ev.data.summary.replace('⏳ [PIANIFICATO]', '✅ [CHIUSO]');
        newSummary = newSummary.replace(/\([0-9.]+h\)/, `(${ore_effettive}h)`);
        
        let newDesc = ev.data.description || '';
        if (ore_backoffice > 0 && !newDesc.includes('Ore Backoffice')) newDesc += `\n🏠 Ore Backoffice Consuntivate: ${ore_backoffice}h`;
        if (ore_trasferta > 0 && !newDesc.includes('Ore Trasferta')) newDesc += `\n🚗 Ore Trasferta: ${ore_trasferta}h`;

        await calendar.events.patch({ calendarId, eventId: calendar_event_id, requestBody: { summary: newSummary, description: newDesc } });
      } catch (e) {}
    }
    return res.status(200).json({ success: true, message: 'Evento chiuso a consuntivo!' });
  }

  // DELETE: Annullamento evento
  if (req.method === 'DELETE') {
    const { id, calendar_event_id } = req.body;
    await supabase.from('ore_lavorative').delete().eq('id', id);
    if (calendar && calendar_event_id) {
      try { await calendar.events.delete({ calendarId, eventId: calendar_event_id, sendUpdates: 'all' }); } catch (e) {}
    }
    return res.status(200).json({ success: true, message: 'Evento annullato!' });
  }
}
