import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const LISTA_DIPENDENTI = [
  'Luca Pera',
  'Giampaolo Lauro',
  'Federico Boagno',
  'Alessandro Ciule',
  'Davide Procopio'
];

const LISTA_CLIENTI = [
  '3S s.r.l.', 'a2a', 'ALSTOM', 'ALSTOM BOLOGNA', 'API Torino', 'ARNALDI CENTINATURE', 'AROL', 
  'AT SYSTEM SERVICES', 'ATE ELECTRONICS', "ATTIVITA' IN PARTNERSHIP IIS", 
  'BARBERO ROBERTO IMPIANTI TERMOSANITARI', 'BORELLI', 'BOSCO ITALIA S.P.A', 'BUCHER MUNICIPAL', 
  'C.T.L. s.r.l.', 'CAGLIERO S.R.L', 'CAGNAZZO s.n.c', 'CAMA 1 s.p.a', 'CASTIM 2000', 
  'CDR ITALIA S.P.A', 'CHERCHISYSTEM', 'CIEMMEBI', 'COGORNO SERGIO', 'COLMAR Technik Spa', 
  'COMET', 'COMETAL s.r.l', 'COMETTO', 'COSPAL COMPOSITES S.P.A', 'COSTA RODOLFO s.r.l', 
  'DAVIDE BERNARDI', 'DEMONT', 'DIGITALISO', 'DMB', 'ECOTECH', 'EMMEGI SCS', 
  'ENOMECCANICA BOSIO', 'ERREPI', 'FARID', 'GIOLITO', 'GIORDANO LUCA e C. s.a.s', 
  'GT GESTIONI TECNOLOGICHE', 'Hitachi Rail', 'HYDRO', 'ICOSE', 'IDEO TECNICA', 
  'IIS', 'IIS CERT', 'IMI s.r.l', 'Ing. Bertolotti', 'IPV', 'IRIDE', 'ISAF BUS COMPONENTS', 
  'ISOCLIMA', 'Jilin QIXING', 'LIZ ITALIANA', 'MA s.r.l', 'MANPOWER', 'MERLO S.P.A', 
  'MICHELE SALE', 'MONDINO', 'MOVINTER S.R.L', 'MSA DAMPER', 'NKB s.r.l', 'NORD ENGINEERING', 
  'OM3', 'ONN WATER', 'OPERVAL', 'PERANO BRUNO S.R.L', 'PERANO SPA', 'PRINCIPI s.r.l', 
  'PROMETES SISTEMI', 'RECIF', 'RG TECH', 'RI.ME.BO', 'ROLFO', 'S.C.A.M.I.C', 
  'SARACINO COSTRUZIONI', 'SARACINO', 'SAVINO', 'SICMA', 'SIMIC S.P.A', 'SPEICH s.r.l', 'STAT', 
  'STAT_BENACCHIO GROUP', 'STUDIO POLIGEO', 'T.M.C', 'TPL_Borgo S.Dalmazzo', 'TSM', 
  'TUBILINE s.r.l', 'VASILY UDODOV', 'VEGLIA'
];

function matchDipendente(testo) {
  if (!testo) return 'Da Assegnare';
  const t = testo.toLowerCase();
  for (const dip of LISTA_DIPENDENTI) {
    const nomeIniziale = dip.split(' ')[0].toLowerCase();
    if (t.includes(dip.toLowerCase()) || t.includes(nomeIniziale)) {
      return dip;
    }
  }
  return 'Da Assegnare';
}

function matchCliente(testo) {
  if (!testo) return 'Senza Cliente';
  const t = testo.toLowerCase();
  for (const cli of LISTA_CLIENTI) {
    if (t.includes(cli.toLowerCase())) {
      return cli;
    }
  }
  return '';
}

