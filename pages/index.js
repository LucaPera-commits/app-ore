import { useState } from 'react';

export default function Home() {
  const [form, setForm] = useState({
    dipendente: '',
    cliente: '',
    progetto: '',
    data: new Date().toISOString().split('T')[0],
    ore: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const res = await fetch('/api/salva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setMsg('✅ Ore registrate con successo!');
        setForm({ dipendente: '', cliente: '', progetto: '', data: new Date().toISOString().split('T')[0], ore: '', note: '' });
      } else {
        setMsg('❌ Errore durante il salvataggio.');
      }
    } catch (err) {
      setMsg('❌ Errore di connessione.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '30px auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#111' }}>📋 Registro Ore</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <label>Dipendente:
          <input type="text" required value={form.dipendente} onChange={e => setForm({...form, dipendente: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </label>
        <label>Cliente:
          <input type="text" required value={form.cliente} onChange={e => setForm({...form, cliente: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </label>
        <label>Progetto:
          <input type="text" value={form.progetto} onChange={e => setForm({...form, progetto: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </label>
        <label>Data:
          <input type="date" required value={form.data} onChange={e => setForm({...form, data: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </label>
        <label>Ore Lavorate:
          <input type="number" step="0.5" required value={form.ore} onChange={e => setForm({...form, ore: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #ccc' }} />
        </label>
        <label>Note / Descrizione:
          <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})} style={{ width: '100%', padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #ccc', minHeight: '80px' }} />
        </label>
        <button type="submit" disabled={loading} style={{ padding: '12px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
          {loading ? 'Salvataggio in corso...' : 'Invia Registrazione'}
        </button>
      </form>
      {msg && <p style={{ marginTop: '20px', textAlign: 'center', fontWeight: 'bold' }}>{msg}</p>}
    </div>
  );
}
