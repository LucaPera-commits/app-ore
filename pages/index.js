import { useState, useEffect } from 'react';
import Head from 'next/head';

const UTENTI = {
  'luca': { nome: 'Luca Pera', pass: '!luca123?', ruolo: 'admin' },
  'giampaolo': { nome: 'Giampaolo Lauro', pass: '!giampaolo123?', ruolo: 'user' },
  'federico': { nome: 'Federico Boagno', pass: '!federico123?', ruolo: 'user' },
  'alessandro': { nome: 'Alessandro Ciule', pass: '!alessandro123?', ruolo: 'user' },
  'davide': { nome: 'Davide Procopio', pass: '!davide123?', ruolo: 'user' }
};

const LISTA_CLIENTI = [
  '3S s.r.l.', 'a2a', 'ALSTOM', 'ALSTOM BOLOGNA', 'API Torino', 'ARNALDI CENTINATURE', 'AROL', 
  'AT SYSTEM SERVICES', 'ATE ELECTRONICS', "ATTIVITA' IN PARTNERSHIP IIS", 
  'BARBERO ROBERTO IMPIANTI TERMOSANITARI', 'BORELLI', 'BOSCO ITALIA S.P.A', 'BUCHER MUNICIPAL', 
  'C.T.L. s.r.l.', 'CAGLIERO S.R.L', 'CAGNAZZO s.n.c', 'CAMA 1 s.p.a', 'CASTIM 2000', 
  'CDR ITALIA S.P.A', 'CHERCHISYSTEM', 'CIEMMEBI', 'COGORNO SERGIO', 'COLMAR Technik Spa', 
  'COMET', 'COMETAL s.r.l', 'COMETTO', 'COSPAL COMPOSITES S.P.A', 'COSTA RODOLFO s.r.l', 
  'DAVIDE BERNARDI', 'DEMONT', 'DIGITALISO', 'DMB', 'ECOTECH', 'EMMEGI SCS', 
  'ENOMECCANICA BOSIO', 'ERREPI', 'FARID', 'GIOLITO', 'GIORDANO LUCA e C. s.a.s', 
  'GT GESTIONI TECNOLOGICHE', 'Hitachi Rail', 'HYDRO', 'ICOSE', 'IDEO TECNICA', 
  'IIS', 'IIS CERT', 'IMI s.r.l', 'Ing. Bertolotti', 'IPV', 'IRIDE', 'ISAF BUS COMPONENTS', 
  'ISOCLIMA', 'Jilin QIXING', 'LIZ ITALIANA', 'MA s.r.l', 'MANPOWER', 'MERLO S.P.A', 
  'MICHELE SALE', 'MONDINO', 'MOVINTER S.R.L', 'MSA DAMPER', 'NKB s.r.l', 'NORD ENGINEERING', 
  'OM3', 'ONN WATER', 'OPERVAL', 'PERANO BRUNO S.R.L', 'PERANO SPA', 'PRINCIPI s.r.l', 
  'PROMETES SISTEMI', 'RECIF', 'RG TECH', 'RI.ME.BO', 'ROLFO', 'S.C.A.M.I.C', 
  'SARACINO COSTRUZIONI', 'SAVINO', 'SICMA', 'SIMIC S.P.A', 'SPEICH s.r.l', 'STAT', 
  'STAT_BENACCHIO GROUP', 'STUDIO POLIGEO', 'T.M.C', 'TPL_Borgo S.Dalmazzo', 'TSM', 
  'TUBILINE s.r.l', 'VASILY UDODOV', 'VEGLIA'
];

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('nuovo');

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getCurrentMonthStr = () => new Date().toISOString().slice(0, 7);
  const getTomorrowStr = () => {
    const t = new Date(); t.setDate(t.getDate() + 1);
    return t.toISOString().split('T')[0];
  };
  const getYesterdayStr = () => {
    const t = new Date(); t.setDate(t.getDate() - 1);
    return t.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    dipendente: '', cliente: '', progetto: '', data: getTodayStr(),
    ore: 8, ore_backoffice: 0, ore_trasferta: 0, note: '', stato: 'consuntivo'
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [storicoCompleto, setStoricoCompleto] = useState([]);
  const [loadingProgrammati, setLoadingProgrammati] = useState(false);
  const [filtroDipendente, setFiltroDipendente] = useState('Tutti');

  const [filtroMese, setFiltroMese] = useState(getCurrentMonthStr());
  const [filtroCruscottoDip, setFiltroCruscottoDip] = useState('Tutti');
  const [filtroCruscottoCliente, setFiltroCruscottoCliente] = useState('Tutti');

  const [modalItem, setModalItem] = useState(null);
  const [oreEffettive, setOreEffettive] = useState(8);
  const [oreBackofficeEffettive, setOreBackofficeEffettive] = useState(0);
  const [oreTrasfertaEffettive, setOreTrasfertaEffettive] = useState(0);
  const [dipendenteEffettivo, setDipendenteEffettivo] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('bw_user');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({ ...prev, dipendente: currentUser.nome }));
    }
  }, [currentUser]);

  const fetchProgrammati = async () => {
    setLoadingProgrammati(true);
    try {
      const res = await fetch('/api/gestisci?mode=all');
      if (res.ok) {
        const dati = await res.json();
        setStoricoCompleto(dati);
      }
    } catch (e) { console.error(e); } 
    finally { setLoadingProgrammati(false); }
  };

  useEffect(() => {
    if (currentUser) fetchProgrammati();
  }, [activeTab, currentUser]);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = UTENTI[loginForm.username.toLowerCase().trim()];
    if (user && user.pass === loginForm.password) {
      setCurrentUser(user);
      localStorage.setItem('bw_user', JSON.stringify(user));
      setFormData(prev => ({ ...prev, dipendente: user.nome }));
    } else {
      alert("Credenziali non valide.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bw_user');
    setLoginForm({ username: '', password: '' });
  };

  const handleSyncCalendar = async () => {
    if (currentUser?.ruolo !== 'admin') return alert("Solo admin");
    setLoadingProgrammati(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      alert(data.message || JSON.stringify(data));
      fetchProgrammati();
    } catch (e) {
      alert("Errore sincronizzazione.");
    } finally {
      setLoadingProgrammati(false);
    }
  };

  const handleQuickReassign = async (item, nuovoDipendente) => {
    if (!nuovoDipendente || nuovoDipendente === item.dipendente) return;
    setLoadingProgrammati(true);
    try {
      const res = await fetch('/api/gestisci', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id, calendar_event_id: item.calendar_event_id, dipendente: nuovoDipendente, chiudi_consuntivo: false
        })
      });
      if (res.ok) fetchProgrammati();
    } catch (e) { alert("Errore"); } 
    finally { setLoadingProgrammati(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/salva', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: data.message });
        setFormData(prev => ({ ...prev, cliente: '', progetto: '', note: '', ore_backoffice: 0, ore_trasferta: 0 }));
        fetchProgrammati();
      } else { setStatusMessage({ type: 'error', text: data.message }); }
    } catch (err) { setStatusMessage({ type: 'error', text: 'Errore server.' }); } 
    finally { setLoading(false); }
  };

  const handleConfermaChiudi = async () => {
    if (!modalItem) return;
    setLoading(true);
    try {
      const res = await fetch('/api/gestisci', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: modalItem.id, calendar_event_id: modalItem.calendar_event_id,
          ore_effettive: oreEffettive, ore_backoffice: oreBackofficeEffettive, ore_trasferta: oreTrasfertaEffettive,
          dipendente: dipendenteEffettivo || modalItem.dipendente, chiudi_consuntivo: true
        })
      });
      if (res.ok) { setModalItem(null); fetchProgrammati(); }
    } catch (e) { alert("Errore"); } 
    finally { setLoading(false); }
  };

  const handleElimina = async (item) => {
    if (!confirm(`Annullare attività per "${item.cliente}"?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/gestisci', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, calendar_event_id: item.calendar_event_id })
      });
      if (res.ok) fetchProgrammati();
    } catch (e) {} 
    finally { setLoading(false); }
  };

  const openEditModal = (item) => {
    setModalItem(item);
    setOreEffettive(item.ore || 0);
    setOreBackofficeEffettive(item.ore_backoffice || 0);
    setOreTrasfertaEffettive(item.ore_trasferta || 0);
    setDipendenteEffettivo(item.dipendente === 'Da Assegnare' ? currentUser?.nome : item.dipendente);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full space-y-4">
          <h2 className="text-xl font-bold text-center">bw solutions - Login</h2>
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="text" required placeholder="Utente" value={loginForm.username} onChange={e=>setLoginForm({...loginForm, username: e.target.value})} className="w-full p-3 border rounded-xl" />
            <input type={showPassword ? "text" : "password"} required placeholder="Password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm, password: e.target.value})} className="w-full p-3 border rounded-xl" />
            <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Accedi</button>
          </form>
        </div>
      </div>
    );
  }

  // --- LOGICA DI CONFRONTO TOLLERANTE ---
  const matchFiltro = (dipDb, filtroSelezionato) => {
    if (!filtroSelezionato || filtroSelezionato === 'Tutti') return true;
    if (!dipDb) return filtroSelezionato === 'Da Assegnare';
    const db = dipDb.toLowerCase().trim();
    const flt = filtroSelezionato.toLowerCase().trim();
    if (flt === 'da assegnare') return db === 'da assegnare' || db === '';
    return db.includes(flt.split(' ')[0]) || flt.includes(db.split(' ')[0]);
  };

  const targetDip = currentUser.ruolo === 'admin' ? filtroDipendente : currentUser.nome;

  // SEPARAZIONE ATTIVITÀ
  const aperte = storicoCompleto.filter(item => item.stato !== 'consuntivo' && item.stato !== 'annullato' && matchFiltro(item.dipendente, targetDip));
  const archiviate = storicoCompleto.filter(item => (item.stato === 'consuntivo' || item.stato === 'annullato') && matchFiltro(item.dipendente, targetDip));

  const listaDipendenti = Object.values(UTENTI).map(u => u.nome);

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12">
      <Head><title>Gestionale Ore | bw solutions</title></Head>

      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="font-bold text-lg text-slate-900">bw solutions</div>
          <nav className="flex space-x-2 text-xs font-bold">
            <button onClick={() => setActiveTab('nuovo')} className={`px-3 py-2 rounded-xl ${activeTab === 'nuovo' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>📝 Inserisci</button>
            <button onClick={() => setActiveTab('programmati')} className={`px-3 py-2 rounded-xl ${activeTab === 'programmati' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>⏳ Gestione Attività</button>
            {currentUser.ruolo === 'admin' && <a href="/preventivi" className="px-3 py-2 rounded-xl bg-sky-100 text-sky-800">💰 Preventivi</a>}
          </nav>
          <div className="text-xs flex items-center gap-2">
            <span className="font-bold">{currentUser.nome}</span>
            <button onClick={handleLogout} className="text-rose-600 bg-rose-50 px-2 py-1 rounded">Esci</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">

        {activeTab === 'nuovo' && (
          <div className="bg-white rounded-3xl p-6 shadow-md space-y-4">
            <h2 className="text-lg font-bold border-b pb-2">Nuova Registrazione</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setFormData({ ...formData, stato: 'consuntivo' })} className={`p-2 rounded-xl font-bold border ${formData.stato === 'consuntivo' ? 'bg-emerald-600 text-white' : 'bg-slate-50'}`}>✅ Consuntivo</button>
                <button type="button" onClick={() => setFormData({ ...formData, stato: 'pianificato' })} className={`p-2 rounded-xl font-bold border ${formData.stato === 'pianificato' ? 'bg-amber-500 text-white' : 'bg-slate-50'}`}>⏳ Pianificato</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Tecnico</label>
                  <select value={formData.dipendente} onChange={e => setFormData({...formData, dipendente: e.target.value})} className="w-full p-2 border rounded-xl font-bold">
                    <option value="Da Assegnare">❓ Da Assegnare</option>
                    {listaDipendenti.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Data</label>
                  <input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} className="w-full p-2 border rounded-xl font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block font-bold mb-1">Cliente</label><input type="text" required value={formData.cliente} onChange={e => setFormData({...formData, cliente: e.target.value})} className="w-full p-2 border rounded-xl" /></div>
                <div><label className="block font-bold mb-1">Progetto</label><input type="text" required value={formData.progetto} onChange={e => setFormData({...formData, progetto: e.target.value})} className="w-full p-2 border rounded-xl" /></div>
              </div>
              <div><label className="block font-bold mb-1">Ore Lavorate</label><input type="number" step="0.5" value={formData.ore} onChange={e => setFormData({...formData, ore: Number(e.target.value)})} className="w-full p-2 border rounded-xl font-bold" /></div>
              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white p-3 rounded-xl font-bold text-sm">Salva Attività 🚀</button>
            </form>
          </div>
        )}

        {activeTab === 'programmati' && (
          <div className="bg-white rounded-3xl p-6 shadow-md space-y-6">
            <div className="flex flex-wrap items-center justify-between border-b pb-4 gap-2">
              <h2 className="text-lg font-bold">Gestione Attività</h2>
              <div className="flex items-center gap-2 text-xs">
                {currentUser.ruolo === 'admin' && (
                  <select value={filtroDipendente} onChange={e => setFiltroDipendente(e.target.value)} className="p-2 border rounded-xl font-bold">
                    {['Tutti', 'Da Assegnare', ...listaDipendenti].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                )}
                <button onClick={handleSyncCalendar} className="bg-indigo-600 text-white px-3 py-2 rounded-xl font-bold">⬇️ Sincronizza Calendar</button>
                <button onClick={fetchProgrammati} className="bg-slate-100 px-3 py-2 rounded-xl font-bold">🔄 Aggiorna</button>
              </div>
            </div>

            {/* 🛠️ BARRA DIAGNOSTICA DEBUG (DA RIMUOVERE APPENA VERIFICATO) */}
            <div className="bg-slate-900 text-white p-3 rounded-2xl text-[11px] font-mono flex flex-wrap justify-between gap-2">
              <span>📊 TOTALE RIGHE NEL DB: <strong>{storicoCompleto.length}</strong></span>
              <span>⏳ APERTE MOSTRATE: <strong>{aperte.length}</strong></span>
              <span>🗂️ ARCHIVIATE MOSTRATE: <strong>{archiviate.length}</strong></span>
            </div>

            {/* VISTA ATTIVITÀ APERTE */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-slate-400">Attività In Corso / In Attesa ({aperte.length})</h3>
              {aperte.length === 0 ? (
                <p className="text-center py-6 text-slate-400 text-xs">Nessuna attività in corso trovata per questo filtro.</p>
              ) : (
                aperte.map(item => (
                  <div key={item.id} className="p-3 bg-slate-50 border rounded-2xl flex flex-wrap justify-between items-center gap-2 text-xs">
                    <div>
                      <span className="font-bold text-sky-700 mr-2">{item.data}</span>
                      <strong className="text-slate-900">{item.cliente}</strong> - {item.progetto}
                      {currentUser.ruolo === 'admin' && (
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[10px] text-slate-400">Assegnato:</span>
                          <select value={item.dipendente || 'Da Assegnare'} onChange={e => handleQuickReassign(item, e.target.value)} className="p-1 border rounded font-bold text-[11px]">
                            <option value="Da Assegnare">❓ Da Assegnare</option>
                            {listaDipendenti.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(item)} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold">✅ Conferma</button>
                      <button onClick={() => handleElimina(item)} className="bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg font-bold">🗑️ Annulla</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* VISTA ARCHIVIO */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-xs font-bold uppercase text-slate-400">🗂️ Archivio Completate / Annullate ({archiviate.length})</h3>
              <div className="max-h-60 overflow-y-auto border rounded-2xl p-2 space-y-2">
                {archiviate.map(item => (
                  <div key={item.id} className="p-2 border-b flex justify-between items-center text-xs">
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold mr-2 ${item.stato === 'consuntivo' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{item.stato}</span>
                      <span className="text-slate-500 font-bold mr-2">{item.data}</span>
                      <strong>{item.cliente}</strong> ({item.dipendente})
                    </div>
                    <span className="font-bold text-slate-700">{item.ore}h</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MODALE CONFERMA CHIUSURA */}
      {modalItem && (
        <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-xs">
            <h3 className="font-bold text-sm">Conferma Consuntivo per {modalItem.cliente}</h3>
            <div>
              <label className="block font-bold mb-1">Ore Lavorate Effettive</label>
              <input type="number" step="0.5" value={oreEffettive} onChange={e => setOreEffettive(Number(e.target.value))} className="w-full p-2 border rounded-xl font-bold" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setModalItem(null)} className="w-1/2 p-2 bg-slate-100 rounded-xl font-bold">Annulla</button>
              <button onClick={handleConfermaChiudi} className="w-1/2 p-2 bg-emerald-600 text-white rounded-xl font-bold">Salva ✅</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
