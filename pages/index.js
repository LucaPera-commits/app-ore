import React, { useState, useEffect, Component } from 'react';
import Head from 'next/head';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Errore React intercettato:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col items-center justify-center font-sans">
          <div className="max-w-xl bg-slate-800 p-6 rounded-3xl border border-rose-500/50 shadow-2xl space-y-4 text-center">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-xl font-bold text-rose-400">Si è verificato un errore nell'interfaccia</h2>
            <p className="text-xs text-slate-300">Dettaglio tecnico dell'eccezione:</p>
            <pre className="bg-black/60 p-4 rounded-2xl text-[11px] text-rose-300 text-left overflow-x-auto whitespace-pre-wrap font-mono border border-slate-700">
              {this.state.error?.toString()}
            </pre>
            <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 font-bold rounded-xl text-xs transition-all shadow-md">
              🔄 Ricarica l'Applicazione
            </button>
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
  'SARACINO COSTRUZIONI', 'SARACINO', 'SAVINO', 'SICMA', 'SIMIC S.P.A', 'SPEICH s.r.l', 'STAT', 
  'STAT_BENACCHIO GROUP', 'STUDIO POLIGEO', 'T.M.C', 'TPL_Borgo S.Dalmazzo', 'TSM', 
  'TUBILINE s.r.l', 'VASILY UDODOV', 'VEGLIA'
];

