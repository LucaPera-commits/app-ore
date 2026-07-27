// ... existing code ...
  // MODALE ITEM ED EDITING ATTIVITÀ
  const [modalItem, setModalItem] = useState(null);
  const [modalRapportino, setModalRapportino] = useState(null); // MODALE PER PREVIEW E STAMPA RAPPROTINO PDF
  const [oreEffettive, setOreEffettive] = useState(8);
// ... existing code ...
  // APRI RAPPROTINO PDF
  const handleGeneraRapportino = (item) => {
    setModalRapportino(item);
  };

  const handleStampaRapportino = () => {
    window.print();
  };
// ... existing code ...
            {/* SUBTAB 2: FATTURAZIONE */}
            {subTabReport === 'fatturazione' && (
              <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base">🧾 Report Ore da Fatturare ({filtroMeseReport})</h3>
                  <select value={filtroClienteFatturazione} onChange={e => setFiltroClienteFatturazione(e.target.value)} className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 outline-none">
                    <option value="Tutti">Tutti i Clienti</option>
                    {listaClientiCompleta.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                        <th className="py-3 px-3">Data</th>
                        <th className="py-3 px-3">Cliente</th>
                        <th className="py-3 px-3">Commessa / Progetto</th>
                        <th className="py-3 px-3">Eseguito da</th>
                        <th className="py-3 px-3 text-center">Cantiere</th>
                        <th className="py-3 px-3 text-center">Backoffice</th>
                        <th className="py-3 px-3 text-center">Azione</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {[...safeStorico]
                        .filter(item => item && getNormalizedDate(item.data).startsWith(filtroMeseReport) && (filtroClienteFatturazione === 'Tutti' || item.cliente === filtroClienteFatturazione) && item.stato === 'consuntivo' && !isAssenza(item))
                        .sort((a, b) => new Date(getNormalizedDate(b.data)) - new Date(getNormalizedDate(a.data)))
                        .map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-sky-50/80 transition-colors">
                            <td className="py-2.5 px-3 text-slate-500 font-bold">{getNormalizedDate(item.data)}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{toText(item.cliente)}</td>
                            <td className="py-2.5 px-3 text-slate-700">{toText(item.progetto)}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{toText(item.dipendente)}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-900">{item.ore || 0} h</td>
                            <td className="py-2.5 px-3 text-center font-bold text-sky-700">{item.ore_backoffice || 0} h</td>
                            <td className="py-2.5 px-3 text-center">
                              <button onClick={() => handleGeneraRapportino(item)} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg shadow-xs cursor-pointer">📄 Rapportino PDF</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
// ... existing code ...
      {/* MODALE EDITING ATTIVITÀ CON PROTEZIONE FERIE */}
      {modalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">{modalItem.stato === 'consuntivo' ? 'Dettaglio Intervento' : 'Scheda Attività'}</h3>
              <button onClick={() => setModalItem(null)} className="text-slate-400 hover:bg-slate-100 w-8 h-8 rounded-full font-black text-base flex items-center justify-center transition-colors cursor-pointer">✕</button>
            </div>
            
            <div className="space-y-4 pt-2">
              <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Cliente</label><input type="text" list="lista-aziende" value={clienteEffettivo} onChange={e=>setClienteEffettivo(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-sky-500" /></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Progetto</label><input type="text" value={progettoEffettivo} onChange={e=>setProgettoEffettivo(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-sky-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Ore Cantiere</label><input type="number" step="0.5" value={oreEffettive} onChange={e=>setOreEffettive(parseFloat(e.target.value))} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold outline-none" /></div>
                <div><label className="block text-xs font-bold text-sky-600 mb-1.5 uppercase tracking-wide">Backoffice</label><input type="number" step="0.5" value={oreBackofficeEffettive} onChange={e=>setOreBackofficeEffettive(parseFloat(e.target.value))} className="w-full p-3 border border-sky-200 bg-sky-50 text-sky-800 rounded-xl text-sm font-bold outline-none" /></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Note</label><textarea rows={2} value={noteEffettive} onChange={e=>setNoteEffettive(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium outline-none"></textarea></div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-slate-100 flex-wrap">
              <button onClick={() => { setModalItem(null); handleGeneraRapportino(modalItem); }} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer mb-2 flex items-center justify-center gap-2">
                📄 Genera Rapportino PDF
              </button>
              <button onClick={() => setModalItem(null)} className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors cursor-pointer">Annulla</button>
              
              {/* BLOCCO VALIDAZIONE FERIE SE NON ADMIN */}
              {isAssenza(modalItem) && currentUser?.ruolo !== 'admin' ? (
                <div className="w-2/3 py-3 bg-amber-50 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 text-center flex items-center justify-center">
                  🔒 In attesa di validazione Admin
                </div>
              ) : (
                <button onClick={handleConfermaChiudi} disabled={loading} className="w-2/3 py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer">{loading ? '...' : 'Salva Modifiche'}</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODALE ANTEPRIMA E STAMPA RAPPROTINO PDF */}
      {modalRapportino && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 space-y-6 text-slate-900 my-auto printable-area">
            
            {/* INTESTAZIONE RAPPROTINO */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
              <div className="flex items-center gap-3">
                <div className="bg-sky-500 text-white font-black text-2xl w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">bw</div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">BW SOLUTIONS S.R.L.</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Rapportino Tecnico di Intervento</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-400 block">N. Intervento: #{modalRapportino.id || Date.now().toString().slice(-5)}</span>
                <span className="text-xs font-bold text-slate-700 block">Data: {getNormalizedDate(modalRapportino.data)}</span>
              </div>
            </div>

            {/* TABELLA DATI CLIENTE E TECNICO */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Cliente / Committente</span>
                <strong className="text-sm font-extrabold text-slate-900 block mt-0.5">{toText(modalRapportino.cliente)}</strong>
                <span className="text-slate-500 block mt-1">Commessa: {toText(modalRapportino.progetto)}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Tecnico Esecutore</span>
                <strong className="text-sm font-extrabold text-slate-900 block mt-0.5">{toText(modalRapportino.dipendente)}</strong>
                <span className="text-slate-500 block mt-1">Stato: Intervento Consuntivato</span>
              </div>
            </div>

            {/* RIEPILOGO ORE */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">Descrizione Prestazione</th>
                    <th className="p-3 text-center">Ore Cantiere</th>
                    <th className="p-3 text-center">Ore Backoffice</th>
                    <th className="p-3 text-center">Trasferta</th>
                    <th className="p-3 text-center">Totale Ore</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="p-3 font-bold text-slate-800">{toText(modalRapportino.progetto)}</td>
                    <td className="p-3 text-center">{modalRapportino.ore || 0} h</td>
                    <td className="p-3 text-center">{modalRapportino.ore_backoffice || 0} h</td>
                    <td className="p-3 text-center">{modalRapportino.ore_trasferta || 0} h</td>
                    <td className="p-3 text-center font-black text-sky-600">
                      {(Number(modalRapportino.ore || 0) + Number(modalRapportino.ore_backoffice || 0) + Number(modalRapportino.ore_trasferta || 0))} h
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* NOTE INTERVENTO */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Note e Dettaglio Lavori Svolti</span>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 min-h-[100px] whitespace-pre-wrap">
                {modalRapportino.note || "Nessuna nota aggiuntiva specificata per questo intervento."}
              </div>
            </div>

            {/* SEZIONE FIRMA CLIENTE */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200">
              <div className="text-center space-y-8">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Firma Tecnico BW Solutions</span>
                <div className="border-b border-slate-300 h-10 flex items-end justify-center text-xs font-serif italic text-slate-600">{toText(modalRapportino.dipendente)}</div>
              </div>
              <div className="text-center space-y-8">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Timbro e Firma Cliente per Accettazione</span>
                <div className="border-b border-slate-300 h-10"></div>
              </div>
            </div>

            {/* TASTI AZIONE (Nascosti in fase di stampa) */}
            <div className="flex gap-3 pt-4 border-t border-slate-100 no-print">
              <button onClick={() => setModalRapportino(null)} className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl cursor-pointer">
                Chiudi
              </button>
              <button onClick={handleStampaRapportino} className="w-2/3 py-3 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2">
                🖨️ Stampa / Salva in PDF
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default function App() { return <ErrorBoundary><HomeContent /></ErrorBoundary>; }
