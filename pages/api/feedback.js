import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { includeDeleted } = req.query;
      let query = supabase.from('app_feedback').select('*').order('created_at', { ascending: false });

      // Se non viene richiesto esplicitamente l'archivio completo (admin), mostra solo i commenti attivi
      if (includeDeleted !== 'true') {
        query = query.eq('is_deleted', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data || []);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { autore, categoria, valutazione, messaggio } = req.body;
      if (!autore || !messaggio) {
        return res.status(400).json({ error: 'Autore e messaggio obbligatori.' });
      }

      const { data, error } = await supabase
        .from('app_feedback')
        .insert([
          {
            autore,
            categoria: categoria || '💡 Nuova Funzionalità',
            valutazione: Number(valutazione) || 5,
            messaggio,
            is_deleted: false
          }
        ]);

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Suggerimento inviato!' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, risposta, is_deleted } = req.body;
      if (!id) return res.status(400).json({ error: 'ID mancante.' });

      const updateData = {};
      if (risposta !== undefined) {
        updateData.risposta = risposta;
        updateData.risposta_at = new Date().toISOString();
      }
      if (is_deleted !== undefined) {
        updateData.is_deleted = is_deleted;
      }

      const { data, error } = await supabase
        .from('app_feedback')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Operazione completata!' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Metodo non consentito' });
}
