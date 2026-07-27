import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ message: 'Variabili d\'ambiente Supabase mancanti.' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // GET: Recupera l'elenco completo dei clienti ordinati per Ragione Sociale
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('clienti')
      .select('*')
      .order('ragione_sociale', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }

  // POST: Inserisce o aggiorna un cliente
  if (req.method === 'POST') {
    const { id, ragione_sociale, partita_iva, codice_fiscale, indirizzo, email, telefono, sdi_pec, note } = req.body;

    if (!ragione_sociale || !ragione_sociale.trim()) {
      return res.status(400).json({ message: 'La Ragione Sociale è un campo obbligatorio.' });
    }

    const payload = {
      ragione_sociale: ragione_sociale.trim(),
      partita_iva: partita_iva ? partita_iva.trim() : null,
      codice_fiscale: codice_fiscale ? codice_fiscale.trim() : null,
      indirizzo: indirizzo ? indirizzo.trim() : null,
      email: email ? email.trim() : null,
      telefono: telefono ? telefono.trim() : null,
      sdi_pec: sdi_pec ? sdi_pec.trim() : null,
      note: note ? note.trim() : null,
      updated_at: new Date().toISOString()
    };

    if (id) {
      const { data, error } = await supabase
        .from('clienti')
        .update(payload)
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ message: 'Cliente aggiornato con successo', data: data[0] });
    } else {
      const { data, error } = await supabase
        .from('clienti')
        .insert([payload])
        .select();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ message: 'Cliente creato con successo', data: data[0] });
    }
  }

  // DELETE: Elimina un cliente
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: 'ID cliente obbligatorio.' });

    const { error } = await supabase.from('clienti').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: 'Cliente eliminato con successo' });
  }

  return res.status(405).json({ message: 'Metodo non consentito' });
}
