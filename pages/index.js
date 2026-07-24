import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [activeTab, setActiveTab] = useState('nuovo');
  
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    dipendente: 'Giampaolo Lauro',
    cliente: '',
    progetto: '',
    data: getTodayStr(),
    ore: 8,
    ore_backoffice: 0,
    note: '',
    stato: 'consuntivo'
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  
  const [programmati, setProgrammati] = useState([]);
  const [loadingProgrammati, setLoadingProgrammati] = useState(false);
  const [filtroDipendente, setFiltroDipendente] = useState('Tutti');

  const [modalItem, setModalItem] = useState(null);
  const [oreEffettive, setOreEffettive] = useState(8);
  const [oreBackofficeEffettive, setOreBackofficeEffettive] = useState(0);

  useEffect(() => {
    const today = getTodayStr();
    const tomorrow = getTomorrowStr();
    if (formData.stato === 'pianificato' && formData.data <= today) {
      setFormData(prev => ({ ...prev, data: tomorrow }));
    }
  }, [formData.stato]);

  const fetchProgrammati = async () => {
    setLoadingProgrammati(true);
    try {
      const res = await fetch('/api/gestisci');
      if (res.ok) setProgrammati(await res.json());
    } catch (e) {
      console.error("Errore caricamento:", e);
    } finally {
      setLoadingProgrammati(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'programmati') fetchProgrammati();
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    const todayStr = getTodayStr();

    if (formData.stato === 'pianificato' && formData.data <= todayStr) {
      setStatusMessage({ type: 'error', text: 'Gli eventi pianificati devono essere nel futuro.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/salva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setStatusMessage({ type: 'success', text: data.message });
        setFormData(prev => ({ ...prev, cliente: '', progetto: '', note: '', ore_backoffice: 0, data: formData.stato === 'pianificato' ? getTomorrowStr() : getTodayStr() }));
        if (activeTab === 'programmati') fetchProgrammati();
      } else {
        setStatusMessage({ type: 'error', text: data.message });
      }
    } catch (err) { setStatusMessage({ type: 'error', text: 'Errore server.' }); } 
    finally { setLoading(false); }
  };

  const handleConfermaChiudi = async () => {
    if (!modalItem) return;
    setLoading(true);
    try {
      const res = await fetch('/api/gestisci', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: modalItem.id,
          calendar_event_id: modalItem.calendar_event_id,
          ore_effettive: oreEffettive,
          ore_backoffice: oreBackofficeEffettive
        })
      });

      if (res.ok) {
        setModalItem(null);
        fetchProgrammati();
      }
    } catch (e) { alert("Errore chiusura evento."); } 
    finally { setLoading(false); }
  };

  const handleElimina = async (item) => {
    if (!confirm(`Vuoi davvero annullare "${item.cliente}"?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/gestisci', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, calendar_event_id: item.calendar_event_id })
      });
      if (res.ok) fetchProgrammati();
    } catch (e) {} 
    finally { setLoading(false); }
  };

  // DIVISIONE EVENTI PASSATI VS FUTURI
  const todayStr = getTodayStr();
  const eventiFiltrati = filtroDipendente === 'Tutti' ? programmati : programmati.filter(p => p.dipendente === filtroDipendente);
  const daConfermare = eventiFiltrati.filter(p => p.data <= todayStr);
  const futuri = eventiFiltrati.filter(p => p.data > todayStr);

  const dipendentiUnici = ['Tutti', ...new Set(programmati.map(p => p.dipendente))];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <Head>
        <title>Gestionale Ore | bw solutions</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* HEADER */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-sky-600 text-white font-bold text-lg px-3 py-1.5 rounded-lg">bw</div>
            <div>
              <h1 className="font-bold text-lg leading-none">bw solutions</h1>
            </div>
          </div>
          <nav className="flex space-x-1 bg-slate-800/80 p-1 rounded-xl text-xs font-medium">
            <button onClick={() => setActiveTab('nuovo')} className={`px-3.5 py-1.5 rounded-lg transition-all ${activeTab === 'nuovo' ? 'bg-sky-600 text-white' : 'text-slate-300'}`}>
              📝 Nuovo Evento
            </button>
            <button onClick={() => setActiveTab('programmati')} className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${activeTab === 'programmati' ? 'bg-sky-600 text-white' : 'text-slate-300'}`}>
              <span>⏳ Gestione Attività</span>
              {programmati.length > 0 && <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-full text-[10px]">{programmati.length}</span>}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* TAB 1: NUOVO */}
        {activeTab === 'nuovo' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-sky-900 p-6 text-white">
              <h2 className="text-xl font-bold">Registro & Programmazione</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormData({ ...formData, stato: 'consuntivo' })} className={`py-2.5 px-3 rounded-lg border text-xs font-semibold ${formData.stato === 'consuntivo' ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-200'}`}>✅ Consuntivo</button>
                  <button type="button" onClick={() => setFormData({ ...formData, stato: 'pianificato' })} className={`py-2.5 px-3 rounded-lg border text-xs font-semibold ${formData.stato === 'pianificato' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-200'}`}>⏳ Pianificato (Futuro)</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Dipendente</label>
                  <input type="text" required value={formData.dipendente} onChange={(e) => setFormData({ ...formData, dipendente: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Data Attività</label>
                  <input type="date" required value={formData.data} min={formData.stato === 'pianificato' ? getTomorrowStr() : undefined} max={formData.stato === 'consuntivo' ? getTodayStr() : undefined} onChange={(e) => setFormData({ ...formData, data: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Cliente</label>
                  <input type="text" required value={formData.cliente} onChange={(e) => setFormData({ ...formData, cliente: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Progetto</label>
                  <input type="text" required value={formData.progetto} onChange={(e) => setFormData({ ...formData, progetto: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">{formData.stato === 'pianificato' ? 'Ore Stimate' : 'Ore Lavorate'}</label>
                  <input type="number" step="0.5" min="0" required value={formData.ore} onChange={(e) => setFormData({ ...formData, ore: parseFloat(e.target.value) })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Ore Backoffice (Casa)</label>
                  <input type="number" step="0.5" min="0" value={formData.ore_backoffice} onChange={(e) => setFormData({ ...formData, ore_backoffice: parseFloat(e.target.value) })} className="w-full px-3.5 py-2.5 rounded-xl border border-sky-200 bg-sky-50" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Note</label>
                <textarea rows={2} value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"></textarea>
              </div>

              {statusMessage && (
                <div className={`p-4 rounded-xl text-sm ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>{statusMessage.text}</div>
              )}

              <button type="submit" disabled={loading} className={`w-full text-white font-semibold py-3.5 rounded-xl ${formData.stato === 'pianificato' ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-sky-600 to-blue-700'}`}>
                {loading ? 'Salvataggio...' : (formData.stato === 'pianificato' ? 'Pianifica Evento ⏳' : 'Salva Consuntivo 🚀')}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: GESTIONE ATTIVITÀ */}
        {activeTab === 'programmati' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-sky-900 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Gestione Attività</h2>
              
              <div className="flex space-x-3">
                <select 
                  value={filtroDipendente} 
                  onChange={(e) => setFiltroDipendente(e.target.value)}
                  className="bg-white/10 text-white text-xs px-2 py-1.5 rounded-lg outline-none border border-white/20"
                >
                  {dipendentiUnici.map(d => <option key={d} value={d} className="text-black">{d}</option>)}
                </select>
                <button onClick={fetchProgrammati} className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/20">🔄</button>
              </div>
            </div>

            <div className="p-6">
              {loadingProgrammati ? <p className="text-center text-slate-500 py-8">Caricamento...</p> : programmati.length === 0 ? (
                <p className="text-center py-12 text-slate-400 font-medium">Nessun evento pianificato!</p>
              ) : (
                <div className="space-y-8">
                  
                  {/* SEZIONE 1: PASSATI DA CONFERMARE */}
                  {daConfermare.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-3 flex items-center">
                        <span className="mr-2">🚨</span> Da Consuntivare (In Ritardo / Passati)
                      </h3>
                      <div className="space-y-3">
                        {daConfermare.map(item => (
                          <div key={item.id} className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col md:flex-row justify-between gap-4">
                            <div>
                              <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2 rounded-full mr-2">{item.data}</span>
                              <span className="text-xs font-semibold text-slate-700">{item.dipendente}</span>
                              <h3 className="font-bold text-slate-800">{item.cliente}</h3>
                              <p className="text-xs text-slate-600">{item.progetto} — <b>{item.ore}h previste</b></p>
                            </div>
                            <div className="flex space-x-2">
                              <button onClick={() => { setModalItem(item); setOreEffettive(item.ore || 8); setOreBackofficeEffettive(item.ore_backoffice || 0); }} className="px-3 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm">✅ Conferma Ore</button>
                              <button onClick={() => handleElimina(item)} className="px-3 bg-white text-rose-600 border border-rose-200 text-xs font-semibold rounded-lg">🗑️</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SEZIONE 2: FUTURI */}
                  {futuri.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-sky-600 uppercase tracking-wider mb-3 flex items-center">
                        <span className="mr-2">⏳</span> Pianificati (Futuri)
                      </h3>
                      <div className="space-y-3">
                        {futuri.map(item => (
                          <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between gap-4">
                            <div>
                              <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 rounded-full mr-2">{item.data}</span>
                              <span className="text-xs font-semibold text-slate-700">{item.dipendente}</span>
                              <h3 className="font-bold text-slate-800">{item.cliente}</h3>
                              <p className="text-xs text-slate-600">{item.progetto}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button onClick={() => handleElimina(item)} className="px-3 py-2 bg-white text-rose-600 border border-rose-200 text-xs font-semibold rounded-lg">🗑️ Annulla Evento</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODALE DI CHIUSURA CONSUNTIVO */}
      {modalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Conferma Attività</h3>
            <p className="text-xs text-slate-500">Conferma o modifica le ore effettivamente lavorate per <b>{modalItem.cliente}</b>.</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Ore Lavorate</label>
                <input type="number" step="0.5" value={oreEffettive} onChange={(e) => setOreEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-sky-600 mb-1">Ore Backoffice</label>
                <input type="number" step="0.5" value={oreBackofficeEffettive} onChange={(e) => setOreBackofficeEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-lg bg-sky-50 border-sky-200" />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button onClick={() => setModalItem(null)} className="w-1/2 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl">Annulla</button>
              <button onClick={handleConfermaChiudi} disabled={loading} className="w-1/2 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl">{loading ? '...' : '✅ Salva Consuntivo'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