function getTodayStr() { return new Date().toISOString().split('T')[0]; }
function getCurrentMonthStr() { return new Date().toISOString().slice(0, 7); }
function getFirstDayOfCurrentMonthStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`; }
function getNextMonthStr() { const d = new Date(); let year = d.getFullYear(); let month = d.getMonth() + 2; if (month > 12) { month = 1; year += 1; } return `${year}-${String(month).padStart(2, '0')}`; }

function getNomeMeseText(annoMeseStr) {
  if (!annoMeseStr) return '';
  try {
    const [year, month] = annoMeseStr.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  } catch (e) { return String(annoMeseStr); }
}

function getNormalizedDate(d) {
  if (!d) return getTodayStr();
  if (typeof d !== 'string' && typeof d !== 'number') return getTodayStr();
  return String(d).split('T')[0].split(' ')[0];
}

function formatDateSafely(dateVal) {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal).split('T')[0];
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch (e) { return String(dateVal); }
}

function toText(val) {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

function renderStars(rating) {
  const parsed = Math.floor(Number(rating));
  const count = isNaN(parsed) || parsed < 1 ? 5 : Math.min(5, parsed);
  return '⭐'.repeat(count);
}

function matchNomeDipendente(nomeDb, filtro) {
  if (!filtro || filtro === 'Tutti') return true; 
  if (!nomeDb) return false;
  const db = String(nomeDb).toLowerCase().trim();
  const flt = String(filtro).toLowerCase().trim();
  if (db === flt) return true;
  const partiFiltro = flt.split(' ').filter(Boolean);
  const partiDb = db.split(' ').filter(Boolean);
  return partiFiltro[0] && partiDb[0] && partiFiltro[0] === partiDb[0];
}

function isItemDaAssegnare(item) {
  if (!item) return false;
  if (item.stato === 'annullato') return false;
  const dip = toText(item.dipendente).toLowerCase().trim();
  return !dip || dip === 'da assegnare' || dip === 'da_assegnare' || dip === 'nessuno' || dip === 'null' || dip === 'undefined';
}

function isFerie(item) { return toText(item?.progetto).toLowerCase().includes('ferie'); }
function isPermesso(item) { return toText(item?.progetto).toLowerCase().includes('permesso') || toText(item?.progetto).toLowerCase().includes('rol'); }
function isMalattia(item) { return toText(item?.progetto).toLowerCase().includes('malattia'); }
function isAssenza(item) { return isFerie(item) || isPermesso(item) || isMalattia(item) || toText(item?.cliente).toLowerCase().includes('assenze'); }
function getFeedbackKey(fb) { if (!fb || !fb.id) return null; return fb.risposta ? `${fb.id}_ans_${fb.risposta_at || ''}` : `${fb.id}`; }
function getParentPath(path) { if (!path) return ''; const cleanPath = String(path).replace(/^\/+|\/+$/g, ''); const parts = cleanPath.split('/').filter(Boolean); if (parts.length <= 1) return ''; parts.pop(); return parts.join('/'); }

function getGiorniLavorativiMese(annoMeseStr) {
  if (!annoMeseStr) return 22;
  try {
    const [year, month] = annoMeseStr.split('-').map(Number);
    let count = 0;
    const date = new Date(year, month - 1, 1);
    while (date.getMonth() === month - 1) {
      const day = date.getDay();
      if (day !== 0 && day !== 6) count++;
      date.setDate(date.getDate() + 1);
    }
    return count;
  } catch (e) { return 22; }
}

function getMondayOfCurrentWeek(dateInput = new Date()) {
  const d = new Date(dateInput);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function get7DaysOfWeek(mondayStr) {
  const days = [];
  const curr = new Date(mondayStr);
  for (let i = 0; i < 7; i++) {
    const d = new Date(curr);
    d.setDate(curr.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function getGiorniLavorativiMancanti(storico, nomeDip) {
  if (!nomeDip) return [];
  const oggi = new Date();
  const giorniMancanti = [];

  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(oggi.getDate() - i);
    const dayOfWeek = d.getDay();
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
  
  const [activeTab, setActiveTab] = useState('home');
  const [pathNC, setPathNC] = useState('');
  const [navHistory, setNavHistory] = useState([]);

  const [categoriaForm, setCategoriaForm] = useState('lavoro');
  const [formData, setFormData] = useState({
    dipendente: 'Da Assegnare', cliente: '', progetto: '', data: getTodayStr(), data_fine: getTodayStr(),
    usaIntervallo: false, ore: 8, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0, note: '', stato: 'pianificato'
  });

  const [plannerWeekStart, setPlannerWeekStart] = useState(getMondayOfCurrentWeek());
  
  // STATO PER PLANNER COLLASSABILE
  const [plannerEspansi, setPlannerEspansi] = useState(() => {
    const init = { 'Da Assegnare': true };
    Object.values(UTENTI).forEach(u => init[u.nome] = true);
    return init;
  });

  const togglePlannerRow = (dipNome) => {
    setPlannerEspansi(prev => ({ ...prev, [dipNome]: !prev[dipNome] }));
  };

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
  const [rispostaApertaId, setRispostaApertaId] = useState(null);
  const [testoRispostaAdmin, setTestoRispostaAdmin] = useState('');

  const [cartelleAperte, setCartelleAperte] = useState({ 'Da Assegnare': true });
  const [sottoCartelleAperte, setSottoCartelleAperte] = useState({});

  const toggleCartella = (nome) => setCartelleAperte(prev => ({ ...prev, [nome]: !prev[nome] }));
  const toggleSottoCartella = (key) => setSottoCartelleAperte(prev => ({ ...prev, [key]: !prev[key] }));

  const [searchQueryNC, setSearchQueryNC] = useState('');
  const [risultatiNC, setRisultatiNC] = useState([]);
  const [loadingNC, setLoadingNC] = useState(false);
  const [errorNC, setErrorNC] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [modalDocumento, setModalDocumento] = useState(null);

  const [filtroMeseReport, setFiltroMeseReport] = useState(getCurrentMonthStr());
  const [subTabReport, setSubTabReport] = useState('paghe');
  const [filtroClienteFatturazione, setFiltroClienteFatturazione] = useState('Tutti');

  const [modalItem, setModalItem] = useState(null);
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
  const safeReadIds = Array.isArray(readFeedbackIds) ? readFeedbackIds : [];

  function canEditItem(item) {
    if (!currentUser) return false;
    if (currentUser.ruolo === 'admin') return true;
    return matchNomeDipendente(item?.dipendente, currentUser.nome);
  }

  function navigateTo(targetTab, targetPathNC = '') {
    const cleanTargetFolder = targetPathNC ? String(targetPathNC).replace(/^\/+|\/+$/g, '') : '';
    if (targetTab === activeTab && cleanTargetFolder === pathNC) return;

    setNavHistory(prev => [...prev, { tab: activeTab, pathNC: pathNC }]);
    setActiveTab(targetTab);
    setPathNC(cleanTargetFolder);
  }

  function handleGoBack() {
    if (navHistory.length === 0) return;
    const lastState = navHistory[navHistory.length - 1];
    setNavHistory(prev => prev.slice(0, prev.length - 1));
    setActiveTab(lastState.tab);
    setPathNC(lastState.pathNC || '');
    setSearchQueryNC('');
  }

  function handleApriCartella(percorso) { setSearchQueryNC(''); navigateTo('documenti', percorso); }
  function handleCartellaSuperioreNC() { const parent = getParentPath(pathNC); setSearchQueryNC(''); navigateTo('documenti', parent); }

  useEffect(() => {
    setIsMounted(true);
    try { const saved = localStorage.getItem('bw_user'); if (saved) setCurrentUser(JSON.parse(saved)); } catch (e) { localStorage.removeItem('bw_user'); }
    try { const savedRead = localStorage.getItem('bw_read_feedbacks'); if (savedRead) { const parsed = JSON.parse(savedRead); if (Array.isArray(parsed)) setReadFeedbackIds(parsed); } } catch (e) { localStorage.removeItem('bw_read_feedbacks'); }
  }, []);

  useEffect(() => { if (currentUser) { setFormData(prev => ({ ...prev, dipendente: currentUser.nome })); } }, [currentUser]);

  useEffect(() => {
    const today = getTodayStr();
    const eDaAssegnare = isItemDaAssegnare({ dipendente: formData.dipendente });
    if (eDaAssegnare || formData.data > today) { setFormData(prev => ({ ...prev, stato: 'pianificato', ore_straordinario: 0 })); } 
    else { setFormData(prev => ({ ...prev, stato: 'consuntivo' })); }
  }, [formData.data, formData.dipendente]);

  useEffect(() => {
    if (categoriaForm === 'ferie') { setFormData(prev => ({ ...prev, cliente: 'ASSENZE / GIUSTIFICATIVI', progetto: 'Ferie', ore: 8, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0 })); } 
    else if (categoriaForm === 'permesso') { setFormData(prev => ({ ...prev, cliente: 'ASSENZE / GIUSTIFICATIVI', progetto: 'Permesso', ore: 4, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0 })); } 
    else if (categoriaForm === 'malattia') { setFormData(prev => ({ ...prev, cliente: 'ASSENZE / GIUSTIFICATIVI', progetto: 'Malattia', ore: 8, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0 })); } 
    else if (categoriaForm === 'lavoro' && formData.cliente === 'ASSENZE / GIUSTIFICATIVI') { setFormData(prev => ({ ...prev, cliente: '', progetto: '', ore: 8 })); }
  }, [categoriaForm]);

  const fetchProgrammati = async () => {
    setLoadingProgrammati(true);
    try {
      const res = await fetch(`/api/gestisci?mode=all&_t=${Date.now()}`);
      if (res.ok) { const dati = await res.json(); setStoricoCompleto(Array.isArray(dati) ? dati : []); }
    } catch (e) { console.error("Errore fetch:", e); } 
    finally { setLoadingProgrammati(false); }
  };

  const fetchFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const isInclude = currentUser?.ruolo === 'admin' && filtroArchivioAdmin;
      const res = await fetch(`/api/feedback?includeDeleted=${isInclude ? 'true' : 'false'}&_t=${Date.now()}`);
      if (res.ok) { const data = await res.json(); setFeedbackList(Array.isArray(data) ? data : []); }
    } catch (e) { console.error("Errore feedback:", e); }
    finally { setLoadingFeedback(false); }
  };

  const handleSilentSync = async () => {
    if (currentUser?.ruolo !== 'admin') return;
    try { const res = await fetch('/api/sync', { method: 'POST' }); if (res.ok) fetchProgrammati(); } catch (e) {}
  };

  useEffect(() => {
    if (currentUser && isMounted) {
      fetchProgrammati(); fetchFeedback();
      if (currentUser.ruolo === 'admin') { handleSilentSync(); const interval = setInterval(handleSilentSync, 180000); return () => clearInterval(interval); }
    }
  }, [currentUser, activeTab, filtroArchivioAdmin, isMounted]);

  const unreadFeedbackCount = safeFeedbackList.filter(fb => {
    if (!fb || fb.is_deleted) return false;
    const key = getFeedbackKey(fb);
    if (!key) return false;
    if (currentUser?.ruolo === 'admin') return !fb.risposta && !safeReadIds.includes(key);
    const isMyReply = currentUser?.nome && matchNomeDipendente(fb.autore, currentUser.nome) && fb.risposta;
    return (isMyReply || !safeReadIds.includes(String(fb.id))) && !safeReadIds.includes(key);
  }).length;

  const handleInviaFeedback = async (e) => {
    e.preventDefault(); if (!feedbackForm.messaggio.trim()) return;
    setLoading(true); setFeedbackStatus(null);
    try {
      const res = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autore: currentUser.nome, categoria: feedbackForm.categoria, valutazione: feedbackForm.valutazione, messaggio: feedbackForm.messaggio.trim() }) });
      const data = await res.json();
      if (res.ok) { setFeedbackStatus({ type: 'success', text: 'Grazie! Il tuo suggerimento è stato inviato.' }); setFeedbackForm({ categoria: '💡 Nuova Funzionalità', valutazione: 5, messaggio: '' }); fetchFeedback(); } 
      else { setFeedbackStatus({ type: 'error', text: data.error || 'Errore durante l\'invio.' }); }
    } catch (e) { setFeedbackStatus({ type: 'error', text: 'Errore di connessione al server.' }); } 
    finally { setLoading(false); }
  };

  const handleInviaRispostaAdmin = async (id) => {
    if (!testoRispostaAdmin.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/feedback', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, risposta: testoRispostaAdmin.trim() }) });
      if (res.ok) { setRispostaApertaId(null); setTestoRispostaAdmin(''); fetchFeedback(); }
    } catch (e) {} finally { setLoading(false); }
  };

  const handleToggleSoftDelete = async (id, statoAttuale) => {
    const nuovaAzione = !statoAttuale;
    if (!confirm(nuovaAzione ? "Rimuovere dalla bacheca pubblica?" : "Ripristinare in bacheca?")) return;
    setLoading(true);
    try {
      const res = await fetch('/api/feedback', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, is_deleted: nuovaAzione }) });
      if (res.ok) fetchFeedback();
    } catch (e) {} finally { setLoading(false); }
  };

  const handleApprovaAssenza = async (item) => {
    if (!item) return; setLoading(true);
    try {
      const res = await fetch('/api/gestisci', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, calendar_event_id: item.calendar_event_id, stato: 'pianificato', chiudi_consuntivo: false }) });
      if (res.ok) fetchProgrammati();
    } catch (e) { alert("Errore"); } finally { setLoading(false); }
  };

  const handleRifiutaAssenza = async (item) => {
    if (!item) return; if (!confirm(`Rifiutare la richiesta di ${toText(item.progetto)}?`)) return; setLoading(true);
    try {
      const res = await fetch('/api/gestisci', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, calendar_event_id: item.calendar_event_id }) });
      if (res.ok) fetchProgrammati();
    } catch (e) { alert("Errore"); } finally { setLoading(false); }
  };

  const caricaContenutoNC = async (folderPath = '', search = '') => {
    setLoadingNC(true); setErrorNC(null);
    try {
      const res = await fetch(`/api/documenti?folder=${encodeURIComponent(folderPath)}&query=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok) { setRisultatiNC(Array.isArray(data.risultati) ? data.risultati : []); setIsSearchMode(data.isSearch || false); } 
      else { setErrorNC(data.message || 'Errore nel caricamento documenti'); }
    } catch (err) { setErrorNC('Impossibile contattare il server Nextcloud'); } 
    finally { setLoadingNC(false); }
  };

  useEffect(() => { if (activeTab === 'documenti' && !searchQueryNC && isMounted) { caricaContenutoNC(pathNC, ''); } }, [activeTab, pathNC, isMounted]);

  const handleCercaNextcloud = (e) => { e.preventDefault(); if (!searchQueryNC.trim()) caricaContenutoNC(pathNC, ''); else caricaContenutoNC('', searchQueryNC); };

  const handleLogin = (e) => {
    e.preventDefault(); const user = UTENTI[loginForm.username.toLowerCase().trim()];
    if (user && user.pass === loginForm.password) { setCurrentUser(user); localStorage.setItem('bw_user', JSON.stringify(user)); setFormData(prev => ({ ...prev, dipendente: user.nome })); navigateTo('home'); } 
    else { alert("Credenziali non valide."); }
  };

  const handleLogout = () => { setCurrentUser(null); localStorage.removeItem('bw_user'); setLoginForm({ username: '', password: '' }); setShowPassword(false); };

  const handleSyncCalendar = async () => {
    if (currentUser?.ruolo !== 'admin') return alert("Solo admin.");
    setLoadingProgrammati(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' }); const data = await res.json();
      alert(data.message || "Sincronizzato."); fetchProgrammati();
    } catch (e) { alert("Errore rete"); } 
    finally { setLoadingProgrammati(false); }
  };

  const handleQuickReassign = async (item, nuovoDipendente) => {
    if (currentUser?.ruolo !== 'admin' || !item || !nuovoDipendente || nuovoDipendente === item.dipendente) return;
    try {
      const res = await fetch('/api/gestisci', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, calendar_event_id: item.calendar_event_id, dipendente: nuovoDipendente, chiudi_consuntivo: false }) });
      if (res.ok) fetchProgrammati();
    } catch (e) {}
  };

  const nuovaAttivitaDaPlanner = (dip, dataStr) => {
    setFormData(prev => ({ ...prev, dipendente: dip, data: dataStr, data_fine: dataStr, usaIntervallo: false }));
    navigateTo('nuovo');
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setStatusMessage(null);

    if (!formData.cliente || !formData.cliente.trim()) { setStatusMessage({ type: 'error', text: '⚠️ Errore: Inserisci o seleziona il Cliente! È un campo obbligatorio.' }); return; }
    if (!formData.progetto || !formData.progetto.trim()) { setStatusMessage({ type: 'error', text: '⚠️ Errore: Inserisci il Progetto o Dettaglio dell\'attività! È un campo obbligatorio.' }); return; }

    const totOreForm = Number(formData.ore || 0) + Number(formData.ore_backoffice || 0) + Number(formData.ore_straordinario || 0);
    if (totOreForm <= 0) { setStatusMessage({ type: 'error', text: '⚠️ Errore: Specificare almeno 0.5 ore di attività!' }); return; }

    if (totOreForm > 12) { if (!confirm(`⚠️ Attenzione: stai registrando un totale di ${totOreForm} ore in una singola giornata. Confermi che la cifra è corretta?`)) { return; } }

    const primoGiornoMeseCorrente = getFirstDayOfCurrentMonthStr();
    if (currentUser?.ruolo !== 'admin' && formData.data < primoGiornoMeseCorrente) {
      setStatusMessage({ type: 'error', text: '🔒 Mese Passato Consolidato: Non puoi inserire o modificare dati dei mesi scorsi. Contatta un amministratore.' }); return;
    }

    const oggi = new Date(); const dataSelezionata = new Date(formData.data);
    const diffGiorni = (oggi - dataSelezionata) / (1000 * 60 * 60 * 24);

    if (diffGiorni > 2.5 && (!formData.note || !formData.note.trim())) {
      setStatusMessage({ type: 'error', text: '⏱️ Inserimento Tardivo (+48h): Quando registri attività passate con ritardo è OBBLIGATORIO specificare una breve nota esplicativa.' }); return;
    }

    setLoading(true);

    try {
      let dateDaSalvare = [formData.data];
      if (formData.usaIntervallo && formData.data_fine > formData.data) {
        dateDaSalvare = []; let curr = new Date(formData.data); const end = new Date(formData.data_fine);
        while (curr <= end) {
          const dayOfWeek = curr.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) { dateDaSalvare.push(curr.toISOString().split('T')[0]); }
          curr.setDate(curr.getDate() + 1);
        }
      }
      if (dateDaSalvare.length === 0) dateDaSalvare = [formData.data];

      const testoProgetto = (formData.progetto || '').toLowerCase();
      const testoCliente = (formData.cliente || '').toLowerCase();
      const eRichiestaAssenza = categoriaForm === 'ferie' || categoriaForm === 'permesso' || testoProgetto.includes('ferie') || testoProgetto.includes('permesso') || testoProgetto.includes('rol') || testoCliente.includes('assenze');

      let statoDaImpostare = formData.stato;
      if (eRichiestaAssenza && currentUser?.ruolo !== 'admin') { statoDaImpostare = 'in_approvazione'; }

      let salvatiOk = 0; let ultimoMessaggioErrore = '';

      for (const d of dateDaSalvare) {
        const payload = { ...formData, data: d, stato: statoDaImpostare, ore_straordinario: formData.stato === 'consuntivo' ? (formData.ore_straordinario || 0) : 0 };
        const res = await fetch('/api/salva', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

        if (res.ok) { salvatiOk++; } 
        else {
          let errText = '';
          try { const errData = await res.json(); errText = errData.message || errData.error || `Errore HTTP ${res.status}`; } 
          catch (pErr) { const rawBody = await res.text().catch(() => ''); errText = `Errore Server (${res.status}): ${rawBody.slice(0, 120) || 'Risposta non valida'}`; }
          ultimoMessaggioErrore = errText;
        }
      }

      if (salvatiOk > 0) {
        const msgOk = statoDaImpostare === 'in_approvazione' ? `Richiesta inviata in approvazione all'amministratore per ${salvatiOk} giornat${salvatiOk > 1 ? 'e' : 'a'}!` : `Registrazione effettuata per ${salvatiOk} giornat${salvatiOk > 1 ? 'e' : 'a'}!`;
        setStatusMessage({ type: 'success', text: msgOk });
        setFormData(prev => ({ ...prev, cliente: '', progetto: '', note: '', ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0, usaIntervallo: false }));
        setCategoriaForm('lavoro'); fetchProgrammati();
      } else { setStatusMessage({ type: 'error', text: ultimoMessaggioErrore || 'Errore di salvataggio sconosciuto.' }); }
    } catch (err) { setStatusMessage({ type: 'error', text: `Errore Rete Client: ${err?.message || err}` }); } 
    finally { setLoading(false); }
  };

  const handleConfermaChiudi = async () => {
    if (!modalItem) return;
    if (!clienteEffettivo || !clienteEffettivo.trim()) { alert("⚠️ Il campo Cliente è obbligatorio per salvare l'attività!"); return; }
    if (!progettoEffettivo || !progettoEffettivo.trim()) { alert("⚠️ Il campo Progetto / Dettaglio è obbligatorio per salvare l'attività!"); return; }

    const primoGiornoMeseCorrente = getFirstDayOfCurrentMonthStr();
    if (currentUser?.ruolo !== 'admin' && getNormalizedDate(modalItem.data) < primoGiornoMeseCorrente) { alert("🔒 Mese Passato Consolidato: Non puoi modificare i dati dei mesi scorsi."); return; }

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
    } catch (e) { alert("Errore"); } finally { setLoading(false); }
  };

  const handleElimina = async (item) => {
    if (!item || !canEditItem(item)) return alert("Operazione non permessa.");
    const primoGiornoMeseCorrente = getFirstDayOfCurrentMonthStr();
    if (currentUser?.ruolo !== 'admin' && getNormalizedDate(item.data) < primoGiornoMeseCorrente) { return alert("🔒 Non puoi eliminare attività dei mesi scorsi."); }
    if (!confirm(`Annullare l'attività "${toText(item.cliente)}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/gestisci', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, calendar_event_id: item.calendar_event_id }) });
      if (res.ok) fetchProgrammati();
    } catch (e) {} finally { setLoading(false); }
  };

  const openEditModal = (item) => {
    if (!item) return;
    if (!canEditItem(item)) { alert(`Sola lettura per l'attività di ${toText(item.dipendente)}.`); return; }
    setModalItem(item);
    setOreEffettive(item.ore || 0); setOreBackofficeEffettive(item.ore_backoffice || 0); setOreTrasfertaEffettive(item.ore_trasferta || 0); setOreStraordinarioEffettive(item.ore_straordinario || 0);
    setDipendenteEffettivo(isItemDaAssegnare(item) ? currentUser?.nome : item.dipendente);
    setClienteEffettivo(item.cliente || ''); setProgettoEffettivo(item.progetto || ''); setNoteEffettive(item.note || '');
  };

  const exportCSVPaghe = () => {
    let csv = "Dipendente;Mese;Ore Cantiere;Ore Backoffice;Ore Trasferta;Ore Straordinario;Ore Ferie;Ore Permessi/ROL;Ore Malattia;Totale Ore Impegnate\n";
    listaDipendenti.forEach(nomeDip => {
      const eventi = safeStorico.filter(item => item && getNormalizedDate(item.data).startsWith(filtroMeseReport) && matchNomeDipendente(item.dipendente, nomeDip) && item.stato === 'consuntivo');
      const oreCantiere = eventi.filter(i => !isAssenza(i)).reduce((a, b) => a + Number(b.ore || 0), 0);
      const oreBackoffice = eventi.filter(i => !isAssenza(i)).reduce((a, b) => a + Number(b.ore_backoffice || 0), 0);
      const oreTrasferta = eventi.filter(i => !isAssenza(i)).reduce((a, b) => a + Number(b.ore_trasferta || 0), 0);
      const oreStraordinario = eventi.filter(i => !isAssenza(i)).reduce((a, b) => a + Number(b.ore_straordinario || 0), 0);
      const oreFerie = eventi.filter(i => isFerie(i)).reduce((a, b) => a + Number(b.ore || 0), 0);
      const orePermesso = eventi.filter(i => isPermesso(i)).reduce((a, b) => a + Number(b.ore || 0), 0);
      const oreMalattia = eventi.filter(i => isMalattia(i)).reduce((a, b) => a + Number(b.ore || 0), 0);
      const tot = oreCantiere + oreBackoffice + oreStraordinario + oreFerie + orePermesso + oreMalattia;
      csv += `"${nomeDip}";"${filtroMeseReport}";"${oreCantiere}";"${oreBackoffice}";"${oreTrasferta}";"${oreStraordinario}";"${oreFerie}";"${orePermesso}";"${oreMalattia}";"${tot}"\n`;
    });

    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.setAttribute("href", url); link.setAttribute("download", `Report_Buste_Paga_${filtroMeseReport}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const exportCSVFatturazione = () => {
    let csv = "Cliente;Commessa / Progetto;Dipendente;Data;Ore Cantiere;Ore Backoffice;Ore Trasferta;Ore Straordinario;Note\n";
    const consuntivi = safeStorico.filter(item => item && getNormalizedDate(item.data).startsWith(filtroMeseReport) && (filtroClienteFatturazione === 'Tutti' || item.cliente === filtroClienteFatturazione) && item.stato === 'consuntivo' && !isAssenza(item));

    [...consuntivi].sort((a, b) => toText(a.cliente).localeCompare(toText(b.cliente))).forEach(row => {
      csv += `"${toText(row.cliente)}";"${toText(row.progetto)}";"${toText(row.dipendente)}";"${getNormalizedDate(row.data)}";"${row.ore || 0}";"${row.ore_backoffice || 0}";"${row.ore_trasferta || 0}";"${row.ore_straordinario || 0}";"${toText(row.note).replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.setAttribute("href", url); link.setAttribute("download", `Report_Fatturazione_${filtroMeseReport}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const isAlessandro = formData.dipendente === 'Alessandro Ciule';
  const todayStr = getTodayStr();

  const daAssegnareItems = safeStorico.filter(isItemDaAssegnare);
  const dipendentiVisibili = listaDipendenti;

  const giorniMancantiUtente = currentUser?.nome ? getGiorniLavorativiMancanti(safeStorico, currentUser.nome) : [];

  const assenzeDaApprovareAdmin = safeStorico.filter(s => s && s.stato === 'in_approvazione');
  const mieAttivitaArretrato = safeStorico.filter(s => s && currentUser?.nome && matchNomeDipendente(s.dipendente, currentUser.nome) && s.stato !== 'consuntivo' && s.stato !== 'annullato' && getNormalizedDate(s.data) <= todayStr);
  const mieAttivitaProssime = safeStorico.filter(s => s && currentUser?.nome && matchNomeDipendente(s.dipendente, currentUser.nome) && s.stato !== 'consuntivo' && s.stato !== 'annullato' && getNormalizedDate(s.data) > todayStr);
  const consuntiviTeamDaChiudere = safeStorico.filter(s => s && s.stato !== 'consuntivo' && s.stato !== 'annullato' && getNormalizedDate(s.data) <= todayStr);

  const nextMonthStr = getNextMonthStr();
  const nomeMeseProssimoText = getNomeMeseText(nextMonthStr);
  const giorniLavorativiProssimoMese = getGiorniLavorativiMese(nextMonthStr);
  const oreLavorativeTotaliProssimoMese = giorniLavorativiProssimoMese * 8;

  const riepilogoDisponibilitaProssimoMese = listaDipendenti.map(nomeDip => {
    const eventiDipMese = safeStorico.filter(item => item && getNormalizedDate(item.data).startsWith(nextMonthStr) && matchNomeDipendente(item.dipendente, nomeDip) && item.stato !== 'annullato');
    const oreImpegnateTotali = eventiDipMese.reduce((acc, curr) => acc + Number(curr.ore || 0) + Number(curr.ore_backoffice || 0) + Number(curr.ore_trasferta || 0), 0);
    const oreDisponibiliResidue = Math.max(0, oreLavorativeTotaliProssimoMese - oreImpegnateTotali);
    const giorniDisponibiliResidui = (oreDisponibiliResidue / 8).toFixed(1);
    return { nome: nomeDip, oreImpegnateTotali, oreDisponibiliResidue, giorniDisponibiliResidui };
  });

  const safeRisultatiNC = Array.isArray(risultatiNC) ? risultatiNC : [];
  const giorniSettimanaPlanner = get7DaysOfWeek(plannerWeekStart);

  const handleShiftWeek = (deltaDays) => {
    const curr = new Date(plannerWeekStart);
    curr.setDate(curr.getDate() + deltaDays);
    setPlannerWeekStart(getMondayOfCurrentWeek(curr));
  };

  const renderRigaAttivita = (item, colorTheme, idx = 0) => {
    if (!item) return null;
    const normDate = getNormalizedDate(item.data);
    const isAssenzaFlag = isFerie(item) || isPermesso(item) || isMalattia(item);
    const isInApprovazione = item.stato === 'in_approvazione';
    
    let icona = '💼'; let etichetta = 'Cantiere'; let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

    if (isFerie(item)) { icona = '🏖️'; etichetta = 'Ferie'; badgeStyle = 'bg-amber-100 text-amber-800 border-amber-300'; }
    else if (isPermesso(item)) { icona = '⏱️'; etichetta = 'Permesso'; badgeStyle = 'bg-indigo-100 text-indigo-800 border-indigo-300'; }
    else if (isMalattia(item)) { icona = '🏥'; etichetta = 'Malattia'; badgeStyle = 'bg-rose-100 text-rose-800 border-rose-300'; }
    else if (Number(item.ore_trasferta || 0) > 0) { icona = '🚗'; etichetta = 'Trasferta'; badgeStyle = 'bg-purple-100 text-purple-800 border-purple-300'; }
    else if (Number(item.ore_backoffice || 0) > 0) { icona = '🖥️'; etichetta = 'Backoffice'; badgeStyle = 'bg-sky-100 text-sky-800 border-sky-300'; }

    const isEditable = canEditItem(item);
    const keyVal = item.id || item.calendar_event_id || `att_${idx}`;

    return (
      <div key={keyVal} onClick={() => openEditModal(item)} className={`p-3.5 bg-${colorTheme}-50/40 border border-${colorTheme}-200 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-sm cursor-pointer hover:border-sky-400 hover:shadow-md transition-all group`}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 shadow-xs">{normDate === todayStr ? 'Oggi' : normDate}</span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border flex items-center gap-1 shadow-xs ${badgeStyle}`}><span>{icona}</span> {etichetta}</span>
            {isInApprovazione && <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg border border-amber-500 shadow-xs animate-pulse">⏳ In Approvazione Admin</span>}
            {Number(item.ore_straordinario || 0) > 0 && <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-300 shadow-xs">⚡ +{item.ore_straordinario}h Straord.</span>}
          </div>
          <div className="font-bold text-slate-900 text-sm truncate group-hover:text-sky-700 transition-colors">{isAssenzaFlag ? toText(item.progetto) : (toText(item.cliente) || "⚠️ Cliente non assegnato")}</div>
          {!isAssenzaFlag && <div className="text-xs text-slate-600 truncate max-w-xs">{toText(item.progetto) || "⚠️ Dettaglio mancante"}</div>}
          {item.note && <div className="text-[11px] text-slate-500 italic mt-1 bg-white p-1.5 rounded-lg border border-slate-100 max-w-xs truncate shadow-xs">📝 {toText(item.note)}</div>}
          
          {currentUser?.ruolo === 'admin' && (
            <div className="mt-2.5 flex items-center gap-2" onClick={e => e.stopPropagation()}>
              <span className="text-[10px] uppercase font-bold text-slate-400">Assegna a:</span>
              <select value={isItemDaAssegnare(item) ? 'Da Assegnare' : item.dipendente} onChange={e => handleQuickReassign(item, e.target.value)} className={`text-xs font-bold px-2 py-0.5 rounded-lg border outline-none cursor-pointer ${isItemDaAssegnare(item) ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-slate-700 border-slate-200'}`}>
                <option value="Da Assegnare">❓ Da Assegnare</option>
                {listaDipendenti.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="flex space-x-2 w-full md:w-auto mt-2 md:mt-0 items-center h-full" onClick={e => e.stopPropagation()}>
          {isInApprovazione && currentUser?.ruolo === 'admin' ? (
            <>
              <button onClick={() => handleApprovaAssenza(item)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-700">✅ Approva</button>
              <button onClick={() => handleRifiutaAssenza(item)} className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-rose-700">❌ Rifiuta</button>
            </>
          ) : isEditable ? (
            <>
              <button onClick={() => openEditModal(item)} className="flex-1 md:flex-none px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-700">{item.stato === 'consuntivo' ? '✏️ Modifica' : '✅ Conferma / Assegna'}</button>
              <button onClick={() => handleElimina(item)} className="flex-1 md:flex-none px-3 py-1.5 bg-white text-rose-600 border border-rose-200 text-xs font-bold rounded-xl hover:bg-rose-50">🗑️ Annulla</button>
            </>
          ) : <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">🔒 Sola Lettura</span>}
        </div>
      </div>
    );
  };

  if (!isMounted) return null;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
        <Head>
          <title>BW Solutions APP</title>
          <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2225%22 fill=%22%230284c7%22/><text y=%2255%25%22 x=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2255%22 font-weight=%22900%22 fill=%22white%22 font-family=%22sans-serif%22>bw</text></svg>" />
        </Head>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-700/50 space-y-6">
            <div className="flex flex-col items-center text-center space-y-3 pb-5 border-b border-slate-100">
              <div className="flex items-center justify-center space-x-3">
                <div className="bg-sky-600 text-white font-extrabold text-xl px-3.5 py-1.5 rounded-2xl shadow-lg tracking-wider">bw</div>
                <div className="text-left">
                  <span className="text-xl font-bold text-slate-900 tracking-tight block leading-tight">bw solutions</span>
                  <span className="text-[11px] text-emerald-600 font-bold tracking-wide uppercase block">Zo&amp;annA S.R.L.</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">Portale Gestionale Ingegneria &amp; Servizi</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Utente</label>
                <input type="text" required value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:ring-2 focus:ring-sky-500/20" placeholder="Inserisci nome utente" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm pr-12 outline-none focus:ring-2 focus:ring-sky-500/20" placeholder="Inserisci password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base p-1">{showPassword ? '👁️' : '🙈'}</button>
                </div>
              </div>
              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all text-sm mt-2">Accedi al Portale ➔</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const renderBreadcrumbs = () => {
    const parts = pathNC ? pathNC.split('/').filter(Boolean) : [];
    let accumulatedPath = '';

    return (
      <div className="flex flex-wrap items-center space-x-1.5 text-xs font-bold text-slate-700 truncate min-w-0 flex-1">
        <button onClick={() => navigateTo('documenti', '')} className={`hover:text-sky-600 cursor-pointer ${parts.length === 0 ? 'text-sky-700 font-black' : 'underline'}`}>🏠 Root</button>
        {parts.map((part, idx) => {
          accumulatedPath += (accumulatedPath ? '/' : '') + part;
          const isLast = idx === parts.length - 1;
          return (
            <React.Fragment key={idx}>
              <span className="text-slate-400">/</span>
              <button onClick={() => !isLast && navigateTo('documenti', accumulatedPath)} className={`transition-colors ${isLast ? 'text-slate-900 font-extrabold cursor-default' : 'underline hover:text-sky-600 text-slate-600 cursor-pointer'}`}>📁 {part}</button>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-800 font-sans flex flex-col md:flex-row">
      <Head>
        <title>BW Solutions APP</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2225%22 fill=%22%230284c7%22/><text y=%2255%25%22 x=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2255%22 font-weight=%22900%22 fill=%22white%22 font-family=%22sans-serif%22>bw</text></svg>" />
      </Head>
      <datalist id="lista-aziende">{LISTA_CLIENTI.map((azienda, index) => <option key={index} value={azienda} />)}</datalist>

      {/* SIDEBAR LATERALE */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col justify-between p-4 sticky top-0 md:h-screen shadow-xl z-40 border-r border-slate-800">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-2 border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo('home')}>
              <div className="bg-sky-500 text-slate-950 font-black text-lg px-3 py-1 rounded-xl shadow-sm">bw</div>
              <div>
                <span className="font-bold text-base text-white leading-none block">bw solutions</span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase block mt-1 tracking-wider">Zo&amp;annA S.R.L.</span>
              </div>
            </div>

            <div className="flex md:hidden items-center space-x-2 text-xs">
              <span className="text-slate-300 font-bold truncate max-w-[100px]">👤 {currentUser?.nome?.split(' ')[0]}</span>
              <button onClick={handleLogout} className="bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white px-2.5 py-1 rounded-lg font-bold transition-all">Esci</button>
            </div>
          </div>

          <nav className="flex md:flex-col space-x-1 md:space-x-0 md:space-y-1.5 overflow-x-auto md:overflow-x-visible text-xs font-semibold">
            {navHistory.length > 0 && (
              <button onClick={handleGoBack} className="w-full px-3.5 py-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold rounded-xl border border-amber-500/40 transition-all flex items-center space-x-2 shadow-sm whitespace-nowrap mb-2 cursor-pointer"><span>⬅️ Torna Indietro</span></button>
            )}

            <button onClick={() => navigateTo('home')} className={`w-full px-3.5 py-3 rounded-xl transition-all text-left flex items-center justify-between whitespace-nowrap ${activeTab === 'home' ? 'bg-sky-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><span className="flex items-center gap-2"><span>🏠</span> Home</span></button>
            <button onClick={() => navigateTo('planner')} className={`w-full px-3.5 py-3 rounded-xl transition-all text-left flex items-center justify-between whitespace-nowrap ${activeTab === 'planner' ? 'bg-sky-400 text-slate-950 font-black shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><span className="flex items-center gap-2"><span>📅</span> Planner Team</span></button>
            <button onClick={() => navigateTo('nuovo')} className={`w-full px-3.5 py-3 rounded-xl transition-all text-left flex items-center justify-between whitespace-nowrap ${activeTab === 'nuovo' ? 'bg-white text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><span className="flex items-center gap-2"><span>📝</span> Inserimento Ore</span></button>

            <button onClick={() => navigateTo('programmati')} className={`w-full px-3.5 py-3 rounded-xl transition-all text-left flex items-center justify-between whitespace-nowrap ${activeTab === 'programmati' ? 'bg-white text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              <span className="flex items-center gap-2"><span>⏳</span> Gestione Attività</span>
              {(daAssegnareItems.length > 0 || (currentUser?.ruolo === 'admin' && assenzeDaApprovareAdmin.length > 0)) && <span className="bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px]">{daAssegnareItems.length + (currentUser?.ruolo === 'admin' ? assenzeDaApprovareAdmin.length : 0)}</span>}
            </button>

            <a href="https://calendar.google.com/" target="_blank" rel="noreferrer" className="w-full px-3.5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all flex items-center space-x-2 shadow-sm whitespace-nowrap"><span>📅</span> <span>Google Calendar</span></a>

            <button onClick={() => navigateTo('feedback')} className={`w-full px-3.5 py-3 rounded-xl transition-all text-left flex items-center justify-between whitespace-nowrap ${activeTab === 'feedback' ? 'bg-white text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              <span className="flex items-center gap-2"><span>💡</span> Suggerimenti</span>
              {unreadFeedbackCount > 0 && <span className="bg-purple-500 text-white font-black px-2 py-0.5 rounded-full text-[10px] animate-pulse">{unreadFeedbackCount}</span>}
            </button>

            <button onClick={() => navigateTo('documenti', pathNC)} className={`w-full px-3.5 py-3 rounded-xl transition-all text-left flex items-center justify-between whitespace-nowrap ${activeTab === 'documenti' ? 'bg-white text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><span className="flex items-center gap-2"><span>📂</span> Cloud Aruba</span></button>
            <a href="https://ug.link/naszoeanna" target="_blank" rel="noreferrer" className="w-full px-3.5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all flex items-center space-x-2 shadow-sm whitespace-nowrap"><span>🖥️</span> <span>NAS UGREEN</span></a>

            {currentUser?.ruolo === 'admin' && (
              <>
                <button onClick={() => navigateTo('cruscotto')} className={`w-full px-3.5 py-3 rounded-xl transition-all text-left flex items-center justify-between whitespace-nowrap ${activeTab === 'cruscotto' ? 'bg-white text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}><span className="flex items-center gap-2"><span>📊</span> Reportistica</span></button>
                <a href="/preventivi" className="w-full px-3.5 py-3 rounded-xl bg-sky-900/60 hover:bg-sky-800 text-sky-200 font-bold border border-sky-700/50 flex items-center gap-2 whitespace-nowrap"><span>💰</span> Preventivi</a>
              </>
            )}
          </nav>
        </div>

        <div className="hidden md:flex flex-col space-y-2 pt-4 border-t border-slate-800 text-xs">
          <div className="flex items-center justify-between bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <span className="text-slate-200 font-bold truncate">👤 {currentUser?.nome}</span>
            <button onClick={handleLogout} className="bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer">Esci</button>
          </div>
        </div>
      </aside>

      {/* CONTENUTO PRINCIPALE */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto space-y-6">

        {navHistory.length > 0 && activeTab !== 'home' && (
          <div className="md:hidden mb-4">
            <button onClick={handleGoBack} className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-2xl border border-slate-200 shadow-sm cursor-pointer"><span>⬅️ Torna indietro</span></button>
          </div>
        )}

        {/* TAB 0: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            {giorniMancantiUtente.length > 0 && (
              <div className="bg-gradient-to-r from-rose-600 to-rose-800 text-white p-5 rounded-3xl shadow-xl border-2 border-rose-400 flex flex-wrap items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white text-rose-700 font-black rounded-2xl flex items-center justify-center text-2xl shadow-md">🚨</div>
                  <div>
                    <div className="text-sm font-black uppercase tracking-wider text-rose-200">Giornate Incomplete Rilevate!</div>
                    <div className="text-xs text-rose-100">Hai <strong>{giorniMancantiUtente.length} giornat{giorniMancantiUtente.length > 1 ? 'e' : 'a'}</strong> lavorativ{giorniMancantiUtente.length > 1 ? 'e' : 'a'} passat{giorniMancantiUtente.length > 1 ? 'e' : 'a'} senza ore registrate ({giorniMancantiUtente.join(', ')}).</div>
                  </div>
                </div>
                <button onClick={() => navigateTo('nuovo')} className="bg-white hover:bg-rose-50 text-rose-900 text-xs px-5 py-2.5 rounded-xl font-black shadow-md transition-all whitespace-nowrap cursor-pointer">Compila Ora ➔</button>
              </div>
            )}

            {currentUser?.ruolo === 'admin' && assenzeDaApprovareAdmin.length > 0 && (
              <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white p-4 rounded-3xl shadow-xl border-2 border-purple-400 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-400 text-slate-950 font-black rounded-2xl flex items-center justify-center text-xl shadow-md">🚨</div>
                  <div>
                    <div className="text-sm font-black uppercase tracking-wider text-amber-300">Nuove Ferie da Approvare!</div>
                    <div className="text-xs text-purple-100">Ci sono <strong>{assenzeDaApprovareAdmin.length}</strong> richieste in sospeso inviate dai dipendenti.</div>
                  </div>
                </div>
                <button onClick={() => { navigateTo('cruscotto'); setSubTabReport('ferie'); }} className="bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs px-4 py-2.5 rounded-xl font-black shadow-md transition-all whitespace-nowrap cursor-pointer">Vai all'Archivio Ferie ➔</button>
              </div>
            )}

            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="relative z-10 space-y-3 max-w-2xl">
                <span className="bg-sky-500/20 text-sky-300 text-xs font-extrabold uppercase px-3 py-1 rounded-full border border-sky-500/30">Pannello Operativo Aziendale</span>
                <h1 className="text-3xl font-extrabold tracking-tight">Bentornato, <span className="text-sky-400">{currentUser?.nome}</span>! 👋</h1>
                <p className="text-slate-300 text-sm leading-relaxed">Accedi a tutte le risorse aziendali: controlla il Planner visuale, registra le ore o apri Google Calendar.</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2"><span>🎯</span> Cruscotto Azioni &amp; Compiti Pendenti</h3>
                <span className="text-xs text-slate-400 font-semibold">In tempo reale</span>
              </div>

              {currentUser?.ruolo === 'admin' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div onClick={() => navigateTo('programmati')} className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 cursor-pointer space-y-2">
                    <div className="flex items-center justify-between"><span className="text-[11px] font-bold text-amber-900 uppercase">Da Assegnare</span><span className="text-base font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-lg border border-amber-300">{daAssegnareItems.length}</span></div>
                    <p className="text-[11px] text-amber-800 font-medium">Interventi da associare ad un tecnico.</p>
                  </div>
                  <div onClick={() => { navigateTo('cruscotto'); setSubTabReport('ferie'); }} className="p-4 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/50 cursor-pointer space-y-2">
                    <div className="flex items-center justify-between"><span className="text-[11px] font-bold text-purple-900 uppercase">Approvazione Ferie</span><span className="text-base font-black text-purple-900 bg-purple-200/80 px-2 py-0.5 rounded-lg border border-purple-300">{assenzeDaApprovareAdmin.length}</span></div>
                    <p className="text-[11px] text-purple-800 font-medium">Richieste ferie/permessi da confermare.</p>
                  </div>
                  <div onClick={() => navigateTo('programmati')} className="p-4 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 cursor-pointer space-y-2">
                    <div className="flex items-center justify-between"><span className="text-[11px] font-bold text-rose-900 uppercase">Consuntivi Scaduti</span><span className="text-base font-black text-rose-900 bg-rose-200/80 px-2 py-0.5 rounded-lg border border-rose-300">{consuntiviTeamDaChiudere.length}</span></div>
                    <p className="text-[11px] text-rose-800 font-medium">Schede ore non ancora consuntivate dal team.</p>
                  </div>
                  <div onClick={() => navigateTo('feedback')} className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/50 cursor-pointer space-y-2">
                    <div className="flex items-center justify-between"><span className="text-[11px] font-bold text-indigo-900 uppercase">Suggerimenti Nuovi</span><span className="text-base font-black text-indigo-900 bg-indigo-200/80 px-2 py-0.5 rounded-lg border border-indigo-300">{unreadFeedbackCount}</span></div>
                    <p className="text-[11px] text-indigo-800 font-medium">Idee dipendenti in attesa di risposta.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div onClick={() => navigateTo('programmati')} className="p-4 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 cursor-pointer space-y-2">
                    <div className="flex items-center justify-between"><span className="text-xs font-bold text-rose-900 uppercase">Da Consuntivare</span><span className="text-lg font-black text-rose-900 bg-rose-200/80 px-2.5 py-0.5 rounded-xl border border-rose-300">{mieAttivitaArretrato.length}</span></div>
                    <p className="text-xs text-rose-800 font-medium">Tue attività passate da confermare.</p>
                  </div>
                  <div onClick={() => navigateTo('programmati')} className="p-4 rounded-2xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100/50 cursor-pointer space-y-2">
                    <div className="flex items-center justify-between"><span className="text-xs font-bold text-sky-900 uppercase">Prossimi Interventi</span><span className="text-lg font-black text-sky-900 bg-sky-200/80 px-2.5 py-0.5 rounded-xl border border-sky-300">{mieAttivitaProssime.length}</span></div>
                    <p className="text-xs text-sky-800 font-medium">Attività e cantieri già programmati.</p>
                  </div>
                  <div onClick={() => navigateTo('feedback')} className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 cursor-pointer space-y-2">
                    <div className="flex items-center justify-between"><span className="text-xs font-bold text-emerald-900 uppercase">Risposte Direzione</span><span className="text-lg font-black text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded-xl border border-emerald-300">{unreadFeedbackCount}</span></div>
                    <p className="text-xs text-emerald-800 font-medium">Risposte ai tuoi suggerimenti.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2"><span>🗓️</span> Disponibilità Team - Mese Successivo ({nomeMeseProssimoText})</h3>
                  <p className="text-xs text-slate-500">Capienza teorica: <strong className="text-slate-800">{giorniLavorativiProssimoMese} giorni lavorativi ({oreLavorativeTotaliProssimoMese} ore)</strong></p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {riepilogoDisponibilitaProssimoMese.map(dip => {
                  const haLibero = Number(dip.giorniDisponibiliResidui) > 0;
                  return (
                    <div key={dip.nome} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2 text-center">
                      <div className="font-bold text-xs text-slate-900 truncate flex items-center justify-center gap-1"><span>👤</span> {dip.nome}</div>
                      <div className={`py-1.5 px-2 rounded-xl text-xs font-black shadow-2xs ${haLibero ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'}`}>{dip.giorniDisponibiliResidui} gg liberi</div>
                      <div className="text-[10px] font-semibold text-slate-500">{dip.oreDisponibiliResidue}h libere su {oreLavorativeTotaliProssimoMese}h</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div onClick={() => navigateTo('planner')} className="bg-gradient-to-br from-sky-500 to-sky-700 text-white p-6 rounded-3xl shadow-md border border-sky-400 cursor-pointer group">
                <div className="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-4">📅</div>
                <h3 className="font-bold text-white text-base mb-1">Planner Team</h3>
                <p className="text-xs text-sky-100 leading-relaxed mb-4">Vista visuale a matrice settimanale della pianificazione.</p>
                <span className="text-xs font-black text-white flex items-center gap-1">Apri Planner ➔</span>
              </div>

              <div onClick={() => navigateTo('nuovo')} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md cursor-pointer group">
                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4">📝</div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Inserimento Ore</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">Registra ore di cantiere, backoffice o assenze.</p>
                <span className="text-xs font-bold text-sky-600 flex items-center gap-1">Registra Ora ➔</span>
              </div>

              <div onClick={() => navigateTo('programmati')} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md cursor-pointer group">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4">⏳</div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Gestione Attività</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">Cartelle per dipendente con attività assegnate e concluse.</p>
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">Apri Cartelle ➔</span>
              </div>

              <a href="https://calendar.google.com/" target="_blank" rel="noreferrer" className="bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 p-6 rounded-3xl shadow-md border border-amber-400 block">
                <div className="w-12 h-12 bg-white/20 text-slate-950 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4">📅</div>
                <h3 className="font-bold text-slate-950 text-base mb-1">Google Calendar</h3>
                <p className="text-xs text-slate-950 leading-relaxed mb-4">Apri direttamente l'applicazione Google Calendar aziendale.</p>
                <span className="text-xs font-extrabold text-slate-950 flex items-center gap-1">Apri Calendar ➔</span>
              </a>
            </div>
          </div>
        )}

        {/* TAB PLANNER SETTIMANALE VISUALE (GANTT) CON FUNZIONE COLLAPSE */}
        {activeTab === 'planner' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
              <div>
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-2"><span>📅</span> Planner Team Settimanale</h2>
                <p className="text-xs text-slate-300 mt-0.5">Clicca sul nome del tecnico per esplodere/ridurre la riga, oppure su una cella vuota per assegnare.</p>
              </div>

              <div className="flex items-center space-x-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
                <button onClick={() => handleShiftWeek(-7)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold cursor-pointer">◀ Settimana Prec.</button>
                <button onClick={() => setPlannerWeekStart(getMondayOfCurrentWeek())} className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-xl text-xs font-black cursor-pointer">Oggi / Questa Set.</button>
                <button onClick={() => handleShiftWeek(7)} className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold cursor-pointer">Settimana Succ. ▶</button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs font-bold">
              <span className="text-slate-400 uppercase font-black text-[10px]">Legenda:</span>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-xl">🟡 Pianificato</span>
              <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-xl">🟢 Svolto (Consuntivo)</span>
              <span className="bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-1 rounded-xl">🟣 Assenza / Ferie</span>
              <span className="bg-rose-100 text-rose-900 border border-rose-300 px-2.5 py-1 rounded-xl">🔴 Scaduto / Da Chiudere</span>
              <span className="bg-indigo-100 text-indigo-900 border border-indigo-300 px-2.5 py-1 rounded-xl">❓ Da Assegnare</span>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-slate-200/90 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold uppercase border-b border-slate-800">
                      <th className="p-3 w-48 min-w-[170px] sticky left-0 bg-slate-900 z-10 border-r border-slate-800">Tecnico / Risorsa</th>
                      {giorniSettimanaPlanner.map((gStr) => {
                        const isToday = gStr === todayStr; const dateObj = new Date(gStr);
                        return (
                          <th key={gStr} className={`p-3 text-center min-w-[130px] border-r border-slate-800 ${isToday ? 'bg-sky-600 text-white' : ''}`}>
                            <div className="uppercase font-black text-[11px]">{dateObj.toLocaleDateString('it-IT', { weekday: 'short' })}</div>
                            <div className="text-[10px] font-normal opacity-80">{dateObj.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {/* RIGA DA ASSEGNARE */}
                    <tr className="bg-amber-50/50 hover:bg-amber-100/30">
                      <td onClick={() => togglePlannerRow('Da Assegnare')} className="p-3 font-bold text-amber-950 sticky left-0 bg-amber-50 z-10 border-r border-amber-200 shadow-2xs cursor-pointer hover:bg-amber-100/60 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2"><span>❓</span><span className="truncate">Da Assegnare</span></div>
                          <span className="text-[10px] text-amber-700">{plannerEspansi['Da Assegnare'] ? '▼' : '▶'}</span>
                        </div>
                      </td>
                      {giorniSettimanaPlanner.map(gStr => {
                        const eventiCella = safeStorico.filter(item => isItemDaAssegnare(item) && getNormalizedDate(item.data) === gStr);
                        const isExpanded = plannerEspansi['Da Assegnare'];
                        return (
                          <td key={`da_ass_${gStr}`} onClick={() => isExpanded && nuovaAttivitaDaPlanner('Da Assegnare', gStr)} className={`p-2 border-r border-amber-200/60 vertical-top ${isExpanded ? 'h-24 hover:bg-amber-100/60 cursor-pointer group' : 'h-10'} transition-all relative`}>
                            {isExpanded ? (
                              <div className="space-y-1.5">
                                {eventiCella.map((ev, evIdx) => (
                                  <div key={ev.id || `da_ass_ev_${evIdx}`} onClick={(e) => { e.stopPropagation(); openEditModal(ev); }} className="p-2 bg-amber-200 text-amber-950 font-bold text-[11px] rounded-xl border border-amber-300 shadow-2xs hover:scale-102 transition-all">
                                    <div className="truncate font-black">{toText(ev.cliente) || "Senza Cliente"}</div>
                                    <div className="truncate text-[10px] font-semibold opacity-90">{toText(ev.progetto)}</div>
                                  </div>
                                ))}
                                {eventiCella.length === 0 && <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-amber-700 block text-center mt-6">+ Assegna</span>}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1.5 items-center justify-center pt-1">
                                {eventiCella.map((ev, evIdx) => <div key={ev.id || evIdx} className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" title={toText(ev.cliente)}></div>)}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* RIGHE DIPENDENTI */}
                    {listaDipendenti.map(nomeDip => {
                      const isExpanded = plannerEspansi[nomeDip];
                      return (
                        <tr key={nomeDip} className="hover:bg-slate-50/80">
                          <td onClick={() => togglePlannerRow(nomeDip)} className="p-3 font-bold text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-2xs cursor-pointer hover:bg-slate-100 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2"><span>👤</span><span className="truncate">{nomeDip}</span></div>
                              <span className="text-[10px] text-slate-400">{isExpanded ? '▼' : '▶'}</span>
                            </div>
                          </td>

                          {giorniSettimanaPlanner.map(gStr => {
                            const eventiCella = safeStorico.filter(item => matchNomeDipendente(item.dipendente, nomeDip) && getNormalizedDate(item.data) === gStr && item.stato !== 'annullato');
                            return (
                              <td key={`${nomeDip}_${gStr}`} onClick={() => isExpanded && nuovaAttivitaDaPlanner(nomeDip, gStr)} className={`p-2 border-r border-slate-200 vertical-top transition-all relative ${isExpanded ? 'h-24 hover:bg-sky-50/60 cursor-pointer group' : 'h-10'} ${gStr === todayStr ? 'bg-sky-50/20' : ''}`}>
                                {isExpanded ? (
                                  <div className="space-y-1.5">
                                    {eventiCella.map((ev, evIdx) => {
                                      const isAss = isAssenza(ev); const isConsuntivo = ev.stato === 'consuntivo'; const isScaduto = !isConsuntivo && gStr <= todayStr && !isAss;
                                      let styleClass = 'bg-amber-100 text-amber-950 border-amber-300';
                                      if (isConsuntivo) styleClass = 'bg-emerald-100 text-emerald-950 border-emerald-300';
                                      else if (isAss) styleClass = 'bg-purple-100 text-purple-950 border-purple-300';
                                      else if (isScaduto) styleClass = 'bg-rose-100 text-rose-950 border-rose-300 animate-pulse';

                                      return (
                                        <div key={ev.id || `cell_ev_${evIdx}`} onClick={(e) => { e.stopPropagation(); openEditModal(ev); }} className={`p-2 font-bold text-[11px] rounded-xl border shadow-2xs hover:scale-102 transition-all ${styleClass}`}>
                                          <div className="truncate font-black">{isAss ? toText(ev.progetto) : (toText(ev.cliente) || "Senza Cliente")}</div>
                                          {!isAss && <div className="truncate text-[10px] font-medium opacity-80">{toText(ev.progetto)}</div>}
                                          <div className="text-[9px] mt-0.5 opacity-70 font-bold">{ev.ore || 8}h {isConsuntivo ? '✅' : '⏳'}</div>
                                        </div>
                                      );
                                    })}
                                    {eventiCella.length === 0 && <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-sky-600 block text-center mt-6">+ Aggiungi</span>}
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-1.5 items-center justify-center pt-1">
                                    {eventiCella.map((ev, evIdx) => {
                                      const isAss = isAssenza(ev); const isConsuntivo = ev.stato === 'consuntivo'; const isScaduto = !isConsuntivo && gStr <= todayStr && !isAss;
                                      let bgDot = 'bg-amber-400';
                                      if (isConsuntivo) bgDot = 'bg-emerald-400'; else if (isAss) bgDot = 'bg-purple-400'; else if (isScaduto) bgDot = 'bg-rose-500 animate-pulse';
                                      return <div key={ev.id || evIdx} className={`w-3 h-3 rounded-full ${bgDot} shadow-sm border border-black/10`} title={toText(ev.cliente) || toText(ev.progetto)}></div>;
                                    })}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ALTRI TAB... (Nuovo, Programmati, Feedback, Documenti, Cruscotto) */}
      </main>

      {/* MODALI RIMANGONO IDENTICI */}
      {modalDocumento && (() => {
        const path = String(modalDocumento.percorso || modalDocumento.path || ''); const ext = path.split('.').pop().toLowerCase();
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const rawFileUrl = `${origin}/api/download?path=${encodeURIComponent(path)}`;
        const isOffice = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext); const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
        const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(rawFileUrl)}&embedded=true`;

        return (
          <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-50 flex items-center justify-center p-2 md:p-6">
            <div className="bg-white rounded-3xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between gap-3 border-b border-slate-800">
                <div className="flex items-center space-x-3 truncate">
                  <span className="text-2xl flex-shrink-0">{isOffice ? '📊' : isImage ? '🖼️' : '📄'}</span>
                  <div className="truncate"><h3 className="font-bold text-sm md:text-base truncate">{toText(modalDocumento.nome)}</h3><p className="text-[10px] text-sky-400 font-medium uppercase">{ext} • Anteprima Online</p></div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <a href={`${origin}/api/download?path=${encodeURIComponent(path)}&forceDownload=true`} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm">📥 Scarica File</a>
                  <button onClick={() => setModalDocumento(null)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer">✕</button>
                </div>
              </div>
              <div className="flex-1 bg-slate-200/50 p-2 overflow-hidden flex items-center justify-center relative">
                {isImage ? <img src={rawFileUrl} alt={toText(modalDocumento.nome)} className="max-h-full max-w-full object-contain rounded-xl shadow-md" /> : <iframe src={isOffice ? googleViewerUrl : rawFileUrl} className="w-full h-full rounded-2xl border border-slate-300 bg-white shadow-inner" title="Anteprima Documento" />}
              </div>
            </div>
          </div>
        );
      })()}

      {modalItem && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div><h3 className="text-lg font-bold text-slate-900">{modalItem.stato === 'consuntivo' ? '✏️ Dettaglio Intervento' : '📋 Scheda Attività'}</h3><p className="text-xs text-slate-500 mt-0.5">Scheda del <strong className="text-slate-800">{getNormalizedDate(modalItem.data)}</strong></p></div>
              <button onClick={() => setModalItem(null)} className="text-slate-400 hover:text-slate-600 font-black text-base p-1 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3 pt-1">
              {(isItemDaAssegnare(modalItem) || currentUser?.ruolo === 'admin') && (
                <div>
                  <label className="block text-xs font-bold text-indigo-600 mb-1 uppercase">Tecnico Assegnato:</label>
                  <select value={dipendenteEffettivo} onChange={e => setDipendenteEffettivo(e.target.value)} className="w-full px-3.5 py-2.5 border rounded-xl bg-indigo-50/70 border-indigo-200 text-sm font-bold text-indigo-900 outline-none">
                    <option value="Da Assegnare">❓ Da Assegnare</option>
                    {listaDipendenti.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Cliente <span className="text-rose-500">*</span></label>
                <input type="text" list="lista-aziende" required value={clienteEffettivo} onChange={e => setClienteEffettivo(e.target.value)} placeholder="Inserisci o seleziona cliente..." className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-sky-200" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Progetto / Dettaglio <span className="text-rose-500">*</span></label>
                <input type="text" required value={progettoEffettivo} onChange={e => setProgettoEffettivo(e.target.value)} placeholder="Es. Assistenza / Manutenzione..." className="w-full px-3.5 py-2.5 border rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-sky-200" />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Ore Cantiere / Assenza</label><input type="number" step="0.5" value={oreEffettive} onChange={e => setOreEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-sky-200" /></div>
                <div><label className="block text-xs font-bold text-sky-600 mb-1 uppercase">Ore Backoffice</label><input type="number" step="0.5" value={oreBackofficeEffettive} onChange={e => setOreBackofficeEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-sky-50 border-sky-200 text-sm font-bold text-sky-800 outline-none focus:ring-2 focus:ring-sky-200" /></div>
                <div><label className="block text-xs font-bold text-purple-600 mb-1 uppercase">🚗 Trasferta</label><input type="number" step="0.5" value={oreTrasfertaEffettive} onChange={e => setOreTrasfertaEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-purple-50 border-purple-200 text-sm font-bold text-purple-800 outline-none" /></div>
                <div><label className="block text-xs font-bold text-amber-600 mb-1 uppercase">⚡ Straordinario</label><input type="number" step="0.5" min="0" value={oreStraordinarioEffettive} onChange={e => setOreStraordinarioEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-amber-50 border-amber-300 text-sm font-extrabold text-amber-900 outline-none" /></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Note &amp; Dettagli</label><textarea rows={2} value={noteEffettive} onChange={e => setNoteEffettive(e.target.value)} placeholder="Note aggiuntive..." className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none"></textarea></div>
            </div>
            <div className="flex space-x-2 pt-2 border-t border-slate-100">
              <button onClick={() => setModalItem(null)} className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Annulla</button>
              <button onClick={handleConfermaChiudi} disabled={loading} className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer">{loading ? '...' : (modalItem.stato === 'consuntivo' ? 'Salva Modifiche ✅' : 'Conferma e Salva ✅')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <HomeContent />
    </ErrorBoundary>
  );
}
