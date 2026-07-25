import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Auto-creazione della tabella nel database Postgres se non esiste già
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS app_feedback (
        id SERIAL PRIMARY KEY,
        autore VARCHAR(255) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        valutazione INT DEFAULT 5,
        messaggio TEXT NOT NULL,
        data_ora TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
  } catch (err) {
    console.error("Inizializzazione tabella feedback:", err);
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM app_feedback ORDER BY data_ora DESC LIMIT 100;`;
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { autore, categoria, valutazione, messaggio } = req.body;
      if (!autore || !messaggio) {
        return res.status(400).json({ error: 'Autore e messaggio sono obbligatori.' });
      }

      await sql`
        INSERT INTO app_feedback (autore, categoria, valutazione, messaggio)
        VALUES (${autore}, ${categoria || 'Suggerimento'}, ${valutazione || 5}, ${messaggio});
      `;
      return res.status(200).json({ success: true, message: 'Suggerimento inviato con successo!' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Metodo non consentito' });
}
