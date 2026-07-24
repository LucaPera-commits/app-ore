import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Leggi tutti i preventivi
    const { data, error } = await supabase.from('preventivi').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  } 
  
  if (req.method === 'POST') {
    // Salva un nuovo preventivo
    const payload = req.body;
    const { data, error } = await supabase.from('preventivi').insert([payload]);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: 'Preventivo salvato con successo!' });
  }

  if (req.method === 'PUT') {
    // Aggiorna un preventivo esistente o cambia stato
    const { id, ...updateData } = req.body;
    const { data, error } = await supabase.from('preventivi').update(updateData).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ message: 'Preventivo aggiornato!' });
  }

  return res.status(405).json({ message: 'Metodo non consentito' });
}
