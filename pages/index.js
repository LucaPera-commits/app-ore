import React, { useState, useEffect, Component } from 'react';
import Head from 'next/head';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { this.setState({ errorInfo }); console.error("Errore React:", error, errorInfo); }
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

function getGiorniLavorativiMese(annoMeseStr) {
  if (!annoMeseStr) return 22;
  try {
    const [year, month] = annoMeseStr.split('-').map(Number); let count = 0; const date = new Date(year, month - 1, 1);
    while (date.getMonth() === month - 1) { const day = date.getDay(); if (day !== 0 && day !== 6) count++; date.setDate(date.getDate() + 1); }
    return count;
  } catch (e) { return 22; }
}

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

  // DIAGNOSTICA DI SISTEMA IN TEMPO REALE
  const [diagnosticaStato, setDiagnosticaStato] = useState({ ok: true, anomalie: [] });

  const [aforismaGiorno, setAforismaGiorno] = useState('');

  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([{role: 'ai', text: 'Ciao! Sono l\'assistente virtuale di BW Solutions. Come posso aiutarti oggi?'}]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // ANAGRAFICA CLIENTI REALE DA SUPABASE
  const [dbClienti, setDbClienti] = useState([]);
  const [loadingClienti, setLoadingClienti] = useState(false);
  const [modalCliente, setModalCliente] = useState(null);
  const [searchCliente, setSearchCliente] = useState('');

  // APPUNTI / PDM REALI DA SUPABASE
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
  const [errorNC, setErrorNC] = useState(null);

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

  const listaClientiCompleta = Array.from(new Set([...LISTA_CLIENTI_BASE, ...dbClienti.map(c => c.ragione_sociale)])).sort();

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

  function handleApriCartella(percorso) { setSearchQueryNC(''); navigateTo('documenti', percorso); }
  function handleCartellaSuperioreNC() { const parent = getParentPath(pathNC); setSearchQueryNC(''); navigateTo('documenti', parent); }

  const renderBreadcrumbs = () => {
    const parts = pathNC ? pathNC.split('/').filter(Boolean) : []; let accumulatedPath = '';
    return (
      <div className="flex flex-wrap items-center space-x-1.5 text-xs font-bold text-slate-700 truncate min-w-0 flex-1">
        <button onClick={() => navigateTo('documenti', '')} className={`hover:text-sky-600 cursor-pointer ${parts.length === 0 ? 'text-sky-700 font-black' : 'underline'}`}>🏠 Root</button>
        {parts.map((part, idx) => {
          accumulatedPath += (accumulatedPath ? '/' : '') + part; const isLast = idx === parts.length - 1; const currentPartPath = accumulatedPath;
          return (
            <React.Fragment key={idx}>
              <span className="text-slate-400">/</span>
              <button onClick={() => !isLast && navigateTo('documenti', currentPartPath)} className={`transition-colors cursor-pointer ${isLast ? 'text-slate-900 font-extrabold cursor-default' : 'underline hover:text-sky-600 text-slate-600'}`}>📁 {part}</button>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // FETCH CLIENTI DA SUPABASE
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

  // FETCH APPUNTI PDM DA SUPABASE
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
      fetchAppunti();
    }
  }, [currentUser, activeTab, isMounted]);

  // ESECUZIONE DIAGNOSTICA AUTOMATICA
  useEffect(() => {
    if (safeStorico.length > 0) {
      const anomalie = [];
      safeStorico.forEach((item, idx) => {
        if (!item.data) anomalie.push(`Data mancante elemento #${idx}`);
        if (Number(item.ore || 0) > 24) anomalie.push(`Anomalia ore (>24h) per ${item.dipendente}`);
      });
      setDiagnosticaStato({ ok: anomalie.length === 0, anomalie });
    }
  }, [storicoCompleto]);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const randIndex = Math.floor(Math.random() * AFORISMI.length);
    setAforismaGiorno(AFORISMI[randIndex]);

    try { const saved = localStorage.getItem('bw_user'); if (saved) setCurrentUser(JSON.parse(saved)); } catch (e) {}
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { if (currentUser) { setFormData(prev => ({ ...prev, dipendente: currentUser.ruolo === 'admin' ? 'Da Assegnare' : currentUser.nome })); } }, [currentUser]);
  useEffect(() => { setSelectedItems([]); }, [activeTab]);

  useEffect(() => {
    setFormData(prev => {
      const today = getTodayStr();
      const eDaAssegnare = isItemDaAssegnare({ dipendente: prev.dipendente });
      const nuovoStato = (eDaAssegnare || prev.data > today) ? 'pianificato' : 'consuntivo';
      if (prev.stato !== nuovoStato) {
        return { ...prev, stato: nuovoStato, ore_straordinario: nuovoStato === 'pianificato' ? 0 : prev.ore_straordinario };
      }
      return prev;
    });
  }, [formData.data, formData.dipendente]);

  useEffect(() => {
    if (categoriaForm === 'ferie') { setFormData(prev => ({ ...prev, cliente: 'ASSENZE / GIUSTIFICATIVI', progetto: 'Ferie', ore: 8, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0 })); } 
    else if (categoriaForm === 'permesso') { setFormData(prev => ({ ...prev, cliente: 'ASSENZE / GIUSTIFICATIVI', progetto: 'Permesso', ore: 4, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0 })); } 
    else if (categoriaForm === 'malattia') { setFormData(prev => ({ ...prev, cliente: 'ASSENZE / GIUSTIFICATIVI', progetto: 'Malattia', ore: 8, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0 })); } 
    else if (categoriaForm === 'lavoro' && formData.cliente === 'ASSENZE / GIUSTIFICATIVI') { setFormData(prev => ({ ...prev, cliente: '', progetto: '', ore: 8 })); }
  }, [categoriaForm]);

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

  const handleSilentSync = async () => { if (currentUser?.ruolo !== 'admin') return; try { const res = await fetch('/api/sync', { method: 'POST' }); if (res.ok) fetchProgrammati(); } catch (e) {} };

  useEffect(() => {
    if (currentUser && isMounted) {
      fetchProgrammati(); fetchFeedback();
      if (currentUser.ruolo === 'admin') { handleSilentSync(); const interval = setInterval(handleSilentSync, 180000); return () => clearInterval(interval); }
    }
  }, [currentUser, activeTab, filtroArchivioAdmin, isMounted]);

  const toggleSelection = (item) => {
    if (!canEditItem(item)) return;
    setSelectedItems(prev => { if (prev.some(i => i.id === item.id)) return prev.filter(i => i.id !== item.id); return [...prev, item]; });
  };

  const handleSelectAll = (itemsToSelect) => {
    const editableItems = itemsToSelect.filter(item => canEditItem(item));
    if (editableItems.length === 0) return alert("Non hai permessi per modificare queste attività.");
    const allSelected = editableItems.every(item => selectedItems.some(sel => sel.id === item.id));
    if (allSelected) { setSelectedItems(prev => prev.filter(sel => !editableItems.some(item => item.id === sel.id))); } 
    else {
      setSelectedItems(prev => {
        const newSelection = [...prev];
        editableItems.forEach(item => { if (!newSelection.some(sel => sel.id === item.id)) newSelection.push(item); });
        return newSelection;
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    const primoGiornoMeseCorrente = getFirstDayOfCurrentMonthStr();
    const validItems = []; const skippedItems = [];
    selectedItems.forEach(item => { if (currentUser?.ruolo !== 'admin' && getNormalizedDate(item.data) < primoGiornoMeseCorrente) { skippedItems.push(item); } else { validItems.push(item); } });
    if (skippedItems.length > 0) { alert(`🔒 ${skippedItems.length} attività non eliminabili (mese chiuso).`); if (validItems.length === 0) return; }
    if (!confirm(`🗑️ Sei sicuro di voler annullare definitivamente le ${validItems.length} attività selezionate?`)) return;

    setLoading(true);
    try {
      const res = await fetch('/api/gestisci', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: validItems.map(i => ({ id: i.id, calendar_event_id: i.calendar_event_id })) }) });
      if (res.ok) { setSelectedItems([]); fetchProgrammati(); } else { alert('Errore.'); }
    } catch (e) { alert('Errore di rete.'); } finally { setLoading(false); }
  };

  const handleAiSubmit = (e) => {
    e.preventDefault(); if (!aiInput.trim()) return;
    const newMsgs = [...aiMessages, { role: 'user', text: aiInput }]; setAiMessages(newMsgs); setAiInput(''); setIsAiTyping(true);
    setTimeout(() => { setAiMessages([...newMsgs, { role: 'ai', text: 'Assistente AI attivo in modalità demo. In futuro potrò riassumerti l\'andamento delle commesse ed estrarre i rapportini!' }]); setIsAiTyping(false); }, 1200);
  };

  const unreadFeedbackCount = safeFeedbackList.filter(fb => {
    if (!fb || fb.is_deleted) return false; const key = getFeedbackKey(fb); if (!key) return false;
    if (currentUser?.ruolo === 'admin') return !fb.risposta && !safeReadIds.includes(key);
    const isMyReply = currentUser?.nome && matchNomeDipendente(fb.autore, currentUser.nome) && fb.risposta;
    return (isMyReply || !safeReadIds.includes(String(fb.id))) && !safeReadIds.includes(key);
  }).length;

  const handleInviaFeedback = async (e) => {
    e.preventDefault(); if (!feedbackForm.messaggio.trim()) return; setLoading(true); setFeedbackStatus(null);
    try {
      const res = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autore: currentUser.nome, categoria: feedbackForm.categoria, valutazione: feedbackForm.valutazione, messaggio: feedbackForm.messaggio.trim() }) });
      if (res.ok) { setFeedbackStatus({ type: 'success', text: 'Suggerimento inviato!' }); setFeedbackForm({ categoria: '💡 Nuova Funzionalità', valutazione: 5, messaggio: '' }); fetchFeedback(); } else { setFeedbackStatus({ type: 'error', text: 'Errore invio.' }); }
    } catch (e) { setFeedbackStatus({ type: 'error', text: 'Errore rete.' }); } finally { setLoading(false); }
  };

  const handleApprovaAssenza = async (item) => {
    if (!item) return;
    if (currentUser?.ruolo !== 'admin') return alert("⚠️ Solo l'amministratore può validare le ferie e i permessi!");
    setLoading(true);
    try { const res = await fetch('/api/gestisci', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, calendar_event_id: item.calendar_event_id, stato: 'pianificato', chiudi_consuntivo: false }) }); if (res.ok) fetchProgrammati(); } catch (e) { alert("Errore"); } finally { setLoading(false); }
  };

  const handleRifiutaAssenza = async (item) => {
    if (!item) return;
    if (currentUser?.ruolo !== 'admin') return alert("⚠️ Solo l'amministratore può gestire le ferie e i permessi!");
    if (!confirm(`Rifiutare la richiesta di ${toText(item.progetto)}?`)) return; setLoading(true);
    try { const res = await fetch('/api/gestisci', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, calendar_event_id: item.calendar_event_id }) }); if (res.ok) fetchProgrammati(); } catch (e) { alert("Errore"); } finally { setLoading(false); }
  };

  const caricaContenutoNC = async (folderPath = '', search = '') => {
    setLoadingNC(true); setErrorNC(null);
    try {
      const res = await fetch(`/api/documenti?folder=${encodeURIComponent(folderPath)}&query=${encodeURIComponent(search)}`);
      const data = await res.json(); if (res.ok) { setRisultatiNC(Array.isArray(data.risultati) ? data.risultati : []); } else { setErrorNC(data.message || 'Errore caricamento'); }
    } catch (err) { setErrorNC('Errore Nextcloud'); } finally { setLoadingNC(false); }
  };

  useEffect(() => { if (activeTab === 'documenti' && !searchQueryNC && isMounted) { caricaContenutoNC(pathNC, ''); } }, [activeTab, pathNC, isMounted]);
  const handleCercaNextcloud = (e) => { e.preventDefault(); if (!searchQueryNC.trim()) caricaContenutoNC(pathNC, ''); else caricaContenutoNC('', searchQueryNC); };

  const handleLogin = (e) => {
    e.preventDefault(); const user = UTENTI[loginForm.username.toLowerCase().trim()];
    if (user && user.pass === loginForm.password) { setCurrentUser(user); localStorage.setItem('bw_user', JSON.stringify(user)); setFormData(prev => ({ ...prev, dipendente: user.ruolo === 'admin' ? 'Da Assegnare' : user.nome })); navigateTo('home'); } 
    else { alert("Credenziali non valide."); }
  };

  const handleLogout = () => { setCurrentUser(null); localStorage.removeItem('bw_user'); setLoginForm({ username: '', password: '' }); setShowPassword(false); };

  const handleSyncCalendar = async () => {
    if (currentUser?.ruolo !== 'admin') return alert("Solo admin."); setLoadingProgrammati(true);
    try { await fetch('/api/sync', { method: 'POST' }); fetchProgrammati(); } catch (e) {} finally { setLoadingProgrammati(false); }
  };

  const handleQuickReassign = async (item, nuovoDipendente) => {
    if (currentUser?.ruolo !== 'admin' || !item || !nuovoDipendente || nuovoDipendente === item.dipendente) return;
    try { await fetch('/api/gestisci', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, calendar_event_id: item.calendar_event_id, dipendente: nuovoDipendente, chiudi_consuntivo: false }) }); fetchProgrammati(); } catch (e) {}
  };

  const nuovaAttivitaDaPlanner = (dip, dataStr) => { setFormData(prev => ({ ...prev, dipendente: dip, data: dataStr, data_fine: dataStr, usaIntervallo: false })); navigateTo('nuovo'); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setStatusMessage(null);
    if (!formData.cliente || !formData.cliente.trim()) { setStatusMessage({ type: 'error', text: '⚠️ Errore: Inserisci il Cliente!' }); return; }
    if (!formData.progetto || !formData.progetto.trim()) { setStatusMessage({ type: 'error', text: '⚠️ Errore: Inserisci il Progetto/Dettaglio!' }); return; }

    const totOreForm = Number(formData.ore || 0) + Number(formData.ore_backoffice || 0) + Number(formData.ore_straordinario || 0);
    if (totOreForm <= 0) { setStatusMessage({ type: 'error', text: '⚠️ Inserisci almeno 0.5 ore.' }); return; }
    if (totOreForm > 12) { if (!confirm(`⚠️ Stai registrando un totale di ${totOreForm} ore in una singola giornata. Confermi?`)) { return; } }

    const primoGiornoMeseCorrente = getFirstDayOfCurrentMonthStr();
    if (currentUser?.ruolo !== 'admin' && formData.data < primoGiornoMeseCorrente) { setStatusMessage({ type: 'error', text: '🔒 Mese Passato Consolidato: Impossibile inserire/modificare i mesi scorsi.' }); return; }

    const oggi = new Date(); const dataSelezionata = new Date(formData.data);
    const diffGiorni = (oggi - dataSelezionata) / (1000 * 60 * 60 * 24);

    if (diffGiorni > 2.5 && (!formData.note || !formData.note.trim())) { setStatusMessage({ type: 'error', text: '⏱️ Inserimento Tardivo (+48h): Le Note sono obbligatorie per registrazioni tardive.' }); return; }

    setLoading(true);
    try {
      let dateDaSalvare = [formData.data];
      if (formData.usaIntervallo && formData.data_fine > formData.data) {
        dateDaSalvare = []; let curr = new Date(formData.data); const end = new Date(formData.data_fine);
        while (curr <= end) { const dayOfWeek = curr.getDay(); if (dayOfWeek !== 0 && dayOfWeek !== 6) { dateDaSalvare.push(curr.toISOString().split('T')[0]); } curr.setDate(curr.getDate() + 1); }
      }
      if (dateDaSalvare.length === 0) dateDaSalvare = [formData.data];

      const testoProgetto = (formData.progetto || '').toLowerCase(); const testoCliente = (formData.cliente || '').toLowerCase();
      const eRichiestaAssenza = categoriaForm === 'ferie' || categoriaForm === 'permesso' || testoProgetto.includes('ferie') || testoProgetto.includes('permesso') || testoProgetto.includes('rol') || testoCliente.includes('assenze');

      let statoDaImpostare = formData.stato;
      if (eRichiestaAssenza && currentUser?.ruolo !== 'admin') {
        statoDaImpostare = 'in_approvazione';
      }

      let salvatiOk = 0; let ultimoMessaggioErrore = '';
      for (const d of dateDaSalvare) {
        const payload = { ...formData, data: d, stato: statoDaImpostare, ore_straordinario: formData.stato === 'consuntivo' ? (formData.ore_straordinario || 0) : 0 };
        const res = await fetch('/api/salva', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) { salvatiOk++; } else { const errData = await res.json().catch(()=>({})); ultimoMessaggioErrore = errData.message || 'Errore Server'; }
      }

      if (salvatiOk > 0) {
        const msgOk = statoDaImpostare === 'in_approvazione' ? `Richiesta ferie/assenza inviata all'amministratore per ${salvatiOk} giornat${salvatiOk > 1 ? 'e' : 'a'}!` : `Registrazione effettuata per ${salvatiOk} giornat${salvatiOk > 1 ? 'e' : 'a'}!`;
        setStatusMessage({ type: 'success', text: msgOk });
        handleResetForm();
        fetchProgrammati();
      } else { setStatusMessage({ type: 'error', text: ultimoMessaggioErrore }); }
    } catch (err) { setStatusMessage({ type: 'error', text: `Errore Rete` }); } finally { setLoading(false); }
  };

  const handleConfermaChiudi = async () => {
    if (!modalItem) return;
    if (!clienteEffettivo || !clienteEffettivo.trim()) { alert("⚠️ Campo Cliente obbligatorio!"); return; }
    if (!progettoEffettivo || !progettoEffettivo.trim()) { alert("⚠️ Campo Progetto obbligatorio!"); return; }

    if (isAssenza(modalItem) && currentUser?.ruolo !== 'admin') {
      alert("⚠️ Solo l'amministratore può approvare e validare le ferie o i permessi.");
      return;
    }

    const primoGiornoMeseCorrente = getFirstDayOfCurrentMonthStr();
    if (currentUser?.ruolo !== 'admin' && getNormalizedDate(modalItem.data) < primoGiornoMeseCorrente) { alert("🔒 Mese Passato Consolidato: Impossibile modificare."); return; }

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
    if (currentUser?.ruolo !== 'admin' && getNormalizedDate(item.data) < primoGiornoMeseCorrente) { return alert("🔒 Mese chiuso."); }
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
    setDipendenteEffettivo(isItemDaAssegnare(item) ? (currentUser?.ruolo === 'admin' ? 'Da Assegnare' : currentUser?.nome) : item.dipendente);
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

  // APPUNTI PDM DA SUPABASE DEDICATI
  const appuntiRaggruppati = React.useMemo(() => {
    const map = {};
    dbAppunti.forEach(app => {
      const key = `${app.cliente}|||${app.progetto}`;
      if (!map[key] || app.versione > map[key].versione) {
        map[key] = { ...app, totaleRevisioni: dbAppunti.filter(a => a.cliente === app.cliente && a.progetto === app.progetto).length };
      }
    });
    return Object.values(map);
  }, [dbAppunti]);

  // SALVATAGGIO REALE CLIENTE SU SUPABASE
  const handleSalvaCliente = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/clienti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modalCliente)
      });
      if (res.ok) {
        setModalCliente(null);
        fetchClienti();
      } else { alert("Errore nel salvataggio del cliente."); }
    } catch (err) { alert("Errore di rete."); }
    finally { setLoading(false); }
  };

  // SALVATAGGIO REALE APPUNTO PDM SU SUPABASE
  const handleSalvaAppunto = async () => {
    if (!appuntiClienteSel || !appuntiProgettoSel || !nuovoAppuntoTesto.trim()) return alert("Compila tutti i campi!");
    setLoading(true);
    try {
      const res = await fetch('/api/appunti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: appuntiClienteSel,
          progetto: appuntiProgettoSel,
          testo: nuovoAppuntoTesto,
          autore: currentUser?.nome
        })
      });
      if (res.ok) {
        setNuovoAppuntoTesto('');
        setModalNuovaNota(false);
        fetchAppunti();
      } else { alert("Errore nel salvataggio dell'appunto."); }
    } catch (err) { alert("Errore di rete."); }
    finally { setLoading(false); }
  };

  const isAlessandro = formData.dipendente === 'Alessandro Ciule';
  const todayStr = getTodayStr();

  const daAssegnareItems = safeStorico.filter(isItemDaAssegnare);

  const giorniMancantiUtente = currentUser?.nome ? getGiorniLavorativiMancanti(safeStorico, currentUser.nome) : [];

  const assenzeDaApprovareAdmin = safeStorico.filter(s => s && s.stato === 'in_approvazione');
  const mieAttivitaArretrato = safeStorico.filter(s => s && currentUser?.nome && matchNomeDipendente(s.dipendente, currentUser.nome) && s.stato !== 'consuntivo' && s.stato !== 'annullato' && getNormalizedDate(s.data) <= todayStr);
  const mieAttivitaProssime = safeStorico.filter(s => s && currentUser?.nome && matchNomeDipendente(s.dipendente, currentUser.nome) && s.stato !== 'consuntivo' && s.stato !== 'annullato' && getNormalizedDate(s.data) > todayStr);

  const safeRisultatiNC = Array.isArray(risultatiNC) ? risultatiNC : [];
  const giorniSettimanaPlanner = get7DaysOfWeek(plannerWeekStart);

  const handleShiftWeek = (deltaDays) => {
    const curr = new Date(plannerWeekStart); curr.setDate(curr.getDate() + deltaDays);
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
            <input type="checkbox" checked={isSelected} onChange={() => toggleSelection(item)} className={`w-5 h-5 cursor-pointer accent-sky-500 rounded border-slate-300`} />
          </div>
        )}
        
        <div onClick={() => openEditModal(item)} className={`flex-1 p-4 bg-white border ${isSelected ? 'border-sky-500 ring-2 ring-sky-400/30 shadow-md' : 'border-slate-200 shadow-xs'} rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4 cursor-pointer hover:border-sky-300 hover:shadow-md transition-all group`}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">{normDate === todayStr ? 'Oggi' : normDate}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badgeStyle}`}>{icona} {etichetta}</span>
              {isInApprovazione && <span className="text-[10px] font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-md shadow-xs animate-pulse">⏳ In Approvazione Admin</span>}
              {Number(item.ore_straordinario || 0) > 0 && <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-300">⚡ +{item.ore_straordinario}h Straord.</span>}
            </div>
            <div className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">{isAssenzaFlag ? toText(item.progetto) : (toText(item.cliente) || "⚠️ Cliente non assegnato")}</div>
            {!isAssenzaFlag && <div className="text-xs text-slate-500">{toText(item.progetto) || "Nessun dettaglio"}</div>}
            {item.note && <div className="text-[11px] text-slate-500 italic mt-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">📝 {toText(item.note)}</div>}
            
            {currentUser?.ruolo === 'admin' && (
              <div className="mt-3 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                <span className="text-[10px] uppercase font-bold text-slate-400">Assegna a:</span>
                <select value={isItemDaAssegnare(item) ? 'Da Assegnare' : item.dipendente} onChange={e => handleQuickReassign(item, e.target.value)} className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ${isItemDaAssegnare(item) ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                  <option value="Da Assegnare">❓ Da Assegnare</option>
                  {listaDipendenti.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="flex space-x-2 mt-2 md:mt-0 items-center h-full" onClick={e => e.stopPropagation()}>
            {isInApprovazione && currentUser?.ruolo === 'admin' ? (
              <>
                <button onClick={() => handleApprovaAssenza(item)} className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-700 cursor-pointer">✅ Approva</button>
                <button onClick={() => handleRifiutaAssenza(item)} className="px-3.5 py-1.5 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-rose-700 cursor-pointer">❌ Rifiuta</button>
              </>
            ) : isEditable ? (
              <>
                {!isAssenzaFlag ? (
                  <button onClick={() => openEditModal(item)} className="px-4 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white text-xs font-bold rounded-xl transition-all border border-sky-100 cursor-pointer">
                    {item.stato === 'consuntivo' ? 'Modifica' : 'Conferma'}
                  </button>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">🔒 Validato dall'Admin</span>
                )}
                <button onClick={() => handleElimina(item)} className="px-3 py-1.5 bg-white text-rose-600 border border-rose-200 text-xs font-bold rounded-xl hover:bg-rose-50 transition-colors cursor-pointer">🗑️</button>
              </>
            ) : <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">Sola Lettura</span>}
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
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-xl shadow-slate-900/20 transition-all text-sm mt-2 cursor-pointer">Accedi alla Piattaforma</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex flex-col md:flex-row pb-24 md:pb-0">
      <Head>
        <title>BW Solutions | Hub</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%230ea5e9'/><text x='50' y='55' font-family='Arial, sans-serif' font-size='50' fill='white' font-weight='bold' text-anchor='middle' alignment-baseline='middle'>bw</text></svg>" />
      </Head>
      <datalist id="lista-aziende">{listaClientiCompleta.map((azienda, index) => <option key={index} value={azienda} />)}</datalist>

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
            {navHistory.length > 0 && <button onClick={handleGoBack} className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl mb-2 transition-all flex gap-2 cursor-pointer"><span>⬅️</span> Indietro</button>}
            <button onClick={() => navigateTo('home')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'home' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>🏠 Home</button>
            <button onClick={() => navigateTo('planner')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'planner' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📅 Planner Team</button>
            <button onClick={() => navigateTo('nuovo')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'nuovo' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📝 Inserisci Ore</button>
            <button onClick={() => navigateTo('programmati')} className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${activeTab === 'programmati' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
              <div className="flex gap-3">⏳ Attività</div>
              {(mostraDaAssegnare && daAssegnareItems.length > 0) && <span className="bg-amber-500 text-white font-black px-2 py-0.5 rounded-full text-[10px]">{daAssegnareItems.length}</span>}
            </button>
            
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
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          {/* BADGE STATO DIAGNOSTICA */}
          <div className="px-3 py-2 bg-slate-800/80 rounded-xl text-[10px] font-bold flex items-center justify-between border border-slate-700">
            <span className="text-slate-400">Diagnostica App:</span>
            <span className={diagnosticaStato.ok ? "text-emerald-400" : "text-amber-400 animate-pulse"}>
              {diagnosticaStato.ok ? "🟢 Sistema OK" : "⚠️ Check In Corso"}
            </span>
          </div>

          <div className="hidden md:flex bg-slate-800 p-3 rounded-2xl items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs">{(currentUser?.nome || 'U')[0]}</div>
              <span className="text-white font-bold text-xs truncate">{currentUser?.nome}</span>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 p-1 transition-colors cursor-pointer">🚪</button>
          </div>
        </div>
      </aside>

      {/* CONTENUTO PRINCIPALE */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto space-y-6 relative">
        
        {/* ACTION BAR ELIMINAZIONE MULTIPLA */}
        {selectedItems.length > 0 && activeTab === 'programmati' && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl z-50 flex items-center gap-6 border border-slate-700 animate-pulse">
            <span className="font-bold text-sm">Hai selezionato <span className="text-sky-400">{selectedItems.length}</span> attività</span>
            <div className="flex gap-3">
              <button onClick={() => setSelectedItems([])} className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors">Annulla</button>
              <button onClick={handleBulkDelete} disabled={loading} className="bg-rose-500 hover:bg-rose-400 text-white px-4 py-2 rounded-full text-xs font-bold shadow-md cursor-pointer transition-colors flex items-center gap-2">
                {loading ? <span className="animate-spin">⏳</span> : '🗑️'} <span>Elimina Selezionate</span>
              </button>
            </div>
          </div>
        )}

        {navHistory.length > 0 && activeTab !== 'home' && (
          <div className="md:hidden mb-4">
            <button onClick={handleGoBack} className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-slate-800 font-extrabold text-xs rounded-2xl border shadow-xs cursor-pointer"><span>⬅️ Torna indietro</span></button>
          </div>
        )}

        {/* TAB HOME */}
        {activeTab === 'home' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-[2rem] p-6 shadow-xs border border-slate-200/60 flex items-center gap-5 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-sky-50 rounded-full blur-2xl"></div>
                <div className="bg-sky-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-sky-500/30 relative z-10">🕒</div>
                <div className="relative z-10">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{currentTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                    {currentTime.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
              
              <a href="https://news.google.it" target="_blank" rel="noreferrer" className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 shadow-xl border border-slate-700 flex items-center gap-5 hover:scale-[1.02] transition-transform cursor-pointer group">
                <div className="bg-white/10 text-white w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border border-white/20 group-hover:bg-white/20 transition-colors">📰</div>
                <div>
                  <div className="text-xl font-black text-white tracking-tight">Notizie del Giorno</div>
                  <div className="text-xs font-semibold text-slate-300 mt-1 flex items-center gap-1">Esplora le ultime news su Google <span className="text-sky-400">➔</span></div>
                </div>
              </a>
            </div>

            <div className="bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 border border-sky-100 rounded-[2rem] p-5 shadow-xs flex items-center gap-4">
              <span className="text-3xl">💬</span>
              <div>
                <span className="text-[10px] font-black uppercase text-sky-600 tracking-widest block">Ispirazione del giorno</span>
                <p className="text-xs md:text-sm font-bold italic text-slate-800 mt-0.5">{aforismaGiorno}</p>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-8 shadow-xs border border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-60"></div>
              <div className="relative z-10 space-y-2 text-center md:text-left">
                <span className="text-xs font-bold uppercase tracking-widest text-sky-500 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">BW Solutions Hub</span>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Ciao, {currentUser?.nome.split(' ')[0]} 👋</h1>
                <p className="text-slate-500 text-sm max-w-md">Gestisci le tue ore, pianifica i cantieri e collabora con il team in un'unica piattaforma integrata.</p>
              </div>
              <div className="relative z-10 flex gap-3">
                <button onClick={() => navigateTo('nuovo')} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all text-sm cursor-pointer">Registra Ore</button>
                <button onClick={() => navigateTo('planner')} className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm cursor-pointer">Vedi Planner</button>
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
                <button onClick={() => navigateTo('nuovo')} className="bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs hover:bg-rose-500 cursor-pointer">Compila Subito</button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ASSISTENTE AI */}
              <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-6 shadow-xl border border-slate-700 text-white flex flex-col relative overflow-hidden">
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
                      <div className={`max-w-[85%] text-xs md:text-sm p-3 rounded-2xl leading-relaxed ${msg.role === 'ai' ? 'bg-slate-800 text-slate-200 rounded-tl-xs border border-slate-700' : 'bg-sky-600 text-white rounded-tr-xs shadow-md'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isAiTyping && <div className="text-xs text-slate-500 italic flex gap-1 items-center"><span className="animate-bounce">●</span><span className="animate-bounce delay-100">●</span><span className="animate-bounce delay-200">●</span></div>}
                </div>
                <form onSubmit={handleAiSubmit} className="relative z-10 flex gap-2">
                  <input type="text" value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder="Chiedi un riepilogo cantieri o di scrivere un rapportino..." className="flex-1 bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500" />
                  <button type="submit" disabled={isAiTyping || !aiInput.trim()} className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all shadow-md cursor-pointer">Invia</button>
                </form>
              </div>

              {/* STATISTICHE RAPIDE INTERATTIVE */}
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-[2rem] border border-slate-200/80 shadow-xs">
                  <h4 className="font-bold text-slate-800 text-sm mb-3">Statistiche Rapide</h4>
                  <div className="space-y-3">
                    <div onClick={() => navigateTo('programmati')} className="flex justify-between items-center bg-slate-50 hover:bg-rose-50/50 p-3 rounded-xl border border-slate-100 hover:border-rose-200 cursor-pointer transition-colors group">
                      <span className="text-xs font-semibold text-slate-600 group-hover:text-rose-900">Da Consuntivare (Tu)</span>
                      <span className="font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-lg group-hover:scale-105 transition-transform">{mieAttivitaArretrato.length}</span>
                    </div>
                    <div onClick={() => navigateTo('programmati')} className="flex justify-between items-center bg-slate-50 hover:bg-sky-50/50 p-3 rounded-xl border border-slate-100 hover:border-sky-200 cursor-pointer transition-colors group">
                      <span className="text-xs font-semibold text-slate-600 group-hover:text-sky-900">In Programma (Tu)</span>
                      <span className="font-black text-sky-600 bg-sky-100 px-2 py-0.5 rounded-lg group-hover:scale-105 transition-transform">{mieAttivitaProssime.length}</span>
                    </div>
                    {currentUser?.ruolo === 'admin' && (
                      <div onClick={() => { navigateTo('cruscotto'); setSubTabReport('ferie'); }} className="flex justify-between items-center bg-amber-50 hover:bg-amber-100/60 p-3 rounded-xl border border-amber-100 hover:border-amber-300 cursor-pointer transition-colors group">
                        <span className="text-xs font-semibold text-amber-800">Assenze in Attesa</span>
                        <span className="font-black text-amber-600 bg-white px-2 py-0.5 rounded-lg shadow-xs group-hover:scale-105 transition-transform">{assenzeDaApprovareAdmin.length}</span>
                      </div>
                    )}
                  </div>
                </div>

                <a href="https://calendar.google.com/" target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-white p-4 rounded-[2rem] border border-slate-200 hover:border-sky-300 transition-colors cursor-pointer group shadow-xs">
                  <div className="bg-sky-50 p-2.5 rounded-xl group-hover:bg-sky-500 group-hover:text-white transition-colors text-sky-600">📅</div>
                  <div><h4 className="font-bold text-slate-800 text-sm">Google Calendar</h4><p className="text-[10px] text-slate-500">Apri l'app ufficiale.</p></div>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB NUOVO INSERIMENTO CON RESET BUTTON */}
        {activeTab === 'nuovo' && (
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 overflow-hidden">
            <div className="bg-slate-50 p-6 flex justify-between items-center border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Nuova Registrazione Attività</h2>
                <p className="text-xs text-slate-500 mt-0.5">Inserisci le ore lavorate, pianifica eventi o registra ferie/permessi.</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wide">Tipologia</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button type="button" onClick={() => setCategoriaForm('lavoro')} className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${categoriaForm === 'lavoro' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>💼 Lavoro</button>
                  <button type="button" onClick={() => setCategoriaForm('ferie')} className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${categoriaForm === 'ferie' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>🏖️ Ferie</button>
                  <button type="button" onClick={() => setCategoriaForm('permesso')} className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${categoriaForm === 'permesso' ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>⏱️ Permesso</button>
                  <button type="button" onClick={() => setCategoriaForm('malattia')} className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${categoriaForm === 'malattia' ? 'bg-rose-500 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>🏥 Malattia</button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border flex items-center justify-between font-bold text-xs shadow-2xs">
                {formData.stato === 'pianificato' ? (
                  <div className="flex items-center space-x-2 text-amber-800 bg-amber-50 p-2.5 rounded-xl w-full border border-amber-200">
                    <span className="text-lg">⏳</span>
                    <div>
                      <span className="block font-extrabold uppercase text-[10px] text-amber-900">Stato Impostato: Pianificato per il Futuro</span>
                      <span className="text-[11px] font-normal text-amber-800 leading-tight block">L'attività verrà salvata nei compiti in programma.</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-emerald-800 bg-emerald-50 p-2.5 rounded-xl w-full border border-emerald-200">
                    <span className="text-lg">✅</span>
                    <div>
                      <span className="block font-extrabold uppercase text-[10px] text-emerald-900">Stato Impostato: Consuntivo Diretto</span>
                      <span className="text-[11px] font-normal text-emerald-800 leading-tight block">L'attività passata sarà chiusa e aggiunta alle ore.</span>
                    </div>
                  </div>
                )}
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
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2 tracking-wide">Note &amp; Dettagli</label>
                <textarea rows={2} placeholder="Note o spiegazioni aggiuntive..." value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500"></textarea>
              </div>

              {statusMessage && <div className={`p-4 rounded-xl text-sm font-bold ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-900'}`}>{statusMessage.text}</div>}
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={handleResetForm} className="w-1/3 py-4 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer">
                  🧹 Svuota Form
                </button>
                <button type="submit" disabled={loading} className="w-2/3 text-white font-bold py-4 rounded-xl shadow-md cursor-pointer bg-slate-900 hover:bg-slate-800 transition-colors">
                  {loading ? 'Salvataggio...' : 'Salva Registrazione 🚀'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB GESTIONE ATTIVITÀ */}
        {activeTab === 'programmati' && (
          <div className="space-y-6 pb-20">
            <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">📁 Repository Attività Team</h2>
                <p className="text-xs text-slate-500 mt-1">Sfoglia le cartelle e le attività della tua risorsa. Usa la spunta a sinistra per eliminazioni multiple.</p>
              </div>
              <div className="flex gap-2">
                {currentUser?.ruolo === 'admin' && <button onClick={handleSyncCalendar} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer">⬇️ Sincronizza Google</button>}
                <button onClick={fetchProgrammati} className="bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-xs cursor-pointer">🔄 Aggiorna</button>
              </div>
            </div>

            {/* CARTELLA DA ASSEGNARE (Solo per Admin) */}
            {mostraDaAssegnare && (
              <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl overflow-hidden shadow-xs">
                <div onClick={() => toggleCartella('Da Assegnare')} className="p-5 flex items-center justify-between cursor-pointer hover:bg-amber-100/50 select-none">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{cartelleAperte['Da Assegnare'] ? '📂' : '📁'}</span>
                    <div>
                      <h3 className="font-bold text-amber-950 text-base">Attività Da Assegnare</h3>
                      <p className="text-xs text-amber-800">Eventi non ancora associati ad un tecnico o con dettagli mancanti</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full">{daAssegnareItems.length} da assegnare</span>
                    <span className="text-amber-900 font-bold text-xs bg-amber-200/80 px-3 py-1.5 rounded-xl border border-amber-300">{cartelleAperte['Da Assegnare'] ? '▲ Chiudi Cartella' : '▼ Apri Cartella'}</span>
                  </div>
                </div>

                {cartelleAperte['Da Assegnare'] && (
                  <div className="p-5 border-t border-amber-200 bg-white space-y-3">
                    {daAssegnareItems.length > 0 && currentUser?.ruolo === 'admin' && (
                      <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Totale: {daAssegnareItems.length}</span>
                        <button onClick={(e) => { e.stopPropagation(); handleSelectAll(daAssegnareItems); }} className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors shadow-xs cursor-pointer border border-amber-200 flex items-center gap-1">
                          ☑️ <span className="hidden sm:inline">Seleziona Tutto</span>
                        </button>
                      </div>
                    )}
                    {daAssegnareItems.length === 0 ? (
                      <p className="text-xs text-amber-700 font-semibold py-2 text-center">✅ Nessuna attività in attesa di assegnazione!</p>
                    ) : (
                      daAssegnareItems.map((item, idx) => renderRigaAttivita(item, 'amber', idx))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CARTELLE DIPENDENTI FILTRATE PER RUOLO */}
            <div className="space-y-4">
              {dipendentiVisibili.map(dipNome => {
                const eventiDip = safeStorico.filter(e => e && matchNomeDipendente(e.dipendente, dipNome));
                const interventiLavoro = eventiDip.filter(e => !isAssenza(e) && Number(e.ore_backoffice || 0) === 0 && e.stato !== 'consuntivo' && e.stato !== 'annullato');
                const backofficeProgetti = eventiDip.filter(e => !isAssenza(e) && Number(e.ore_backoffice || 0) > 0 && e.stato !== 'consuntivo' && e.stato !== 'annullato');
                const assenzeGiustificativi = eventiDip.filter(e => isAssenza(e) && e.stato !== 'consuntivo' && e.stato !== 'annullato');
                const concluseConsuntivate = eventiDip.filter(e => e.stato === 'consuntivo');

                const isAperta = !!cartelleAperte[dipNome];

                return (
                  <div key={dipNome} className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                    <div onClick={() => toggleCartella(dipNome)} className="bg-slate-900 hover:bg-slate-800 text-white p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-sky-500 text-slate-950 font-extrabold rounded-2xl flex items-center justify-center text-lg">{isAperta ? '📂' : '📁'}</div>
                        <div>
                          <h3 className="font-bold text-lg leading-tight">{dipNome}</h3>
                          <span className="text-xs text-slate-400 font-medium">Cartella Personale Attività</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 text-xs font-bold hidden sm:flex">
                          <span className="bg-sky-500/20 text-sky-300 px-2.5 py-1 rounded-xl border border-sky-500/30">💼 {interventiLavoro.length + backofficeProgetti.length} Attivi</span>
                          <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-xl border border-emerald-500/30">✅ {concluseConsuntivate.length} Conclusi</span>
                        </div>
                        <span className="text-sky-400 font-bold text-xs bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">{isAperta ? '▲ Chiudi' : '▼ Apri'}</span>
                      </div>
                    </div>

                    {isAperta && (
                      <div className="p-5 space-y-4 bg-slate-50/50">
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                          <div onClick={() => toggleSottoCartella(`${dipNome}_lavoro`)} className="p-3.5 bg-sky-50/80 hover:bg-sky-100/80 flex items-center justify-between cursor-pointer border-b border-sky-100 select-none">
                            <span className="font-bold text-slate-900 text-sm flex items-center gap-2"><span>💼</span> Interventi Lavoro &amp; Cantiere</span>
                            <span className="bg-sky-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full">{interventiLavoro.length}</span>
                          </div>
                          {sottoCartelleAperte[`${dipNome}_lavoro`] && (
                            <div className="p-4 space-y-2 bg-white">
                              {interventiLavoro.length > 0 && canEditItem(interventiLavoro[0]) && (
                                <div className="flex justify-between items-center mb-2 px-1">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Totale: {interventiLavoro.length}</span>
                                  <button onClick={(e) => { e.stopPropagation(); handleSelectAll(interventiLavoro); }} className="text-[10px] font-extrabold bg-sky-100 text-sky-800 px-3 py-1.5 rounded-lg hover:bg-sky-200 transition-colors shadow-xs cursor-pointer border border-sky-200 flex items-center gap-1">
                                    ☑️ <span className="hidden sm:inline">Seleziona Tutto</span>
                                  </button>
                                </div>
                              )}
                              {interventiLavoro.length === 0 ? <p className="text-xs text-slate-400 py-2 text-center">Nessun intervento in programma.</p> : interventiLavoro.map((item, idx) => renderRigaAttivita(item, getNormalizedDate(item.data) < todayStr ? 'rose' : 'sky', idx))}
                            </div>
                          )}
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                          <div onClick={() => toggleSottoCartella(`${dipNome}_backoffice`)} className="p-3.5 bg-indigo-50/80 hover:bg-indigo-100/80 flex items-center justify-between cursor-pointer border-b border-indigo-100 select-none">
                            <span className="font-bold text-slate-900 text-sm flex items-center gap-2"><span>🖥️</span> Backoffice &amp; Progetti Interni</span>
                            <span className="bg-indigo-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full">{backofficeProgetti.length}</span>
                          </div>
                          {sottoCartelleAperte[`${dipNome}_backoffice`] && (
                            <div className="p-4 space-y-2 bg-white">
                              {backofficeProgetti.length > 0 && canEditItem(backofficeProgetti[0]) && (
                                <div className="flex justify-between items-center mb-2 px-1">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Totale: {backofficeProgetti.length}</span>
                                  <button onClick={(e) => { e.stopPropagation(); handleSelectAll(backofficeProgetti); }} className="text-[10px] font-extrabold bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-200 transition-colors shadow-xs cursor-pointer border border-indigo-200 flex items-center gap-1">
                                    ☑️ <span className="hidden sm:inline">Seleziona Tutto</span>
                                  </button>
                                </div>
                              )}
                              {backofficeProgetti.length === 0 ? <p className="text-xs text-slate-400 py-2 text-center">Nessun backoffice programmato.</p> : backofficeProgetti.map((item, idx) => renderRigaAttivita(item, 'indigo', idx))}
                            </div>
                          )}
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                          <div onClick={() => toggleSottoCartella(`${dipNome}_assenze`)} className="p-3.5 bg-purple-50/80 hover:bg-purple-100/80 flex items-center justify-between cursor-pointer border-b border-purple-100 select-none">
                            <span className="font-bold text-slate-900 text-sm flex items-center gap-2"><span>🏖️</span> Ferie, Permessi &amp; Malattie</span>
                            <span className="bg-purple-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full">{assenzeGiustificativi.length}</span>
                          </div>
                          {sottoCartelleAperte[`${dipNome}_assenze`] && (
                            <div className="p-4 space-y-2 bg-white">
                              {assenzeGiustificativi.length > 0 && canEditItem(assenzeGiustificativi[0]) && (
                                <div className="flex justify-between items-center mb-2 px-1">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Totale: {assenzeGiustificativi.length}</span>
                                  <button onClick={(e) => { e.stopPropagation(); handleSelectAll(assenzeGiustificativi); }} className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition-colors shadow-xs cursor-pointer border border-purple-200 flex items-center gap-1">
                                    ☑️ <span className="hidden sm:inline">Seleziona Tutto</span>
                                  </button>
                                </div>
                              )}
                              {assenzeGiustificativi.length === 0 ? <p className="text-xs text-slate-400 py-2 text-center">Nessuna assenza programmata.</p> : assenzeGiustificativi.map((item, idx) => renderRigaAttivita(item, 'purple', idx))}
                            </div>
                          )}
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                          <div onClick={() => toggleSottoCartella(`${dipNome}_concluse`)} className="p-3.5 bg-emerald-50/80 hover:bg-emerald-100/80 flex items-center justify-between cursor-pointer border-b border-emerald-100 select-none">
                            <span className="font-bold text-slate-900 text-sm flex items-center gap-2"><span>✅</span> Storico Attività Concluse</span>
                            <span className="bg-emerald-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full">{concluseConsuntivate.length}</span>
                          </div>
                          {sottoCartelleAperte[`${dipNome}_concluse`] && (
                            <div className="p-4 space-y-2 bg-white">
                              {concluseConsuntivate.length > 0 && canEditItem(concluseConsuntivate[0]) && (
                                <div className="flex justify-between items-center mb-2 px-1">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Totale: {concluseConsuntivate.length}</span>
                                  <button onClick={(e) => { e.stopPropagation(); handleSelectAll(concluseConsuntivate); }} className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition-colors shadow-xs cursor-pointer border border-emerald-200 flex items-center gap-1">
                                    ☑️ <span className="hidden sm:inline">Seleziona Tutto</span>
                                  </button>
                                </div>
                              )}
                              {concluseConsuntivate.length === 0 ? <p className="text-xs text-slate-400 py-2 text-center">Nessuna attività conclusa.</p> : [...concluseConsuntivate].sort((a, b) => new Date(getNormalizedDate(b.data)) - new Date(getNormalizedDate(a.data))).map((item, idx) => renderRigaAttivita(item, 'emerald', idx))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB ANAGRAFICHE */}
        {activeTab === 'anagrafiche' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2"><span>🏢</span> Anagrafica Clienti</h2>
                <p className="text-xs text-slate-500 mt-1">Gestisci le informazioni dei clienti, contatti e indirizzi registrati su Supabase.</p>
              </div>
              <button onClick={() => setModalCliente({ ragione_sociale: '', piva: '', indirizzo: '', email: '', telefono: '', note: '' })} className="bg-sky-600 text-white font-bold px-4 py-2 rounded-xl text-sm shadow-md hover:bg-sky-500 transition-colors cursor-pointer">
                + Nuovo Cliente
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <input type="text" placeholder="Cerca cliente..." value={searchCliente} onChange={e => setSearchCliente(e.target.value)} className="w-full mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-sky-500" />
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 uppercase border-b border-slate-200">
                      <th className="p-3">Ragione Sociale</th>
                      <th className="p-3">P.IVA / C.F.</th>
                      <th className="p-3">Indirizzo</th>
                      <th className="p-3">Contatti</th>
                      <th className="p-3 text-right">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dbClienti.filter(c => c.ragione_sociale.toLowerCase().includes(searchCliente.toLowerCase())).map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{c.ragione_sociale}</td>
                        <td className="p-3 font-mono text-slate-600">{c.partita_iva || c.piva || '-'}</td>
                        <td className="p-3 text-slate-600">{c.indirizzo || '-'}</td>
                        <td className="p-3 text-slate-600">{c.email}<br/>{c.telefono}</td>
                        <td className="p-3 text-right">
                          <button onClick={() => setModalCliente(c)} className="text-sky-600 font-bold hover:underline cursor-pointer">Modifica</button>
                        </td>
                      </tr>
                    ))}
                    {dbClienti.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-slate-400">{loadingClienti ? 'Caricamento clienti...' : 'Nessun cliente in anagrafica.'}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB APPUNTI PDM */}
        {activeTab === 'appunti' && (
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-xs border border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2"><span>📓</span> Quaderno Appunti &amp; PDM Revisioni</h2>
                <p className="text-xs text-slate-500 mt-1">Sfoglia le note per commessa in stile OneNote o crea una nuova revisione PDM.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="🔍 Cerca appunti..." 
                  value={ricercaAppunti}
                  onChange={e => setSearchAppunti(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button onClick={() => { setAppuntiClienteSel(listaClientiCompleta[0] || ''); setAppuntiProgettoSel(''); setNuovoAppuntoTesto(''); setModalNuovaNota(true); }} className="bg-sky-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md hover:bg-sky-500 transition-colors cursor-pointer flex items-center gap-1">
                  ➕ <span className="hidden sm:inline">Nuovo Appunto</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {appuntiRaggruppati
                .filter(a => a.cliente.toLowerCase().includes(ricercaAppunti.toLowerCase()) || a.progetto.toLowerCase().includes(ricercaAppunti.toLowerCase()) || a.testo.toLowerCase().includes(ricercaAppunti.toLowerCase()))
                .map((app) => (
                <div key={`${app.cliente}_${app.progetto}`} onClick={() => { setAppuntiClienteSel(app.cliente); setAppuntiProgettoSel(app.progetto); }} className="bg-white rounded-3xl border border-slate-200 hover:border-sky-400 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between overflow-hidden group relative">
                  <div className="h-2 bg-sky-500 w-full"></div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-sky-600 bg-sky-50 border border-sky-100 px-2.5 py-0.5 rounded-md truncate max-w-[180px]">{app.cliente}</span>
                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-[10px] px-2 py-0.5 rounded-full flex-shrink-0">Rev. v{app.versione}</span>
                    </div>
                    <h3 className="font-black text-slate-900 text-base leading-snug group-hover:text-sky-600 transition-colors">{app.progetto}</h3>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 bg-slate-50 p-3 rounded-xl border border-slate-100">{app.testo}</p>
                  </div>
                  <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                    <span className="flex items-center gap-1">👤 {app.autore}</span><span>{formatDateSafely(app.data_ora)}</span>
                  </div>
                </div>
              ))}
            </div>

            {appuntiClienteSel && appuntiProgettoSel && (
              <div className="bg-white rounded-3xl border-2 border-sky-400 shadow-xl p-6 space-y-5 animate-fade-in mt-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <span className="text-xs font-black uppercase text-sky-600">{appuntiClienteSel}</span>
                    <h3 className="text-xl font-black text-slate-900">{appuntiProgettoSel}</h3>
                  </div>
                  <button onClick={() => { setAppuntiClienteSel(''); setAppuntiProgettoSel(''); }} className="text-slate-400 hover:text-slate-600 font-bold text-xs bg-slate-100 px-3 py-1.5 rounded-xl cursor-pointer">✕ Chiudi Scheda</button>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2"><span>✏️</span> Aggiungi Nuova Revisione (PDM)</h4>
                  <textarea value={nuovoAppuntoTesto} onChange={e=>setNuovoAppuntoTesto(e.target.value)} placeholder="Scrivi gli aggiornamenti della nota qui..." className="w-full h-28 p-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-sky-500"></textarea>
                  <button onClick={handleSalvaAppunto} className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow cursor-pointer transition-colors">Salva e Pubblica Revisione 🚀</button>
                </div>
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Storico Completo Revisioni</h4>
                  {dbAppunti.filter(a => a.cliente === appuntiClienteSel && a.progetto === appuntiProgettoSel).sort((a,b) => b.versione - a.versione).map((nota, idx) => (
                    <div key={nota.id} className={`p-4 rounded-2xl border ${idx === 0 ? 'bg-sky-50/50 border-sky-200' : 'bg-slate-50 border-slate-200 opacity-80'}`}>
                      <div className="flex justify-between items-center mb-2 border-b border-slate-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${idx === 0 ? 'bg-sky-600 text-white' : 'bg-slate-300 text-slate-700'}`}>Versione v{nota.versione} {idx === 0 ? '(In Uso)' : ''}</span>
                          <span className="text-xs font-bold text-slate-800">👤 {nota.autore}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{formatDateSafely(nota.data_ora)}</span>
                      </div>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap font-medium">{nota.testo}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB FEEDBACK */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">💡 Suggerimenti &amp; Feedback App</h2>
                <p className="text-xs text-slate-500 mt-1">Invia le tue idee o segnala malfunzionamenti direttamente al team.</p>
              </div>
              <form onSubmit={handleInviaFeedback} className="space-y-5">
                <textarea required rows={4} placeholder="Scrivi qui il tuo messaggio o suggerimento..." value={feedbackForm.messaggio} onChange={e => setFeedbackForm({ ...feedbackForm, messaggio: e.target.value })} className="w-full p-4 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-sky-500"></textarea>
                {feedbackStatus && <div className={`p-4 rounded-xl text-xs font-bold ${feedbackStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>{feedbackStatus.text}</div>}
                <button type="submit" disabled={loading || !feedbackForm.messaggio.trim()} className="bg-sky-600 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-sky-500 cursor-pointer">Invia Suggerimento</button>
              </form>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-base">💬 Bacheca Pubblica Idee ({safeFeedbackList.length})</h3>
              <div className="space-y-4">
                {safeFeedbackList.map((fb, idx) => (
                  <div key={fb.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-900">👤 {toText(fb.autore)}</span>
                      <span className="text-slate-400">{formatDateSafely(fb.created_at || fb.data_ora)}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{toText(fb.messaggio)}</p>
                    {fb.risposta && <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 text-xs text-sky-900 font-semibold mt-2">💬 Direzione: {toText(fb.risposta)}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB DOCUMENTI ARUBA NEXTCLOUD */}
        {activeTab === 'documenti' && (
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 space-y-6">
             <div className="flex justify-between items-center">
               <h2 className="text-xl font-bold text-slate-900">📂 Documenti Cloud (Aruba)</h2>
             </div>
             <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
               {renderBreadcrumbs()}
             </div>
             
             <form onSubmit={handleCercaNextcloud} className="flex gap-2">
               <input type="text" value={searchQueryNC} onChange={e => setSearchQueryNC(e.target.value)} placeholder="Cerca un file su Aruba (es. ALSTOM)..." className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
               <button type="submit" disabled={loadingNC} className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer">{loadingNC ? '...' : 'Cerca 🔍'}</button>
             </form>

             <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
               {safeRisultatiNC.length === 0 ? (
                 <p className="text-xs text-slate-400 p-8 text-center">Nessun file presente in questo percorso.</p>
               ) : (
                 safeRisultatiNC.map((item, idx) => {
                   const isDir = item?.isFolder === true || item?.type === 'dir' || item?.type === 'folder';
                   return (
                     <div key={idx} onClick={() => { if (isDir) handleApriCartella(item.percorso); else setModalDocumento(item); }} className="p-3.5 hover:bg-sky-50 flex items-center justify-between gap-3 cursor-pointer transition-all">
                       <div className="flex items-center space-x-3 min-w-0 flex-1">
                         <span className="text-2xl flex-shrink-0">{isDir ? '📁' : '📄'}</span>
                         <span className="font-bold text-sm text-slate-800 truncate">{toText(item?.nome)}</span>
                       </div>
                       {!isDir && (
                         <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                           <button type="button" onClick={() => setModalDocumento(item)} className="bg-sky-100 text-sky-800 hover:bg-sky-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer">👁️ Vedi</button>
                           <a href={`/api/download?path=${encodeURIComponent(item?.percorso || '')}&forceDownload=true`} className="bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold">📥 Scarica</a>
                         </div>
                       )}
                     </div>
                   );
                 })
               )}
             </div>
          </div>
        )}

        {/* TAB REPORTISTICA COMPLETA */}
        {activeTab === 'cruscotto' && currentUser?.ruolo === 'admin' && (
           <div className="space-y-6">
             <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl space-y-4">
               <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                 <div>
                   <h2 className="text-xl font-bold tracking-tight">📊 Centro Reportistica Aziendale</h2>
                   <p className="text-xs text-slate-400 mt-0.5">Analisi avanzata e consuntivi per contabilità e paghe.</p>
                 </div>

                 <div className="flex items-center space-x-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700 overflow-x-auto">
                   <button onClick={() => setSubTabReport('paghe')} className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${subTabReport === 'paghe' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>💶 Buste Paga</button>
                   <button onClick={() => setSubTabReport('fatturazione')} className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${subTabReport === 'fatturazione' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>🧾 Fatturazione</button>
                   <button onClick={() => setSubTabReport('ferie')} className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${subTabReport === 'ferie' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}>🏖️ Archivio Ferie</button>
                 </div>
               </div>

               <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                 <div className="flex items-center space-x-3">
                   <label className="text-xs font-bold uppercase text-slate-400">Mese:</label>
                   <input type="month" value={filtroMeseReport} onChange={e => setFiltroMeseReport(e.target.value)} className="bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 outline-none" />
                 </div>

                 {subTabReport === 'paghe' && <button onClick={exportCSVPaghe} className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer transition-colors">📥 Esporta CSV Paghe</button>}
                 {subTabReport === 'fatturazione' && <button onClick={exportCSVFatturazione} className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer transition-colors">📥 Esporta CSV Fatture</button>}
               </div>
             </div>

             {/* SUBTAB 1: BUSTE PAGA */}
             {subTabReport === 'paghe' && (
               <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 space-y-4">
                 <div className="border-b border-slate-100 pb-3">
                   <h3 className="font-bold text-slate-900 text-base">💶 Prospetto Ore Dipendenti ({filtroMeseReport})</h3>
                 </div>
                 <div className="overflow-x-auto">
                   <table className="w-full text-left text-xs border-collapse">
                     <thead>
                       <tr className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                         <th className="py-3 px-3">Dipendente</th>
                         <th className="py-3 px-3 text-center">Cantiere</th>
                         <th className="py-3 px-3 text-center">Backoffice</th>
                         <th className="py-3 px-3 text-center">Trasferta</th>
                         <th className="py-3 px-3 text-center text-amber-900 bg-amber-50/50">⚡ Straordinari</th>
                         <th className="py-3 px-3 text-center text-amber-700">Ferie</th>
                         <th className="py-3 px-3 text-center text-indigo-700">Permessi</th>
                         <th className="py-3 px-3 text-center text-rose-700">Malattia</th>
                         <th className="py-3 px-3 text-center font-black">Totale Impegnate</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 font-medium">
                       {listaDipendenti.map(nomeDip => {
                         const eventi = safeStorico.filter(item => item && getNormalizedDate(item.data).startsWith(filtroMeseReport) && matchNomeDipendente(item.dipendente, nomeDip) && item.stato === 'consuntivo');
                         const oreCantiere = eventi.filter(i => !isAssenza(i)).reduce((a, b) => a + Number(b.ore || 0), 0);
                         const oreBackoffice = eventi.filter(i => !isAssenza(i)).reduce((a, b) => a + Number(b.ore_backoffice || 0), 0);
                         const oreTrasferta = eventi.filter(i => !isAssenza(i)).reduce((a, b) => a + Number(b.ore_trasferta || 0), 0);
                         const oreStraordinario = eventi.filter(i => !isAssenza(i)).reduce((a, b) => a + Number(b.ore_straordinario || 0), 0);
                         const oreFerie = eventi.filter(i => isFerie(i)).reduce((a, b) => a + Number(b.ore || 0), 0);
                         const orePermesso = eventi.filter(i => isPermesso(i)).reduce((a, b) => a + Number(b.ore || 0), 0);
                         const oreMalattia = eventi.filter(i => isMalattia(i)).reduce((a, b) => a + Number(b.ore || 0), 0);
                         const tot = oreCantiere + oreBackoffice + oreStraordinario + oreFerie + orePermesso + oreMalattia;

                         return (
                           <tr key={nomeDip} className="hover:bg-slate-50 cursor-pointer" onClick={() => { navigateTo('programmati'); toggleCartella(nomeDip); }}>
                             <td className="py-3 px-3 font-bold text-slate-900">{nomeDip}</td>
                             <td className="py-3 px-3 text-center font-bold">{oreCantiere} h</td>
                             <td className="py-3 px-3 text-center font-bold text-sky-700">{oreBackoffice} h</td>
                             <td className="py-3 px-3 text-center font-bold text-purple-700">{oreTrasferta} h</td>
                             <td className="py-3 px-3 text-center font-extrabold text-amber-900 bg-amber-50/50">{oreStraordinario} h</td>
                             <td className="py-3 px-3 text-center font-bold text-amber-700">{oreFerie} h</td>
                             <td className="py-3 px-3 text-center font-bold text-indigo-700">{orePermesso} h</td>
                             <td className="py-3 px-3 text-center font-bold text-rose-700">{oreMalattia} h</td>
                             <td className="py-3 px-3 text-center font-black bg-slate-50 text-slate-900">{tot} h</td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                 </div>
               </div>
             )}

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
                         <th className="py-3 px-3 text-center text-amber-900 bg-amber-50/50">Straordinari</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 font-medium">
                       {[...safeStorico]
                         .filter(item => item && getNormalizedDate(item.data).startsWith(filtroMeseReport) && (filtroClienteFatturazione === 'Tutti' || item.cliente === filtroClienteFatturazione) && item.stato === 'consuntivo' && !isAssenza(item))
                         .sort((a, b) => new Date(getNormalizedDate(b.data)) - new Date(getNormalizedDate(a.data)))
                         .map((item, idx) => (
                           <tr key={item.id || idx} onClick={() => openEditModal(item)} className="hover:bg-sky-50/80 cursor-pointer transition-colors">
                             <td className="py-2.5 px-3 text-slate-500 font-bold">{getNormalizedDate(item.data)}</td>
                             <td className="py-2.5 px-3 font-bold text-slate-900">{toText(item.cliente)}</td>
                             <td className="py-2.5 px-3 text-slate-700">{toText(item.progetto)}</td>
                             <td className="py-2.5 px-3 font-semibold text-slate-800">{toText(item.dipendente)}</td>
                             <td className="py-2.5 px-3 text-center font-bold text-slate-900">{item.ore || 0} h</td>
                             <td className="py-2.5 px-3 text-center font-bold text-sky-700">{item.ore_backoffice || 0} h</td>
                             <td className="py-2.5 px-3 text-center font-extrabold text-amber-900 bg-amber-50/50">{item.ore_straordinario || 0} h</td>
                           </tr>
                         ))}
                     </tbody>
                   </table>
                 </div>
               </div>
             )}

             {/* SUBTAB 3: ARCHIVIO FERIE */}
             {subTabReport === 'ferie' && (
               <div className="bg-white rounded-3xl shadow-xs border border-slate-200/80 p-6 space-y-6">
                 <div className="border-b border-slate-100 pb-3">
                   <h3 className="font-bold text-slate-900 text-base">🏖️ Archivio Ferie &amp; Permessi</h3>
                 </div>
                 <div className="space-y-5">
                   {listaDipendenti.map(nomeDip => {
                     const inApprovazione = safeStorico.filter(e => e && matchNomeDipendente(e.dipendente, nomeDip) && isAssenza(e) && e.stato === 'in_approvazione');
                     const approvate = safeStorico.filter(e => e && matchNomeDipendente(e.dipendente, nomeDip) && isAssenza(e) && e.stato !== 'in_approvazione' && e.stato !== 'annullato' && getNormalizedDate(e.data).startsWith(filtroMeseReport));

                     if (inApprovazione.length === 0 && approvate.length === 0) return null;

                     return (
                       <div key={nomeDip} className="border border-slate-200 rounded-2xl overflow-hidden">
                         <div className="bg-slate-50 p-3.5 border-b border-slate-200 flex justify-between items-center">
                           <span className="font-bold text-slate-800 text-sm">👤 {nomeDip}</span>
                         </div>
                         <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                             <h4 className="text-xs font-black text-amber-700 uppercase">⏳ In Approvazione Admin</h4>
                             {inApprovazione.map((item, idx) => (
                               <div key={item.id || idx} onClick={() => openEditModal(item)} className="p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer">
                                 <div className="text-xs font-bold text-amber-900">{getNormalizedDate(item.data)} - {toText(item.progetto)} ({item.ore}h)</div>
                                 {currentUser?.ruolo === 'admin' ? (
                                   <div className="flex space-x-2 mt-2" onClick={e => e.stopPropagation()}>
                                     <button onClick={() => handleApprovaAssenza(item)} className="flex-1 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-lg cursor-pointer hover:bg-emerald-600">✅ Approva</button>
                                     <button onClick={() => handleRifiutaAssenza(item)} className="flex-1 py-1 bg-rose-500 text-white text-[10px] font-bold rounded-lg cursor-pointer hover:bg-rose-600">❌ Rifiuta</button>
                                   </div>
                                 ) : (
                                   <p className="text-[10px] text-amber-800 font-bold mt-1">In attesa di validazione</p>
                                 )}
                               </div>
                             ))}
                             {inApprovazione.length === 0 && <p className="text-xs text-slate-400">Nessuna richiesta in sospeso.</p>}
                           </div>
                           <div className="space-y-2">
                             <h4 className="text-xs font-black text-emerald-700 uppercase">✅ Approvate ({filtroMeseReport})</h4>
                             {approvate.map((item, idx) => (
                               <div key={item.id || idx} onClick={() => openEditModal(item)} className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl cursor-pointer">
                                 <span className="text-xs font-bold text-emerald-900">{getNormalizedDate(item.data)} - {toText(item.progetto)} ({item.ore}h)</span>
                               </div>
                             ))}
                             {approvate.length === 0 && <p className="text-xs text-slate-400">Nessuna assenza per questo mese.</p>}
                           </div>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}
           </div>
        )}

      </main>

      {/* MODALE NUOVO APPUNTO RAPIDO */}
      {modalNuovaNota && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">📓 Nuovo Appunto / PDM</h3>
              <button onClick={() => setModalNuovaNota(false)} className="text-slate-400 hover:bg-slate-100 w-8 h-8 rounded-full font-black text-base flex items-center justify-center transition-colors cursor-pointer">✕</button>
            </div>
            
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Cliente *</label>
                <select value={appuntiClienteSel} onChange={e => setAppuntiClienteSel(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-sky-500">
                  {listaClientiCompleta.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Progetto / Commessa *</label>
                <input type="text" placeholder="Es. Collaudo Impianto X" value={appuntiProgettoSel} onChange={e=>setAppuntiProgettoSel(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-sky-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Testo dell'Appunto *</label>
                <textarea rows={4} placeholder="Scrivi qui i dettagli tecnici o gli appunti..." value={nuovoAppuntoTesto} onChange={e=>setNuovoAppuntoTesto(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-sky-500"></textarea>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setModalNuovaNota(false)} className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl cursor-pointer">Annulla</button>
              <button onClick={handleSalvaAppunto} disabled={loading} className="w-2/3 py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-md cursor-pointer">{loading ? '...' : 'Salva Appunto 🚀'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE ANTEPRIMA DOCUMENTI */}
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
                  <div className="truncate"><h3 className="font-bold text-sm md:text-base truncate">{toText(modalDocumento.nome)}</h3></div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <a href={`${origin}/api/download?path=${encodeURIComponent(path)}&forceDownload=true`} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs">📥 Scarica</a>
                  <button onClick={() => setModalDocumento(null)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer">✕</button>
                </div>
              </div>
              <div className="flex-1 bg-slate-200/50 p-2 overflow-hidden flex items-center justify-center relative">
                {isImage ? <img src={rawFileUrl} alt="Anteprima" className="max-h-full max-w-full object-contain rounded-xl shadow-md" /> : <iframe src={isOffice ? googleViewerUrl : rawFileUrl} className="w-full h-full rounded-2xl border bg-white" title="Anteprima" />}
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODALE NUOVO/MODIFICA CLIENTE */}
      {modalCliente && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">{modalCliente.id ? 'Modifica Cliente' : 'Nuovo Cliente'}</h3>
              <button onClick={() => setModalCliente(null)} className="text-slate-400 hover:bg-slate-100 w-8 h-8 rounded-full font-black text-base flex items-center justify-center transition-colors cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSalvaCliente} className="space-y-4 pt-2">
              <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Ragione Sociale *</label><input type="text" required value={modalCliente.ragione_sociale} onChange={e=>setModalCliente({...modalCliente, ragione_sociale: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-sky-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">P.IVA / Cod. Fisc.</label><input type="text" value={modalCliente.partita_iva || modalCliente.piva || ''} onChange={e=>setModalCliente({...modalCliente, partita_iva: e.target.value, piva: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none" /></div>
                <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Telefono</label><input type="text" value={modalCliente.telefono || ''} onChange={e=>setModalCliente({...modalCliente, telefono: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Email</label><input type="email" value={modalCliente.email || ''} onChange={e=>setModalCliente({...modalCliente, email: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Indirizzo Sede</label><input type="text" value={modalCliente.indirizzo || ''} onChange={e=>setModalCliente({...modalCliente, indirizzo: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-sm outline-none" /></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide">Note Anagrafiche</label><textarea rows={2} value={modalCliente.note || ''} onChange={e=>setModalCliente({...modalCliente, note: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl text-xs font-medium outline-none"></textarea></div>
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalCliente(null)} className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors cursor-pointer">Annulla</button>
                <button type="submit" disabled={loading} className="w-2/3 py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer">{loading ? '...' : 'Salva Cliente ✅'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            
            <div className="flex gap-3 pt-4 border-t border-slate-100">
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
    </div>
  );
}

export default function App() { return <ErrorBoundary><HomeContent /></ErrorBoundary>; }
