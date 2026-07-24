import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

// Inizializzazione Client Supabase con fallback sulle variabili d'ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Accetta solo richieste HTTP POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metodo non consentito. Utilizzare POST.' });
  }

  const { dipendente, cliente, progetto, data, ore, note } = req.body;

  // Validazione campi obbligatori
  if (!dipendente || !cliente || !progetto || !data || !ore) {
    return res.status(400).json({ message: 'Compilare tutti i campi obbligatori del modulo.' });
  }

  try {
    // -------------------------------------------------------------
    // 1. SALVATAGGIO PRIMARIO SU SUPABASE
    // -------------------------------------------------------------
    const { data: insertedData, error: dbError } = await supabase
      .from('ore_lavorative')
      .insert([{ dipendente, cliente, progetto, data, ore, note }]);

    if (dbError) {
      console.error('Errore durante l\'inserimento su Supabase:', dbError);
      return res.status(500).json({ 
        message: `Errore Database Supabase: ${dbError.message}` 
      });
    }

    // -------------------------------------------------------------
    // 2. TENTATIVO DI SINCRONIZZAZIONE SU GOOGLE CALENDAR
    // -------------------------------------------------------------
    let calendarSaved = false;
    let calendarErrorMsg = null;

    try {
      const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
      const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;

      if (clientEmail && privateKeyRaw) {
        // Formattazione della Private Key (sostituisce le newlines escape)
        const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

        // Autenticazione con Delega di Dominio (Domain-Wide Delegation)
        const auth = new google.auth.JWT({
          email: clientEmail,
          key: privateKey,
          scopes: ['https://www.googleapis.com/auth/calendar'],
          subject: 'info@zoeanna.it' // Account aziendale impersonato
        });

        const calendar = google.calendar({ version: 'v3', auth });
        const calendarId = process.env.GOOGLE_CALENDAR_ID || 'info@zoeanna.it';

        // Creazione dell'evento su Google Calendar
        await calendar.events.insert({
          calendarId: calendarId,
          requestBody: {
            summary: `${dipendente} - ${cliente} (${ore}h)`,
            description: `Progetto/Commessa: ${progetto}\nNote: ${note || 'Nessuna nota aggiuntiva'}`,
            start: { date: data }, // Evento tutto il giorno
            end: { date: data }
          }
        });

        calendarSaved = true;
      } else {
        calendarErrorMsg = 'Variabili d\'ambiente Google non configurate.';
      }
    } catch (calErr) {
      console.warn('Avviso Google Calendar:', calErr.message);
      calendarErrorMsg = calErr.message;
    }

    // -------------------------------------------------------------
    // 3. RISPOSTA DI CONFERMA ALL'UTENTE
    // -------------------------------------------------------------
    return res.status(200).json({
      success: true,
      message: calendarSaved 
        ? 'Ore registrate con successo sia su Supabase che su Google Calendar! 🎉' 
        : 'Ore salvate con successo nel Database! 💾 (Sincronizzazione Calendar in attesa di autorizzazione)',
      calendarSaved,
      calendarError: calendarErrorMsg
    });

  } catch (err) {
    console.error('Errore Generale del Server:', err);
    return res.status(500).json({ message: err.message || 'Errore interno del server' });
  }
}
