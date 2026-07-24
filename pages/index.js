import { useState, useEffect } from 'react';
import Head from 'next/head';

// --- CONFIGURAZIONE UTENTI E PASSWORD ---
const UTENTI = {
  'luca': { nome: 'Luca Pera', pass: 'luca123', ruolo: 'admin' },
  'giampaolo': { nome: 'Giampaolo Lauro', pass: 'giampaolo123', ruolo: 'user' },
  'federico': { nome: 'Federico Boagno', pass: 'federico123', ruolo: 'user' },
  'alessandro': { nome: 'Alessandro Ciule', pass: 'alessandro123', ruolo: 'user' },
  'davide': { nome: 'Davide Procopio', pass: 'davide123', ruolo: 'user' }
};

// --- DATABASE AZIENDE ---
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

  useEffect(() => {
    const saved = localStorage.getItem('bw_user');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = UTENTI[loginForm.username.toLowerCase().trim()];
    if (user && user.pass === loginForm.password) {
      setCurrentUser(user);
      localStorage.setItem('bw_user', JSON.stringify(user));
      setFormData(prev => ({ ...prev, dipendente: user.nome }));
    } else {
      alert("Utente o password errati!");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bw_user');
    setLoginForm({ username: '', password: '' });
  };

  const [activeTab, setActiveTab] = useState('nuovo');
  
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => {
    const t = new Date(); t.setDate(t.getDate() + 1);
    return t.toISOString().split('T')[0];
  };
  const getYesterdayStr = () => {
    const t = new Date(); t.setDate(t.getDate() - 1);
    return t.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    dipendente: '',
    cliente: '', progetto: '', data: getTodayStr(),
    ore: 8, ore_backoffice: 0, ore_trasferta: 0,
    note: '', stato: 'consuntivo'
  });

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({ ...prev, dipendente: currentUser.nome }));
    }
  }, [currentUser]);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  
  const [programmati, setProgrammati] = useState([]);
  const [storicoCompleto, setStoricoCompleto] = useState([]);
  const [loadingProgrammati, setLoadingProgrammati] = useState(false);
  const [filtroDipendente, setFiltroDipendente] = useState('Tutti');

  const [modalItem, setModalItem] = useState(null);
  const [oreEffettive, setOreEffettive] = useState(8);
  const [oreBackofficeEffettive, setOreBackofficeEffettive] = useState(0);
  const [oreTrasfertaEffettive, setOreTrasfertaEffettive] = useState(0);

  useEffect(() => {
    const today = getTodayStr();
    if (formData.stato === 'pianificato' && formData.data <= today) {
      setFormData(prev => ({ ...prev, data: getTomorrowStr() }));
    }
  }, [formData.stato, formData.data]);

  const fetchProgrammati = async () => {
    setLoadingProgrammati(true);
    try {
      const res = await fetch('/api/gestisci');
      if (res.ok) setProgrammati(await res.json());
      
      // Se è admin, recupera lo storico completo per i report
      if (currentUser?.ruolo === 'admin') {
        const resAll = await fetch('/api/gestisci?mode=all');
        if (resAll.ok) setStoricoCompleto(await resAll.json());
      }
    } catch (e) { console.error(e); } 
    finally { setLoadingProgrammati(false); }
  };

  useEffect(() => {
    if (currentUser) fetchProgrammati();
  }, [activeTab, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    if (formData.stato === 'pianificato' && formData.data <= getTodayStr()) {
      setStatusMessage({ type: 'error', text: 'Gli eventi pianificati devono essere nel futuro.' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/salva', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: data.message });
        setFormData(prev => ({ ...prev, cliente: '', progetto: '', note: '', ore_backoffice: 0, ore_trasferta: 0, data: formData.stato === 'pianificato' ? getTomorrowStr() : getTodayStr() }));
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
          ore_effettive: oreEffettive, ore_backoffice: oreBackofficeEffettive, ore_trasferta: oreTrasfertaEffettive
        })
      });
      if (res.ok) { setModalItem(null); fetchProgrammati(); }
    } catch (e) { alert("Errore"); } 
    finally { setLoading(false); }
  };

  const handleElimina = async (item) => {
    if (!confirm(`Vuoi annullare "${item.cliente}"?`)) return;
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

  // --- SCREEN LOGIN ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
          <div className="text-center mb-6">
            <div className="bg-sky-600 text-white font-bold text-2xl inline-block px-4 py-2 rounded-xl mb-2">bw</div>
            <h1 className="font-bold text-xl text-slate-800">Area Riservata</h1>
            <p className="text-sm text-slate-500">Accedi per gestire le ore lavorative</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Utente</label>
              <input type="text" required value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border rounded-lg" placeholder="Es. luca" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
              <input type="password" required value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full px-4 py-2 bg-slate-50 border rounded-lg" />
            </div>
            <button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl mt-4 transition-all">Accedi</button>
          </div>
        </form>
      </div>
    );
  }

  const isAlessandro = formData.dipendente === 'Alessandro Ciule';
  const dipendenteFiltro = currentUser.ruolo === 'admin' ? filtroDipendente : currentUser.nome;
  const eventiFiltrati = dipendenteFiltro === 'Tutti' ? programmati : programmati.filter(p => p.dipendente === dipendenteFiltro);
  
  const daConfermare = eventiFiltrati.filter(p => p.data <= getTodayStr());
  const futuri = eventiFiltrati.filter(p => p.data > getTodayStr());
  
  // NOTIFICA ATTIVITÀ IN RITARDO (> 1 giorno dal termine dell'evento)
  const ieriStr = getYesterdayStr();
  const attivitaInScadenzaRitardo = programmati.filter(p => 
    (currentUser.ruolo === 'admin' || p.dipendente === currentUser.nome) && 
    p.stato === 'pianificato' && 
    p.data < ieriStr
  );

  const listaDipendenti = Object.values(UTENTI).map(u => u.nome);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <Head>
        <title>Gestionale Ore | bw solutions</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <datalist id="lista-aziende">
        {LISTA_CLIENTI.map((azienda, index) => (
          <option key={index} value={azienda} />
        ))}
      </datalist>

      {/* HEADER NAVBAR */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-sky-600 font-bold text-lg px-3 py-1.5 rounded-lg">bw</div>
            <h1 className="font-bold text-lg hidden sm:block">bw solutions</h1>
          </div>
          
          <nav className="flex space-x-1 bg-slate-800/80 p-1 rounded-xl text-xs font-medium">
            <button onClick={() => setActiveTab('nuovo')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'nuovo' ? 'bg-sky-600 text-white' : 'text-slate-300'}`}>📝 Nuovo</button>
            <button onClick={() => setActiveTab('programmati')} className={`px-3 py-1.5 rounded-lg flex items-center space-x-1 ${activeTab === 'programmati' ? 'bg-sky-600 text-white' : 'text-slate-300'}`}>
              <span>⏳ Attività</span>
              {daConfermare.length > 0 && <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">{daConfermare.length}</span>}
            </button>

            {/* TAB REPORT ADMIN */}
            {currentUser.ruolo === 'admin' && (
              <button onClick={() => setActiveTab('report')} className={`px-3 py-1.5 rounded-lg ${activeTab === 'report' ? 'bg-sky-600 text-white' : 'text-slate-300'}`}>📊 Performance &amp; Report</button>
            )}
          </nav>

          <div className="flex items-center space-x-3 text-xs">
            <span className="text-slate-300">👤 {currentUser.nome}</span>
            <button onClick={handleLogout} className="bg-rose-600/20 text-rose-400 px-2 py-1 rounded hover:bg-rose-600 hover:text-white">Esci</button>
          </div>
        </div>
      </header>

      {/* BANNER NOTIFICA SEGNALAZIONE RITARDO (Visibile se ci sono attività scadute da >24h) */}
      {attivitaInScadenzaRitardo.length > 0 && (
        <div className="bg-rose-600 text-white text-xs font-semibold px-4 py-3 shadow-md border-b border-rose-700 animate-pulse">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-base">🚨</span>
              <span><strong>SEGNALAZIONE ATTIVITÀ IN RITARDO:</strong> Ci sono <strong>{attivitaInScadenzaRitardo.length}</strong> attività concluse da oltre 24 ore in attesa di consuntivazione!</span>
            </div>
            <button onClick={() => setActiveTab('programmati')} className="bg-white text-rose-700 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow hover:bg-rose-50">
              Consuntiva Ora ➔
            </button>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* TAB 1: NUOVO INSERIMENTO */}
        {activeTab === 'nuovo' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-sky-900 p-6 text-white">
              <h2 className="text-xl font-bold">Registro &amp; Programmazione</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <button type="button" onClick={() => setFormData({ ...formData, stato: 'consuntivo' })} className={`py-2 px-2 rounded-lg border text-xs font-semibold ${formData.stato === 'consuntivo' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600'}`}>✅ Consuntivo</button>
                <button type="button" onClick={() => setFormData({ ...formData, stato: 'pianificato' })} className={`py-2 px-2 rounded-lg border text-xs font-semibold ${formData.stato === 'pianificato' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600'}`}>⏳ Pianificato</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Dipendente</label>
                  {currentUser.ruolo === 'admin' ? (
                    <select value={formData.dipendente} onChange={e => setFormData({...formData, dipendente: e.target.value})} className="w-full px-3 py-2.5 rounded-xl border bg-white">
                      {listaDipendenti.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  ) : (
                    <input type="text" readOnly value={formData.dipendente} className="w-full px-3 py-2.5 rounded-xl border bg-slate-100 text-slate-500 cursor-not-allowed" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Data Attività</label>
                  <input type="date" required value={formData.data} min={formData.stato === 'pianificato' ? getTomorrowStr() : undefined} max={formData.stato === 'consuntivo' ? getTodayStr() : undefined} onChange={(e) => setFormData({ ...formData, data: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border bg-slate-50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Cliente (Digita la prima lettera)</label>
                  <input type="text" list="lista-aziende" placeholder="Es. C (mostra C.T.L, COMETAL...)" required value={formData.cliente} onChange={e => setFormData({ ...formData, cliente: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border focus:ring-2 focus:ring-sky-200" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Progetto</label>
                  <input type="text" required value={formData.progetto} onChange={e => setFormData({ ...formData, progetto: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Ore {formData.stato === 'pianificato' ? 'Stimate' : 'Lavorate'}</label>
                  <input type="number" step="0.5" min="0" required value={formData.ore} onChange={e => setFormData({ ...formData, ore: parseFloat(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl border font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-sky-600 mb-1.5">Ore Backoffice</label>
                  <input type="number" step="0.5" min="0" value={formData.ore_backoffice} onChange={e => setFormData({ ...formData, ore_backoffice: parseFloat(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl border border-sky-200 bg-sky-50" />
                </div>
                
                {isAlessandro && (
                  <div>
                    <label className="block text-xs font-semibold text-purple-600 mb-1.5">🚗 Ore Trasferta</label>
                    <input type="number" step="0.5" min="0" value={formData.ore_trasferta} onChange={e => setFormData({ ...formData, ore_trasferta: parseFloat(e.target.value) })} className="w-full px-3 py-2.5 rounded-xl border border-purple-200 bg-purple-50" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Note</label>
                <textarea rows={2} value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border"></textarea>
              </div>

              {statusMessage && <div className={`p-4 rounded-xl text-sm ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>{statusMessage.text}</div>}
              <button type="submit" disabled={loading} className={`w-full text-white font-semibold py-3.5 rounded-xl ${formData.stato === 'pianificato' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-sky-600 hover:bg-sky-700'}`}>
                {loading ? 'Salvataggio...' : (formData.stato === 'pianificato' ? 'Pianifica ⏳' : 'Salva Consuntivo 🚀')}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: GESTIONE ATTIVITÀ */}
        {activeTab === 'programmati' && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 to-sky-900 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Attività Programmata</h2>
              <div className="flex space-x-3">
                {currentUser.ruolo === 'admin' && (
                  <select value={filtroDipendente} onChange={e => setFiltroDipendente(e.target.value)} className="bg-white/10 text-white text-xs px-2 py-1.5 rounded-lg border border-white/20">
                    {['Tutti', ...listaDipendenti].map(d => <option key={d} value={d} className="text-black">{d}</option>)}
                  </select>
                )}
                <button onClick={fetchProgrammati} className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/20">🔄</button>
              </div>
            </div>

            <div className="p-6">
              {loadingProgrammati ? <p className="text-center text-slate-500 py-8">Caricamento...</p> : programmati.length === 0 ? (
                <p className="text-center py-12 text-slate-400">Nessun evento pianificato!</p>
              ) : (
                <div className="space-y-8">
                  {daConfermare.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-rose-600 uppercase mb-3 flex items-center">🚨 Da Consuntivare (Passati)</h3>
                      <div className="space-y-3">
                        {daConfermare.map(item => {
                          const isInRitardo = item.data < ieriStr;
                          return (
                            <div key={item.id} className={`p-4 rounded-xl border flex flex-col md:flex-row justify-between gap-4 ${isInRitardo ? 'bg-rose-100/70 border-rose-300' : 'bg-rose-50 border-rose-200'}`}>
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs font-bold text-rose-700 bg-rose-200 px-2 rounded-full">{item.data}</span>
                                  {isInRitardo && <span className="text-[10px] bg-rose-700 text-white px-1.5 py-0.5 rounded font-bold uppercase">🚨 SCADUTO (>24h)</span>}
                                  <span className="text-xs font-semibold text-slate-700">{item.dipendente}</span>
                                </div>
                                <h3 className="font-bold text-slate-800">{item.cliente}</h3>
                                <p className="text-xs text-slate-600">{item.progetto} — <b>{item.ore}h previste</b></p>
                              </div>
                              <div className="flex space-x-2 items-center">
                                <button onClick={() => { setModalItem(item); setOreEffettive(item.ore || 8); setOreBackofficeEffettive(item.ore_backoffice || 0); setOreTrasfertaEffettive(item.ore_trasferta || 0); }} className="px-3 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-700">✅ Conferma Ore</button>
                                <button onClick={() => handleElimina(item)} className="px-3 py-2 bg-white text-rose-600 border border-rose-200 text-xs font-semibold rounded-lg">🗑️</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {futuri.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-sky-600 uppercase mb-3 flex items-center">⏳ Pianificati (Futuri)</h3>
                      <div className="space-y-3">
                        {futuri.map(item => (
                          <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex justify-between gap-4">
                            <div>
                              <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2 rounded-full mr-2">{item.data}</span>
                              <span className="text-xs font-semibold text-slate-700">{item.dipendente}</span>
                              <h3 className="font-bold text-slate-800">{item.cliente}</h3>
                              <p className="text-xs text-slate-600">{item.progetto}</p>
                            </div>
                            <button onClick={() => handleElimina(item)} className="px-3 py-2 bg-white text-rose-600 border border-rose-200 text-xs font-semibold rounded-lg">🗑️</button>
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

        {/* TAB 3: PERFORMANCE & REPORT (RISERVATO ALL'ADMIN LUCA) */}
        {activeTab === 'report' && currentUser.ruolo === 'admin' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 to-sky-900 p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Performance &amp; Riepilogo Team</h2>
                  <p className="text-xs text-slate-300 mt-1">Monitora la reattività nella consuntivazione e il carico ore per dipendente.</p>
                </div>
                <button onClick={fetchProgrammati} className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">🔄 Aggiorna</button>
              </div>

              {/* CARD PERFORMANCE PER OGNI DIPENDENTE */}
              <div className="p-6 space-y-6">
                {listaDipendenti.map(nomeDip => {
                  const attivitaDip = storicoCompleto.filter(s => s.dipendente === nomeDip);
                  const consuntivate = attivitaDip.filter(s => s.stato === 'consuntivo');
                  const inRitardoScadute = attivitaDip.filter(s => s.stato === 'pianificato' && s.data < ieriStr);
                  const inAttesaPuntuali = attivitaDip.filter(s => s.stato === 'pianificato' && s.data >= ieriStr);

                  // Calcolo Reattività: % di consuntivazioni effettuate rispetto a quelle scadute o completate
                  const totaleRilevante = consuntivate.length + inRitardoScadute.length;
                  const indiceReattivita = totaleRilevante > 0 
                    ? Math.round((consuntivate.length / totaleRilevante) * 100) 
                    : 100;

                  // Somma ore
                  const totOreLavorate = consuntivate.reduce((acc, curr) => acc + Number(curr.ore || 0), 0);
                  const totOreBackoffice = consuntivate.reduce((acc, curr) => acc + Number(curr.ore_backoffice || 0), 0);
                  const totOreTrasferta = consuntivate.reduce((acc, curr) => acc + Number(curr.ore_trasferta || 0), 0);

                  return (
                    <div key={nomeDip} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">👤</span>
                          <h3 className="font-bold text-slate-800 text-base">{nomeDip}</h3>
                        </div>

                        {/* BADGE REATTIVITÀ */}
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium text-slate-500">Reattività Consuntivi:</span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            indiceReattivita >= 90 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            indiceReattivita >= 70 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {indiceReattivita}% {indiceReattivita >= 90 ? '💯' : indiceReattivita >= 70 ? '⚠️' : '🚨'}
                          </span>
                        </div>
                      </div>

                      {/* STATISTICHE ORE & ATTIVITÀ */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <p className="text-[10px] font-bold uppercase text-slate-400">Ore Lavorate</p>
                          <p className="text-lg font-bold text-slate-800">{totOreLavorate} h</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-sky-200">
                          <p className="text-[10px] font-bold uppercase text-sky-600">Ore Backoffice</p>
                          <p className="text-lg font-bold text-sky-700">{totOreBackoffice} h</p>
                        </div>
                        {nomeDip === 'Alessandro Ciule' && (
                          <div className="bg-white p-3 rounded-xl border border-purple-200">
                            <p className="text-[10px] font-bold uppercase text-purple-600">Ore Trasferta</p>
                            <p className="text-lg font-bold text-purple-700">{totOreTrasferta} h</p>
                          </div>
                        )}
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <p className="text-[10px] font-bold uppercase text-slate-400">Scaduti / In Ritardo</p>
                          <p className={`text-lg font-bold ${inRitardoScadute.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {inRitardoScadute.length}
                          </p>
                        </div>
                      </div>

                      {/* AVVISO SEGNALAZIONE SE IN RITARDO */}
                      {inRitardoScadute.length > 0 && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
                          <span>🚨 <strong>{inRitardoScadute.length}</strong> attività svolte non ancora consuntivate oltre le 24h limite!</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TABELLA STORICO DETTAGLIATO */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 space-y-4">
              <h3 className="font-bold text-slate-800 text-base">Dettaglio Tutte le Attività</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase">
                      <th className="py-2.5 px-2">Data</th>
                      <th className="py-2.5 px-2">Dipendente</th>
                      <th className="py-2.5 px-2">Cliente</th>
                      <th className="py-2.5 px-2">Progetto</th>
                      <th className="py-2.5 px-2 text-center">Ore</th>
                      <th className="py-2.5 px-2 text-center">Stato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {storicoCompleto.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2 font-medium">{item.data}</td>
                        <td className="py-2.5 px-2 font-semibold text-slate-700">{item.dipendente}</td>
                        <td className="py-2.5 px-2 font-bold text-slate-800">{item.cliente}</td>
                        <td className="py-2.5 px-2 text-slate-600">{item.progetto}</td>
                        <td className="py-2.5 px-2 text-center font-bold">{item.ore}h</td>
                        <td className="py-2.5 px-2 text-center">
                          {item.stato === 'consuntivo' ? (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">✅ Chiuso</span>
                          ) : item.data < ieriStr ? (
                            <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">🚨 Scaduto</span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">⏳ In Corso</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODALE DI CHIUSURA CONSUNTIVO */}
      {modalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Conferma Attività</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Ore Lavorate</label>
                <input type="number" step="0.5" value={oreEffettive} onChange={e => setOreEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-sky-600 mb-1">Ore Backoffice</label>
                <input type="number" step="0.5" value={oreBackofficeEffettive} onChange={e => setOreBackofficeEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-lg bg-sky-50 border-sky-200" />
              </div>
              {modalItem.dipendente === 'Alessandro Ciule' && (
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-purple-600 mb-1">🚗 Ore Trasferta</label>
                  <input type="number" step="0.5" value={oreTrasfertaEffettive} onChange={e => setOreTrasfertaEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-lg bg-purple-50 border-purple-200" />
                </div>
              )}
            </div>
            <div className="flex space-x-2 pt-2">
              <button onClick={() => setModalItem(null)} className="w-1/2 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl">Annulla</button>
              <button onClick={handleConfermaChiudi} disabled={loading} className="w-1/2 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl">{loading ? '...' : '✅ Salva'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
