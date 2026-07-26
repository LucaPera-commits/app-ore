import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ 
        message: 'Variabili Supabase non trovate. Verificare SUPABASE_URL e SUPABASE_KEY su Vercel.' 
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
      return res.status(400).json({ message: 'Campi obbligatori mancanti: dipendente e data.' });
    }

    const startDateStr = String(data).split('T')[0];

    // 1. TENTATIVO DI SALVATAGGIO IN SUPABASE (COMPLETO)
    const payloadCompleto = {
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

    let { data: dbResult, error: dbError } = await supabase
      .from('registrazioni_ore')
      .insert([payloadCompleto])
      .select();

    // 2. FALLBACK (Se mancano colonne come ore_trasferta o ore_backoffice nel DB)
    if (dbError) {
      console.error("Errore Supabase tentato inserimento completo:", dbError);

      const payloadBase = {
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
        .insert([payloadBase])
        .select();

      if (fallbackRes.error) {
        console.error("Errore Supabase fallback:", fallbackRes.error);
        const dettagli = dbError.message || dbError.details || JSON.stringify(dbError);
        return res.status(500).json({ message: `Errore Supabase: ${dettagli}` });
      }

      dbResult = fallbackRes.data;
    }

    // 3. TENTATIVO GOOGLE CALENDAR ISOLATO (Non blocca mai il salvataggio)
    let calendarEventId = null;
    try {
      const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
      const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
      const calendarId = process.env.GOOGLE_CALENDAR_ID;

      if (clientEmail && privateKey && calendarId) {
        const { google } = require('googleapis');
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
      console.warn("Sincronizzazione Google Calendar saltata o fallita:", gErr?.message || gErr);
    }

    return res.status(200).json({
      message: 'Registrazione salvata con successo!',
      data: dbResult ? dbResult[0] : null,
      calendar_event_id: calendarEventId
    });

  } catch (err) {
    console.error("Errore server imprevisto:", err);
    return res.status(500).json({ message: `Errore Server: ${err?.message || err}` });
  }
}
