import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Metodo non consentito' });

  const { dipendente, cliente, progetto, data, ore, note } = req.body;

  try {
    // 1. Salvataggio su Supabase
    await supabase
      .from('registrazione_ore')
      .insert([{ dipendente, cliente, progetto, data, ore: parseFloat(ore), note }]);

    // 2. Invio a Google Calendar
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
      const auth = new google.auth.JWT(
        process.env.GOOGLE_CLIENT_EMAIL,
        null,
        privateKey,
        ['https://www.googleapis.com/auth/calendar']
      );

      const calendar = google.calendar({ version: 'v3', auth });

      await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        requestBody: {
          summary: `${dipendente} - ${cliente} (${ore}h)`,
          description: `Progetto: ${progetto || '-'}\nNote: ${note || '-'}`,
          start: { date: data },
          end: { date: data },
        },
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Errore:', err);
    return res.status(500).json({ error: err.message });
  }
}
