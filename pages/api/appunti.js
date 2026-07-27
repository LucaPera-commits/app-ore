import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ message: 'Variabili d\'ambiente Supabase mancanti.' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // GET: Recupera tutti gli appunti PDM
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('appunti_pdm')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }

  // POST: Crea una nuova revisione PDM
  if (req.method === 'POST') {
    const { cliente, progetto, testo, autore } = req.body;

    if (!cliente || !progetto || !testo || !testo.trim()) {
      return res.status(400).json({ message: 'Cliente, Progetto e Testo sono obbligatori.' });
    }

    const nomeCliente = cliente.trim();
    const nomeProgetto = progetto.trim();

    // Calcolo automatico della revisione successiva
    const { data: esistenti } = await supabase
      .from('appunti_pdm')
      .select('versione')
      .eq('titolo', nomeProgetto);

    let maxVersione = 0;
    if (esistenti && esistenti.length > 0) {
      maxVersione = Math.max(...esistenti.map(e => Number(e.versione || 1)));
    }

    const nuovaVersione = maxVersione + 1;

    // Recupera l'ID del cliente se presente
    const { data: clienteRecord } = await supabase
      .from('clienti')
      .select('id')
      .ilike('ragione_sociale', nomeCliente)
      .maybeSingle();

    const payload = {
      cliente_id: clienteRecord ? clienteRecord.id : null,
      titolo: nomeProgetto,
      testo: testo.trim(),
      versione: nuovaVersione,
      autore: autore || 'Sistema',
      created_at: new Date().toISOString()
    };

    const { data: inserito, error } = await supabase
      .from('appunti_pdm')
      .insert([payload])
      .select();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({
      message: `Revisione v${nuovaVersione} creata con successo!`,
      data: inserito[0]
    });
  }

  return res.status(405).json({ message: 'Metodo non consentito' });
}
