import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Mappa delle email aziendali dei dipendenti
const emailDipendenti = {
  'Giampaolo Lauro': 'g.lauro@zoeanna.it',
  'Luca Pera': 'l.pera@zoeanna.it',
  'Federico Boagno': 'f.boagno@zoeanna.it',
  'Alessandro Ciule': 'a.ciule@zoeanna.it',
  'Davide Procopio': 'd.procopio@zoeanna.it'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metodo non consentito.' });
  }

  const { dipendente, cliente, progetto, data, ore, note } = req.body;

  if (!dipendente || !cliente || !progetto || !data || !ore) {
    return res.status(400).json({ message: 'Compilare tutti i campi obbligatori del modulo.' });
  }

  try {
    // 1. SALVATAGGIO SU SUPABASE
    const { error: dbError } = await supabase
      .from('ore_lavorative')
      .insert([{ dipendente, cliente, progetto, data, ore, note }]);

    if (dbError) {
      console.error('Errore Supabase:', dbError);
      return res.status(500).json({ message: `Errore Database Supabase: ${dbError.message}` });
    }

    // 2. TENTATIVO GOOGLE CALENDAR
    let calendarSaved = false;
    let calendarErrorDetails = null;

    try {
      const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
      const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;

      if (clientEmail && privateKeyRaw) {
        const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

        // Calcolo data fine (+1 giorno per eventi tutto il giorno)
        const startDateObj = new Date(data);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(endDateObj.getDate() + 1);
        const endDateStr = endDateObj.toISOString().split('T')[0];

        const auth = new google.auth.JWT({
          email: clientEmail,
          key: privateKey,
          scopes: ['https://www.googleapis.com/auth/calendar'],
          subject: 'info@zoeanna.it'
        });

        const calendar = google.calendar({ version: 'v3', auth });
        const calendarId = process.env.GOOGLE_CALENDAR_ID || 'info@zoeanna.it';

        // Determina gli invitati (sempre Luca Pera + l'eventuale dipendente selezionato)
        const listaInvitati = [{ email: 'l.pera@zoeanna.it' }];
        const emailTecnico = emailDipendenti[dipendente];
        if (emailTecnico && emailTecnico !== 'l.pera@zoeanna.it') {
          listaInvitati.push({ email: emailTecnico });
        }

        await calendar.events.insert({
          calendarId: calendarId,
          sendUpdates: 'all', // Forza Google a notificare e mostrare l'invito nei calendari personali
          requestBody: {
            summary: `${dipendente} - ${cliente} (${ore}h)`,
            description: `Progetto/Commessa: ${progetto}\nNote: ${note || 'Nessuna nota'}`,
            start: { date: data },
            end: { date: endDateStr },
            attendees: listaInvitati
          }
        });

        calendarSaved = true;
      } else {
        calendarErrorDetails = 'Chiavi d\'ambiente Google mancanti su Vercel.';
      }
    } catch (calErr) {
      console.error('Errore Google Calendar:', calErr);
      calendarErrorDetails = calErr.message || JSON.stringify(calErr);
    }

    // 3. RISPOSTA
    if (calendarSaved) {
      return res.status(200).json({
        success: true,
        message: 'Ore salvate con successo sia nel Database che su Google Calendar! 🎉'
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `Ore salvate nel Database! 💾 (Calendar: ${calendarErrorDetails})`
      });
    }

  } catch (err) {
    console.error('Errore Generale:', err);
    return res.status(500).json({ message: err.message || 'Errore interno del server' });
  }
}
