import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  const { dipendente, cliente, progetto, data, ore, note } = req.body;

  try {
    // 1. SALVATAGGIO SU SUPABASE (Priorità Assoluta)
    const { error: dbError } = await supabase
      .from('ore_lavorative')
      .insert([{ dipendente, cliente, progetto, data, ore, note }]);

    if (dbError) {
      console.error('Errore Supabase:', dbError);
      return res.status(500).json({ message: `Errore Database: ${dbError.message}` });
    }

    // 2. TENTATIVO GOOGLE CALENDAR (Non bloccante)
    let calendarSaved = false;
    try {
      if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
        
        const auth = new google.auth.JWT({
          email: process.env.GOOGLE_CLIENT_EMAIL,
          key: privateKey,
          scopes: ['https://www.googleapis.com/auth/calendar'],
          subject: 'info@zoeanna.it'
        });

        const calendar = google.calendar({ version: 'v3', auth });
        const calendarId = process.env.GOOGLE_CALENDAR_ID || 'info@zoeanna.it';

        await calendar.events.insert({
          calendarId: calendarId,
          requestBody: {
            summary: `${dipendente} - ${cliente} (${ore}h)`,
            description: `Progetto: ${progetto}\nNote: ${note || '-'}`,
            start: { date: data },
            end: { date: data }
          }
        });
        calendarSaved = true;
      }
    } catch (calErr) {
      console.warn('Calendar in attesa di autorizzazione:', calErr.message);
    }

    return res.status(200).json({
      success: true,
      message: calendarSaved 
        ? 'Ore salvate su Supabase e Google Calendar!' 
        : 'Ore salvate con successo nel Database!',
      calendarSaved
    });

  } catch (err) {
    console.error('Errore Generale:', err);
    return res.status(500).json({ message: err.message || 'Errore interno' });
  }
}
