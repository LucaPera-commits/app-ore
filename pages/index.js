import React, { useState, useEffect, Component, useMemo } from 'react';
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
            <h2 className="text-2xl font-black text-rose-600">Si è verificato un errore nell'interfaccia</h2>
            <div className="bg-slate-900 text-left p-4 rounded-xl overflow-x-auto">
              <p className="text-rose-400 font-mono text-sm font-bold">{this.state.error && this.state.error.toString()}</p>
              <pre className="text-slate-400 font-mono text-[10px] mt-2 whitespace-pre-wrap">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </div>
            <button onClick={() => window.location.reload()} className="px-6 py-3 bg-sky-600 text-white font-bold rounded-xl shadow-md cursor-pointer hover:bg-sky-500 transition-colors">🔄 Ricarica l'App</button>
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
  const [modalCommessa, setModalCommessa] = useState(null);

  // APPUNTI / PDM
  const [dbAppunti, setDbAppunti] = useState([]);
  const [loadingAppunti, setLoadingAppunti] = useState(false);
  const [appuntiClienteSel, setAppuntiClienteSel] = useState('');
  const [appuntiProgettoSel, setAppuntiProgettoSel] = useState('');
  const [nuovoAppuntoTesto, setNuovoAppuntoTesto] = useState('');
  const [ricercaAppunti, setSearchAppunti] = useState('');
  const [modalNuovaNota, setModalNuovaNota] = useState(false);

  // FORM INSERIMENTO
  const [categoriaForm, setCategoriaForm] = useState('lavoro');
  const [formData, setFormData] = useState({
    dipendente: 'Da Assegnare', cliente: '', progetto: '', data: getTodayStr(), data_fine: getTodayStr(),
    usaIntervallo: false, ore: 8, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0, note: '', stato: 'pianificato'
  });

  // PLANNER
  const [plannerWeekStart, setPlannerWeekStart] = useState(getMondayOfCurrentWeek());
  const [plannerEspansi, setPlannerEspansi] = useState(() => {
    const init = { 'Da Assegnare': true };
    Object.values(UTENTI).forEach(u => init[u.nome] = true);
    return init;
  });

  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  const [storicoCompleto, setStoricoCompleto] = useState([]);
  const [loadingProgrammati, setLoadingProgrammati] = useState(false);

  // FEEDBACK
  const [feedbackList, setFeedbackList] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [filtroArchivioAdmin, setFiltroArchivioAdmin] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ categoria: '💡 Nuova Funzionalità', valutazione: 5, messaggio: '' });
  const [feedbackStatus, setFeedbackStatus] = useState(null);

  // CARTELLE ATTIVITÀ
  const [cartelleAperte, setCartelleAperte] = useState({ 'Da Assegnare': true });
  const [sottoCartelleAperte, setSottoCartelleAperte] = useState({});
  const toggleCartella = (nome) => setCartelleAperte(prev => ({ ...prev, [nome]: !prev[nome] }));
  const toggleSottoCartella = (key) => setSottoCartelleAperte(prev => ({ ...prev, [key]: !prev[key] }));

  // NEXTCLOUD / ARUBA
  const [searchQueryNC, setSearchQueryNC] = useState('');
  const [risultatiNC, setRisultatiNC] = useState([]);
  const [loadingNC, setLoadingNC] = useState(false);
  const [errorNC, setErrorNC] = useState(null);

  // MODALI ED EDITING
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
    setIsMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const randIndex = Math.floor(Math.random() * AFORISMI.length);
    setAforismaGiorno(AFORISMI[randIndex]);

    try { const saved = localStorage.getItem('bw_user'); if (saved) setCurrentUser(JSON.parse(saved)); } catch (e) {}
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentUser && isMounted) {
      fetchClienti();
      fetchCommesse();
      fetchAppunti();
      fetchProgrammati();
      fetchFeedback();
    }
  }, [currentUser, activeTab, isMounted]);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({ ...prev, dipendente: currentUser.ruolo === 'admin' ? 'Da Assegnare' : currentUser.nome }));
    }
  }, [currentUser]);

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

  const handleLogin = (e) => {
    e.preventDefault(); const user = UTENTI[loginForm.username.toLowerCase().trim()];
    if (user && user.pass === loginForm.password) { setCurrentUser(user); localStorage.setItem('bw_user', JSON.stringify(user)); setFormData(prev => ({ ...prev, dipendente: user.ruolo === 'admin' ? 'Da Assegnare' : user.nome })); navigateTo('home'); } 
    else { setStatusMessage({ type: 'error', text: 'Credenziali non valide.' }); }
  };

  const handleLogout = () => { setCurrentUser(null); localStorage.removeItem('bw_user'); setLoginForm({ username: '', password: '' }); setShowPassword(false); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setStatusMessage(null);
    if (!formData.cliente || !formData.cliente.trim()) { setStatusMessage({ type: 'error', text: '⚠️ Errore: Inserisci il Cliente!' }); return; }
    if (!formData.progetto || !formData.progetto.trim()) { setStatusMessage({ type: 'error', text: '⚠️ Errore: Inserisci il Progetto/Dettaglio!' }); return; }

    const totOreForm = Number(formData.ore || 0) + Number(formData.ore_backoffice || 0) + Number(formData.ore_straordinario || 0);
    if (totOreForm <= 0) { setStatusMessage({ type: 'error', text: '⚠️ Inserisci almeno 0.5 ore.' }); return; }

    const primoGiornoMeseCorrente = getFirstDayOfCurrentMonthStr();
    if (currentUser?.ruolo !== 'admin' && formData.data < primoGiornoMeseCorrente) { setStatusMessage({ type: 'error', text: '🔒 Mese Passato Consolidato: Impossibile inserire o modificare i mesi scorsi.' }); return; }

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
      if (eRichiestaAssenza && currentUser?.ruolo !== 'admin') { statoDaImpostare = 'in_approvazione'; }

      let salvatiOk = 0;
      for (const d of dateDaSalvare) {
        const payload = { ...formData, data: d, stato: statoDaImpostare, ore_straordinario: formData.stato === 'consuntivo' ? (formData.ore_straordinario || 0) : 0 };
        const res = await fetch('/api/salva', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) salvatiOk++;
      }

      if (salvatiOk > 0) {
        const msgOk = statoDaImpostare === 'in_approvazione' ? `Richiesta assenza inviata all'amministratore per ${salvatiOk} giornate!` : `Registrazione effettuata con successo!`;
        setStatusMessage({ type: 'success', text: msgOk });
        handleResetForm();
        fetchProgrammati();
      } else { setStatusMessage({ type: 'error', text: 'Errore durante il salvataggio.' }); }
    } catch (err) { setStatusMessage({ type: 'error', text: 'Errore di connessione di rete.' }); } finally { setLoading(false); }
  };

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

  const handleSalvaCliente = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch('/api/clienti', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(modalCliente) });
      if (res.ok) { setModalCliente(null); fetchClienti(); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSalvaCommessa = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch('/api/commesse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(modalCommessa) });
      if (res.ok) { setModalCommessa(null); fetchCommesse(); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSalvaAppunto = async () => {
    if (!appuntiClienteSel || !appuntiProgettoSel || !nuovoAppuntoTesto.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/appunti', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cliente: appuntiClienteSel, progetto: appuntiProgettoSel, testo: nuovoAppuntoTesto, autore: currentUser?.nome }) });
      if (res.ok) { setNuovoAppuntoTesto(''); setModalNuovaNota(false); fetchAppunti(); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleInviaFeedback = async (e) => {
    e.preventDefault(); if (!feedbackForm.messaggio.trim()) return; setLoading(true); setFeedbackStatus(null);
    try {
      const res = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ autore: currentUser.nome, categoria: feedbackForm.categoria, valutazione: feedbackForm.valutazione, messaggio: feedbackForm.messaggio.trim() }) });
      if (res.ok) { setFeedbackStatus({ type: 'success', text: 'Suggerimento inviato!' }); setFeedbackForm({ categoria: '💡 Nuova Funzionalità', valutazione: 5, messaggio: '' }); fetchFeedback(); }
    } catch (e) { setFeedbackStatus({ type: 'error', text: 'Errore invio.' }); } finally { setLoading(false); }
  };

  const openEditModal = (item) => {
    if (!item || !canEditItem(item)) return;
    setModalItem(item);
    setOreEffettive(item.ore || 0); setOreBackofficeEffettive(item.ore_backoffice || 0); setOreTrasfertaEffettive(item.ore_trasferta || 0); setOreStraordinarioEffettive(item.ore_straordinario || 0);
    setDipendenteEffettivo(isItemDaAssegnare(item) ? (currentUser?.ruolo === 'admin' ? 'Da Assegnare' : currentUser?.nome) : item.dipendente);
    setClienteEffettivo(item.cliente || ''); setProgettoEffettivo(item.progetto || ''); setNoteEffettive(item.note || '');
  };

  const exportCSVPaghe = () => {
    let csv = "Dipendente;Mese;Ore Cantiere;Ore Backoffice;Ore Trasferta;Ore Straordinario;Ore Ferie;Ore Permessi/ROL;Ore Malattia;Totale Ore\n";
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

  const toggleSelection = (item) => {
    if (!canEditItem(item)) return;
    setSelectedItems(prev => { if (prev.some(i => i.id === item.id)) return prev.filter(i => i.id !== item.id); return [...prev, item]; });
  };

  const handleSelectAll = (itemsToSelect) => {
    const editableItems = itemsToSelect.filter(item => canEditItem(item));
    if (editableItems.length === 0) return;
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
    setConfirmModal({
      title: 'Conferma Eliminazione Multipla',
      message: `Vuoi davvero eliminare definitivamente ${selectedItems.length} attività selezionate?`,
      onConfirm: async () => {
        setConfirmModal(null);
        setLoading(true);
        try {
          const res = await fetch('/api/gestisci', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: selectedItems.map(i => ({ id: i.id, calendar_event_id: i.calendar_event_id })) }) });
          if (res.ok) { setSelectedItems([]); fetchProgrammati(); }
        } catch (e) { console.error(e); } finally { setLoading(false); }
      }
    });
  };

  const isAlessandro = formData.dipendente === 'Alessandro Ciule';
  const todayStr = getTodayStr();
  const daAssegnareItems = safeStorico.filter(isItemDaAssegnare);
  const giorniMancantiUtente = currentUser?.nome ? getGiorniLavorativiMancanti(safeStorico, currentUser.nome) : [];
  const assenzeDaApprovareAdmin = safeStorico.filter(s => s && s.stato === 'in_approvazione');
  const mieAttivitaArretrato = safeStorico.filter(s => s && currentUser?.nome && matchNomeDipendente(s.dipendente, currentUser.nome) && s.stato !== 'consuntivo' && s.stato !== 'annullato' && getNormalizedDate(s.data) <= todayStr);
  const mieAttivitaProssime = safeStorico.filter(s => s && currentUser?.nome && matchNomeDipendente(s.dipendente, currentUser.nome) && s.stato !== 'consuntivo' && s.stato !== 'annullato' && getNormalizedDate(s.data) > todayStr);
  const giorniSettimanaPlanner = get7DaysOfWeek(plannerWeekStart);

  if (!isMounted) return null;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <Head>
          <title>BW Solutions | ERP Enterprise</title>
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
      </Head>
      <datalist id="lista-aziende">{listaClientiCompleta.map((azienda, index) => <option key={index} value={azienda} />)}</datalist>

      {/* SIDEBAR NAVIGATION */}
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
              {(mostraDaAssegnare && daAssegnareItems.length > 0) && <span className="bg-amber-500 text-white font-black px-2 py-0.5 rounded-full text-[10px]">{daAssegnareItems.length}</span>}
            </button>
            <button onClick={() => navigateTo('commesse')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'commesse' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📐 Commesse &amp; Budget</button>
            <button onClick={() => navigateTo('anagrafiche')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'anagrafiche' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>🏢 Anagrafiche</button>
            <button onClick={() => navigateTo('appunti')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'appunti' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📓 Appunti/PDM</button>
            <button onClick={() => navigateTo('documenti', pathNC)} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'documenti' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📂 Cloud Aruba</button>
            <button onClick={() => navigateTo('feedback')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'feedback' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>💡 Feedback</button>
            {currentUser?.ruolo === 'admin' && (
              <button onClick={() => navigateTo('cruscotto')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'cruscotto' ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📊 Reportistica</button>
            )}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="px-3 py-2 bg-slate-800/80 rounded-xl text-[10px] font-bold flex items-center justify-between border border-slate-700">
            <span className="text-slate-400">Diagnostica App:</span>
            <span className={diagnosticaStato.ok ? "text-emerald-400" : "text-amber-400"}>{diagnosticaStato.ok ? "🟢 Sistema OK" : "⚠️ Check"}</span>
          </div>
          <div className="hidden md:flex bg-slate-800 p-3 rounded-2xl items-center justify-between">
            <span className="text-white font-bold text-xs truncate">{currentUser?.nome}</span>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer">🚪</button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-6xl mx-auto space-y-6 relative">

        {/* TAB HOME */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-xs border border-slate-200">
              <h1 className="text-3xl font-black text-slate-900">Ciao, {currentUser?.nome.split(' ')[0]} 👋</h1>
              <p className="text-slate-500 text-sm mt-1">Pannello di controllo enterprise BW Solutions ERP.</p>
              <div className="mt-4 p-4 bg-sky-50 border border-sky-100 rounded-2xl text-xs font-semibold text-sky-900 italic">
                {aforismaGiorno}
              </div>
            </div>

            {giorniMancantiUtente.length > 0 && (
              <div className="bg-rose-50 p-5 rounded-2xl border border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚨</span>
                  <div>
                    <h4 className="font-bold text-rose-900 text-sm">Hai delle giornate scoperte!</h4>
                    <p className="text-xs text-rose-700">Mancano le ore per {giorniMancantiUtente.length} giorni lavorativi ({giorniMancantiUtente.slice(0,3).join(', ')}...)</p>
                  </div>
                </div>
                <button onClick={() => navigateTo('nuovo')} className="bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs hover:bg-rose-500 cursor-pointer">Compila Subito</button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-slate-800 text-base">📊 Riepilogo Personale</h3>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl text-xs font-semibold">
                  <span>In Programma (Tu)</span>
                  <span className="font-bold text-sky-600 bg-sky-100 px-2 py-0.5 rounded-lg">{mieAttivitaProssime.length}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl text-xs font-semibold">
                  <span>Arretrato da consuntivare</span>
                  <span className="font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-lg">{mieAttivitaArretrato.length}</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-bold text-base flex items-center gap-2"><span>🤖</span> BW Assistente AI</h3>
                  <p className="text-xs text-slate-300">Interfaccia intelligente per risposte rapide su cantieri e commesse.</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <input type="text" value={aiInput} onChange={e=>setAiInput(e.target.value)} placeholder="Fai una domanda..." className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                  <button onClick={() => { if(!aiInput.trim()) return; setAiMessages([...aiMessages, {role: 'user', text: aiInput}, {role: 'ai', text: 'Assistente AI attivo. In futuro potrò estrarre dati storici automaticamente.'}]); setAiInput(''); }} className="bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer">Invia</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB PLANNER */}
        {activeTab === 'planner' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">📅 Planner Operativo Settimanale</h2>
                <p className="text-xs text-slate-500 mt-1">Sfoglia e assegna le attività del team giorno per giorno.</p>
              </div>
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                <button onClick={() => { const curr = new Date(plannerWeekStart); curr.setDate(curr.getDate() - 7); setPlannerWeekStart(getMondayOfCurrentWeek(curr)); }} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white rounded-lg cursor-pointer">◀ Prec</button>
                <button onClick={() => setPlannerWeekStart(getMondayOfCurrentWeek())} className="px-3 py-1.5 text-xs font-bold bg-sky-500 text-white rounded-lg cursor-pointer">Oggi</button>
                <button onClick={() => { const curr = new Date(plannerWeekStart); curr.setDate(curr.getDate() + 7); setPlannerWeekStart(getMondayOfCurrentWeek(curr)); }} className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-white rounded-lg cursor-pointer">Succ ▶</button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200">
                    <th className="p-3 min-w-[150px] border-r border-slate-200">Risorsa</th>
                    {giorniSettimanaPlanner.map(gStr => (
                      <th key={gStr} className="p-3 text-center min-w-[120px] border-r border-slate-100">
                        <div>{new Date(gStr).toLocaleDateString('it-IT', { weekday: 'short' })}</div>
                        <div className="text-[10px] text-slate-400">{gStr}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dipendentiVisibili.map(nomeDip => (
                    <tr key={nomeDip} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900 border-r border-slate-100">{nomeDip}</td>
                      {giorniSettimanaPlanner.map(gStr => {
                        const eventi = safeStorico.filter(e => matchNomeDipendente(e.dipendente, nomeDip) && getNormalizedDate(e.data) === gStr);
                        return (
                          <td key={gStr} className="p-2 border-r border-slate-100 vertical-top h-20 text-center">
                            {eventi.map((ev, idx) => (
                              <div key={idx} onClick={() => openEditModal(ev)} className="p-1.5 mb-1 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 text-[10px] font-bold truncate cursor-pointer hover:bg-sky-100">
                                {ev.cliente}
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB INSERISCI ORE */}
        {activeTab === 'nuovo' && (
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200 p-6 space-y-6">
            <h2 className="text-xl font-bold text-slate-900">📝 Nuova Registrazione Attività</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Tipologia</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button type="button" onClick={() => setCategoriaForm('lavoro')} className={`py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer ${categoriaForm === 'lavoro' ? 'bg-sky-600 text-white' : 'bg-slate-50 text-slate-600'}`}>💼 Lavoro</button>
                  <button type="button" onClick={() => setCategoriaForm('ferie')} className={`py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer ${categoriaForm === 'ferie' ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-600'}`}>🏖️ Ferie</button>
                  <button type="button" onClick={() => setCategoriaForm('permesso')} className={`py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer ${categoriaForm === 'permesso' ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-slate-600'}`}>⏱️ Permesso</button>
                  <button type="button" onClick={() => setCategoriaForm('malattia')} className={`py-2.5 px-3 rounded-xl border text-xs font-bold cursor-pointer ${categoriaForm === 'malattia' ? 'bg-rose-500 text-white' : 'bg-slate-50 text-slate-600'}`}>🏥 Malattia</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tecnico</label>
                  {currentUser?.ruolo === 'admin' ? (
                    <select value={formData.dipendente} onChange={e => setFormData({ ...formData, dipendente: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none">
                      <option value="Da Assegnare">❓ Da Assegnare</option>
                      {listaDipendenti.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  ) : <input type="text" readOnly value={formData.dipendente} className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600" />}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Data</label>
                  <input type="date" required value={formData.data} onChange={e => setFormData({ ...formData, data: e.target.value, data_fine: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Cliente *</label>
                  <input type="text" list="lista-aziende" required value={formData.cliente} onChange={e => setFormData({ ...formData, cliente: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Progetto / Dettaglio *</label>
                  <input type="text" required value={formData.progetto} onChange={e => setFormData({ ...formData, progetto: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Ore Cantiere</label><input type="number" step="0.5" value={formData.ore} onChange={e => setFormData({ ...formData, ore: parseFloat(e.target.value) })} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold" /></div>
                <div><label className="block text-xs font-bold text-sky-600 mb-1">Backoffice</label><input type="number" step="0.5" value={formData.ore_backoffice} onChange={e => setFormData({ ...formData, ore_backoffice: parseFloat(e.target.value) })} className="w-full p-3 border border-sky-200 bg-sky-50 rounded-xl text-sm font-bold" /></div>
                {isAlessandro && <div><label className="block text-xs font-bold text-purple-600 mb-1">Trasferta</label><input type="number" step="0.5" value={formData.ore_trasferta} onChange={e => setFormData({ ...formData, ore_trasferta: parseFloat(e.target.value) })} className="w-full p-3 border border-purple-200 bg-purple-50 rounded-xl text-sm font-bold" /></div>}
                <div><label className="block text-xs font-bold text-amber-600 mb-1">Straordinario</label><input type="number" step="0.5" value={formData.ore_straordinario} onChange={e => setFormData({ ...formData, ore_straordinario: parseFloat(e.target.value) })} className="w-full p-3 border border-amber-200 bg-amber-50 rounded-xl text-sm font-bold" /></div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Note</label>
                <textarea rows={2} value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none"></textarea>
              </div>

              {statusMessage && <div className={`p-4 rounded-xl text-xs font-bold ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>{statusMessage.text}</div>}

              <div className="flex gap-3">
                <button type="button" onClick={handleResetForm} className="w-1/3 py-3 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 cursor-pointer">🧹 Svuota Form</button>
                <button type="submit" disabled={loading} className="w-2/3 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-md cursor-pointer hover:bg-slate-800">{loading ? 'Salvataggio...' : 'Salva Registrazione 🚀'}</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'programmati' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">⏳ Repository Attività &amp; Interventi</h2>
                <p className="text-xs text-slate-500 mt-1">Sfoglia il registro attività diviso per cartelle collaboratore.</p>
              </div>
              <button onClick={fetchProgrammati} className="bg-sky-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow cursor-pointer hover:bg-sky-500">🔄 Aggiorna Dati</button>
            </div>

            {/* CARTELLA DA ASSEGNARE */}
            {mostraDaAssegnare && daAssegnareItems.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 space-y-3">
                <div className="flex justify-between items-center font-bold text-amber-900 text-sm">
                  <span>❓ Attività In Attesa di Assegnazione ({daAssegnareItems.length})</span>
                </div>
                <div className="space-y-2">
                  {daAssegnareItems.map(item => (
                    <div key={item.id} onClick={() => openEditModal(item)} className="p-3 bg-white rounded-xl border border-amber-200 flex justify-between items-center cursor-pointer hover:border-amber-400">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{item.cliente} - {item.progetto}</div>
                        <div className="text-[10px] text-slate-500">{getNormalizedDate(item.data)} ({item.ore}h)</div>
                      </div>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">Assegna ➔</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CARTELLE DIPENDENTI */}
            <div className="space-y-4">
              {dipendentiVisibili.map(nomeDip => {
                const attivitaDip = safeStorico.filter(e => matchNomeDipendente(e.dipendente, nomeDip));
                const isAperta = !!cartelleAperte[nomeDip];
                return (
                  <div key={nomeDip} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                    <div onClick={() => toggleCartella(nomeDip)} className="p-5 bg-slate-50 hover:bg-slate-100 flex justify-between items-center cursor-pointer select-none">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{isAperta ? '📂' : '📁'}</span>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{nomeDip}</h3>
                          <span className="text-[10px] text-slate-500">{attivitaDip.length} attività registrate</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-400">{isAperta ? '▲' : '▼'}</span>
                    </div>

                    {isAperta && (
                      <div className="p-4 divide-y divide-slate-100 space-y-2">
                        {attivitaDip.map(item => (
                          <div key={item.id} onClick={() => openEditModal(item)} className="pt-2 flex justify-between items-center cursor-pointer hover:bg-slate-50 p-2 rounded-xl">
                            <div>
                              <div className="font-bold text-xs text-slate-900">{item.cliente}</div>
                              <div className="text-[11px] text-slate-500">{item.progetto} ({getNormalizedDate(item.data)})</div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.stato === 'consuntivo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {item.stato === 'consuntivo' ? 'Consuntivato' : 'In Programma'}
                            </span>
                          </div>
                        ))}
                        {attivitaDip.length === 0 && <p className="text-xs text-slate-400 p-2">Nessuna attività registrata.</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB COMMESSE */}
        {activeTab === 'commesse' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">📐 Commesse &amp; Controllo Budget</h2>
                <p className="text-xs text-slate-500 mt-1">Gestisci i progetti ed imposta i tetti di ore per commessa.</p>
              </div>
              <button onClick={() => setModalCommessa({ codice_commessa: '', titolo: '', budget_ore: 50, stato: 'aperta' })} className="bg-sky-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow cursor-pointer hover:bg-sky-500">+ Nuova Commessa</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dbCommesse.map(com => (
                <div key={com.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{com.codice_commessa}</span>
                      <h3 className="font-bold text-slate-900 text-base mt-1">{com.titolo}</h3>
                    </div>
                    <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-xl">{com.budget_ore || 0} Ore Budget</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full w-1/2"></div>
                  </div>
                </div>
              ))}
              {dbCommesse.length === 0 && <p className="text-xs text-slate-400 p-4">Nessuna commessa registrata.</p>}
            </div>
          </div>
        )}

        {/* TAB ANAGRAFICHE */}
        {activeTab === 'anagrafiche' && (
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">🏢 Anagrafica Clienti</h2>
              <button onClick={() => setModalCliente({ ragione_sociale: '', piva: '', indirizzo: '', email: '', telefono: '', note: '' })} className="bg-sky-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow cursor-pointer hover:bg-sky-500">+ Nuovo Cliente</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200">
                    <th className="p-3">Ragione Sociale</th>
                    <th className="p-3">P.IVA / CF</th>
                    <th className="p-3">Indirizzo</th>
                    <th className="p-3">Contatti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dbClienti.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{c.ragione_sociale}</td>
                      <td className="p-3 text-slate-600">{c.partita_iva || c.piva || '-'}</td>
                      <td className="p-3 text-slate-600">{c.indirizzo || '-'}</td>
                      <td className="p-3 text-slate-600">{c.email} {c.telefono}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB APPUNTI PDM */}
        {activeTab === 'appunti' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">📓 Quaderno Appunti &amp; Revisioni PDM</h2>
              <button onClick={() => setModalNuovaNota(true)} className="bg-sky-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow cursor-pointer hover:bg-sky-500">+ Nuovo Appunto</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dbAppunti.map(app => (
                <div key={app.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                  <span className="text-[10px] font-bold text-sky-600 uppercase block">{app.cliente}</span>
                  <h3 className="font-bold text-slate-900 text-sm">{app.progetto}</h3>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl line-clamp-3">{app.testo}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CLOUD DOCUMENTI */}
        {activeTab === 'documenti' && (
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">📂 Documenti Cloud Aruba / Nextcloud</h2>
            <p className="text-xs text-slate-500">Sfoglia le cartelle remote sincronizzate sul cloud aziendale.</p>
          </div>
        )}

        {/* TAB FEEDBACK */}
        {activeTab === 'feedback' && (
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">💡 Feedback &amp; Suggerimenti App</h2>
            <form onSubmit={handleInviaFeedback} className="space-y-4">
              <textarea rows={3} value={feedbackForm.messaggio} onChange={e => setFeedbackForm({ ...feedbackForm, messaggio: e.target.value })} placeholder="Scrivi un suggerimento..." className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none"></textarea>
              <button type="submit" className="bg-sky-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer">Invia Messaggio</button>
            </form>
          </div>
        )}

        {/* TAB REPORTISTICA */}
        {activeTab === 'cruscotto' && currentUser?.ruolo === 'admin' && (
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">📊 Reportistica Buste Paga &amp; Fatturazione</h2>
              <button onClick={exportCSVPaghe} className="bg-sky-600 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer">📥 Esporta CSV Paghe</button>
            </div>
          </div>
        )}
      </main>

      {/* MODALE DI CONFERMA GENERICO (Sostituto di confirm) */}
      {confirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 text-center">
            <h3 className="text-lg font-bold text-slate-900">{confirmModal.title || 'Conferma Operazione'}</h3>
            <p className="text-xs text-slate-600">{confirmModal.message}</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmModal(null)} className="w-1/2 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">Annulla</button>
              <button onClick={confirmModal.onConfirm} className="w-1/2 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl cursor-pointer">Conferma</button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE CLIENTE */}
      {modalCliente && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">{modalCliente.id ? 'Modifica Cliente' : 'Nuovo Cliente'}</h3>
            <form onSubmit={handleSalvaCliente} className="space-y-3 text-xs">
              <input type="text" placeholder="Ragione Sociale *" required value={modalCliente.ragione_sociale} onChange={e=>setModalCliente({...modalCliente, ragione_sociale: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl outline-none" />
              <input type="text" placeholder="Partita IVA / CF" value={modalCliente.piva || ''} onChange={e=>setModalCliente({...modalCliente, piva: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl outline-none" />
              <input type="text" placeholder="Indirizzo" value={modalCliente.indirizzo || ''} onChange={e=>setModalCliente({...modalCliente, indirizzo: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl outline-none" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setModalCliente(null)} className="w-1/2 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Annulla</button>
                <button type="submit" className="w-1/2 py-3 bg-sky-600 text-white font-bold rounded-xl cursor-pointer">Salva</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE COMMESSA */}
      {modalCommessa && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Nuova Commessa</h3>
            <form onSubmit={handleSalvaCommessa} className="space-y-3 text-xs">
              <input type="text" placeholder="Codice Commessa (es. COM-2026-01)" required value={modalCommessa.codice_commessa} onChange={e=>setModalCommessa({...modalCommessa, codice_commessa: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl outline-none" />
              <input type="text" placeholder="Titolo Commessa *" required value={modalCommessa.titolo} onChange={e=>setModalCommessa({...modalCommessa, titolo: e.target.value})} className="w-full p-3 border border-slate-200 rounded-xl outline-none" />
              <input type="number" placeholder="Budget Ore" value={modalCommessa.budget_ore} onChange={e=>setModalCommessa({...modalCommessa, budget_ore: parseFloat(e.target.value)})} className="w-full p-3 border border-slate-200 rounded-xl outline-none" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setModalCommessa(null)} className="w-1/2 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Annulla</button>
                <button type="submit" className="w-1/2 py-3 bg-sky-600 text-white font-bold rounded-xl cursor-pointer">Salva Commessa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE NUOVO APPUNTO */}
      {modalNuovaNota && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-lg font-bold text-slate-900">Nuovo Appunto PDM</h3>
            <input type="text" list="lista-aziende" placeholder="Cliente *" value={appuntiClienteSel} onChange={e=>setAppuntiClienteSel(e.target.value)} className="w-full p-3 border rounded-xl outline-none" />
            <input type="text" placeholder="Progetto / Titolo *" value={appuntiProgettoSel} onChange={e=>setAppuntiProgettoSel(e.target.value)} className="w-full p-3 border rounded-xl outline-none" />
            <textarea rows={3} placeholder="Testo nota *" value={nuovoAppuntoTesto} onChange={e=>setNuovoAppuntoTesto(e.target.value)} className="w-full p-3 border rounded-xl outline-none"></textarea>
            <div className="flex gap-2">
              <button onClick={() => setModalNuovaNota(false)} className="w-1/2 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Annulla</button>
              <button onClick={handleSalvaAppunto} className="w-1/2 py-3 bg-sky-600 text-white font-bold rounded-xl cursor-pointer">Salva Note</button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE EDIT ATTIVITÀ & RAPPORTINO TRIGGER */}
      {modalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Dettaglio Intervento</h3>
            <div className="space-y-3 text-xs">
              <div><label className="font-bold text-slate-500">Cliente</label><input type="text" value={clienteEffettivo} onChange={e=>setClienteEffettivo(e.target.value)} className="w-full p-3 border rounded-xl outline-none" /></div>
              <div><label className="font-bold text-slate-500">Progetto</label><input type="text" value={progettoEffettivo} onChange={e=>setProgettoEffettivo(e.target.value)} className="w-full p-3 border rounded-xl outline-none" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="font-bold text-slate-500">Ore Cantiere</label><input type="number" step="0.5" value={oreEffettive} onChange={e=>setOreEffettive(parseFloat(e.target.value))} className="w-full p-3 border rounded-xl" /></div>
                <div><label className="font-bold text-sky-600">Ore Backoffice</label><input type="number" step="0.5" value={oreBackofficeEffettive} onChange={e=>setOreBackofficeEffettive(parseFloat(e.target.value))} className="w-full p-3 border border-sky-200 bg-sky-50 rounded-xl" /></div>
              </div>
              <div><label className="font-bold text-slate-500">Note Intervento</label><textarea rows={2} value={noteEffettive} onChange={e=>setNoteEffettive(e.target.value)} className="w-full p-3 border rounded-xl"></textarea></div>
            </div>
            <div className="flex gap-2 flex-wrap pt-2">
              <button onClick={() => { setModalRapportino(modalItem); setModalItem(null); }} className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer">📄 Genera Rapportino PDF</button>
              <button onClick={() => setModalItem(null)} className="w-1/3 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">Chiudi</button>
              <button onClick={handleConfermaChiudi} className="w-2/3 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl cursor-pointer">Salva Modifiche</button>
            </div>
          </div>
        </div>
      )}

      {/* RAPPORTINO STAMPABILE MODALE */}
      {modalRapportino && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 text-slate-900 my-auto">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900">BW SOLUTIONS S.R.L.</h2>
                <span className="text-xs text-slate-500 uppercase font-bold">Rapportino Tecnico di Intervento</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">N. #{modalRapportino.id || '1001'}</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border text-xs space-y-1">
              <div><strong>Cliente:</strong> {toText(modalRapportino.cliente)}</div>
              <div><strong>Commessa:</strong> {toText(modalRapportino.progetto)}</div>
              <div><strong>Tecnico:</strong> {toText(modalRapportino.dipendente)}</div>
              <div><strong>Data:</strong> {getNormalizedDate(modalRapportino.data)}</div>
            </div>
            <div className="border rounded-xl p-4 text-xs font-semibold">
              <strong>Totale Ore Lavorate:</strong> {(Number(modalRapportino.ore || 0) + Number(modalRapportino.ore_backoffice || 0))} h
            </div>
            <div className="flex gap-2 no-print">
              <button onClick={() => setModalRapportino(null)} className="w-1/3 py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">Chiudi</button>
              <button onClick={() => { if(typeof window !== 'undefined') window.print(); }} className="w-2/3 py-3 bg-sky-600 text-white font-bold text-xs rounded-xl cursor-pointer">🖨️ Stampa / Salva in PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() { return <ErrorBoundary><HomeContent /></ErrorBoundary>; }
