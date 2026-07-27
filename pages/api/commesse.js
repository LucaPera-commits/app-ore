// ... existing code ...
  // ANAGRAFICA CLIENTI REALE DA SUPABASE
  const [dbClienti, setDbClienti] = useState([]);
  const [loadingClienti, setLoadingClienti] = useState(false);
  const [modalCliente, setModalCliente] = useState(null);
  const [searchCliente, setSearchCliente] = useState('');

  // COMMESSE & BUDGET ERP
  const [dbCommesse, setDbCommesse] = useState([]);
  const [loadingCommesse, setLoadingCommesse] = useState(false);
  const [modalCommessa, setModalCommessa] = useState(null);
  const [searchCommessa, setSearchCommessa] = useState('');

  // APPUNTI / PDM REALI DA SUPABASE
  const [dbAppunti, setDbAppunti] = useState([]);
// ... existing code ...
  // FETCH COMMESSE DA SUPABASE
  const fetchCommesse = async () => {
    setLoadingCommesse(true);
    try {
      const res = await fetch('/api/commesse');
      if (res.ok) {
        const data = await res.json();
        setDbCommesse(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error("Errore fetch commesse:", e); }
    finally { setLoadingCommesse(false); }
  };

  useEffect(() => {
    if (currentUser && isMounted) {
      fetchClienti();
      fetchCommesse();
      fetchAppunti();
    }
  }, [currentUser, activeTab, isMounted]);
// ... existing code ...
  // SALVATAGGIO REALE COMMESSA SU SUPABASE
  const handleSalvaCommessa = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/commesse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modalCommessa)
      });
      if (res.ok) {
        setModalCommessa(null);
        fetchCommesse();
      } else { alert("Errore nel salvataggio della commessa."); }
    } catch (err) { alert("Errore di rete."); }
    finally { setLoading(false); }
  };
