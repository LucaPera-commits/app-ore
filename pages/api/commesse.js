import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ message: 'Variabili d\'ambiente Supabase mancanti.' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // GET: Recupera tutte le commesse con il totale delle ore già erogate
  if (req.method === 'GET') {
    const { data: commesse, error: errCommesse } = await supabase
      .from('commesse')
      .select('*, clienti(ragione_sociale)')
      .order('created_at', { ascending: false });

    if (errCommesse) return res.status(500).json({ error: errCommesse.message });

    return res.status(200).json(commesse || []);
  }

  // POST: Crea o aggiorna una commessa
  if (req.method === 'POST') {
    const { id, cliente_id, codice_commessa, titolo, budget_ore, stato } = req.body;

    if (!titolo || !titolo.trim()) {
      return res.status(400).json({ message: 'Il titolo della commessa è obbligatorio.' });
    }

    const payload = {
      cliente_id: cliente_id || null,
      codice_commessa: codice_commessa ? codice_commessa.trim() : `COM-${Date.now().toString().slice(-4)}`,
      titolo: titolo.trim(),
      budget_ore: Number(budget_ore) || 0,
      stato: stato || 'aperta',
      updated_at: new Date().toISOString()
    };

    if (id) {
      const { data, error } = await supabase
        .from('commesse')
        .update(payload)
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ message: 'Commessa aggiornata', data: data[0] });
    } else {
      const { data, error } = await supabase
        .from('commesse')
        .insert([payload])
        .select();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ message: 'Commessa creata', data: data[0] });
    }
  }

  return res.status(405).json({ message: 'Metodo non consentito' });
}
