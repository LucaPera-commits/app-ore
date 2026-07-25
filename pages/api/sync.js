import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const calendarId = process.env.GOOGLE_CALENDAR_ID;

const DIPENDENTI_MAPPING = [
  { nomeCompleto: 'Luca Pera', chiavi: ['luca pera', 'luca'] },
  { nomeCompleto: 'Giampaolo Lauro', chiavi: ['giampaolo lauro', 'giampaolo'] },
  { nomeCompleto: 'Federico Boagno', chiavi: ['federico boagno', 'federico'] },
  { nomeCompleto: 'Alessandro Ciule', chiavi: ['alessandro ciule', 'alessandro'] },
  { nomeCompleto: 'Davide Procopio', chiavi: ['davide procopio', 'davide'] }
];

function rilevaDipendenteDaTitolo(summary) {
  if (!summary) return 'Da Assegnare';
  const summaryLower = summary.toLowerCase();

  const matchDip = summary.match(/^\[(.*?)\]/);
  if (matchDip) {
    const dentroQuadre = matchDip[1].trim().toLowerCase();
    for (const dip of DIPENDENTI_MAPPING) {
      if (dip.chiavi.some(k => dentroQuadre.includes(k) || k.includes(dentroQuadre))) {
        return dip.nomeCompleto;
      }
    }
    return matchDip[1].trim(); 
  }

  for (const dip of DIPENDENTI_MAPPING) {
    for (const chiave of dip.chiavi) {
      const regex = new RegExp(`\\b${chiave}\\b`, 'i');
      if (regex.test(summaryLower)) {
        return dip.nomeCompleto;
      }
    }
  }

  return 'Da Assegnare';
}

function rilevaClienteProgetto(summary) {
  const sumLower = (summary || '').toLowerCase();
  
  if (sumLower.includes('ferie')) {
    return { cliente: 'ASSENZE / GIUSTIFICATIVI', progetto: 'Ferie' };
  }
  if (sumLower.includes('permesso') || sumLower.includes('rol')) {
    return { cliente: 'ASSENZE / GIUSTIFICATIVI', progetto: 'Permesso' };
  }
  if (sumLower.includes('malattia')) {
    return { cliente: 'ASSENZE / GIUSTIFICATIVI', progetto: 'Malattia' };
  }

  let titoloPulito = summary
    .replace(/^\[.*?\]\s*/, '')
    .replace(/^(✅ |❌ |❓ )/g, '')
    .trim();

  let [cliente, ...restoProgetto] = titoloPulito.split('-');
  let progetto = restoProgetto.join('-').trim() || 'Attività da Calendar';
  return { cliente: cliente.trim(), progetto };
}

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
  if (req.method !== 'POST') return res.status(405).json({ message: 'Metodo non consentito' });

  try {
    const calendar = await getGoogleCalendar();
    if (!calendar) {
      return res.status(500).json({ message: 'Configurazione Google Calendar mancante su Vercel.' });
    }

    const ora = new Date();
    const timeMin = new Date(ora.getTime() - (90 * 24 * 60 * 60 * 1000)).toISOString();
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
    let aggiornati = 0;

    for (const event of events) {
      if (!event.summary) continue;

      const dipendenteRilevato = rilevaDipendenteDaTitolo(event.summary);
      const { cliente, progetto } = rilevaClienteProgetto(event.summary);

      let dataEvento = null;
      if (event.start?.date) {
        dataEvento = event.start.date;
      } else if (event.start?.dateTime) {
        dataEvento = event.start.dateTime.split('T')[0];
      }

      if (!dataEvento) continue;

      const { data: esistente } = await supabase
        .from('eventi_ore')
        .select('id, dipendente, stato')
        .eq('calendar_event_id', event.id)
        .maybeSingle();

      if (esistente) {
        if ((!esistente.dipendente || esistente.dipendente === 'Da Assegnare') && dipendenteRilevato !== 'Da Assegnare') {
          await supabase
            .from('eventi_ore')
            .update({ dipendente: dipendenteRilevato, cliente, progetto })
            .eq('id', esistente.id);
          
          aggiornati++;
        }
        continue;
      }

      await supabase.from('eventi_ore').insert([{
        calendar_event_id: event.id,
        dipendente: dipendenteRilevato,
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

    return res.status(200).json({ 
      message: `Sincronizzazione completata! ${events.length} analizzati, ${inseriti} nuovi importati, ${aggiornati} aggiornati.` 
    });

  } catch (error) {
    console.error("Errore Sync:", error);
    return res.status(500).json({ message: "Errore durante la sincronizzazione", error: error.message });
  }
}
