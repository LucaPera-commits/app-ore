import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  try {
    // 1. Inizializzazione Client Supabase con chiavi di fallback
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        message: 'Configurazione mancante: verificare le chiavi Supabase nelle variabili d\'ambiente di Vercel.' 
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      dipendente,
      cliente,
      progetto,
      data,
      ore = 8,
      ore_backoffice = 0,
      ore_trasferta = 0,
      ore_straordinario = 0,
      note = '',
      stato = 'consuntivo'
    } = req.body;

    if (!dipendente || !data) {
      return res.status(400).json({ message: 'Campi obbligatori mancanti (dipendente, data).' });
    }

    const startDateStr = String(data).split('T')[0];

    // 2. Creazione Evento Google Calendar (Isolato in Try-Catch)
    let calendarEventId = null;
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

        const startDateObj = new Date(startDateStr);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(endDateObj.getDate() + 1);
        const endDateStr = endDateObj.toISOString().split('T')[0];

        let etichettaStato = '✅ [SVOLTO]';
        if (stato === 'pianificato') etichettaStato = '⏳ [PIANIFICATO]';
        if (stato === 'in_approvazione') etichettaStato = '⏳ [IN APPROVAZIONE]';

        const summaryText = `${etichettaStato} ${dipendente} - ${cliente || 'Attività'} (${progetto || 'Senza Dettaglio'})`;
        let descriptionText = `Svolto da: ${dipendente}\nCliente: ${cliente || '-'}\nProgetto: ${progetto || '-'}\nOre Cantiere: ${ore}h`;
        if (Number(ore_backoffice) > 0) descriptionText += `\nBackoffice: ${ore_backoffice}h`;
        if (Number(ore_trasferta) > 0) descriptionText += `\nTrasferta: ${ore_trasferta}h`;
        if (Number(ore_straordinario) > 0) descriptionText += `\nStraordinario: ${ore_straordinario}h`;
        if (note) descriptionText += `\n\nNote: ${note}`;

        const calendar = google.calendar({ version: 'v3', auth });
        const calRes = await calendar.events.insert({
          calendarId,
          resource: {
            summary: summaryText,
            description: descriptionText,
            start: { date: startDateStr },
            end: { date: endDateStr }
          }
        });

        if (calRes?.data?.id) {
          calendarEventId = calRes.data.id;
        }
      }
    } catch (gErr) {
      console.error("Google Calendar Error (non-bloccante):", gErr?.message || gErr);
    }

    // 3. TENTATIVO 1: Inserimento Completo nel DB Supabase
    const fullPayload = {
      dipendente,
      cliente: cliente || '',
      progetto: progetto || '',
      data: startDateStr,
      ore: Number(ore) || 0,
      ore_backoffice: Number(ore_backoffice) || 0,
      ore_trasferta: Number(ore_trasferta) || 0,
      ore_straordinario: Number(ore_straordinario) || 0,
      note: note || '',
      stato
    };

    if (calendarEventId) {
      fullPayload.calendar_event_id = calendarEventId;
    }

    let { data: dbResult, error: dbError } = await supabase
      .from('registrazioni_ore')
      .insert([fullPayload])
      .select();

    // 4. TENTATIVO 2 (FALLBACK): Se il tentativo 1 fallisce per colonne mancano sul DB
    if (dbError) {
      console.error("Errore Inserimento Completo Supabase:", dbError);

      const minimalPayload = {
        dipendente,
        cliente: cliente || '',
        progetto: progetto || '',
        data: startDateStr,
        ore: Number(ore) || 0,
        note: note || '',
        stato
      };

      const fallbackRes = await supabase
        .from('registrazioni_ore')
        .insert([minimalPayload])
        .select();

      if (fallbackRes.error) {
        console.error("Errore Inserimento Fallback Supabase:", fallbackRes.error);
        const msgDettagliato = dbError.message || dbError.details || JSON.stringify(dbError);
        return res.status(500).json({ 
          message: `Errore Supabase DB: ${msgDettagliato}` 
        });
      }

      dbResult = fallbackRes.data;
    }

    return res.status(200).json({
      message: 'Registrazione salvata con successo!',
      data: dbResult ? dbResult[0] : null,
      calendar_event_id: calendarEventId
    });

  } catch (err) {
    console.error("Errore Imprevisto Server API salva:", err);
    return res.status(500).json({ 
      message: `Errore Server: ${err?.message || 'Eccezione sconosciuta'}` 
    });
  }
}
