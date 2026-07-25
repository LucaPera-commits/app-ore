import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  try {
    const { 
      dipendente, cliente, progetto, data, 
      ore, ore_backoffice, ore_trasferta, ore_straordinario, 
      note, stato 
    } = req.body;

    if (!dipendente || !data) {
      return res.status(400).json({ message: 'Dipendente e data sono obbligatori.' });
    }

    const payload = {
      dipendente,
      cliente: cliente || '',
      progetto: progetto || '',
      data,
      ore: Number(ore) || 0,
      ore_backoffice: Number(ore_backoffice) || 0,
      ore_trasferta: Number(ore_trasferta) || 0,
      ore_straordinario: Number(ore_straordinario) || 0,
      note: note || '',
      stato: stato || 'consuntivo'
    };

    const { data: responseData, error } = await supabase
      .from('ore_registrate')
      .insert([payload]);

    if (error) {
      console.error("Errore Supabase Salva:", error);
      return res.status(500).json({ message: error.message });
    }

    return res.status(200).json({ message: 'Registrazione salvata con successo!' });
  } catch (error) {
    console.error("Errore Server Salva:", error);
    return res.status(500).json({ message: error.message });
  }
}
