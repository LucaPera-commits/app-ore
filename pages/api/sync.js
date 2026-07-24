import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Metodo non consentito.' });

  try {
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return res.status(500).json({ success: false, message: 'Chiavi Google mancanti.' });
    }

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
      subject: 'info@zoeanna.it'
    });
    
    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'info@zoeanna.it';

    // 1. Prendi gli eventi futuri da Calendar (da ieri in poi)
    const ieri = new Date();
    ieri.setDate(ieri.getDate() - 1);
    
    const calendarRes = await calendar.events.list({
      calendarId,
      timeMin: ieri.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const eventiGoogle = calendarRes.data.items || [];

    // 2. Prendi tutti gli ID degli eventi che l'app GIA' CONOSCE dal Database
    const { data: eventiDb } = await supabase.from('ore_lavorative').select('calendar_event_id');
    const idConosciuti = eventiDb.map(e => e.calendar_event_id);

    let eventiImportati = 0;

    // 3. Confronta e Importa quelli nuovi
    for (const ev of eventiGoogle) {
      // Se l'ID di Calendar non è nel nostro Database, è stato creato a mano su Calendar!
      if (ev.id && !idConosciuti.includes(ev.id)) {
        
        // Trova la data
        const dataEvento = ev.start.date || (ev.start.dateTime ? ev.start.dateTime.split('T')[0] : null);
        
        if (dataEvento) {
          // Inserisce nel Database con valori di Default
          await supabase.from('ore_lavorative').insert([{
            dipendente: 'Da Assegnare', // Lo mettiamo così l'admin lo nota subito
            cliente: ev.summary || 'Evento Senza Titolo',
            progetto: 'Importato da Calendar',
            data: dataEvento,
            ore: 8, // Ore stimate di default
            note: ev.description || '',
            stato: 'pianificato',
            calendar_event_id: ev.id
          }]);
          eventiImportati++;
        }
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: eventiImportati > 0 
        ? `Sincronizzazione completata! ${eventiImportati} nuovi eventi importati.` 
        : `Tutto aggiornato! Nessun nuovo evento trovato su Calendar.` 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Errore durante la sincronizzazione.' });
  }
}
