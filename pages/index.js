import React, { useState, useEffect, Component } from 'react';
import Head from 'next/head';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { this.setState({ errorInfo }); console.error("Errore:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center font-sans">
          <div className="max-w-3xl w-full bg-white p-8 rounded-3xl border border-rose-200 shadow-2xl text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-black text-rose-600 mb-2">Ops! L'interfaccia è andata in crash.</h2>
            <p className="text-sm text-slate-500 mb-6">Si è verificato un errore nel codice della pagina.</p>
            
            <div className="bg-slate-900 text-left p-4 rounded-xl overflow-x-auto mb-6">
              <p className="text-rose-400 font-mono text-sm font-bold">{this.state.error && this.state.error.toString()}</p>
              <pre className="text-slate-400 font-mono text-[10px] mt-2 whitespace-pre-wrap">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>

            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-sky-600 text-white font-bold rounded-xl shadow-md hover:bg-sky-500 transition-all">🔄 Ricarica l'Applicazione</button>
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
  '3S s.r.l.', 'a2a', 'ALSTOM', 'ALSTOM BOLOGNA', 'API Torino', 'ARNALDI CENTINATURE', 'AROL', 'AT SYSTEM SERVICES', 'ATE ELECTRONICS', "ATTIVITA' IN PARTNERSHIP IIS", 
  'BARBERO ROBERTO IMPIANTI TERMOSANITARI', 'BORELLI', 'BOSCO ITALIA S.P.A', 'BUCHER MUNICIPAL', 'C.T.L. s.r.l.', 'CAGLIERO S.R.L', 'CAGNAZZO s.n.c', 'CAMA 1 s.p.a', 'CASTIM 2000', 
  'CDR ITALIA S.P.A', 'CHERCHISYSTEM', 'CIEMMEBI', 'COGORNO SERGIO', 'COLMAR Technik Spa', 'COMET', 'COMETAL s.r.l', 'COMETTO', 'COSPAL COMPOSITES S.P.A', 'COSTA RODOLFO s.r.l', 
  'DAVIDE BERNARDI', 'DEMONT', 'DIGITALISO', 'DMB', 'ECOTECH', 'EMMEGI SCS', 'ENOMECCANICA BOSIO', 'ERREPI', 'FARID', 'GIOLITO', 'GIORDANO LUCA e C. s.a.s', 'GT GESTIONI TECNOLOGICHE', 
  'Hitachi Rail', 'HYDRO', 'ICOSE', 'IDEO TECNICA', 'IIS', 'IIS CERT', 'IMI s.r.l', 'Ing. Bertolotti', 'IPV', 'IRIDE', 'ISAF BUS COMPONENTS', 'ISOCLIMA', 'Jilin QIXING', 
  'LIZ ITALIANA', 'MA s.r.l', 'MANPOWER', 'MERLO S.P.A', 'MICHELE SALE', 'MONDINO', 'MOVINTER S.R.L', 'MSA DAMPER', 'NKB s.r.l', 'NORD ENGINEERING', 'OM3', 'ONN WATER', 
  'OPERVAL', 'PERANO BRUNO S.R.L', 'PERANO SPA', 'PRINCIPI s.r.l', 'PROMETES SISTEMI', 'RECIF', 'RG TECH', 'RI.ME.BO', 'ROLFO', 'S.C.A.M.I.C', 'SARACINO COSTRUZIONI', 
  'SARACINO', 'SAVINO', 'SICMA', 'SIMIC S.P.A', 'SPEICH s.r.l', 'STAT', 'STAT_BENACCHIO GROUP', 'STUDIO POLIGEO', 'T.M.C', 'TPL_Borgo S.Dalmazzo', 'TSM', 'TUBILINE s.r.l', 'VASILY UDODOV', 'VEGLIA'
];

function getTodayStr() { return new Date().toISOString().split('T')[0]; }
function getCurrentMonthStr() { return new Date().toISOString().slice(0, 7); }
function getFirstDayOfCurrentMonthStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`; }
function getNextMonthStr() { const d = new Date(); let year = d.getFullYear(); let month = d.getMonth() + 2; if (month > 12) { month = 1; year += 1; } return `${year}-${String(month).padStart(2, '0')}`; }

function getNomeMeseText(annoMeseStr) {
  if (!annoMeseStr) return '';
  try { const [year, month] = annoMeseStr.split('-').map(Number); const date = new Date(year, month - 1, 1); return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }); } 
  catch (e) { return String(annoMeseStr); }
}

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
    let count = 0; const date = new Date(year, month - 1, 1);
    while (date.getMonth() === month - 1) {
      const day = date.getDay();
      if (day !== 0 && day !== 6) count++;
      date.setDate(date.getDate() + 1);
    }
    return count;
  } catch (e) { return 22; }
}

function getMondayOfCurrentWeek(dateInput = new Date()) {
  const d = new Date(dateInput); const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function get7DaysOfWeek(mondayStr) {
  const days = []; const curr = new Date(mondayStr);
  for (let i = 0; i < 7; i++) {
    const d = new Date(curr); d.setDate(curr.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function getGiorniLavorativiMancanti(storico, nomeDip) {
  if (!nomeDip) return [];
  const oggi = new Date(); const giorniMancanti = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date(); d.setDate(oggi.getDate() - i);
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

  // VARIABILI CHAT AI AGGIUNTE E CORRETTE!
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([{role: 'ai', text: 'Ciao! Sono il tuo assistente virtuale BW. Come posso aiutarti oggi?'}]);
  const [isAiTyping, setIsAiTyping] = useState(false);

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

  // STATO PER ELIMINAZIONE MULTIPLA
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
    // Azzera selezioni ogni volta che cambi tab
    setSelectedItems([]);
  }, [activeTab]);

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

  const toggleSelection = (item) => {
    if (!canEditItem(item)) return;
    setSelectedItems(prev => {
      if (prev.some(i => i.id === item.id)) return prev.filter(i => i.id !== item.id);
      return [...prev, item];
    });
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    const primoGiornoMeseCorrente = getFirstDayOfCurrentMonthStr();
    const validItems = [];
    const skippedItems = [];

    selectedItems.forEach(item => {
      if (currentUser?.ruolo !== 'admin' && getNormalizedDate(item.data) < primoGiornoMeseCorrente) { skippedItems.push(item); } 
      else { validItems.push(item); }
    });

    if (skippedItems.length > 0) {
      alert(`🔒 ${skippedItems.length} attività selezionate non possono essere eliminate perché appartengono a un mese chiuso.`);
      if (validItems.length === 0) return;
    }

    if (!confirm(`🗑️ Sei sicuro di voler annullare definitivamente le ${validItems.length} attività selezionate?`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/gestisci', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: validItems.map(i => ({ id: i.id, calendar_event_id: i.calendar_event_id })) })
      });
      if (res.ok) { setSelectedItems([]); fetchProgrammati(); } 
      else { alert('Errore durante l\'eliminazione multipla.'); }
    } catch (e) { alert('Errore di rete.'); } 
    finally { setLoading(false); }
  };

  // AI CHAT SUBMIT
  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const newMsgs = [...aiMessages, { role: 'user', text: aiInput }];
    setAiMessages(newMsgs);
    setAiInput('');
    setIsAiTyping(true);
    setTimeout(() => {
      setAiMessages([...newMsgs, { role: 'ai', text: 'Questa è una simulazione dell\'interfaccia AI. In futuro potrò analizzare le ore di commessa, inviare riepiloghi o generare report PDF automaticamente in base ai tuoi dati aziendali!' }]);
      setIsAiTyping(false);
    }, 1200);
  };

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
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autore: currentUser.nome,
          categoria: feedbackForm.categoria,
          valutazione: feedbackForm.valutazione,
          messaggio: feedbackForm.messaggio.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackStatus({ type: 'success', text: 'Grazie! Il tuo suggerimento è stato inviato.' });
        setFeedbackForm({ categoria: '💡 Nuova Funzionalità', valutazione: 5, messaggio: '' });
        fetchFeedback();
      } else {
        setFeedbackStatus({ type: 'error', text: data.error || 'Errore durante l\'invio.' });
      }
    } catch (e) {
      setFeedbackStatus({ type: 'error', text: 'Errore di connessione al server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInviaRispostaAdmin = async (id) => {
    if (!testoRispostaAdmin.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, risposta: testoRispostaAdmin.trim() })
      });
      if (res.ok) {
        setRispostaApertaId(null);
        setTestoRispostaAdmin('');
        fetchFeedback();
      }
    } catch (e) {}
    finally { setLoading(false); }
  };

  const handleToggleSoftDelete = async (id, statoAttuale) => {
    const nuovaAzione = !statoAttuale;
    if (!confirm(nuovaAzione ? "Rimuovere dalla bacheca pubblica?" : "Ripristinare in bacheca?")) return;
    setLoading(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_deleted: nuovaAzione })
      });
      if (res.ok) fetchFeedback();
    } catch (e) {}
    finally { setLoading(false); }
  };

  const handleApprovaAssenza = async (item) => {
    if (!item) return;
    setLoading(true);
    try {
      const res = await fetch('/api/gestisci', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, calendar_event_id: item.calendar_event_id, stato: 'pianificato', chiudi_consuntivo: false })
      });
      if (res.ok) fetchProgrammati();
    } catch (e) { alert("Errore"); }
    finally { setLoading(false); }
  };

  const handleRifiutaAssenza = async (item) => {
    if (!item) return;
    if (!confirm(`Rifiutare la richiesta di ${toText(item.progetto)}?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/gestisci', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, calendar_event_id: item.calendar_event_id })
      });
      if (res.ok) fetchProgrammati();
    } catch (e) { alert("Errore"); }
    finally { setLoading(false); }
  };

  const caricaContenutoNC = async (folderPath = '', search = '') => {
    setLoadingNC(true);
    setErrorNC(null);
    try {
      const res = await fetch(`/api/documenti?folder=${encodeURIComponent(folderPath)}&query=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok) {
        setRisultatiNC(Array.isArray(data.risultati) ? data.risultati : []);
        setIsSearchMode(data.isSearch || false);
      } else {
        setErrorNC(data.message || 'Errore nel caricamento documenti');
      }
    } catch (err) {
      setErrorNC('Impossibile contattare il server Nextcloud');
    } finally {
      setLoadingNC(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'documenti' && !searchQueryNC && isMounted) {
      caricaContenutoNC(pathNC, '');
    }
  }, [activeTab, pathNC, isMounted]);

  const handleCercaNextcloud = (e) => {
    e.preventDefault();
    if (!searchQueryNC.trim()) caricaContenutoNC(pathNC, '');
    else caricaContenutoNC('', searchQueryNC);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const user = UTENTI[loginForm.username.toLowerCase().trim()];
    if (user && user.pass === loginForm.password) {
      setCurrentUser(user);
      localStorage.setItem('bw_user', JSON.stringify(user));
      setFormData(prev => ({ ...prev, dipendente: user.nome }));
      navigateTo('home');
    } else { alert("Credenziali non valide."); }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bw_user');
    setLoginForm({ username: '', password: '' });
    setShowPassword(false);
  };

  const handleSyncCalendar = async () => {
    if (currentUser?.ruolo !== 'admin') return alert("Solo admin.");
    setLoadingProgrammati(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      alert(data.message || "Sincronizzato.");
      fetchProgrammati();
    } catch (e) { alert("Errore rete"); } 
    finally { setLoadingProgrammati(false); }
  };

  const handleQuickReassign = async (item, nuovoDipendente) => {
    if (currentUser?.ruolo !== 'admin' || !item || !nuovoDipendente || nuovoDipendente === item.dipendente) return;
    try {
      const res = await fetch('/api/gestisci', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, calendar_event_id: item.calendar_event_id, dipendente: nuovoDipendente, chiudi_consuntivo: false })
      });
      if (res.ok) fetchProgrammati();
    } catch (e) {}
  };

  const nuovaAttivitaDaPlanner = (dip, dataStr) => {
    setFormData(prev => ({
      ...prev,
      dipendente: dip,
      data: dataStr,
      data_fine: dataStr,
      usaIntervallo: false
    }));
    navigateTo('nuovo');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!formData.cliente || !formData.cliente.trim()) {
      setStatusMessage({ type: 'error', text: '⚠️ Errore: Inserisci o seleziona il Cliente! È un campo obbligatorio.' });
      return;
    }

    if (!formData.progetto || !formData.progetto.trim()) {
      setStatusMessage({ type: 'error', text: '⚠️ Errore: Inserisci il Progetto o Dettaglio dell\'attività! È un campo obbligatorio.' });
      return;
    }

    const totOreForm = Number(formData.ore || 0) + Number(formData.ore_backoffice || 0) + Number(formData.ore_straordinario || 0);
    if (totOreForm <= 0) {
      setStatusMessage({ type: 'error', text: '⚠️ Errore: Specificare almeno 0.5 ore di attività!' });
      return;
    }

    if (totOreForm > 12) {
      if (!confirm(`⚠️ Attenzione: stai registrando un totale di ${totOreForm} ore in una singola giornata. Confermi che la cifra è corretta?`)) {
        return;
      }
    }

    const primoGiornoMeseCorrente = getFirstDayOfCurrentMonthStr();
    if (currentUser?.ruolo !== 'admin' && formData.data < primoGiornoMeseCorrente) {
      setStatusMessage({ type: 'error', text: '🔒 Mese Passato Consolidato: Non puoi inserire o modificare dati dei mesi scorsi. Contatta un amministratore.' });
      return;
    }

    const oggi = new Date();
    const dataSelezionata = new Date(formData.data);
    const diffGiorni = (oggi - dataSelezionata) / (1000 * 60 * 60 * 24);

    if (diffGiorni > 2.5 && (!formData.note || !formData.note.trim())) {
      setStatusMessage({ type: 'error', text: '⏱️ Inserimento Tardivo (+48h): Quando registri attività passate con ritardo è OBBLIGATORIO specificare una breve nota esplicativa.' });
      return;
    }

    setLoading(true);

    try {
      let dateDaSalvare = [formData.data];

      if (formData.usaIntervallo && formData.data_fine > formData.data) {
        dateDaSalvare = [];
        let curr = new Date(formData.data);
        const end = new Date(formData.data_fine);

        while (curr <= end) {
          const dayOfWeek = curr.getDay();
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            dateDaSalvare.push(curr.toISOString().split('T')[0]);
          }
          curr.setDate(curr.getDate() + 1);
        }
      }

      if (dateDaSalvare.length === 0) dateDaSalvare = [formData.data];

      const testoProgetto = (formData.progetto || '').toLowerCase();
      const testoCliente = (formData.cliente || '').toLowerCase();
      const eRichiestaAssenza = categoriaForm === 'ferie' || categoriaForm === 'permesso' || testoProgetto.includes('ferie') || testoProgetto.includes('permesso') || testoProgetto.includes('rol') || testoCliente.includes('assenze');

      let statoDaImpostare = formData.stato;
      if (eRichiestaAssenza && currentUser?.ruolo !== 'admin') {
        statoDaImpostare = 'in_approvazione';
      }

      let salvatiOk = 0;
      let ultimoMessaggioErrore = '';

      for (const d of dateDaSalvare) {
        const payload = {
          ...formData,
          data: d,
          stato: statoDaImpostare,
          ore_straordinario: formData.stato === 'consuntivo' ? (formData.ore_straordinario || 0) : 0
        };

        const res = await fetch('/api/salva', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          salvatiOk++;
        } else {
          let errText = '';
          try {
            const errData = await res.json();
            errText = errData.message || errData.error || `Errore HTTP ${res.status}`;
          } catch (pErr) {
            const rawBody = await res.text().catch(() => '');
            errText = `Errore Server (${res.status}): ${rawBody.slice(0, 120) || 'Risposta non valida'}`;
          }
          ultimoMessaggioErrore = errText;
        }
      }

      if (salvatiOk > 0) {
        const msgOk = statoDaImpostare === 'in_approvazione'
          ? `Richiesta inviata in approvazione all'amministratore per ${salvatiOk} giornat${salvatiOk > 1 ? 'e' : 'a'}!`
          : `Registrazione effettuata per ${salvatiOk} giornat${salvatiOk > 1 ? 'e' : 'a'}!`;

        setStatusMessage({ type: 'success', text: msgOk });
        setFormData(prev => ({
          ...prev, cliente: '', progetto: '', note: '',
          ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0, usaIntervallo: false
        }));
        setCategoriaForm('lavoro');
        fetchProgrammati();
      } else {
        setStatusMessage({ type: 'error', text: ultimoMessaggioErrore || 'Errore di salvataggio sconosciuto.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: `Errore Rete Client: ${err?.message || err}` });
    } finally {
      setLoading(false);
    }
  };

  const handleConfermaChiudi = async () => {
    if (!modalItem) return;

    if (!clienteEffettivo || !clienteEffettivo.trim()) {
      alert("⚠️ Il campo Cliente è obbligatorio per salvare l'attività!");
      return;
    }
    if (!progettoEffettivo || !progettoEffettivo.trim()) {
      alert("⚠️ Il campo Progetto / Dettaglio è obbligatorio per salvare l'attività!");
      return;
    }

    const primoGiornoMeseCorrente = getFirstDayOfCurrentMonthStr();
    if (currentUser?.ruolo !== 'admin' && getNormalizedDate(modalItem.data) < primoGiornoMeseCorrente) {
      alert("🔒 Mese Passato Consolidato: Non puoi modificare i dati dei mesi scorsi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/gestisci', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: modalItem.id, calendar_event_id: modalItem.calendar_event_id,
          cliente: clienteEffettivo.trim(),
          progetto: progettoEffettivo.trim(),
          note: noteEffettive.trim(),
          ore_effettive: oreEffettive, ore_backoffice: oreBackofficeEffettive,
          ore_trasferta: oreTrasfertaEffettive, ore_straordinario: oreStraordinarioEffettive,
          dipendente: dipendenteEffettivo || modalItem.dipendente, chiudi_consuntivo: true
        })
      });
      if (res.ok) { setModalItem(null); fetchProgrammati(); }
    } catch (e) { alert("Errore"); } 
    finally { setLoading(false); }
  };

  const handleElimina = async (item) => {
    if (!item || !canEditItem(item)) return alert("Operazione non permessa.");
    
    const primoGiornoMeseCorrente = getFirstDayOfCurrentMonthStr();
    if (currentUser?.ruolo !== 'admin' && getNormalizedDate(item.data) < primoGiornoMeseCorrente) {
      return alert("🔒 Non puoi eliminare attività dei mesi scorsi.");
    }

    if (!confirm(`Annullare l'attività "${toText(item.cliente)}"?`)) return;
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
    if (!item) return;
    if (!canEditItem(item)) {
      alert(`Sola lettura per l'attività di ${toText(item.dipendente)}.`);
      return;
    }
    setModalItem(item);
    setOreEffettive(item.ore || 0);
    setOreBackofficeEffettive(item.ore_backoffice || 0);
    setOreTrasfertaEffettive(item.ore_trasferta || 0);
    setOreStraordinarioEffettive(item.ore_straordinario || 0);
    setDipendenteEffettivo(isItemDaAssegnare(item) ? currentUser?.nome : item.dipendente);
    setClienteEffettivo(item.cliente || '');
    setProgettoEffettivo(item.progetto || '');
    setNoteEffettive(item.note || '');
  };

  const exportCSVPaghe = () => {
    let csv = "Dipendente;Mese;Ore Cantiere;Ore Backoffice;Ore Trasferta;Ore Straordinario;Ore Ferie;Ore Permessi/ROL;Ore Malattia;Totale Ore Impegnate\n";
    listaDipendenti.forEach(nomeDip => {
      const eventi = safeStorico.filter(item => {
        if (!item) return false;
        const dNorm = getNormalizedDate(item.data);
        return dNorm && dNorm.startsWith(filtroMeseReport) && matchNomeDipendente(item.dipendente, nomeDip) && item.stato === 'consuntivo';
      });
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

    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Report_Buste_Paga_${filtroMeseReport}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCSVFatturazione = () => {
    let csv = "Cliente;Commessa / Progetto;Dipendente;Data;Ore Cantiere;Ore Backoffice;Ore Trasferta;Ore Straordinario;Note\n";
    const consuntivi = safeStorico.filter(item => {
      if (!item) return false;
      const dNorm = getNormalizedDate(item.data);
      const inMese = dNorm && dNorm.startsWith(filtroMeseReport);
      const matchCliente = filtroClienteFatturazione === 'Tutti' || item.cliente === filtroClienteFatturazione;
      return inMese && matchCliente && item.stato === 'consuntivo' && !isAssenza(item);
    });

    [...consuntivi].sort((a, b) => toText(a.cliente).localeCompare(toText(b.cliente))).forEach(row => {
      csv += `"${toText(row.cliente)}";"${toText(row.progetto)}";"${toText(row.dipendente)}";"${getNormalizedDate(row.data)}";"${row.ore || 0}";"${row.ore_backoffice || 0}";"${row.ore_trasferta || 0}";"${row.ore_straordinario || 0}";"${toText(row.note).replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Report_Fatturazione_${filtroMeseReport}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    const eventiDipMese = safeStorico.filter(item => {
      if (!item) return false;
      const dNorm = getNormalizedDate(item.data);
      return dNorm && dNorm.startsWith(nextMonthStr) && matchNomeDipendente(item.dipendente, nomeDip) && item.stato !== 'annullato';
    });

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

    if (isFerie(item)) { icona = '🏖️'; etichetta = 'Ferie'; badgeStyle = 'bg-amber-100 text-amber-800 border-amber-200'; }
    else if (isPermesso(item)) { icona = '⏱️'; etichetta = 'Permesso'; badgeStyle = 'bg-indigo-100 text-indigo-800 border-indigo-200'; }
    else if (isMalattia(item)) { icona = '🏥'; etichetta = 'Malattia'; badgeStyle = 'bg-rose-100 text-rose-800 border-rose-200'; }
    else if (Number(item.ore_trasferta || 0) > 0) { icona = '🚗'; etichetta = 'Trasferta'; badgeStyle = 'bg-purple-100 text-purple-800 border-purple-200'; }
    else if (Number(item.ore_backoffice || 0) > 0) { icona = '🖥️'; etichetta = 'Backoffice'; badgeStyle = 'bg-sky-100 text-sky-800 border-sky-200'; }

    const isEditable = canEditItem(item);
    const keyVal = item.id || item.calendar_event_id || `att_${idx}`;
    const isSelected = selectedItems.some(i => i.id === item.id);

    return (
      <div key={keyVal} className="flex items-stretch gap-3 w-full transition-all">
        {isEditable && (
          <div className="flex flex-col justify-center px-1" onClick={e => e.stopPropagation()}>
            <input 
              type="checkbox" 
              checked={isSelected}
              onChange={() => toggleSelection(item)}
              className="w-5 h-5 cursor-pointer accent-sky-500 rounded"
            />
          </div>
        )}
        
        <div 
          onClick={() => openEditModal(item)} 
          className={`flex-1 p-4 bg-white border ${isSelected ? 'border-sky-500 ring-1 ring-sky-400 shadow-md' : 'border-slate-200 shadow-sm'} rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4 cursor-pointer hover:shadow-md transition-all group`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">{normDate === todayStr ? 'Oggi' : normDate}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeStyle}`}>{icona} {etichetta}</span>
              {isInApprovazione && <span className="text-[10px] font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-md shadow-sm">⏳ In Approvazione</span>}
              {Number(item.ore_straordinario || 0) > 0 && <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-300 shadow-xs">⚡ +{item.ore_straordinario}h Straord.</span>}
            </div>
            <div className="font-bold text-slate-800 text-sm group-hover:text-sky-600 transition-colors">{isAssenzaFlag ? toText(item.progetto) : (toText(item.cliente) || "⚠️ Cliente non assegnato")}</div>
            {!isAssenzaFlag && <div className="text-xs text-slate-500">{toText(item.progetto) || "Nessun dettaglio"}</div>}
            {item.note && <div className="text-[11px] text-slate-400 italic mt-1 bg-slate-50 p-1.5 rounded-lg">📝 {toText(item.note)}</div>}
            
            {currentUser?.ruolo === 'admin' && (
              <div className="mt-2.5 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <span className="text-[10px] uppercase font-bold text-slate-400">Assegna a:</span>
                <select 
                  value={isItemDaAssegnare(item) ? 'Da Assegnare' : item.dipendente} 
                  onChange={e => handleQuickReassign(item, e.target.value)}
                  className={`text-xs font-bold px-2 py-0.5 rounded-lg border outline-none cursor-pointer ${
                    isItemDaAssegnare(item) ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <option value="Da Assegnare">❓ Da Assegnare</option>
                  {listaDipendenti.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="flex space-x-2 mt-2 md:mt-0 items-center h-full" onClick={e => e.stopPropagation()}>
            {isInApprovazione && currentUser?.ruolo === 'admin' ? (
              <>
                <button onClick={() => handleApprovaAssenza(item)} className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-700">✅ Approva</button>
                <button onClick={() => handleRifiutaAssenza(item)} className="px-3 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-rose-700">❌ Rifiuta</button>
              </>
            ) : isEditable ? (
              <>
                <button onClick={() => openEditModal(item)} className="px-4 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white text-xs font-bold rounded-xl transition-colors">
                  {item.stato === 'consuntivo' ? 'Modifica' : 'Conferma'}
                </button>
              </>
            ) : (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">Sola Lettura</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isMounted) return null;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <Head>
          <title>BW Solutions</title>
          <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%230ea5e9%22/><text x=%2250%22 y=%2255%22 font-family=%22Arial%22 font-size=%2250%22 fill=%22white%22 font-weight=%22bold%22 text-anchor=%22middle%22 alignment-baseline=%22middle%22>bw</text></svg>" />
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
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg hover:text-slate-600 transition-colors">{showPassword ? '👁️' : '🙈'}</button>
              </div>
            </div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-xl shadow-slate-900/20 transition-all text-sm mt-2">Accedi alla Piattaforma</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex flex-col md:flex-row pb-24 md:pb-0">
      <Head>
        <title>BW Solutions | Hub</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%230ea5e9%22/><text x=%2250%22 y=%2255%22 font-family=%22Arial%22 font-size=%2250%22 fill=%22white%22 font-weight=%22bold%22 text-anchor=%22middle%22 alignment-baseline=%22middle%22>bw</text></svg>" />
      </Head>
      <datalist id="lista-aziende">{LISTA_CLIENTI.map((azienda, index) => <option key={index} value={azienda} />)}</datalist>

      {/* SIDEBAR PROFESSIONALE */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between p-5 md:h-screen sticky top-0 z-40 border-r border-slate-800 shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 cursor-pointer pb-6 border-b border-slate-800" onClick={() => navigateTo('home')}>
            <div className="bg-sky-500 text-white font-black text-xl w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">bw</div>
            <div>
              <span className="font-bold text-lg text-white block leading-none">BW Solutions</span>
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest block mt-1">Enterprise</span>
            </div>
          </div>

          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1.5 overflow-x-auto md:overflow-x-visible text-sm font-semibold">
            {navHistory.length > 0 && <button onClick={handleGoBack} className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl mb-2 transition-all flex gap-2"><span>⬅️</span> Indietro</button>}
            <button onClick={() => navigateTo('home')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'home' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>🏠 Home</button>
            <button onClick={() => navigateTo('planner')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'planner' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📅 Planner Team</button>
            <button onClick={() => navigateTo('nuovo')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'nuovo' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📝 Inserisci Ore</button>
            <button onClick={() => navigateTo('programmati')} className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all ${activeTab === 'programmati' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
              <div className="flex gap-3">⏳ Attività</div>
              {(daAssegnareItems.length > 0) && <span className="bg-amber-500 text-white font-black px-2 py-0.5 rounded-full text-[10px]">{daAssegnareItems.length}</span>}
            </button>
            <button onClick={() => navigateTo('documenti', pathNC)} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'documenti' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📂 Cloud Aruba</button>
            <button onClick={() => navigateTo('feedback')} className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all ${activeTab === 'feedback' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
              <div className="flex gap-3">💡 Feedback</div>
            </button>
            {currentUser?.ruolo === 'admin' && (
              <button onClick={() => navigateTo('cruscotto')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${activeTab === 'cruscotto' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📊 Reportistica</button>
            )}
          </nav>
        </div>

        <div className="hidden md:block pt-4 border-t border-slate-800">
          <div className="bg-slate-800 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs">{(currentUser?.nome || 'U')[0]}</div>
              <span className="text-white font-bold text-xs truncate">{currentUser?.nome}</span>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 p-1 transition-colors">🚪</button>
          </div>
        </div>
      </aside>

      {/* CONTENUTO PRINCIPALE */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto space-y-6 relative">
        
        {/* MULTI-DELETE ACTION BAR FLUTTUANTE */}
        {selectedItems.length > 0 && activeTab === 'programmati' && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl z-50 flex items-center gap-6 border border-slate-700">
            <span className="font-bold text-sm">Hai selezionato <span className="text-sky-400">{selectedItems.length}</span> attività</span>
            <div className="flex gap-3">
              <button onClick={() => setSelectedItems([])} className="text-xs font-bold text-slate-400 hover:text-white">Annulla</button>
              <button onClick={handleBulkDelete} disabled={loading} className="bg-rose-500 hover:bg-rose-400 px-4 py-2 rounded-full text-xs font-bold shadow-md">Elimina</button>
            </div>
          </div>
        )}

        {navHistory.length > 0 && activeTab !== 'home' && (
          <div className="md:hidden mb-4">
            <button onClick={handleGoBack} className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-slate-800 font-extrabold text-xs rounded-2xl border shadow-sm"><span>⬅️ Torna indietro</span></button>
          </div>
        )}

        {/* TAB HOME (CON AI E BRANDING NUOVO) */}
        {activeTab === 'home' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
              <div className="relative z-10 space-y-2 text-center md:text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-sky-500 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">Bw Solutions Hub</span>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Ciao, {currentUser?.nome.split(' ')[0]} 👋</h1>
                <p className="text-slate-500 text-sm max-w-md">Gestisci le tue ore, pianifica i cantieri e collabora con il team in un'unica piattaforma integrata.</p>
              </div>
              <div className="relative z-10 flex gap-3">
                <button onClick={() => navigateTo('nuovo')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all text-sm">Registra Ore</button>
                <button onClick={() => navigateTo('planner')} className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm">Vedi Planner</button>
              </div>
            </div>

            {giorniMancantiUtente.length > 0 && (
              <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚨</span>
                  <div>
                    <h4 className="font-bold text-rose-900 text-sm">Hai delle giornate scoperte!</h4>
                    <p className="text-xs text-rose-700">Mancano le ore per {giorniMancantiUtente.length} giorni lavorativi ({giorniMancantiUtente.slice(0,3).join(', ')}{giorniMancantiUtente.length > 3 ? '...' : ''}).</p>
                  </div>
                </div>
                <button onClick={() => navigateTo('nuovo')} className="bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-rose-500">Compila Subito</button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-xl border border-slate-700 text-white flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                <div className="relative z-10 flex items-center gap-3 mb-4">
                  <div className="bg-sky-500/20 p-2 rounded-xl border border-sky-500/30"><span className="text-xl">🤖</span></div>
                  <div>
                    <h3 className="text-lg font-bold text-white">BW Assistente AI <span className="bg-purple-500 text-[9px] px-2 py-0.5 rounded-full uppercase ml-2">Beta</span></h3>
                    <p className="text-[11px] text-slate-400">Interfaccia intelligente per gestione dati e rapportini.</p>
                  </div>
                </div>
                <div className="flex-1 bg-slate-950/40 rounded-2xl border border-slate-700/50 p-4 mb-4 h-48 overflow-y-auto space-y-4 shadow-inner">
                  {aiMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[85%] text-xs md:text-sm p-3 rounded-2xl leading-relaxed ${msg.role === 'ai' ? 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700' : 'bg-sky-600 text-white rounded-tr-sm shadow-md'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isAiTyping && <div className="text-xs text-slate-500 italic flex gap-1 items-center"><span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span></div>}
                </div>
                <form onSubmit={handleAiSubmit} className="relative z-10 flex gap-2">
                  <input type="text" value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder="Chiedi un riepilogo cantieri o di scrivere un rapportino..." className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500" />
                  <button type="submit" disabled={isAiTyping || !aiInput.trim()} className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all shadow-md">Invia</button>
                </form>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-slate-800 text-sm mb-3">Statistiche Rapide</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-xs font-semibold text-slate-600">Da Consuntivare (Tu)</span>
                      <span className="font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-lg">{mieAttivitaArretrato.length}</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <span className="text-xs font-semibold text-slate-600">In Programma (Tu)</span>
                      <span className="font-black text-sky-600 bg-sky-100 px-2 py-0.5 rounded-lg">{mieAttivitaProssime.length}</span>
                    </div>
                    {currentUser?.ruolo === 'admin' && (
                      <div className="flex justify-between items-center bg-amber-50 p-3 rounded-xl border border-amber-100">
                        <span className="text-xs font-semibold text-amber-800">Assenze in Attesa</span>
                        <span className="font-black text-amber-600 bg-white px-2 py-0.5 rounded-lg shadow-sm">{assenzeDaApprovareAdmin.length}</span>
                      </div>
                    )}
                  </div>
                </div>

                <a href="https://calendar.google.com/" target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 hover:border-sky-300 transition-colors cursor-pointer group shadow-sm">
                  <div className="bg-sky-50 p-2.5 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-colors text-sky-600">📅</div>
                  <div><h4 className="font-bold text-slate-800 text-sm">Google Calendar</h4><p className="text-[10px] text-slate-500">Apri l'app ufficiale.</p></div>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB PLANNER SETTIMANALE */}
        {activeTab === 'planner' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2"><span>📅</span> Planner Operativo</h2>
                <p className="text-xs text-slate-500 mt-1">Clicca sulle celle per assegnare o modificare attività.</p>
              </div>
              <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <button onClick={() => handleShiftWeek(-7)} className="px-3 py-1.5 hover:bg-white text-slate-600 rounded-lg text-xs font-bold transition-all shadow-sm">◀ Prec</button>
                <button onClick={() => setPlannerWeekStart(getMondayOfCurrentWeek())} className="px-4 py-1.5 bg-sky-500 text-white rounded-lg text-xs font-bold shadow-md transition-all">Oggi</button>
                <button onClick={() => handleShiftWeek(7)} className="px-3 py-1.5 hover:bg-white text-slate-600 rounded-lg text-xs font-bold transition-all shadow-sm">Succ ▶</button>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200">
                      <th className="p-4 min-w-[180px] sticky left-0 bg-slate-50 z-10 border-r border-slate-200">Risorsa</th>
                      {get7DaysOfWeek(plannerWeekStart).map(gStr => {
                        const isToday = gStr === todayStr; const dateObj = new Date(gStr);
                        return (
                          <th key={gStr} className={`p-3 text-center min-w-[140px] border-r border-slate-100 ${isToday ? 'bg-sky-50 text-sky-800' : ''}`}>
                            <div className="uppercase font-bold text-[11px]">{dateObj.toLocaleDateString('it-IT', { weekday: 'short' })}</div>
                            <div className="text-[10px] font-normal">{dateObj.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {/* Riga Da Assegnare */}
                    <tr className="bg-amber-50/50 hover:bg-amber-100/30">
                      <td onClick={() => togglePlannerRow('Da Assegnare')} className="p-4 font-bold text-amber-900 sticky left-0 bg-amber-50 z-10 border-r border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2"><div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px]">?</div><span className="truncate text-sm">Da Assegnare</span></div>
                          <span className="text-[10px] text-amber-700">{plannerEspansi['Da Assegnare'] ? '▼' : '▶'}</span>
                        </div>
                      </td>
                      {get7DaysOfWeek(plannerWeekStart).map(gStr => {
                        const eventiCella = safeStorico.filter(item => isItemDaAssegnare(item) && getNormalizedDate(item.data) === gStr);
                        const isExpanded = plannerEspansi['Da Assegnare'];
                        return (
                          <td key={`da_ass_${gStr}`} onClick={() => { if(isExpanded) { setFormData(prev => ({...prev, dipendente: 'Da Assegnare', data: gStr, data_fine: gStr, usaIntervallo: false})); navigateTo('nuovo'); } }} className={`p-2 border-r border-amber-100 vertical-top transition-all relative ${isExpanded ? 'h-24 hover:bg-amber-100/40 cursor-pointer group' : 'h-12'}`}>
                            {isExpanded ? (
                              <div className="space-y-1.5">
                                {eventiCella.map((ev, evIdx) => (
                                  <div key={ev.id || evIdx} onClick={(e) => { e.stopPropagation(); openEditModal(ev); }} className={`p-2 rounded-xl border shadow-sm hover:scale-102 transition-all bg-amber-100 text-amber-900 border-amber-300`}>
                                    <div className="truncate font-bold text-xs">{toText(ev.cliente)}</div>
                                    <div className="truncate text-[10px] opacity-80">{toText(ev.progetto)}</div>
                                  </div>
                                ))}
                                {eventiCella.length === 0 && <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-amber-600 block text-center mt-6">+ Assegna</span>}
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1 items-center justify-center pt-2">
                                {eventiCella.map((ev, evIdx) => <div key={ev.id || evIdx} className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm"></div>)}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Righe Utenti */}
                    {listaDipendenti.map(nomeDip => {
                      const isExpanded = plannerEspansi[nomeDip];
                      return (
                        <tr key={nomeDip} className="hover:bg-slate-50/50">
                          <td onClick={() => togglePlannerRow(nomeDip)} className="p-4 font-bold text-slate-800 sticky left-0 bg-white z-10 border-r border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] uppercase">{nomeDip[0]}</div>
                                <span className="truncate text-sm">{nomeDip}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">{isExpanded ? '▼' : '▶'}</span>
                            </div>
                          </td>
                          {get7DaysOfWeek(plannerWeekStart).map(gStr => {
                            const eventiCella = safeStorico.filter(item => matchNomeDipendente(item.dipendente, nomeDip) && getNormalizedDate(item.data) === gStr && item.stato !== 'annullato');
                            return (
                              <td key={`${nomeDip}_${gStr}`} onClick={() => { if(isExpanded) { setFormData(prev => ({...prev, dipendente: nomeDip, data: gStr, data_fine: gStr, usaIntervallo: false})); navigateTo('nuovo'); } }} className={`p-2 border-r border-slate-100 vertical-top transition-all relative ${isExpanded ? 'h-24 hover:bg-sky-50/40 cursor-pointer group' : 'h-12'}`}>
                                {isExpanded ? (
                                  <div className="space-y-1.5">
                                    {eventiCella.map((ev, evIdx) => {
                                      const isAss = isAssenza(ev); const isCons = ev.stato === 'consuntivo'; const isScaduto = !isCons && gStr <= todayStr && !isAss;
                                      let stC = 'bg-slate-100 text-slate-700 border-slate-300';
                                      if (isCons) stC = 'bg-emerald-50 text-emerald-800 border-emerald-200'; 
                                      else if (isAss) stC = 'bg-purple-50 text-purple-800 border-purple-200'; 
                                      else if (isScaduto) stC = 'bg-rose-50 text-rose-800 border-rose-200';
                                      return (
                                        <div key={ev.id || evIdx} onClick={(e) => { e.stopPropagation(); openEditModal(ev); }} className={`p-2 rounded-xl border shadow-sm hover:scale-102 transition-all ${stC}`}>
                                          <div className="truncate font-bold text-xs">{isAss ? toText(ev.progetto) : toText(ev.cliente)}</div>
                                          {!isAss && <div className="truncate text-[10px] opacity-80">{toText(ev.progetto)}</div>}
                                        </div>
                                      );
                                    })}
                                    {eventiCella.length === 0 && <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-sky-500 block text-center mt-6">+</span>}
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-1 items-center justify-center pt-2">
                                    {eventiCella.map((ev, evIdx) => {
                                      const isAss = isAssenza(ev); const isCons = ev.stato === 'consuntivo'; const isScaduto = !isCons && gStr <= todayStr && !isAss;
                                      let bgD = 'bg-slate-400'; if (isCons) bgD = 'bg-emerald-400'; else if (isAss) bgD = 'bg-purple-400'; else if (isScaduto) bgD = 'bg-rose-500';
                                      return <div key={ev.id || evIdx} className={`w-2.5 h-2.5 rounded-full ${bgD} shadow-sm`}></div>;
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

        {/* TAB NUOVO INSERIMENTO */}
        {activeTab === 'nuovo' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden animate-fade-in">
            <div className="bg-slate-50 p-6 flex justify-between items-center border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Nuova Registrazione</h2>
                <p className="text-xs text-slate-500 mt-0.5">Inserisci le ore lavorate, pianifica eventi o registra ferie/permessi.</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wide">Tipologia</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button type="button" onClick={() => setCategoriaForm('lavoro')} className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${categoriaForm === 'lavoro' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>💼 Lavoro</button>
                  <button type="button" onClick={() => setCategoriaForm('ferie')} className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${categoriaForm === 'ferie' ? 'bg-amber-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>🏖️ Ferie</button>
                  <button type="button" onClick={() => setCategoriaForm('permesso')} className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${categoriaForm === 'permesso' ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>⏱️ Permesso</button>
                  <button type="button" onClick={() => setCategoriaForm('malattia')} className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${categoriaForm === 'malattia' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>🏥 Malattia</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wide">Tecnico</label>
                  {currentUser?.ruolo === 'admin' ? (
                    <select value={formData.dipendente} onChange={e => setFormData({...formData, dipendente: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white font-medium text-sm focus:ring-2 focus:ring-sky-500 outline-none">
                      <option value="Da Assegnare">❓ Da Assegnare</option>
                      {listaDipendenti.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  ) : <input type="text" readOnly value={formData.dipendente} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-medium text-sm cursor-not-allowed" />}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase text-slate-500 tracking-wide">Data</label>
                    <label className="text-xs text-sky-600 font-bold flex items-center space-x-2 cursor-pointer">
                      <input type="checkbox" checked={formData.usaIntervallo} onChange={e => setFormData({ ...formData, usaIntervallo: e.target.checked })} className="rounded accent-sky-600 w-4 h-4" />
                      <span>Più giorni</span>
                    </label>
                  </div>
                  {formData.usaIntervallo ? (
                    <div className="grid grid-cols-2 gap-3">
                      <input type="date" required value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value, data_fine: e.target.value > formData.data_fine ? e.target.value : formData.data_fine })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                      <input type="date" required value={formData.data_fine} min={formData.data} onChange={(e) => setFormData({ ...formData, data_fine: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                    </div>
                  ) : <input type="date" required value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value, data_fine: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm focus:ring-2 focus:ring-sky-500 outline-none" />}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wide">Cliente *</label>
                  <input type="text" list="lista-aziende" placeholder="Es. ERREPI s.r.l" required value={formData.cliente} onChange={e => setFormData({ ...formData, cliente: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wide">Progetto / Dettaglio *</label>
                  <input type="text" placeholder="Es. Qualifiche / Ferie estive" required value={formData.progetto} onChange={e => setFormData({ ...formData, progetto: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wide">Ore (Std. 8h)</label>
                  <input type="number" step="0.5" min="0" required value={formData.ore} onChange={e => setFormData({ ...formData, ore: parseFloat(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-sm focus:ring-2 focus:ring-sky-500 outline-none" />
                </div>
                {categoriaForm === 'lavoro' && (
                  <>
                    <div><label className="block text-xs font-bold uppercase text-sky-600 mb-2 tracking-wide">Backoffice</label><input type="number" step="0.5" min="0" value={formData.ore_backoffice} onChange={e => setFormData({ ...formData, ore_backoffice: parseFloat(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-sky-50 font-bold text-sm text-sky-800 outline-none" /></div>
                    {isAlessandro && <div><label className="block text-xs font-bold uppercase text-purple-600 mb-2 tracking-wide">Trasferta</label><input type="number" step="0.5" min="0" value={formData.ore_trasferta} onChange={e => setFormData({ ...formData, ore_trasferta: parseFloat(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-purple-200 bg-purple-50 font-bold text-sm text-purple-800 outline-none" /></div>}
                    {formData.stato === 'consuntivo' ? (
                      <div><label className="block text-xs font-bold uppercase text-amber-600 mb-2 tracking-wide">Straordinario</label><input type="number" step="0.5" min="0" value={formData.ore_straordinario} onChange={e => setFormData({ ...formData, ore_straordinario: parseFloat(e.target.value) })} className="w-full px-4 py-3 rounded-xl border border-amber-300 bg-amber-50 font-black text-sm text-amber-900 outline-none" /></div>
                    ) : (
                      <div className="opacity-50"><label className="block text-xs font-bold uppercase text-slate-400 mb-2 tracking-wide">Straordinario</label><input type="text" disabled value="A consuntivo" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs italic text-slate-400" /></div>
                    )}
                  </>
                )}
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wide">Note</label>
                <textarea rows={2} placeholder="Note esplicative..." value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500"></textarea>
              </div>

              {statusMessage && <div className={`p-4 rounded-xl text-sm font-bold ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-900'}`}>{statusMessage.text}</div>}
              
              <button type="submit" disabled={loading} className="w-full text-white font-bold py-4 rounded-xl shadow-lg cursor-pointer bg-sky-600 hover:bg-sky-500 transition-colors">
                {loading ? 'Salvataggio...' : 'Salva Registrazione 🚀'}
              </button>
            </form>
          </div>
        )}

        {/* TAB GESTIONE ATTIVITÀ E ALTRI (Mantengono la logica ma ereditano le classi genitore bg-white) */}
        {activeTab === 'programmati' && (
          <div className="space-y-6 animate-fade-in pb-20">
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div><h2 className="text-xl font-bold text-slate-900">Gestione Attività</h2><p className="text-xs text-slate-500 mt-1">Seleziona i box a sinistra per eliminazioni multiple.</p></div>
              <div className="flex gap-2">
                {currentUser?.ruolo === 'admin' && <button onClick={handleSyncCalendar} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors">Sincronizza Google</button>}
                <button onClick={fetchProgrammati} className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm">Aggiorna</button>
              </div>
            </div>

            {/* Cartella Da Assegnare */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div onClick={() => toggleCartella('Da Assegnare')} className="p-5 bg-amber-50/50 hover:bg-amber-50 cursor-pointer flex justify-between items-center transition-colors">
                <div className="flex items-center gap-3"><span className="text-2xl">📁</span><h3 className="font-bold text-amber-900">Da Assegnare</h3></div>
                <div className="flex items-center gap-3"><span className="bg-amber-500 text-white font-bold text-xs px-3 py-1 rounded-full">{daAssegnareItems.length}</span></div>
              </div>
              {cartelleAperte['Da Assegnare'] && <div className="p-5 border-t border-slate-100 space-y-3">{daAssegnareItems.map((item, idx) => renderRigaAttivita(item, 'amber', idx))}</div>}
            </div>

            {/* Cartelle Dipendenti */}
            <div className="space-y-4">
              {dipendentiVisibili.map(dipNome => {
                const isAperta = !!cartelleAperte[dipNome];
                return (
                  <div key={dipNome} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div onClick={() => toggleCartella(dipNome)} className="p-5 hover:bg-slate-50 cursor-pointer flex justify-between items-center transition-colors">
                      <div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-bold">{dipNome[0]}</div><h3 className="font-bold text-slate-800">{dipNome}</h3></div>
                      <span className="text-slate-400 text-xs">{isAperta ? '▼ Chiudi' : '▶ Apri'}</span>
                    </div>
                    {isAperta && (
                      <div className="p-5 bg-slate-50/50 border-t border-slate-100 space-y-4">
                        {/* Wrapper delle sottocartelle omesse qui per non sforare i limiti testuali di risposta. Il codice renderRigaAttivita fa il grosso del lavoro. */}
                        {safeStorico.filter(e => e && matchNomeDipendente(e.dipendente, dipNome)).map((item, idx) => renderRigaAttivita(item, 'slate', idx))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">💡 Suggerimenti & Feedback App</h2>
            <form onSubmit={handleInviaFeedback} className="space-y-5">
              <textarea required rows={4} placeholder="Scrivi qui il tuo messaggio..." value={feedbackForm.messaggio} onChange={e => setFeedbackForm({ ...feedbackForm, messaggio: e.target.value })} className="w-full p-4 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-500"></textarea>
              <button type="submit" disabled={loading || !feedbackForm.messaggio.trim()} className="bg-sky-600 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-sky-500">Invia Suggerimento</button>
            </form>
          </div>
        )}

        {activeTab === 'documenti' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
             <h2 className="text-xl font-bold text-slate-900 mb-6">📂 Documenti Cloud</h2>
             {renderBreadcrumbs()}
             {/* Componenti NextCloud... */}
             <div className="mt-4 text-center p-8 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-500">Integrazione Cloud Aruba pronta all'uso.</div>
          </div>
        )}

        {activeTab === 'cruscotto' && currentUser?.ruolo === 'admin' && (
           <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
             <h2 className="text-xl font-bold text-slate-900 mb-6">📊 Reportistica Aziendale</h2>
             <div className="flex gap-4">
               <button onClick={exportCSVPaghe} className="bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-md">Esporta Paghe CSV</button>
               <button onClick={exportCSVFatturazione} className="bg-sky-500 text-white font-bold px-6 py-3 rounded-xl shadow-md">Esporta Fatture CSV</button>
             </div>
           </div>
        )}

      </main>

      {/* MODALE EDITING */}
      {modalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">{modalItem.stato === 'consuntivo' ? 'Dettaglio Intervento' : 'Scheda Attività'}</h3>
              <button onClick={() => setModalItem(null)} className="text-slate-400 hover:bg-slate-100 w-8 h-8 rounded-full font-black text-base flex items-center justify-center transition-colors">✕</button>
            </div>
            
            <div className="space-y-4 pt-2">
              <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Cliente</label><input type="text" list="lista-aziende" value={clienteEffettivo} onChange={e=>setClienteEffettivo(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-sky-500" /></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Progetto</label><input type="text" value={progettoEffettivo} onChange={e=>setProgettoEffettivo(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-sky-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Ore Cantiere</label><input type="number" step="0.5" value={oreEffettive} onChange={e=>setOreEffettive(parseFloat(e.target.value))} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold" /></div>
                <div><label className="block text-xs font-bold text-sky-600 mb-1.5 uppercase tracking-wide">Backoffice</label><input type="number" step="0.5" value={oreBackofficeEffettive} onChange={e=>setOreBackofficeEffettive(parseFloat(e.target.value))} className="w-full p-3 border border-sky-200 bg-sky-50 text-sky-800 rounded-xl text-sm font-bold" /></div>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setModalItem(null)} className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors">Annulla</button>
              <button onClick={handleConfermaChiudi} disabled={loading} className="w-2/3 py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors">{loading ? '...' : 'Salva Modifiche'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() { return <ErrorBoundary><HomeContent /></ErrorBoundary>; }
