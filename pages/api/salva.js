import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const emailDipendenti = {
  'Giampaolo Lauro': 'g.lauro@zoeanna.it', 'Luca Pera': 'l.pera@zoeanna.it',
  'Federico Boagno': 'f.boagno@zoeanna.it', 'Alessandro Ciule': 'a.ciule@zoeanna.it',
  'Davide Procopio': 'd.procopio@zoeanna.it'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Metodo non consentito.' });

  const { dipendente, cliente, progetto, data, ore, note, stato, ore_backoffice, ore_trasferta } = req.body;
  const statoEvento = stato || 'consuntivo';

  if (!dipendente || !cliente || !progetto || !data || !ore) {
    return res.status(400).json({ message: 'Compila tutti i campi obbligatori.' });
  }

  try {
    const { data: insertedData, error: dbError } = await supabase
      .from('ore_lavorative')
      .insert([{ 
        dipendente, cliente, progetto, data, ore, note, 
        stato: statoEvento, 
        ore_backoffice: ore_backoffice || 0,
        ore_trasferta: ore_trasferta || 0
      }]).select();

    if (dbError) throw new Error(`Errore DB: ${dbError.message}`);
    const rowId = insertedData[0].id;

    let calendarSaved = false;

    try {
      if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        const auth = new google.auth.JWT({
          email: process.env.GOOGLE_CLIENT_EMAIL,
          key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          scopes: ['https://www.googleapis.com/auth/calendar'],
          subject: 'info@zoeanna.it'
        });

        const calendar = google.calendar({ version: 'v3', auth });
        const prefisso = statoEvento === 'pianificato' ? '⏳ [PIANIFICATO]' : '✅';
        const titoloEvento = `${prefisso} ${dipendente} - ${cliente} (${ore}h)`;
        
        let desc = `Progetto: ${progetto}\nNote: ${note || '-'}`;
        if (ore_backoffice > 0) desc += `\n🏠 Ore Backoffice: ${ore_backoffice}h`;
        if (ore_trasferta > 0) desc += `\n🚗 Ore Trasferta: ${ore_trasferta}h`; // Aggiunge info su Calendar

        const listaInvitati = [{ email: 'l.pera@zoeanna.it' }];
        if (emailDipendenti[dipendente] && emailDipendenti[dipendente] !== 'l.pera@zoeanna.it') {
          listaInvitati.push({ email: emailDipendenti[dipendente] });
        }

        const startDateObj = new Date(data);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(endDateObj.getDate() + 1);

        const calendarRes = await calendar.events.insert({
          calendarId: process.env.GOOGLE_CALENDAR_ID || 'info@zoeanna.it',
          sendUpdates: 'all',
          requestBody: {
            summary: titoloEvento, description: desc,
            start: { date: data }, end: { date: endDateObj.toISOString().split('T')[0] },
            attendees: listaInvitati
          }
        });

        await supabase.from('ore_lavorative').update({ calendar_event_id: calendarRes.data.id }).eq('id', rowId);
        calendarSaved = true;
      }
    } catch (calErr) { console.log(calErr); }

    return res.status(200).json({ success: true, message: calendarSaved ? 'Salvato con successo! 🎉' : `Salvato solo su Database.` });
  } catch (err) { return res.status(500).json({ message: err.message }); }
}
