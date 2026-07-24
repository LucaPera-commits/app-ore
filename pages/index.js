import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [formData, setFormData] = useState({
    dipendente: 'Giampaolo Lauro',
    cliente: '',
    progetto: '',
    data: new Date().toISOString().split('T')[0],
    ore: 8,
    note: ''
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/salva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMessage({ type: 'success', text: data.message });
        setFormData(prev => ({ ...prev, cliente: '', progetto: '', note: '' }));
      } else {
        setStatusMessage({ type: 'error', text: data.message || 'Errore durante il salvataggio.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Errore di connessione al server.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Head>
        <title>Gestionale Ore | bw solutions</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* HEADER / NAVBAR */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-sky-600 text-white font-bold text-lg px-3 py-1.5 rounded-lg tracking-wider shadow-sm">
              bw
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none text-white tracking-tight">bw solutions</h1>
              <p className="text-[10px] text-sky-400 font-medium tracking-wide uppercase mt-0.5">Powered by Zo&annA s.r.l.</p>
            </div>
          </div>
          <nav className="flex space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50 text-xs font-medium">
            <button className="px-3 py-1.5 rounded-lg bg-sky-600 text-white shadow-sm transition-all">
              ⏱️ Registro Ore
            </button>
            <button className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all opacity-60 cursor-not-allowed">
              📄 Preventivi (Presto)
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          
          {/* Card Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Registro Ore Lavorative</h2>
                <p className="text-slate-300 text-xs mt-1">Inserisci le attività svolte per aggiornare il database ed il calendario aziendale.</p>
              </div>
              <span className="text-2xl bg-white/10 p-2.5 rounded-xl backdrop-blur-md">📝</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Dipendente & Data */}
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all text-sm font-medium bg-slate-50/50"
                />
              </div>
            </div>

            {/* Cliente & Progetto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Cliente</label>
                <input
                  type="text"
                  placeholder="Es. COSTA RODOLFO s.r.l"
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
                  placeholder="Es. ISO 9001 / Qualifiche Saldatori"
                  required
                  value={formData.progetto}
                  onChange={(e) => setFormData({ ...formData, progetto: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            {/* Ore Lavorate */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Ore Lavorate</label>
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

            {/* Note / Descrizione */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Note & Dettagli Attività</label>
              <textarea
                rows={3}
                placeholder="Descrivi brevemente l'attività svolta..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all text-sm font-medium"
              ></textarea>
            </div>

            {/* Messaggio Stato */}
            {statusMessage && (
              <div className={`p-4 rounded-xl text-sm font-medium flex items-center space-x-2 animate-fade-in ${
                statusMessage.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                <span>{statusMessage.type === 'success' ? '✅' : '❌'}</span>
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-sky-600/20 hover:shadow-sky-600/30 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Salvataggio in corso...</span>
              ) : (
                <span>Invia Registrazione Ore 🚀</span>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