// ... existing code ...
          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1.5 overflow-x-auto md:overflow-x-visible text-sm font-semibold">
            {navHistory.length > 0 && <button onClick={handleGoBack} className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl mb-2 transition-all flex gap-2 cursor-pointer"><span>⬅️</span> Indietro</button>}
            <button onClick={() => navigateTo('home')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'home' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>🏠 Home</button>
            <button onClick={() => navigateTo('planner')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'planner' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📅 Planner Team</button>
            <button onClick={() => navigateTo('nuovo')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'nuovo' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📝 Inserisci Ore</button>
            <button onClick={() => navigateTo('programmati')} className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${activeTab === 'programmati' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
              <div className="flex gap-3">⏳ Attività</div>
              {(mostraDaAssegnare && daAssegnareItems.length > 0) && <span className="bg-amber-500 text-white font-black px-2 py-0.5 rounded-full text-[10px]">{daAssegnareItems.length}</span>}
            </button>
            
            <button onClick={() => navigateTo('commesse')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'commesse' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📐 Commesse &amp; Budget</button>
            <button onClick={() => navigateTo('anagrafiche')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'anagrafiche' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>🏢 Anagrafiche</button>
            <button onClick={() => navigateTo('appunti')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'appunti' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📓 Appunti/PDM</button>

            <button onClick={() => navigateTo('documenti', pathNC)} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'documenti' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📂 Cloud Aruba</button>
            <button onClick={() => navigateTo('feedback')} className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${activeTab === 'feedback' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
              <div className="flex gap-3">💡 Feedback</div>
              {unreadFeedbackCount > 0 && <span className="bg-purple-500 text-white font-black px-2 py-0.5 rounded-full text-[10px] animate-pulse">{unreadFeedbackCount}</span>}
            </button>
            {currentUser?.ruolo === 'admin' && (
              <button onClick={() => navigateTo('cruscotto')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'cruscotto' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📊 Reportistica</button>
            )}
          </nav>
// ... existing code ...
        {/* TAB COMMESSE & BUDGET ERP */}
        {activeTab === 'commesse' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2"><span>📐</span> Commesse &amp; Controllo Budget Ore</h2>
                <p className="text-xs text-slate-500 mt-1">Monitora l'avanzamento dei cantieri e il consumo del budget ore autorizzato.</p>
              </div>
              {currentUser?.ruolo === 'admin' && (
                <button onClick={() => setModalCommessa({ titolo: '', cliente_id: '', budget_ore: 50, stato: 'aperta' })} className="bg-sky-600 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-md hover:bg-sky-500 transition-colors cursor-pointer">
                  + Nuova Commessa
                </button>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <input type="text" placeholder="Cerca commessa o cliente..." value={searchCommessa} onChange={e => setSearchCommessa(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-sky-500" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {dbCommesse
                  .filter(c => c.titolo.toLowerCase().includes(searchCommessa.toLowerCase()) || (c.clienti?.ragione_sociale || '').toLowerCase().includes(searchCommessa.toLowerCase()))
                  .map(com => {
                    const oreUsate = safeStorico
                      .filter(s => s && s.stato === 'consuntivo' && s.progetto && s.progetto.toLowerCase() === com.titolo.toLowerCase())
                      .reduce((acc, curr) => acc + Number(curr.ore || 0) + Number(curr.ore_backoffice || 0), 0);

                    const percentuale = com.budget_ore > 0 ? Math.min(100, Math.round((oreUsate / com.budget_ore) * 100)) : 0;
                    const superato = com.budget_ore > 0 && oreUsate > com.budget_ore;

                    return (
                      <div key={com.id} className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3 relative overflow-hidden shadow-2xs">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-black uppercase text-sky-600 bg-sky-100 px-2 py-0.5 rounded">{com.clienti?.ragione_sociale || 'Cliente Generale'}</span>
                            <h3 className="font-bold text-slate-900 text-base mt-1">{com.titolo}</h3>
                            <span className="text-[10px] font-mono text-slate-400">{com.codice_commessa}</span>
                          </div>
                          <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${com.stato === 'aperta' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                            {com.stato}
                          </span>
                        </div>

                        {/* Barra di avanzamento Budget Ore */}
                        <div className="space-y-1 pt-2">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-500">Avanzamento Ore:</span>
                            <span className={superato ? "text-rose-600 font-black" : "text-slate-800"}>
                              {oreUsate} / {com.budget_ore} h ({percentuale}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className={`h-2.5 rounded-full transition-all ${superato ? 'bg-rose-500' : percentuale > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${percentuale}%` }}
                            ></div>
                          </div>
                          {superato && <p className="text-[10px] font-bold text-rose-600">⚠️ Attenzione: Budget ore superato!</p>}
                        </div>

                        {currentUser?.ruolo === 'admin' && (
                          <div className="pt-2 text-right border-t border-slate-200/60">
                            <button onClick={() => setModalCommessa(com)} className="text-xs font-bold text-sky-600 hover:underline">Modifica Commessa</button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {dbCommesse.length === 0 && (
                  <div className="col-span-full text-center py-8 text-slate-400 text-sm">
                    {loadingCommesse ? 'Caricamento commesse...' : 'Nessuna commessa registrata.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB ANAGRAFICHE */}
// ... existing code ...
      {/* MODALE NUOVA COMMESSA */}
      {modalCommessa && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">{modalCommessa.id ? 'Modifica Commessa' : 'Nuova Commessa ERP'}</h3>
              <button onClick={() => setModalCommessa(null)} className="text-slate-400 hover:bg-slate-100 w-8 h-8 rounded-full font-black text-base flex items-center justify-center cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSalvaCommessa} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Cliente *</label>
                <select value={modalCommessa.cliente_id || ''} onChange={e=>setModalCommessa({...modalCommessa, cliente_id: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-sky-500">
                  <option value="">-- Seleziona Cliente --</option>
                  {dbClienti.map(c => <option key={c.id} value={c.id}>{c.ragione_sociale}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Titolo / Nome Commessa *</label>
                <input type="text" required placeholder="Es. Collaudo Impianto X" value={modalCommessa.titolo || ''} onChange={e=>setModalCommessa({...modalCommessa, titolo: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-sky-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Budget Ore Preventivate</label>
                  <input type="number" min="0" value={modalCommessa.budget_ore || 0} onChange={e=>setModalCommessa({...modalCommessa, budget_ore: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Stato Commessa</label>
                  <select value={modalCommessa.stato || 'aperta'} onChange={e=>setModalCommessa({...modalCommessa, stato: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none">
                    <option value="aperta">🟢 Aperta</option>
                    <option value="in_sospeso">🟡 In Sospeso</option>
                    <option value="chiusa">🔴 Chiusa</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalCommessa(null)} className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl cursor-pointer">Annulla</button>
                <button type="submit" disabled={loading} className="w-2/3 py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-md cursor-pointer">{loading ? '...' : 'Salva Commessa 🚀'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE NUOVO/MODIFICA CLIENTE */}
// ... existing code ...
