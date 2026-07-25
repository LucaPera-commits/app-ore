import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const calendarId = process.env.GOOGLE_CALENDAR_ID;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Metodo non consentito' });

  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (!clientEmail || !privateKey || !calendarId) {
      return res.status(500).json({ message: 'Configurazione Google Calendar mancante nelle variabili Vercel.' });
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Finestra temporale: 60 giorni nel passato e 180 nel futuro
    const ora = new Date();
    const timeMin = new Date(ora.getTime() - (60 * 24 * 60 * 60 * 1000)).toISOString();
    const timeMax = new Date(ora.getTime() + (180 * 24 * 60 * 60 * 1000)).toISOString();

    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    let inseriti = 0;

    for (const event of events) {
      if (!event.summary) continue;

      // Estrai eventuale nome dipendente [Nome] dal titolo
      const matchDip = event.summary.match(/^\[(.*?)\]/);
      let dipendente = matchDip ? matchDip[1].trim() : 'Da Assegnare';

      // Pulisci il titolo del cliente/progetto
      let titoloPulito = event.summary.replace(/^\[.*?\]\s*/, '').replace(/^(✅ |❌ |❓ )/g, '').trim();
      let [cliente, ...restoProgetto] = titoloPulito.split('-');
      let progetto = restoProgetto.join('-').trim() || 'Attività da Calendar';
      cliente = cliente.trim();

      const dataEvento = event.start.date || (event.start.dateTime ? event.start.date: event.start.dateTime.split('T')[0]);

      if (!dataEvento) continue;

      // Verifica se l'evento esiste già su Supabase tramite calendar_event_id
      const { data: esistente } = await supabase
        .from('eventi_ore')
        .select('id')
        .eq('calendar_event_id', event.id)
        .maybeSingle();

      if (!esistente) {
        // Inserisci nuovo evento pianificato
        await supabase.from('eventi_ore').insert([{
          calendar_event_id: event.id,
          dipendente,
          cliente,
          progetto,
          data: dataEvento,
          ore: 8,
          ore_backoffice: 0,
          ore_trasferta: 0,
          stato: 'pianificato',
          note: event.description || 'Importato da Google Calendar'
        }]);
        inseriti++;
      }
    }

    return res.status(200).json({ 
      message: `Sincronizzazione completata! Trovati ${events.length} eventi su Calendar, ${inseriti} nuovi importati.` 
    });

  } catch (error) {
    console.error("Errore Sync:", error);
    return res.status(500).json({ message: "Errore durante la sincronizzazione", error: error.message });
  }
}
