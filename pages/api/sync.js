import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function getGoogleCalendar() {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) return null;
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar']
  });
  return google.calendar({ version: 'v3', auth });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) {
    return res.status(400).json({ message: 'ID Calendario non configurato.' });
  }

  try {
    const calendar = await getGoogleCalendar();
    if (!calendar) {
      return res.status(500).json({ message: 'Errore di configurazione Google Calendar.' });
    }

    // 1. Recupera gli eventi da Google Calendar (range: da 30 giorni fa a 90 giorni nel futuro)
    const now = new Date();
    const timeMin = new Date(now.setDate(now.getDate() - 30)).toISOString();
    const timeMax = new Date(now.setDate(now.getDate() + 120)).toISOString();

    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const calEvents = response.data.items || [];

    // 2. Recupera le attività pianificate già presenti nel database Supabase
    const { data: dbItems, error: dbError } = await supabase
      .from('ore_lavorative')
      .select('*')
      .eq('stato', 'pianificato')
      .not('calendar_event_id', 'is', null);

    if (dbError) throw dbError;

    // Set con gli ID degli eventi attivi e non annullati su Google Calendar
    const activeCalEventIds = new Set(
      calEvents.filter(e => e.status !== 'cancelled').map(e => e.id)
    );

    // 3. PULIZIA AUTOMATICA: Trova ed elimina gli eventi cancellati da Google Calendar
    const itemsToDelete = dbItems.filter(item => !activeCalEventIds.has(item.calendar_event_id));
    let deletedCount = 0;

    if (itemsToDelete.length > 0) {
      const idsToDelete = itemsToDelete.map(i => i.id);
      const { error: delError } = await supabase
        .from('ore_lavorative')
        .delete()
        .in('id', idsToDelete);

      if (!delError) {
        deletedCount = itemsToDelete.length;
      }
    }

    // 4. IMPORTAZIONE NUOVI EVENTI
    let insertedCount = 0;
    const existingEventIdsInDb = new Set(dbItems.map(i => i.calendar_event_id));

    for (const event of calEvents) {
      if (event.status === 'cancelled') continue;
      if (existingEventIdsInDb.has(event.id)) continue; // Già presente nel DB

      const eventDate = event.start.date || (event.start.dateTime ? event.start.dateTime.split('T')[0] : null);
      if (!eventDate) continue;

      let title = event.summary || 'Senza Titolo';
      let dipendente = 'Da Assegnare';

      // Se nel titolo c'è un tag [Nome], prova ad assegnare il tecnico in automatico
      const matchDip = title.match(/\[(.*?)\]/);
      if (matchDip && matchDip[1]) {
        const nomeEstratto = matchDip[1].toLowerCase();
        if (nomeEstratto.includes('luca')) dipendente = 'Luca Pera';
        else if (nomeEstratto.includes('giampaolo')) dipendente = 'Giampaolo Lauro';
        else if (nomeEstratto.includes('federico')) dipendente = 'Federico Boagno';
        else if (nomeEstratto.includes('alessandro')) dipendente = 'Alessandro Ciule';
        else if (nomeEstratto.includes('davide')) dipendente = 'Davide Procopio';
      }

      // Pulisce il titolo per usarlo come Nome Cliente
      let clientePulito = title.replace(/^(✅ |❌ )/g, '').replace(/\s*\[.*?\]/g, '').trim();

      const { error: insertError } = await supabase.from('ore_lavorative').insert([{
        cliente: clientePulito || 'Da definire',
        progetto: 'Sincronizzato da Calendar',
        data: eventDate,
        ore: 8,
        ore_backoffice: 0,
        ore_trasferta: 0,
        dipendente: dipendente,
        stato: 'pianificato',
        calendar_event_id: event.id
      }]);

      if (!insertError) insertedCount++;
    }

    // Costruisce il messaggio di risposta dinamico
    let msg = "Sincronizzazione completata!";
    if (insertedCount > 0 && deletedCount > 0) {
      msg = `Sincronizzazione ok: ➕ ${insertedCount} nuovi eventi, 🗑️ ${deletedCount} eliminati perché rimossi da Calendar.`;
    } else if (insertedCount > 0) {
      msg = `Sincronizzazione ok: ➕ ${insertedCount} nuovi eventi importati.`;
    } else if (deletedCount > 0) {
      msg = `Sincronizzazione ok: 🗑️ ${deletedCount} eventi eliminati perché rimossi da Calendar.`;
    } else {
      msg = "Sincronizzazione ok: nessuna modifica trovata su Calendar.";
    }

    return res.status(200).json({ message: msg });

  } catch (err) {
    console.error("Errore Sync:", err);
    return res.status(500).json({ message: "Errore durante la sincronizzazione con Google Calendar." });
  }
}
