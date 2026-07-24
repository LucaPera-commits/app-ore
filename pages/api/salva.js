import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const emailDipendenti = {
  'Giampaolo Lauro': 'g.lauro@zoeanna.it',
  'Luca Pera': 'l.pera@zoeanna.it',
  'Federico Boagno': 'f.boagno@zoeanna.it',
  'Alessandro Ciule': 'a.ciule@zoeanna.it',
  'Davide Procopio': 'd.procopio@zoeanna.it'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Metodo non consentito.' });

  const { dipendente, cliente, progetto, data, ore, note, stato } = req.body;
  const statoEvento = stato || 'consuntivo'; // Default a "consuntivo" se non specificato

  if (!dipendente || !cliente || !progetto || !data || !ore) {
    return res.status(400).json({ message: 'Compila tutti i campi obbligatori.' });
  }

  try {
    // 1. SALVA SU SUPABASE (e recupera l'ID della riga)
    const { data: insertedData, error: dbError } = await supabase
      .from('ore_lavorative')
      .insert([{ dipendente, cliente, progetto, data, ore, note, stato: statoEvento }])
      .select(); // Fondamentale per ottenere l'ID

    if (dbError) throw new Error(`Errore Database: ${dbError.message}`);
    const rowId = insertedData[0].id;

    // 2. TENTATIVO GOOGLE CALENDAR
    let calendarSaved = false;
    let calendarErrorDetails = null;

    try {
      const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
      const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;

      if (clientEmail && privateKeyRaw) {
        const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
        const startDateObj = new Date(data);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(endDateObj.getDate() + 1);

        const auth = new google.auth.JWT({
          email: clientEmail,
          key: privateKey,
          scopes: ['https://www.googleapis.com/auth/calendar'],
          subject: 'info@zoeanna.it'
        });

        const calendar = google.calendar({ version: 'v3', auth });
        
        // Costruisci il titolo: se è pianificato metti un'icona diversa
        const prefisso = statoEvento === 'pianificato' ? '⏳ [PIANIFICATO]' : '✅';
        const titoloEvento = `${prefisso} ${dipendente} - ${cliente} (${ore}h)`;

        const listaInvitati = [{ email: 'l.pera@zoeanna.it' }];
        const emailTecnico = emailDipendenti[dipendente];
        if (emailTecnico && emailTecnico !== 'l.pera@zoeanna.it') {
          listaInvitati.push({ email: emailTecnico });
        }

        const calendarRes = await calendar.events.insert({
          calendarId: process.env.GOOGLE_CALENDAR_ID || 'info@zoeanna.it',
          sendUpdates: 'all',
          requestBody: {
            summary: titoloEvento,
            description: `Progetto: ${progetto}\nNote: ${note || '-'}`,
            start: { date: data },
            end: { date: endDateObj.toISOString().split('T')[0] },
            attendees: listaInvitati
          }
        });

        // 3. AGGIORNA SUPABASE CON L'ID DEL CALENDARIO
        const calendarEventId = calendarRes.data.id;
        await supabase.from('ore_lavorative').update({ calendar_event_id: calendarEventId }).eq('id', rowId);
        
        calendarSaved = true;
      }
    } catch (calErr) {
      calendarErrorDetails = calErr.message;
    }

    return res.status(200).json({
      success: true,
      message: calendarSaved ? 'Salvato su Database e Calendar! 🎉' : `Salvato su DB! (Calendar err: ${calendarErrorDetails})`
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
