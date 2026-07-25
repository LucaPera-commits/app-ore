import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  // Disabilita la cache lato Vercel per garantire dati freschi al 100%
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('ore_registrate')
        .select('*')
        .order('data', { ascending: false });

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(200).json(data || []);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, ore_effettive, ore_backoffice, ore_trasferta, ore_straordinario, dipendente, chiudi_consuntivo, stato } = req.body;
      
      let updateData = {};
      if (chiudi_consuntivo) {
        updateData = {
          ore: ore_effettive,
          ore_backoffice: ore_backoffice || 0,
          ore_trasferta: ore_trasferta || 0,
          ore_straordinario: ore_straordinario || 0,
          dipendente: dipendente,
          stato: 'consuntivo'
        };
      } else if (stato) {
        updateData = { stato };
      } else if (dipendente) {
        updateData = { dipendente };
      }

      const { error } = await supabase
        .from('ore_registrate')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ message: 'Aggiornato con successo' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      const { error } = await supabase
        .from('ore_registrate')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ message: 'Eliminato con successo' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: 'Metodo non consentito' });
}
