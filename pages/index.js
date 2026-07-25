import { useState, useEffect } from 'react';
import Head from 'next/head';

// --- CONFIGURAZIONE UTENTI E PASSWORD ---
const UTENTI = {
  'luca': { nome: 'Luca Pera', pass: '!luca123?', ruolo: 'admin' },
  'giampaolo': { nome: 'Giampaolo Lauro', pass: '!giampaolo123?', ruolo: 'user' },
  'federico': { nome: 'Federico Boagno', pass: '!federico123?', ruolo: 'user' },
  'alessandro': { nome: 'Alessandro Ciule', pass: '!alessandro123?', ruolo: 'user' },
  'davide': { nome: 'Davide Procopio', pass: '!davide123?', ruolo: 'user' }
};

// --- DATABASE CLIENTE ---
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
  // 1. STATI E HOOK
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
    dipendente: '',
    cliente: '', progetto: '', data: getTodayStr(),
    ore: 8, ore_backoffice: 0, ore_trasferta: 0,
    note: '', stato: 'consuntivo'
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [programmati, setProgrammati] = useState([]);
  const [storicoCompleto, setStoricoCompleto] = useState([]);
  const [loadingProgrammati, setLoadingProgrammati] = useState(false);
  const [filtroDipendente, setFiltroDipendente] = useState('Tutti');

  // Filtri Cruscotto
  const [filtroMese, setFiltroMese] = useState(getCurrentMonthStr());
  const [filtroCruscottoDip, setFiltroCruscottoDip] = useState('Tutti');
  const [filtroCruscottoCliente, setFiltroCruscottoCliente] = useState('Tutti');

  const [modalItem, setModalItem] = useState(null);
  const [oreEffettive, setOreEffettive] = useState(8);
  const [oreBackofficeEffettive, setOreBackofficeEffettive] = useState(0);
  const [oreTrasfertaEffettive, setOreTrasfertaEffettive] = useState(0);
  const [dipendenteEffettivo, setDipendenteEffettivo] = useState('');

  // 2. EFFETTI COLLATERALI
  useEffect(() => {
    const saved = localStorage.getItem('bw_user');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({ ...prev, dipendente: currentUser.nome }));
    }
  }, [currentUser]);

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
      
      const resAll = await fetch('/api/gestisci?mode=all');
      if (resAll.ok) setStoricoCompleto(await resAll.json());
    } catch (e) { console.error(e); } 
    finally { setLoadingProgrammati(false); }
  };

  useEffect(() => {
    if (currentUser) fetchProgrammati();
  }, [activeTab, currentUser]);

  // 3. FUNZIONI DI GESTIONE
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
    setShowPassword(false);
  };

  const handleSyncCalendar = async () => {
    if (currentUser?.ruolo !== 'admin') {
      alert("Solo l'amministratore può avviare la sincronizzazione.");
      return;
    }
    setLoadingProgrammati(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      alert(data.message);
      fetchProgrammati();
    } catch (e) {
      alert("Errore durante la connessione a Google Calendar.");
    } finally {
      setLoadingProgrammati(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
    if (formData.stato === 'pianificato' && formData.data <= getTodayStr()) {
      setStatusMessage({ type: 'error', text: 'Gli eventi pianificati devono essere registrati per date future.' });
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
          id: modalItem.id, 
          calendar_event_id: modalItem.calendar_event_id,
          ore_effettive: oreEffettive, 
          ore_backoffice: oreBackofficeEffettive, 
          ore_trasferta: oreTrasfertaEffettive,
          dipendente: dipendenteEffettivo || modalItem.dipendente,
          chiudi_consuntivo: true
        })
      });
      if (res.ok) { setModalItem(null); fetchProgrammati(); }
    } catch (e) { alert("Errore"); } 
    finally { setLoading(false); }
  };

  const handleElimina = async (item) => {
    if (!confirm(`Vuoi annullare l'attività per "${item.cliente}"?`)) return;
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

  const exportCSV = (datiDaEsportare) => {
    let csv = "Data;Dipendente;Cliente;Commessa / Progetto;Ore Cantiere;Ore Backoffice;Ore Trasferta;Totale Ore;Note\n";
    datiDaEsportare.forEach(row => {
      const tot = Number(row.ore || 0) + Number(row.ore_backoffice || 0) + Number(row.ore_trasferta || 0);
      csv += `"${row.data}";"${row.dipendente}";"${row.cliente}";"${row.progetto}";"${row.ore || 0}";"${row.ore_backoffice || 0}";"${row.ore_trasferta || 0}";"${tot}";"${(row.note || '').replace(/"/g, '""')}"\n`;
    });
    
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Report_Ore_${filtroMese}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 4. LOGIN SCREEN
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-sky-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200/80 space-y-6">
            <div className="flex flex-col items-center text-center space-y-3 pb-5 border-b border-slate-100">
              <div className="flex items-center justify-center space-x-3">
                <div className="bg-sky-600 text-white font-extrabold text-xl px-3.5 py-1.5 rounded-xl shadow-md tracking-wider">bw</div>
                <div className="text-left">
                  <span className="text-xl font-bold text-slate-900 tracking-tight block leading-tight">bw solutions</span>
                  <span className="text-[11px] text-emerald-600 font-bold tracking-wide uppercase block">Zo&amp;annA S.R.L.</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">Gestione Ore &amp; Attività Lavorative</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Utente</label>
                <input 
                  type="text" 
                  required 
                  value={loginForm.username} 
                  onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all font-medium" 
                  placeholder="Inserisci nome utente" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    value={loginForm.password} 
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none transition-all font-medium pr-12" 
                    placeholder="Inserisci password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-base focus:outline-none p-1 transition-all"
                    title={showPassword ? 'Nascondi password' : 'Mostra password'}
                  >
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all text-sm mt-2">
                Accedi al Portale ➔
              </button>
            </form>
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-6 font-medium">© {new Date().getFullYear()} bw solutions • Powered by Zo&amp;annA S.R.L.</p>
        </div>
      </div>
    );
  }

  // 5. CALCOLI DASHBOARD & FILTRAGGIO CORRETTO
  const isAlessandro = formData.dipendente === 'Alessandro Ciule';
  const targetDipendente = currentUser.ruolo === 'admin' ? filtroDipendente : currentUser.nome;

  // 🎯 FILTRAGGIO ATTIVITÀ IN CORSO (Solo 'pianificato')
  const attivitaPianificateAttive = programmati.filter(p => {
    if (p.stato !== 'pianificato') return false; // Ignora consuntivi e annullati
    if (targetDipendente === 'Tutti') return true;
    return p.dipendente?.trim().toLowerCase() === targetDipendente.trim().toLowerCase();
  });

  // 🎯 FILTRAGGIO ARCHIVIO STORICO (Solo 'consuntivo' e 'annullato')
  const attivitaArchiviate = storicoCompleto.filter(p => {
    if (p.stato !== 'consuntivo' && p.stato !== 'annullato') return false;
    if (targetDipendente === 'Tutti') return true;
    return p.dipendente?.trim().toLowerCase() === targetDipendente.trim().toLowerCase();
  });

  const daConfermare = attivitaPianificateAttive.filter(p => p.data <= getTodayStr());
  const ieriStr = getYesterdayStr();
  const attivitaInScadenzaRitardo = programmati.filter(p => 
    (currentUser.ruolo === 'admin' || p.dipendente === currentUser.nome) && 
    p.stato === 'pianificato' && 
    p.data < ieriStr
  );

  const listaDipendenti = Object.values(UTENTI).map(u => u.nome);

  const tuttiEventiMese = storicoCompleto.filter(item => {
    const isInMese = item.data && item.data.startsWith(filtroMese);
    const matchDip = filtroCruscottoDip === 'Tutti' || item.dipendente === filtroCruscottoDip;
    const matchCliente = filtroCruscottoCliente === 'Tutti' || item.cliente === filtroCruscottoCliente;
    return isInMese && matchDip && matchCliente;
  });

  const consuntiviMese = tuttiEventiMese.filter(item => item.stato === 'consuntivo');

  const totMeseCantiere = consuntiviMese.reduce((a, b) => a + Number(b.ore || 0), 0);
  const totMeseBackoffice = consuntiviMese.reduce((a, b) => a + Number(b.ore_backoffice || 0), 0);
  const totMeseTrasferta = consuntiviMese.reduce((a, b) => a + Number(b.ore_trasferta || 0), 0);
  const totMeseComplessivo = totMeseCantiere + totMeseBackoffice + totMeseTrasferta;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans pb-12">
      <Head>
        <title>Gestionale Ore | bw solutions</title>
      </Head>

      <datalist id="lista-aziende">
        {LISTA_CLIENTI.map((azienda, index) => (
          <option key={index} value={azienda} />
        ))}
      </datalist>

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
            {currentUser.ruolo === 'admin' && (
              <>
                <button onClick={() => setActiveTab('cruscotto')} className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'cruscotto' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>📊 Cruscotto Mensile</button>
                <button onClick={() => setActiveTab('report')} className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'report' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>⚡ Performance</button>
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

      {attivitaInScadenzaRitardo.length > 0 && (
        <div className="bg-rose-600 text-white text-xs font-semibold px-4 py-2.5 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-base">🚨</span>
              <span><strong>SOLLECITO CONSUNTIVAZIONE:</strong> Ci sono <strong>{attivitaInScadenzaRitardo.length}</strong> attività concluse da oltre 24 ore in attesa di conferma!</span>
            </div>
            <button onClick={() => setActiveTab('programmati')} className="bg-white text-rose-700 px-3 py-1 rounded-xl text-xs font-bold shadow hover:bg-rose-50 transition-all">Vedi Attività ➔</button>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* TAB 1: NUOVO INSERIMENTO */}
        {activeTab === 'nuovo' && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80 overflow-hidden">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Nuova Registrazione</h2>
                <p className="text-xs text-slate-300 mt-0.5">Inserisci le ore lavorate o pianifica un evento futuro.</p>
              </div>
              <span className="text-2xl bg-white/10 p-2.5 rounded-2xl">📅</span>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                <button type="button" onClick={() => setFormData({ ...formData, stato: 'consuntivo' })} className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${formData.stato === 'consuntivo' ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600'}`}>✅ Consuntivo (Ore Svolte)</button>
                <button type="button" onClick={() => setFormData({ ...formData, stato: 'pianificato' })} className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${formData.stato === 'pianificato' ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600'}`}>⏳ Pianificato (Evento Futuro)</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Dipendente / Tecnico</label>
                  {currentUser.ruolo === 'admin' ? (
                    <select value={formData.dipendente} onChange={e => setFormData({...formData, dipendente: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-sm">
                      {listaDipendenti.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  ) : (
                    <input type="text" readOnly value={formData.dipendente} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-medium text-sm cursor-not-allowed" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Data Attività</label>
                  <input type="date" required value={formData.data} min={formData.stato === 'pianificato' ? getTomorrowStr() : undefined} max={formData.stato === 'consuntivo' ? getTodayStr() : undefined} onChange={(e) => setFormData({ ...formData, data: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Cliente (Digita per cercare)</label>
                  <input type="text" list="lista-aziende" placeholder="Es. ERREPI s.r.l" required value={formData.cliente} onChange={e => setFormData({ ...formData, cliente: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-sky-200 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Progetto / Commessa</label>
                  <input type="text" placeholder="Es. Qualifiche Saldatori" required value={formData.progetto} onChange={e => setFormData({ ...formData, progetto: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Ore {formData.stato === 'pianificato' ? 'Stimate' : 'Lavorate'}</label>
                  <input type="number" step="0.5" min="0" required value={formData.ore} onChange={e => setFormData({ ...formData, ore: parseFloat(e.target.value) })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-sky-600 mb-1.5">Ore Backoffice</label>
                  <input type="number" step="0.5" min="0" value={formData.ore_backoffice} onChange={e => setFormData({ ...formData, ore_backoffice: parseFloat(e.target.value) })} className="w-full px-3.5 py-2.5 rounded-xl border border-sky-200 bg-sky-50/50 font-bold text-sm text-sky-800" />
                </div>
                {isAlessandro && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-purple-600 mb-1.5">🚗 Ore Trasferta</label>
                    <input type="number" step="0.5" min="0" value={formData.ore_trasferta} onChange={e => setFormData({ ...formData, ore_trasferta: parseFloat(e.target.value) })} className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 bg-purple-50/50 font-bold text-sm text-purple-800" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Note &amp; Dettagli</label>
                <textarea rows={2} placeholder="Note o descrizioni aggiuntive..." value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none"></textarea>
              </div>
              {statusMessage && <div className={`p-4 rounded-xl text-sm font-semibold ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>{statusMessage.text}</div>}
              <button type="submit" disabled={loading} className={`w-full text-white font-bold py-3.5 rounded-xl shadow-md transition-all ${formData.stato === 'pianificato' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-900 hover:bg-slate-800'}`}>
                {loading ? 'Salvataggio in corso...' : (formData.stato === 'pianificato' ? 'Pianifica Evento ⏳' : 'Salva Consuntivo 🚀')}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: GESTIONE ATTIVITÀ (CORRETTA ED EFFICIENTE) */}
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
              {loadingProgrammati ? (
                <p className="text-center text-slate-500 py-8 text-sm">Caricamento in corso...</p>
              ) : attivitaPianificateAttive.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <span className="text-4xl block mb-2">🎉</span>
                  <p className="text-sm font-medium">Nessuna attività in programma da svolgere!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* RAGGRUPPAMENTO DINAMICO PER DIPENDENTE */}
                  {Array.from(new Set(attivitaPianificateAttive.map(e => e.dipendente))).map(dipNome => {
                    const attivitaDip = attivitaPianificateAttive.filter(e => e.dipendente === dipNome);
                    const inRitardo = attivitaDip.filter(e => e.data < getTodayStr());
                    const oggi = attivitaDip.filter(e => e.data === getTodayStr());
                    const future = attivitaDip.filter(e => e.data > getTodayStr());

                    return (
                      <div key={dipNome} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-slate-100 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                            <span>👤</span> {dipNome}
                          </h3>
                          <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-lg border">{attivitaDip.length} attive</span>
                        </div>

                        <div className="p-4 space-y-4 bg-white">
                          {/* IN RITARDO */}
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
                                      <button onClick={() => openEditModal(item)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-700">✅ Conferma</button>
                                      <button onClick={() => handleElimina(item)} className="px-3 py-1.5 bg-white text-rose-600 border border-rose-200 text-xs font-bold rounded-lg hover:bg-rose-50">🗑️ Annulla</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* OGGI */}
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
                                      <button onClick={() => openEditModal(item)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-700">✅ Conferma</button>
                                      <button onClick={() => handleElimina(item)} className="px-3 py-1.5 bg-white text-rose-600 border border-rose-200 text-xs font-bold rounded-lg hover:bg-rose-50">🗑️ Annulla</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* FUTURE */}
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

            {/* SEZIONE: ARCHIVIO STORICO ATTIVITÀ */}
            <div className="bg-slate-50 border-t border-slate-200 p-6">
              <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                <span>🗂️</span> Archivio Storico ({attivitaArchiviate.length} voci)
              </h3>
              
              <div className="overflow-x-auto max-h-64 border border-slate-200 rounded-xl bg-white shadow-inner">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 z-10 shadow-sm">
                    <tr className="text-slate-500 font-bold uppercase border-b">
                      <th className="py-2.5 px-3">Stato</th>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Dipendente</th>
                      <th className="py-2.5 px-3">Cliente</th>
                      <th className="py-2.5 px-3">Dettagli / Ore</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attivitaArchiviate.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-slate-400 font-medium">Nessuna attività conclusa o annullata nell'archivio.</td>
                      </tr>
                    ) : (
                      attivitaArchiviate
                        .sort((a, b) => new Date(b.data) - new Date(a.data))
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CRUSCOTTO MENSILE */}
        {activeTab === 'cruscotto' && currentUser.ruolo === 'admin' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">📊 Cruscotto Mensile</h2>
                  <p className="text-xs text-slate-300 mt-0.5">Riepilogo ore per fatturazione clienti e calcolo buste paga dipendenti.</p>
                </div>
                <button onClick={() => exportCSV(consuntiviMese)} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl shadow transition-all flex items-center space-x-2">
                  <span>📥 Esporta per Excel (CSV)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Mese &amp; Anno</label>
                  <input type="month" value={filtroMese} onChange={e => setFiltroMese(e.target.value)} className="w-full bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Filtra Dipendente</label>
                  <select value={filtroCruscottoDip} onChange={e => setFiltroCruscottoDip(e.target.value)} className="w-full bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 outline-none">
                    <option value="Tutti">Tutti i Dipendenti</option>
                    {listaDipendenti.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">Filtra Cliente</label>
                  <select value={filtroCruscottoCliente} onChange={e => setFiltroCruscottoCliente(e.target.value)} className="w-full bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 outline-none">
                    <option value="Tutti">Tutti i Clienti</option>
                    {LISTA_CLIENTI.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Cantiere</span>
                  <span className="text-lg font-bold text-white">{totMeseCantiere} h</span>
                </div>
                <div className="bg-slate-800/80 border border-sky-500/30 p-3 rounded-2xl text-center">
                  <span className="text-[10px] font-bold uppercase text-sky-400 block">Backoffice</span>
                  <span className="text-lg font-bold text-sky-300">{totMeseBackoffice} h</span>
                </div>
                <div className="bg-slate-800/80 border border-purple-500/30 p-3 rounded-2xl text-center">
                  <span className="text-[10px] font-bold uppercase text-purple-400 block">Trasferta</span>
                  <span className="text-lg font-bold text-purple-300">{totMeseTrasferta} h</span>
                </div>
                <div className="bg-emerald-950/60 border border-emerald-500/40 p-3 rounded-2xl text-center">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block">Totale Ore</span>
                  <span className="text-lg font-extrabold text-emerald-300">{totMeseComplessivo} h</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80 p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-base flex justify-between items-center">
                <span>Registro Dettagliato Interventi ({tuttiEventiMese.length})</span>
              </h3>
              <div className="overflow-x-auto max-h-[500px] border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-slate-100 z-10">
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase">
                      <th className="py-3 px-3">Stato</th>
                      <th className="py-3 px-2">Data</th>
                      <th className="py-3 px-2">Tecnico</th>
                      <th className="py-3 px-2">Cliente / Progetto</th>
                      <th className="py-3 px-2 text-center">Ore Cant.</th>
                      <th className="py-3 px-2 text-center">Backoff.</th>
                      <th className="py-3 px-2 text-center">Trasf.</th>
                      <th className="py-3 px-2 text-center">Azione</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tuttiEventiMese.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 group">
                        <td className="py-2.5 px-3">
                          {item.stato === 'consuntivo' ? (
                            <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Chiuso</span>
                          ) : (
                            <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100 animate-pulse">In Sospeso</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 font-semibold text-slate-700 whitespace-nowrap">{item.data}</td>
                        <td className="py-2.5 px-2 whitespace-nowrap font-semibold">{item.dipendente}</td>
                        <td className="py-2.5 px-2">
                          <div className="font-bold text-slate-900">{item.cliente}</div>
                          <div className="text-slate-500 text-[10px] truncate max-w-[150px]">{item.progetto}</div>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-800">{item.ore || 0}h</td>
                        <td className="py-2.5 px-2 text-center font-bold text-sky-700">{item.ore_backoffice || 0}h</td>
                        <td className="py-2.5 px-2 text-center font-bold text-purple-700">{item.ore_trasferta || 0}h</td>
                        <td className="py-2.5 px-2 text-center">
                          <button onClick={() => openEditModal(item)} className="bg-white border border-slate-300 text-slate-600 hover:text-sky-700 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-sm">✏️ Modifica</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: REPORT PERFORMANCE */}
        {activeTab === 'report' && currentUser.ruolo === 'admin' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Performance &amp; Reattività Team</h2>
                  <p className="text-xs text-slate-300 mt-0.5">Valuta la tempestività di consuntivazione delle schede ore.</p>
                </div>
                <button onClick={fetchProgrammati} className="text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 font-medium">🔄 Aggiorna</button>
              </div>

              <div className="p-6 space-y-6">
                {listaDipendenti.map(nomeDip => {
                  const attivitaDip = storicoCompleto.filter(s => s.dipendente === nomeDip);
                  const consuntivate = attivitaDip.filter(s => s.stato === 'consuntivo');
                  const inRitardoScadute = attivitaDip.filter(s => s.stato === 'pianificato' && s.data < ieriStr);

                  const totaleRilevante = consuntivate.length + inRitardoScadute.length;
                  const indiceReattivita = totaleRilevante > 0 ? Math.round((consuntivate.length / totaleRilevante) * 100) : 100;

                  const totOreLavorate = consuntivate.reduce((acc, curr) => acc + Number(curr.ore || 0), 0);
                  const totOreBackoffice = consuntivate.reduce((acc, curr) => acc + Number(curr.ore_backoffice || 0), 0);
                  const totOreTrasferta = consuntivate.reduce((acc, curr) => acc + Number(curr.ore_trasferta || 0), 0);

                  return (
                    <div key={nomeDip} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">👤</span>
                          <h3 className="font-bold text-slate-900 text-base">{nomeDip}</h3>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-500 uppercase">Indice Reattività:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            indiceReattivita >= 90 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            indiceReattivita >= 70 ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            'bg-rose-100 text-rose-800 border-rose-300'
                          }`}>
                            {indiceReattivita}% {indiceReattivita >= 90 ? '💯' : indiceReattivita >= 70 ? '⚠️' : '🚨'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                          <p className="text-[10px] font-bold uppercase text-slate-400">Ore Svolte Totali</p>
                          <p className="text-lg font-bold text-slate-800">{totOreLavorate} h</p>
                        </div>
                        <div className="bg-white p-3 rounded-2xl border border-sky-200 shadow-sm">
                          <p className="text-[10px] font-bold uppercase text-sky-600">Backoffice</p>
                          <p className="text-lg font-bold text-sky-700">{totOreBackoffice} h</p>
                        </div>
                        {nomeDip === 'Alessandro Ciule' && (
                          <div className="bg-white p-3 rounded-2xl border border-purple-200 shadow-sm">
                            <p className="text-[10px] font-bold uppercase text-purple-600">Trasferta</p>
                            <p className="text-lg font-bold text-purple-700">{totOreTrasferta} h</p>
                          </div>
                        )}
                        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                          <p className="text-[10px] font-bold uppercase text-slate-400">Ritardi (&gt;24h)</p>
                          <p className={`text-lg font-bold ${inRitardoScadute.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{inRitardoScadute.length}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODALE CHIUSURA / MODIFICA */}
      {modalItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {modalItem.stato === 'consuntivo' ? 'Modifica Dati Intervento' : 'Conferma Consuntivo'}
            </h3>
            <p className="text-xs text-slate-500">
              Stai modificando l'attività per <strong className="text-slate-800">{modalItem.cliente}</strong>.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {(modalItem.dipendente === 'Da Assegnare' || currentUser.ruolo === 'admin') && (
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-indigo-500 mb-1 uppercase">Svolto da:</label>
                  <select value={dipendenteEffettivo} onChange={e => setDipendenteEffettivo(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-indigo-50 border-indigo-200 text-sm font-bold text-indigo-800">
                    <option value="Da Assegnare" disabled>❓ Da Assegnare</option>
                    {listaDipendenti.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Ore Lavorate</label>
                <input type="number" step="0.5" value={oreEffettive} onChange={e => setOreEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-sm font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-sky-600 mb-1 uppercase">Ore Backoffice</label>
                <input type="number" step="0.5" value={oreBackofficeEffettive} onChange={e => setOreBackofficeEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-sky-50 border-sky-200 text-sm font-bold text-sky-800" />
              </div>
              
              {(modalItem.dipendente === 'Alessandro Ciule' || dipendenteEffettivo === 'Alessandro Ciule') && (
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-purple-600 mb-1 uppercase">🚗 Ore Trasferta</label>
                  <input type="number" step="0.5" value={oreTrasfertaEffettive} onChange={e => setOreTrasfertaEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-purple-50 border-purple-200 text-sm font-bold text-purple-800" />
                </div>
              )}
            </div>

            <div className="flex space-x-2 pt-2">
              <button onClick={() => setModalItem(null)} className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">Annulla</button>
              <button onClick={handleConfermaChiudi} disabled={loading} className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all">
                {loading ? '...' : (modalItem.stato === 'consuntivo' ? 'Salva Modifiche ✅' : 'Conferma e Salva ✅')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
