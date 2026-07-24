import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [activeTab, setActiveTab] = useState('nuovo'); // 'nuovo' | 'programmati'
  
  // Calcolo delle date (Oggi e Domani)
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
    note: '',
    stato: 'consuntivo' // 'consuntivo' oppure 'pianificato'
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [programmati, setProgrammati] = useState([]);
  const [loadingProgrammati, setLoadingProgrammati] = useState(false);
  const [modalItem, setModalItem] = useState(null);
  const [oreEffettive, setOreEffettive] = useState(8);

  // Auto-correzione data quando si cambia lo stato in "Pianificato"
  useEffect(() => {
    const today = getTodayStr();
    const tomorrow = getTomorrowStr();
    
    if (formData.stato === 'pianificato' && formData.data <= today) {
      setFormData(prev => ({ ...prev, data: tomorrow }));
    }
    // Opzionale: se torna a consuntivo e la data era nel futuro, si potrebbe rimettere a oggi
    // ma lasciamo la libertà di registrare consuntivi passati.
  }, [formData.stato]);

  const fetchProgrammati = async () => {
    setLoadingProgrammati(true);
    try {
      const res = await fetch('/api/gestisci');
      if (res.ok) {
        const data = await res.json();
        setProgrammati(data);
      }
    } catch (e) {
      console.error("Errore caricamento programmati:", e);
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

    // 🔒 Controllo di sicurezza Server/Client sulle date pianificate
    if (formData.stato === 'pianificato' && formData.data <= todayStr) {
      setStatusMessage({ 
        type: 'error', 
        text: 'Errore: Gli eventi pianificati possono essere registrati solo per date future (da domani in poi).' 
      });
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
        setFormData(prev => ({ 
          ...prev, 
          cliente: '', 
          progetto: '', 
          note: '',
          data: formData.stato === 'pianificato' ? getTomorrowStr() : getTodayStr() 
        }));
        if (activeTab === 'programmati') fetchProgrammati();
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Errore durante il salvataggio.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Errore di connessione al server.' });
    } finally {
      setLoading(false);
    }
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
          ore_effettive: oreEffettive
        })
      });

      if (res.ok) {
        setModalItem(null);
        fetchProgrammati();
      }
    } catch (e) {
      alert("Errore durante la chiusura dell'evento.");
    } finally {
      setLoading(false);
    }
  };

  const handleElimina = async (item) => {
    if (!confirm(`Sei sicuro di voler annullare l'evento "${item.cliente} - ${item.progetto}"?\nVerrà rimosso anche da Google Calendar.`)) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/gestisci', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          calendar_event_id: item.calendar_event_id
        })
      });

      if (res.ok) fetchProgrammati();
    } catch (e) {
      alert("Errore durante l'eliminazione dell'evento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <Head>
        <title>Gestionale Ore | bw solutions</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* HEADER / NAVBAR */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-sky-600 text-white font-bold text-lg px-3 py-1.5 rounded-lg tracking-wider shadow-sm">
              bw
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none text-white tracking-tight">bw solutions</h1>
              <p className="text-[10px] text-sky-400 font-medium tracking-wide uppercase mt-0.5">Powered by Zo&amp;annA s.r.l.</p>
            </div>
          </div>

          <nav className="flex space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('nuovo')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'nuovo'
                  ? 'bg-sky-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              📝 Nuovo Evento / Ore
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('programmati')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'programmati'
                  ? 'bg-sky-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>⏳ Programmati</span>
              {programmati.length > 0 && (
                <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
                  {programmati.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* TAB 1: NUOVO INSERIMENTO */}
        {activeTab === 'nuovo' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transition-all">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Registro Attività &amp; Programmazione</h2>
                  <p className="text-slate-300 text-xs mt-1">Registra le ore lavorate o pianifica un evento futuro per il team.</p>
                </div>
                <span className="text-2xl bg-white/10 p-2.5 rounded-xl backdrop-blur-md">📅</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Tipologia Inserimento</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, stato: 'consuntivo' })}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                      formData.stato === 'consuntivo'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>✅ Consuntivo (Ore Lavorate)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, stato: 'pianificato' })}
                    className={`py-2.5 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
                      formData.stato === 'pianificato'
                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>⏳ Pianificato (Evento Futuro)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Dipendente / Tecnico</label>
                  <input
                    type="text"
                    required
                    value={formData.dipendente}
                    onChange={(e) => setFormData({ ...formData, dipendente: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all text-sm font-medium bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Data Attività</label>
                  <input
                    type="date"
                    required
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    /* 👇 QUI IL BLOCCO SUL CALENDARIO UI */
                    min={formData.stato === 'pianificato' ? getTomorrowStr() : undefined} 
                    max={formData.stato === 'consuntivo' ? getTodayStr() : undefined}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all text-sm font-medium bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Cliente</label>
                  <input
                    type="text"
                    placeholder="Es. ERREPI s.r.l"
                    required
                    value={formData.cliente}
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Progetto / Commessa</label>
                  <input
                    type="text"
                    placeholder="Es. Qualifiche Saldatori"
                    required
                    value={formData.progetto}
                    onChange={(e) => setFormData({ ...formData, progetto: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                  {formData.stato === 'pianificato' ? 'Ore Stimate' : 'Ore Lavorate'}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    required
                    value={formData.ore}
                    onChange={(e) => setFormData({ ...formData, ore: parseFloat(e.target.value) })}
                    className="w-32 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all text-sm font-bold text-slate-800"
                  />
                  <div className="flex space-x-1.5">
                    {[4, 8].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setFormData({ ...formData, ore: h })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          formData.ore === h 
                            ? 'bg-sky-100 border-sky-300 text-sky-800' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {h} h
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Note &amp; Dettagli</label>
                <textarea
                  rows={3}
                  placeholder="Descrivi l'attività svolta o pianificata..."
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all text-sm font-medium"
                ></textarea>
              </div>

              {statusMessage && (
                <div className={`p-4 rounded-xl text-sm font-medium flex items-center space-x-2 ${
                  statusMessage.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <span>{statusMessage.type === 'success' ? '✅' : '❌'}</span>
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full text-white font-semibold py-3.5 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 ${
                  formData.stato === 'pianificato'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/20'
                    : 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 shadow-sky-600/20'
                }`}
              >
                {loading ? (
                  <span>Salvataggio in corso...</span>
                ) : (
                  <span>
                    {formData.stato === 'pianificato' ? 'Pianifica Evento Futuro ⏳' : 'Invia Registrazione Ore 🚀'}
                  </span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: GESTIONE EVENTI PROGRAMMATI */}
        {activeTab === 'programmati' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900 p-6 text-white flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Eventi Programmati</h2>
                <p className="text-slate-300 text-xs mt-1">Gestisci le attività pianificate per i prossimi giorni.</p>
              </div>
              <button
                onClick={fetchProgrammati}
                className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition-all"
              >
                🔄 Aggiorna Lista
              </button>
            </div>

            <div className="p-6">
              {loadingProgrammati ? (
                <p className="text-center text-slate-500 text-sm py-8">Caricamento eventi in corso...</p>
              ) : programmati.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <span className="text-4xl block mb-2">🎉</span>
                  <p className="text-sm font-medium">Nessun evento in sospeso o programmato!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {programmati.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 uppercase">
                            ⏳ Pianificato
                          </span>
                          <span className="text-xs font-bold text-slate-700">{item.data}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-semibold text-sky-700">{item.dipendente}</span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-base">{item.cliente}</h3>
                        <p className="text-xs text-slate-600 font-medium">{item.progetto} — <span className="font-bold text-slate-700">{item.ore}h previste</span></p>
                        {item.note && <p className="text-xs text-slate-500 mt-1 italic">"{item.note}"</p>}
                      </div>

                      <div className="flex items-center space-x-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                        <button
                          onClick={() => {
                            setModalItem(item);
                            setOreEffettive(item.ore || 8);
                          }}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1"
                        >
                          <span>✅ Chiudi a Consuntivo</span>
                        </button>
                        <button
                          onClick={() => handleElimina(item)}
                          className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 text-xs font-semibold rounded-lg transition-all"
                        >
                          <span>🗑️ Annulla</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODALE DI CHIUSURA CONSUNTIVO */}
      {modalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Chiudi Evento a Consuntivo</h3>
            <p className="text-xs text-slate-500">
              Stai completando l'attività per <strong className="text-slate-700">{modalItem.cliente}</strong> ({modalItem.progetto}). Conferma le ore effettive lavorate:
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Ore Effettive Lavorate</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={oreEffettive}
                onChange={(e) => setOreEffettive(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setModalItem(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
              >
                Annulla
              </button>
              <button
                onClick={handleConfermaChiudi}
                disabled={loading}
                className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
              >
                {loading ? 'Salvataggio...' : 'Conferma e Chiudi ✅'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