function parseEstrazioneOre(descrizione) {
  let ore = 8;
  let ore_backoffice = 0;
  let ore_trasferta = 0;
  let ore_straordinario = 0;
  let note = '';

  if (!descrizione) return { ore, ore_backoffice, ore_trasferta, ore_straordinario, note };

  const righe = descrizione.split('\n');
  for (const riga of righe) {
    const lower = riga.toLowerCase();
    if (lower.includes('ore cantiere:') || lower.includes('ore:')) {
      const val = parseFloat(riga.replace(/[^0-9.]/g, ''));
      if (!isNaN(val)) ore = val;
    } else if (lower.includes('backoffice:')) {
      const val = parseFloat(riga.replace(/[^0-9.]/g, ''));
      if (!isNaN(val)) ore_backoffice = val;
    } else if (lower.includes('trasferta:')) {
      const val = parseFloat(riga.replace(/[^0-9.]/g, ''));
      if (!isNaN(val)) ore_trasferta = val;
    } else if (lower.includes('straordinario:')) {
      const val = parseFloat(riga.replace(/[^0-9.]/g, ''));
      if (!isNaN(val)) ore_straordinario = val;
    } else if (lower.includes('note:')) {
      note = riga.replace(/note:/i, '').trim();
    }
  }

  return { ore, ore_backoffice, ore_trasferta, ore_straordinario, note };
}

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ message: 'Variabili Supabase mancanti' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!clientEmail || !privateKey || !calendarId) {
      return res.status(400).json({ message: 'Credenziali Google Calendar non configurate su Vercel.' });
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/calendar']
    });

    const calendar = google.calendar({ version: 'v3', auth });

    // Finestra di sincronizzazione: da -30 giorni a +60 giorni
    const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const timeMax = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = response.data.items || [];
    let sincroCount = 0;

    for (const event of events) {
      if (!event.id || !event.summary) continue;

      const calendarEventId = event.id;
      const summary = event.summary.trim();
      const startDateStr = event.start?.date || event.start?.dateTime?.split('T')[0];

      if (!startDateStr) continue;

      let stato = 'pianificato';
      if (summary.includes('[SVOLTO]') || summary.includes('✅')) stato = 'consuntivo';
      if (summary.includes('[IN APPROVAZIONE]')) stato = 'in_approvazione';

      // Parsing del titolo
      let dipendente = matchDipendente(summary);
      let cliente = matchCliente(summary);
      let progetto = '';

      // Estrazione contenuto tra parentesi per il Progetto
      const matchProgetto = summary.match(/\((.*?)\)/);
      if (matchProgetto && matchProgetto[1]) {
        progetto = matchProgetto[1].trim();
      } else {
        // Tentativo di pulizia dal titolo
        progetto = summary
          .replace(/\[.*?\]/g, '')
          .replace(dipendente, '')
          .replace(cliente, '')
          .replace(/[-–—]/g, '')
          .trim();
      }

      // Estrazione dettagli ore dalla descrizione
      const { ore, ore_backoffice, ore_trasferta, ore_straordinario, note } = parseEstrazioneOre(event.description);

      // Auto-Correzione del Titolo su Google Calendar se il formato era irregolare
      const tagStato = stato === 'consuntivo' ? '✅ [SVOLTO]' : '⏳ [PIANIFICATO]';
      const titoloCorretto = `${tagStato} ${dipendente} - ${cliente || 'Attività'} (${progetto || 'Dettagli'})`;

      if (summary !== titoloCorretto && !summary.includes('ASSENZA') && !summary.includes('FERIE')) {
        try {
          await calendar.events.patch({
            calendarId,
            eventId: calendarEventId,
            resource: { summary: titoloCorretto }
          });
        } catch (patchErr) {
          console.warn("Impossibile aggiornare titolo su Calendar:", patchErr?.message);
        }
      }

      // Inserimento o Aggiornamento su Supabase (Upsert)
      const payload = {
        calendar_event_id: calendarEventId,
        dipendente,
        cliente: cliente || 'Senza Cliente',
        progetto: progetto || 'Nessun dettaglio',
        data: startDateStr,
        ore,
        ore_backoffice,
        ore_trasferta,
        ore_straordinario,
        note,
        stato
      };

      // Controlla se l'evento esiste già su Supabase
      const { data: existing } = await supabase
        .from('registrazioni_ore')
        .select('id, stato')
        .eq('calendar_event_id', calendarEventId)
        .maybeSingle();

      if (existing) {
        // Aggiorna senza sovrascrivere se è già stato consuntivato dall'App
        if (existing.stato !== 'consuntivo') {
          await supabase
            .from('registrazioni_ore')
            .update(payload)
            .eq('id', existing.id);
        }
      } else {
        // Inserisce il nuovo evento
        await supabase
          .from('registrazioni_ore')
          .insert([payload]);
      }

      sincroCount++;
    }

    return res.status(200).json({
      message: `Sincronizzazione completata! Processati ${sincroCount} eventi da Google Calendar.`,
      eventiProcessati: sincroCount
    });

  } catch (err) {
    console.error("Errore Sincronizzazione:", err);
    return res.status(500).json({ message: `Errore Sincronizzazione: ${err?.message || err}` });
  }
}
