import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function getGoogleAuth() {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    return null;
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar']
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  try {
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

    let calendarEventId = null;

    // 1. CALCOLO DATE E CREAZIONE EVENTO GOOGLE CALENDAR
    const startDateStr = String(data).split('T')[0];
    const startDateObj = new Date(startDateStr);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(endDateObj.getDate() + 1);
    const endDateStr = endDateObj.toISOString().split('T')[0];

    try {
      const auth = getGoogleAuth();
      const calendarId = process.env.GOOGLE_CALENDAR_ID;

      if (auth && calendarId) {
        const calendar = google.calendar({ version: 'v3', auth });

        let etichettaStato = '✅ [SVOLTO]';
        if (stato === 'pianificato') etichettaStato = '⏳ [PIANIFICATO]';
        if (stato === 'in_approvazione') etichettaStato = '⏳ [IN APPROVAZIONE]';

        const summaryText = `${etichettaStato} ${dipendente} - ${cliente || 'Attività'} (${progetto || 'Senza Dettaglio'})`;
        
        let descriptionText = `Svolto da: ${dipendente}\nCliente: ${cliente || '-'}\nProgetto: ${progetto || '-'}\nOre Cantiere/Ordinarie: ${ore}h`;
        if (Number(ore_backoffice) > 0) descriptionText += `\nOre Backoffice: ${ore_backoffice}h`;
        if (Number(ore_trasferta) > 0) descriptionText += `\nOre Trasferta: ${ore_trasferta}h`;
        if (Number(ore_straordinario) > 0) descriptionText += `\nOre Straordinario: ${ore_straordinario}h`;
        if (note) descriptionText += `\n\nNote: ${note}`;

        const eventResource = {
          summary: summaryText,
          description: descriptionText,
          start: { date: startDateStr },
          end: { date: endDateStr }
        };

        const calRes = await calendar.events.insert({
          calendarId: calendarId,
          resource: eventResource
        });

        if (calRes && calRes.data && calRes.data.id) {
          calendarEventId = calRes.data.id;
        }
      }
    } catch (calErr) {
      console.error("Avviso Google Calendar:", calErr?.response?.data || calErr?.message || calErr);
    }

    // 2. SALVATAGGIO NEL DATABASE SUPABASE
    const payloadDb = {
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
      payloadDb.calendar_event_id = calendarEventId;
    }

    let { data: dbResult, error: dbError } = await supabase
      .from('registrazioni_ore')
      .insert([payloadDb])
      .select();

    // FALLBACK IN CASO DI COLONNE MANCANTI NEL DATABASE
    if (dbError) {
      console.error("Errore primo inserimento Supabase:", dbError);

      const fallbackPayload = {
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
        .insert([fallbackPayload])
        .select();

      if (fallbackRes.error) {
        console.error("Errore fallback Supabase:", fallbackRes.error);
        const errMsg = dbError.message || dbError.details || JSON.stringify(dbError);
        return res.status(500).json({ 
          message: `Errore Supabase DB: ${errMsg}`, 
          error: dbError 
        });
      } else {
        dbResult = fallbackRes.data;
      }
    }

    return res.status(200).json({
      message: 'Registrazione salvata con successo!',
      data: dbResult ? dbResult[0] : null,
      calendar_event_id: calendarEventId
    });

  } catch (error) {
    console.error("Errore generale API salva:", error);
    return res.status(500).json({ message: `Errore Server API: ${error?.message || error}` });
  }
}
