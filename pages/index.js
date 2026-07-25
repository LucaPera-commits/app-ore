{/* TAB 2: GESTIONE ATTIVITÀ (RAGGRUPPATA PER DIPENDENTE) */}
        {activeTab === 'programmati' && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80 overflow-hidden">
            <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Gestione Attività</h2>
                <p className="text-xs text-slate-300 mt-0.5">Visualizza e gestisci le attività raggruppate per dipendente.</p>
              </div>
            </div>

            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
              {currentUser.ruolo === 'admin' ? (
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Filtra:</span>
                  <select value={filtroDipendente} onChange={e => setFiltroDipendente(e.target.value)} className="bg-white text-slate-800 text-xs px-3 py-1.5 rounded-xl border border-slate-200 font-bold outline-none focus:ring-2 focus:ring-sky-200">
                    {['Tutti', 'Da Assegnare', ...listaDipendenti].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              ) : <div></div>}

              <div className="flex items-center space-x-2">
                {currentUser.ruolo === 'admin' && (
                  <button onClick={handleSyncCalendar} className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-200 font-bold transition-all shadow-sm">
                    ⬇️ Sincronizza Calendar
                  </button>
                )}
                <button onClick={fetchProgrammati} className="text-xs bg-white text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 font-bold transition-all shadow-sm">
                  🔄 Aggiorna
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingProgrammati ? <p className="text-center text-slate-500 py-8 text-sm">Caricamento in corso...</p> : programmati.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <span className="text-4xl block mb-2">🎉</span>
                  <p className="text-sm font-medium">Nessuna attività in sospeso!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* RAGGRUPPAMENTO PER DIPENDENTE */}
                  {Array.from(new Set(eventiFiltrati.map(e => e.dipendente))).map(dipNome => {
                    const attivitaDipendente = eventiFiltrati.filter(e => e.dipendente === dipNome);
                    const inRitardo = attivitaDipendente.filter(e => e.data < getTodayStr());
                    const oggi = attivitaDipendente.filter(e => e.data === getTodayStr());
                    const future = attivitaDipendente.filter(e => e.data > getTodayStr());

                    return (
                      <div key={dipNome} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        {/* Intestazione Dipendente */}
                        <div className="bg-slate-100 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                            <span>👤</span> {dipNome}
                          </h3>
                          <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-lg border">{attivitaDipendente.length} attività</span>
                        </div>

                        <div className="p-4 space-y-4 bg-white">
                          {/* Sotto-gruppo: IN RITARDO (Rosso) */}
                          {inRitardo.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-bold text-rose-600 uppercase mb-2 border-b border-rose-100 pb-1">🚨 Da Consuntivare (Scadute)</h4>
                              <div className="space-y-2">
                                {inRitardo.map(item => (
                                  <div key={item.id} className="p-3 bg-rose-50/50 border border-rose-200 rounded-xl flex justify-between items-center gap-4">
                                    <div>
                                      <span className="text-[10px] font-bold bg-white text-slate-600 px-1.5 py-0.5 rounded border mr-2">{item.data}</span>
                                      <span className="font-bold text-slate-900 text-sm">{item.cliente}</span>
                                      <div className="text-xs text-slate-600 truncate max-w-xs">{item.progetto}</div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <button onClick={() => openEditModal(item)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm">✅ Conferma</button>
                                      <button onClick={() => handleElimina(item)} className="px-3 py-1.5 bg-white text-rose-600 border border-rose-200 text-xs font-bold rounded-lg">🗑️ Annulla</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Sotto-gruppo: OGGI (Giallo/Arancio) */}
                          {oggi.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-bold text-amber-600 uppercase mb-2 border-b border-amber-100 pb-1">⏳ In programma Oggi</h4>
                              <div className="space-y-2">
                                {oggi.map(item => (
                                  <div key={item.id} className="p-3 bg-amber-50/30 border border-amber-200 rounded-xl flex justify-between items-center gap-4">
                                    <div>
                                      <span className="text-[10px] font-bold bg-white text-slate-600 px-1.5 py-0.5 rounded border mr-2">Oggi</span>
                                      <span className="font-bold text-slate-900 text-sm">{item.cliente}</span>
                                      <div className="text-xs text-slate-600 truncate max-w-xs">{item.progetto}</div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <button onClick={() => openEditModal(item)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm">✅ Conferma</button>
                                      <button onClick={() => handleElimina(item)} className="px-3 py-1.5 bg-white text-rose-600 border border-rose-200 text-xs font-bold rounded-lg">🗑️ Annulla</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Sotto-gruppo: FUTURE (Azzurro) */}
                          {future.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-bold text-sky-600 uppercase mb-2 border-b border-sky-100 pb-1">📅 Pianificate Future</h4>
                              <div className="space-y-2">
                                {future.map(item => (
                                  <div key={item.id} className="p-3 bg-sky-50/30 border border-sky-200 rounded-xl flex justify-between items-center gap-4">
                                    <div>
                                      <span className="text-[10px] font-bold bg-white text-slate-600 px-1.5 py-0.5 rounded border mr-2">{item.data}</span>
                                      <span className="font-bold text-slate-900 text-sm">{item.cliente}</span>
                                      <div className="text-xs text-slate-600 truncate max-w-xs">{item.progetto}</div>
                                    </div>
                                    <button onClick={() => handleElimina(item)} className="px-3 py-1.5 bg-white text-rose-600 border border-rose-200 text-xs font-bold rounded-lg hover:bg-rose-50">🗑️ Annulla</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SEZIONE: ARCHIVIO (ATTIVITÀ CONCLUSE E ANNULLATE) */}
            <div className="bg-slate-50 border-t border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                <span>🗂️</span> Archivio Storico (Concluse e Annullate)
              </h3>
              
              <div className="overflow-x-auto max-h-64 border border-slate-200 rounded-xl bg-white shadow-inner">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 z-10 shadow-sm">
                    <tr className="text-slate-500 font-bold uppercase">
                      <th className="py-2 px-3">Stato</th>
                      <th className="py-2 px-3">Data</th>
                      <th className="py-2 px-3">Dipendente</th>
                      <th className="py-2 px-3">Cliente</th>
                      <th className="py-2 px-3">Dettagli / Ore</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {storicoCompleto
                      .filter(item => item.stato === 'consuntivo' || item.stato === 'annullato')
                      .filter(item => filtroDipendente === 'Tutti' || item.dipendente === filtroDipendente)
                      .sort((a, b) => new Date(b.data) - new Date(a.data)) // Più recenti prima
                      .map(item => (
                      <tr key={item.id} className={`hover:bg-slate-50 ${item.stato === 'annullato' ? 'opacity-60' : ''}`}>
                        <td className="py-2 px-3">
                          {item.stato === 'consuntivo' ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">✅ Conclusa</span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-200">❌ Annullata</span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-600">{item.data}</td>
                        <td className="py-2 px-3 font-semibold text-slate-800">{item.dipendente}</td>
                        <td className="py-2 px-3 font-bold text-slate-900">{item.cliente}</td>
                        <td className="py-2 px-3">
                          <span className="text-slate-500">{item.progetto}</span>
                          {item.stato === 'consuntivo' && <span className="ml-2 font-bold text-sky-700">({item.ore}h)</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
