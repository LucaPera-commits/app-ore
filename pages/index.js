<header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-sky-600 text-white font-bold text-base px-2.5 py-1 rounded-lg tracking-wider shadow-sm">bw</div>
            <div>
              <span className="font-bold text-base text-slate-900 tracking-tight block leading-none">bw solutions</span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block mt-0.5">Zo&amp;annA S.R.L.</span>
            </div>
          </div>
          
          <nav className="flex space-x-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold overflow-x-auto">
            <button onClick={() => setActiveTab('nuovo')} className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'nuovo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>📝 Nuovo Inserimento</button>
            <button onClick={() => setActiveTab('programmati')} className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${activeTab === 'programmati' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
              <span>⏳ Gestione Attività</span>
              {daConfermare.length > 0 && <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">{daConfermare.length}</span>}
            </button>
            
            {/* TASTI RISERVATI ALL'AMMINISTRATORE */}
            {currentUser.ruolo === 'admin' && (
              <>
                <button onClick={() => setActiveTab('cruscotto')} className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'cruscotto' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>📊 Cruscotto Mensile</button>
                <button onClick={() => setActiveTab('report')} className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'report' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>⚡ Performance</button>
                
                {/* NUOVO TASTO COLLEGAMENTO AI PREVENTIVI */}
                <a href="/preventivi" className="px-3.5 py-2 ml-1 rounded-xl transition-all bg-sky-100 text-sky-800 hover:bg-sky-200 border border-sky-200 font-bold flex items-center space-x-1 shadow-sm whitespace-nowrap">
                  <span>💰 Preventivi</span>
                </a>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-slate-700 font-semibold">👤 {currentUser.nome}</span>
            <button onClick={handleLogout} className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2 py-0.5 rounded-lg transition-all font-bold border border-rose-200">Esci</button>
          </div>
        </div>
      </header>
