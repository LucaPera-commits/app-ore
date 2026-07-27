import React, { useState, useEffect, Component, useMemo } from 'react';
import Head from 'next/head';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { this.setState({ errorInfo }); console.error("Errore React intercettato:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center font-sans">
          <div className="max-w-3xl w-full bg-white p-8 rounded-3xl border border-rose-200 shadow-2xl text-center space-y-4">
            <div className="text-5xl">⚠️</div>
            <h2 className="text-2xl font-black text-rose-600">Errore nell'interfaccia</h2>
            <div className="bg-slate-900 text-left p-4 rounded-xl overflow-x-auto">
              <p className="text-rose-400 font-mono text-sm font-bold">{this.state.error && this.state.error.toString()}</p>
              <pre className="text-slate-400 font-mono text-[10px] mt-2 whitespace-pre-wrap">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </div>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-sky-600 text-white font-bold rounded-xl shadow-md cursor-pointer">🔄 Ricarica l'App</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const UTENTI = {
  'luca': { nome: 'Luca Pera', pass: '!luca123?', ruolo: 'admin' },
  'giampaolo': { nome: 'Giampaolo Lauro', pass: '!giampaolo123?', ruolo: 'user' },
  'federico': { nome: 'Federico Boagno', pass: '!federico123?', ruolo: 'user' },
  'alessandro': { nome: 'Alessandro Ciule', pass: '!alessandro123?', ruolo: 'user' },
  'davide': { nome: 'Davide Procopio', pass: '!davide123?', ruolo: 'user' }
};

const LISTA_CLIENTI_BASE = [
  '3S s.r.l.', 'a2a', 'ALSTOM', 'ALSTOM BOLOGNA', 'API Torino', 'ARNALDI CENTINATURE', 'AROL', 'AT SYSTEM SERVICES', 'ATE ELECTRONICS', "ATTIVITA' IN PARTNERSHIP IIS", 
  'BARBERO ROBERTO IMPIANTI TERMOSANITARI', 'BORELLI', 'BOSCO ITALIA S.P.A', 'BUCHER MUNICIPAL', 'C.T.L. s.r.l.', 'CAGLIERO S.R.L', 'CAGNAZZO s.n.c', 'CAMA 1 s.p.a', 'CASTIM 2000', 
  'CDR ITALIA S.P.A', 'CHERCHISYSTEM', 'CIEMMEBI', 'COGORNO SERGIO', 'COLMAR Technik Spa', 'COMET', 'COMETAL s.r.l', 'COMETTO', 'COSPAL COMPOSITES S.P.A', 'COSTA RODOLFO s.r.l'
];

const AFORISMI = [
  "“L'unico modo di fare un ottimo lavoro è amare quello che fai.” – Steve Jobs",
  "“Nessun grande risultato è mai stato raggiunto senza entusiasmo.” – Ralph Waldo Emerson",
  "“La qualità non è mai un fatto casuale; è sempre il risultato di uno sforzo intelligente.” – John Ruskin",
  "“Non contare i giorni, fai in modo che i giorni contino.” – Muhammad Ali",
  "“Il segreto per andare avanti è iniziare.” – Mark Twain",
  "“L'eccellenza non è un atto, ma un'abitudine.” – Aristotele",
  "“Ciò che facciamo ogni giorno plasma ciò che diventiamo.” – Eraclito",
  "“L'ingegneria è l'arte di dirigere le grandi fonti di energia della natura per l'uso dell'uomo.” – Thomas Tredgold",
  "“Il lavoro di squadra divide i compiti e moltiplica il successo.”",
  "“La precisione e la passione trasformano un’idea in un capolavoro.”"
];

function getTodayStr() { return new Date().toISOString().split('T')[0]; }
function getCurrentMonthStr() { return new Date().toISOString().slice(0, 7); }
function getFirstDayOfCurrentMonthStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`; }

function getNormalizedDate(d) {
  if (!d) return getTodayStr();
  if (typeof d !== 'string' && typeof d !== 'number') return getTodayStr();
  return String(d).split('T')[0].split(' ')[0];
}

function formatDateSafely(dateVal) {
  if (!dateVal) return '-';
  try { const d = new Date(dateVal); if (isNaN(d.getTime())) return String(dateVal).split('T')[0]; return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } 
  catch (e) { return String(dateVal); }
}

function toText(val) { if (val === null || val === undefined) return ''; if (typeof val === 'object') return JSON.stringify(val); return String(val); }

function matchNomeDipendente(nomeDb, filtro) {
  if (!filtro || filtro === 'Tutti') return true; 
  if (!nomeDb) return false;
  const db = String(nomeDb).toLowerCase().trim(); const flt = String(filtro).toLowerCase().trim();
  if (db === flt) return true;
  const pF = flt.split(' ').filter(Boolean); const pD = db.split(' ').filter(Boolean);
  return pF[0] && pD[0] && pF[0] === pD[0];
}

function isItemDaAssegnare(item) {
  if (!item) return false; if (item.stato === 'annullato') return false;
  const dip = toText(item.dipendente).toLowerCase().trim();
  return !dip || dip === 'da assegnare' || dip === 'da_assegnare' || dip === 'nessuno' || dip === 'null' || dip === 'undefined';
}

function isFerie(item) { return toText(item?.progetto).toLowerCase().includes('ferie'); }
function isPermesso(item) { return toText(item?.progetto).toLowerCase().includes('permesso') || toText(item?.progetto).toLowerCase().includes('rol'); }
function isMalattia(item) { return toText(item?.progetto).toLowerCase().includes('malattia'); }
function isAssenza(item) { return isFerie(item) || isPermesso(item) || isMalattia(item) || toText(item?.cliente).toLowerCase().includes('assenze'); }
function getFeedbackKey(fb) { if (!fb || !fb.id) return null; return fb.risposta ? `${fb.id}_ans_${fb.risposta_at || ''}` : `${fb.id}`; }
function getParentPath(path) { if (!path) return ''; const cleanPath = String(path).replace(/^\/+|\/+$/g, ''); const parts = cleanPath.split('/').filter(Boolean); if (parts.length <= 1) return ''; parts.pop(); return parts.join('/'); }

function getMondayOfCurrentWeek(dateInput = new Date()) {
  const d = new Date(dateInput); const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

function get7DaysOfWeek(mondayStr) {
  const days = []; const curr = new Date(mondayStr);
  for (let i = 0; i < 7; i++) { const d = new Date(curr); d.setDate(curr.getDate() + i); days.push(d.toISOString().split('T')[0]); }
  return days;
}

function getGiorniLavorativiMancanti(storico, nomeDip) {
  if (!nomeDip) return []; const oggi = new Date(); const giorniMancanti = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date(); d.setDate(oggi.getDate() - i); const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dStr = d.toISOString().split('T')[0];
      const haReg = storico.some(item => item && matchNomeDipendente(item.dipendente, nomeDip) && getNormalizedDate(item.data) === dStr && item.stato !== 'annullato');
      if (!haReg) giorniMancanti.push(dStr);
    }
  }
  return giorniMancanti.sort();
}

function HomeContent() {
  const [isMounted, setIsMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [activeTab, setActiveTab] = useState('home');
  const [pathNC, setPathNC] = useState('');
  const [navHistory, setNavHistory] = useState([]);

  const [diagnosticaStato, setDiagnosticaStato] = useState({ ok: true, anomalie: [] });
  const [aforismaGiorno, setAforismaGiorno] = useState('');

  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([{role: 'ai', text: 'Ciao! Sono l\'assistente virtuale di BW Solutions. Come posso aiutarti oggi?'}]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // ANAGRAFICA CLIENTI
  const [dbClienti, setDbClienti] = useState([]);
  const [loadingClienti, setLoadingClienti] = useState(false);
  const [modalCliente, setModalCliente] = useState(null);
  const [searchCliente, setSearchCliente] = useState('');

  // COMMESSE & BUDGET
  const [dbCommesse, setDbCommesse] = useState([]);
  const [loadingCommesse, setLoadingCommesse] = useState(false);

  // APPUNTI / PDM
  const [dbAppunti, setDbAppunti] = useState([]);
  const [loadingAppunti, setLoadingAppunti] = useState(false);
  const [appuntiClienteSel, setAppuntiClienteSel] = useState('');
  const [appuntiProgettoSel, setAppuntiProgettoSel] = useState('');
  const [nuovoAppuntoTesto, setNuovoAppuntoTesto] = useState('');
  const [ricercaAppunti, setSearchAppunti] = useState('');
  const [modalNuovaNota, setModalNuovaNota] = useState(false);

  const [categoriaForm, setCategoriaForm] = useState('lavoro');
  const [formData, setFormData] = useState({
    dipendente: 'Da Assegnare', cliente: '', progetto: '', data: getTodayStr(), data_fine: getTodayStr(),
    usaIntervallo: false, ore: 8, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0, note: '', stato: 'pianificato'
  });

  const [plannerWeekStart, setPlannerWeekStart] = useState(getMondayOfCurrentWeek());
  const [plannerEspansi, setPlannerEspansi] = useState(() => {
    const init = { 'Da Assegnare': true };
    Object.values(UTENTI).forEach(u => init[u.nome] = true);
    return init;
  });
  const togglePlannerRow = (dipNome) => setPlannerEspansi(prev => ({ ...prev, [dipNome]: !prev[dipNome] }));

  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [storicoCompleto, setStoricoCompleto] = useState([]);
  const [loadingProgrammati, setLoadingProgrammati] = useState(false);

  const [feedbackList, setFeedbackList] = useState([]);
  const [readFeedbackIds, setReadFeedbackIds] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [filtroArchivioAdmin, setFiltroArchivioAdmin] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ categoria: '💡 Nuova Funzionalità', valutazione: 5, messaggio: '' });
  const [feedbackStatus, setFeedbackStatus] = useState(null);

  const [cartelleAperte, setCartelleAperte] = useState({ 'Da Assegnare': true });
  const [sottoCartelleAperte, setSottoCartelleAperte] = useState({});
  const toggleCartella = (nome) => setCartelleAperte(prev => ({ ...prev, [nome]: !prev[nome] }));
  const toggleSottoCartella = (key) => setSottoCartelleAperte(prev => ({ ...prev, [key]: !prev[key] }));

  const [searchQueryNC, setSearchQueryNC] = useState('');
  const [risultatiNC, setRisultatiNC] = useState([]);
  const [loadingNC, setLoadingNC] = useState(false);

  const [modalDocumento, setModalDocumento] = useState(null);
  const [filtroMeseReport, setFiltroMeseReport] = useState(getCurrentMonthStr());
  const [subTabReport, setSubTabReport] = useState('paghe');
  const [filtroClienteFatturazione, setFiltroClienteFatturazione] = useState('Tutti');

  const [modalItem, setModalItem] = useState(null);
  const [modalRapportino, setModalRapportino] = useState(null);
  const [oreEffettive, setOreEffettive] = useState(8);
  const [oreBackofficeEffettive, setOreBackofficeEffettive] = useState(0);
  const [oreTrasfertaEffettive, setOreTrasfertaEffettive] = useState(0);
  const [oreStraordinarioEffettive, setOreStraordinarioEffettive] = useState(0);
  const [dipendenteEffettivo, setDipendenteEffettivo] = useState('');
  const [clienteEffettivo, setClienteEffettivo] = useState('');
  const [progettoEffettivo, setProgettoEffettivo] = useState('');
  const [noteEffettive, setNoteEffettive] = useState('');

  const listaDipendenti = Object.values(UTENTI).map(u => u.nome);
  const safeStorico = Array.isArray(storicoCompleto) ? storicoCompleto : [];
  const safeFeedbackList = Array.isArray(feedbackList) ? feedbackList : [];

  const listaClientiCompleta = useMemo(() => {
    return Array.from(new Set([...LISTA_CLIENTI_BASE, ...dbClienti.map(c => c.ragione_sociale)])).sort();
  }, [dbClienti]);

  const dipendentiVisibili = currentUser?.ruolo === 'admin' ? listaDipendenti : (currentUser ? [currentUser.nome] : []);
  const mostraDaAssegnare = currentUser?.ruolo === 'admin';

  function canEditItem(item) { if (!currentUser) return false; if (currentUser.ruolo === 'admin') return true; return matchNomeDipendente(item?.dipendente, currentUser.nome); }

  function navigateTo(targetTab, targetPathNC = '') {
    const cleanTargetFolder = targetPathNC ? String(targetPathNC).replace(/^\/+|\/+$/g, '') : '';
    if (targetTab === activeTab && cleanTargetFolder === pathNC) return;
    setNavHistory(prev => [...prev, { tab: activeTab, pathNC: pathNC }]);
    setActiveTab(targetTab); setPathNC(cleanTargetFolder);
  }

  function handleGoBack() {
    if (navHistory.length === 0) return;
    const lastState = navHistory[navHistory.length - 1];
    setNavHistory(prev => prev.slice(0, prev.length - 1));
    setActiveTab(lastState.tab); setPathNC(lastState.pathNC || ''); setSearchQueryNC('');
  }

  const handleGeneraRapportino = (item) => {
    setModalRapportino(item);
  };

  const handleStampaRapportino = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const fetchClienti = async () => {
    setLoadingClienti(true);
    try {
      const res = await fetch('/api/clienti');
      if (res.ok) {
        const data = await res.json();
        setDbClienti(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error("Errore fetch clienti:", e); }
    finally { setLoadingClienti(false); }
  };

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

  const fetchAppunti = async () => {
    setLoadingAppunti(true);
    try {
      const res = await fetch('/api/appunti');
      if (res.ok) {
        const data = await res.json();
        const adattati = (Array.isArray(data) ? data : []).map(a => ({
          ...a,
          cliente: a.cliente_id ? (dbClienti.find(c => c.id === a.cliente_id)?.ragione_sociale || 'Generico') : 'Generico',
          progetto: a.titolo,
          data_ora: a.created_at
        }));
        setDbAppunti(adattati);
      }
    } catch (e) { console.error("Errore fetch appunti:", e); }
    finally { setLoadingAppunti(false); }
  };

  useEffect(() => {
    if (currentUser && isMounted) {
      fetchClienti();
      fetchCommesse();
      fetchAppunti();
    }
  }, [currentUser, activeTab, isMounted]);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const randIndex = Math.floor(Math.random() * AFORISMI.length);
    setAforismaGiorno(AFORISMI[randIndex]);

    try { const saved = localStorage.getItem('bw_user'); if (saved) setCurrentUser(JSON.parse(saved)); } catch (e) {}
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { if (currentUser) { setFormData(prev => ({ ...prev, dipendente: currentUser.ruolo === 'admin' ? 'Da Assegnare' : currentUser.nome })); } }, [currentUser]);

  const handleResetForm = () => {
    setFormData({
      dipendente: currentUser?.ruolo === 'admin' ? 'Da Assegnare' : (currentUser?.nome || 'Da Assegnare'),
      cliente: '', progetto: '', data: getTodayStr(), data_fine: getTodayStr(),
      usaIntervallo: false, ore: 8, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0, note: '', stato: 'consuntivo'
    });
    setCategoriaForm('lavoro');
    setStatusMessage(null);
  };

  const fetchProgrammati = async () => {
    setLoadingProgrammati(true);
    try { const res = await fetch(`/api/gestisci?mode=all&_t=${Date.now()}`); if (res.ok) { const dati = await res.json(); setStoricoCompleto(Array.isArray(dati) ? dati : []); } } catch (e) { console.error("Errore fetch:", e); } 
    finally { setLoadingProgrammati(false); }
  };

  const fetchFeedback = async () => {
    setLoadingFeedback(true);
    try { const isInclude = currentUser?.ruolo === 'admin' && filtroArchivioAdmin; const res = await fetch(`/api/feedback?includeDeleted=${isInclude ? 'true' : 'false'}&_t=${Date.now()}`); if (res.ok) { const data = await res.json(); setFeedbackList(Array.isArray(data) ? data : []); } } catch (e) { console.error("Errore feedback:", e); }
    finally { setLoadingFeedback(false); }
  };

  useEffect(() => {
    if (currentUser && isMounted) {
      fetchProgrammati(); fetchFeedback();
    }
  }, [currentUser, activeTab, filtroArchivioAdmin, isMounted]);

  const handleLogin = (e) => {
    e.preventDefault(); const user = UTENTI[loginForm.username.toLowerCase().trim()];
    if (user && user.pass === loginForm.password) { setCurrentUser(user); localStorage.setItem('bw_user', JSON.stringify(user)); setFormData(prev => ({ ...prev, dipendente: user.ruolo === 'admin' ? 'Da Assegnare' : user.nome })); navigateTo('home'); } 
    else { setStatusMessage({ type: 'error', text: 'Credenziali non valide.' }); }
  };

  const handleLogout = () => { setCurrentUser(null); localStorage.removeItem('bw_user'); setLoginForm({ username: '', password: '' }); setShowPassword(false); };

  const handleConfermaChiudi = async () => {
    if (!modalItem) return;
    if (!clienteEffettivo || !clienteEffettivo.trim()) { setStatusMessage({ type: 'error', text: '⚠️ Campo Cliente obbligatorio!' }); return; }
    if (!progettoEffettivo || !progettoEffettivo.trim()) { setStatusMessage({ type: 'error', text: '⚠️ Campo Progetto obbligatorio!' }); return; }

    if (isAssenza(modalItem) && currentUser?.ruolo !== 'admin') {
      setStatusMessage({ type: 'error', text: "⚠️ Solo l'amministratore può approvare e validare le ferie o i permessi." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/gestisci', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: modalItem.id, calendar_event_id: modalItem.calendar_event_id,
          cliente: clienteEffettivo.trim(), progetto: progettoEffettivo.trim(), note: noteEffettive.trim(),
          ore_effettive: oreEffettive, ore_backoffice: oreBackofficeEffettive, ore_trasferta: oreTrasfertaEffettive, ore_straordinario: oreStraordinarioEffettive,
          dipendente: dipendenteEffettivo || modalItem.dipendente, chiudi_consuntivo: true
        })
      });
      if (res.ok) { setModalItem(null); fetchProgrammati(); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (!isMounted) return null;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <Head>
          <title>BW Solutions | ERP</title>
          <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%230ea5e9'/><text x='50' y='55' font-family='Arial, sans-serif' font-size='50' fill='white' font-weight='bold' text-anchor='middle' alignment-baseline='middle'>bw</text></svg>" />
        </Head>
        <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl border border-slate-100">
          <div className="flex flex-col items-center text-center space-y-2 pb-6 border-b border-slate-100 mb-6">
            <div className="bg-sky-500 text-white font-black text-3xl w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30 mb-2">bw</div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">BW Solutions</h1>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Enterprise Hub</span>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nome Utente</label>
              <input type="text" required value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg hover:text-slate-600 transition-colors cursor-pointer">{showPassword ? '👁️' : '🙈'}</button>
              </div>
            </div>
            {statusMessage && <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold">{statusMessage.text}</div>}
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-xl shadow-slate-900/20 transition-all text-sm mt-2 cursor-pointer">Accedi alla Piattaforma</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex flex-col md:flex-row pb-24 md:pb-0">
      <Head>
        <title>BW Solutions | Hub ERP</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%230ea5e9'/><text x='50' y='55' font-family='Arial, sans-serif' font-size='50' fill='white' font-weight='bold' text-anchor='middle' alignment-baseline='middle'>bw</text></svg>" />
      </Head>

      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between p-5 md:h-screen sticky top-0 z-40 border-r border-slate-800 shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 cursor-pointer pb-6 border-b border-slate-800" onClick={() => navigateTo('home')}>
            <div className="bg-sky-500 text-white font-black text-xl w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">bw</div>
            <div>
              <span className="font-bold text-lg text-white block leading-none">BW Solutions</span>
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest block mt-1">Enterprise ERP</span>
            </div>
          </div>

          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1.5 overflow-x-auto md:overflow-x-visible text-sm font-semibold">
            <button onClick={() => navigateTo('home')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'home' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>🏠 Home</button>
            <button onClick={() => navigateTo('planner')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'planner' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📅 Planner Team</button>
            <button onClick={() => navigateTo('nuovo')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'nuovo' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📝 Inserisci Ore</button>
            <button onClick={() => navigateTo('programmati')} className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${activeTab === 'programmati' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
              <div className="flex gap-3">⏳ Attività</div>
            </button>
            <button onClick={() => navigateTo('anagrafiche')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'anagrafiche' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>🏢 Anagrafiche</button>
            <button onClick={() => navigateTo('appunti')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'appunti' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📓 Appunti/PDM</button>
            <button onClick={() => navigateTo('documenti', pathNC)} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'documenti' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📂 Cloud Aruba</button>
            {currentUser?.ruolo === 'admin' && (
              <button onClick={() => navigateTo('cruscotto')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'cruscotto' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📊 Reportistica</button>
            )}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="px-3 py-2 bg-slate-800/80 rounded-xl text-[10px] font-bold flex items-center justify-between border border-slate-700">
            <span className="text-slate-400">Diagnostica App:</span>
            <span className={diagnosticaStato.ok ? "text-emerald-400" : "text-amber-400 animate-pulse"}>{diagnosticaStato.ok ? "🟢 Sistema OK" : "⚠️ Check In Corso"}</span>
          </div>
          <div className="hidden md:flex bg-slate-800 p-3 rounded-2xl items-center justify-between">
            <span className="text-white font-bold text-xs truncate">{currentUser?.nome}</span>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer">🚪</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto space-y-6 relative">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-xs border border-slate-200">
              <h1 className="text-3xl font-black text-slate-900">Ciao, {currentUser?.nome.split(' ')[0]} 👋</h1>
              <p className="text-slate-500 text-sm mt-1">Pannello di controllo enterprise BW Solutions ERP.</p>
              <div className="mt-4 p-4 bg-sky-50 border border-sky-100 rounded-2xl text-xs font-semibold text-sky-900 italic">
                {aforismaGiorno}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cruscotto' && (
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">🧾 Report Ore da Fatturare</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                    <th className="py-3 px-3">Data</th>
                    <th className="py-3 px-3">Cliente</th>
                    <th className="py-3 px-3">Progetto</th>
                    <th className="py-3 px-3">Eseguito da</th>
                    <th className="py-3 px-3 text-center">Ore</th>
                    <th className="py-3 px-3 text-center">Azione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeStorico.filter(item => item.stato === 'consuntivo').map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-sky-50">
                      <td className="py-2.5 px-3 font-bold text-slate-500">{getNormalizedDate(item.data)}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{toText(item.cliente)}</td>
                      <td className="py-2.5 px-3 text-slate-700">{toText(item.progetto)}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{toText(item.dipendente)}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-900">{item.ore || 0} h</td>
                      <td className="py-2.5 px-3 text-center">
                        <button onClick={() => handleGeneraRapportino(item)} className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer">📄 Rapportino PDF</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {modalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">{modalItem.stato === 'consuntivo' ? 'Dettaglio Intervento' : 'Scheda Attività'}</h3>
              <button onClick={() => setModalItem(null)} className="text-slate-400 hover:bg-slate-100 w-8 h-8 rounded-full font-black text-base flex items-center justify-center transition-colors cursor-pointer">✕</button>
            </div>
            
            <div className="space-y-4 pt-2">
              <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Cliente</label><input type="text" value={clienteEffettivo} onChange={e=>setClienteEffettivo(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-sky-500" /></div>
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
              <button onClick={handleConfermaChiudi} disabled={loading} className="w-2/3 py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer">{loading ? '...' : 'Salva Modifiche'}</button>
            </div>
          </div>
        </div>
      )}

      {modalRapportino && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 space-y-6 text-slate-900 my-auto printable-area">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
              <div className="flex items-center gap-3">
                <div className="bg-sky-500 text-white font-black text-2xl w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">bw</div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">BW SOLUTIONS S.R.L.</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Rapportino Tecnico di Intervento</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-slate-400 block">N. Intervento: #{modalRapportino.id || '1001'}</span>
                <span className="text-xs font-bold text-slate-700 block">Data: {getNormalizedDate(modalRapportino.data)}</span>
              </div>
            </div>

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

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">Descrizione Prestazione</th>
                    <th className="p-3 text-center">Ore Cantiere</th>
                    <th className="p-3 text-center">Ore Backoffice</th>
                    <th className="p-3 text-center">Totale Ore</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="p-3 font-bold text-slate-800">{toText(modalRapportino.progetto)}</td>
                    <td className="p-3 text-center">{modalRapportino.ore || 0} h</td>
                    <td className="p-3 text-center">{modalRapportino.ore_backoffice || 0} h</td>
                    <td className="p-3 text-center font-black text-sky-600">{(Number(modalRapportino.ore || 0) + Number(modalRapportino.ore_backoffice || 0))} h</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Note e Dettaglio Lavori Svolti</span>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 min-h-[100px] whitespace-pre-wrap">
                {modalRapportino.note || "Nessuna nota aggiuntiva specificata per questo intervento."}
              </div>
            </div>

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
