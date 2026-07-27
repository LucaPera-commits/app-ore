import React, { useState, useEffect, Component, useMemo, useRef } from 'react';
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

const SAMPLE_COMMESSE = [
  { id: 'c1', codice_commessa: 'COM-2026-01', titolo: 'Revamping Linea Robotizzata', cliente: 'ALSTOM', budget_ore: 120, ore_utilizzate: 84, stato: 'aperta' },
  { id: 'c2', codice_commessa: 'COM-2026-02', titolo: 'Manutenzione Impianti Termici', cliente: 'a2a', budget_ore: 60, ore_utilizzate: 45, stato: 'aperta' },
  { id: 'c3', codice_commessa: 'COM-2026-03', titolo: 'Installazione Quadri PLC', cliente: 'AROL', budget_ore: 80, ore_utilizzate: 82, stato: 'aperta' },
  { id: 'c4', codice_commessa: 'COM-2026-04', titolo: 'Collaudo Struttura Composita', cliente: 'COSPAL COMPOSITES S.P.A', budget_ore: 40, ore_utilizzate: 12, stato: 'aperta' }
];

const SAMPLE_CLIENTI = [
  { id: 'cli1', ragione_sociale: 'ALSTOM', partita_iva: 'IT01234567890', indirizzo: 'Via Ferrovie 12, Bologna', email: 'service@alstom.com', telefono: '+39 051 123456' },
  { id: 'cli2', ragione_sociale: 'a2a', partita_iva: 'IT09876543210', indirizzo: 'Corso Porta Vittoria 4, Milano', email: 'impianti@a2a.it', telefono: '+39 02 88871' },
  { id: 'cli3', ragione_sociale: 'AROL', partita_iva: 'IT04567891234', indirizzo: 'Viale Industria 8, Canelli (AT)', email: 'tech@arol.com', telefono: '+39 0141 820111' },
  { id: 'cli4', ragione_sociale: 'COSPAL COMPOSITES S.P.A', partita_iva: 'IT03322114455', indirizzo: 'Via Compositi 45, Torino', email: 'info@cospal.it', telefono: '+39 011 998877' }
];

const SAMPLE_STORICO = [
  { id: 101, dipendente: 'Giampaolo Lauro', cliente: 'ALSTOM', progetto: 'Revamping Linea Robotizzata', data: '2026-07-20', ore: 8, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 1, note: 'Sostituzione sensori asse X e Y completata con successo.', stato: 'consuntivo' },
  { id: 102, dipendente: 'Federico Boagno', cliente: 'a2a', progetto: 'Manutenzione Impianti Termici', data: '2026-07-21', ore: 7, ore_backoffice: 1, ore_trasferta: 0, ore_straordinario: 0, note: 'Verifica pressione e taratura valvole di sicurezza.', stato: 'consuntivo' },
  { id: 103, dipendente: 'Alessandro Ciule', cliente: 'AROL', progetto: 'Installazione Quadri PLC', data: '2026-07-22', ore: 8, ore_backoffice: 0, ore_trasferta: 2, ore_straordinario: 2, note: 'Cablaggio morsettiere e test di continuità.', stato: 'consuntivo' },
  { id: 104, dipendente: 'Davide Procopio', cliente: 'COSPAL COMPOSITES S.P.A', progetto: 'Collaudo Struttura Composita', data: '2026-07-23', ore: 8, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0, note: 'Ispezione visiva e test ad ultrasuoni.', stato: 'consuntivo' },
  { id: 105, dipendente: 'Giampaolo Lauro', cliente: 'ASSENZE / GIUSTIFICATIVI', progetto: 'Ferie', data: '2026-08-03', ore: 8, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0, note: 'Richiesta ferie estive.', stato: 'in_approvazione' },
  { id: 106, dipendente: 'Da Assegnare', cliente: '3S s.r.l.', progetto: 'Manutenzione Straordinaria Riduttore', data: '2026-07-28', ore: 8, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0, note: 'Intervento programmato da assegnare a un tecnico.', stato: 'pianificato' }
];

const SAMPLE_APPUNTI = [
  { id: 'app1', cliente: 'ALSTOM', progetto: 'Revamping Linea Robotizzata', testo: 'Richiesto schema elettrico aggiornato versione v2.2 dal cliente prima dell\'avvio cantiere.', autore: 'Luca Pera', versione: 1, created_at: '2026-07-15T10:30:00Z' },
  { id: 'app2', cliente: 'AROL', progetto: 'Installazione Quadri PLC', testo: 'Verificare disponibilita moduli I/O aggiuntivi in magazzino.', autore: 'Alessandro Ciule', versione: 2, created_at: '2026-07-18T14:15:00Z' }
];

const AFORISMI = [
  "“L'unico modo di fare un ottimo lavoro è amare quello che fai.” – Steve Jobs",
  "“Nessun grande risultato è mai stato raggiunto senza entusiasmo.” – Ralph Waldo Emerson",
  "“La qualità non è mai un fatto casuale; è sempre il risultato di uno sforzo intelligente.” – John Ruskin",
  "“Non contare i giorni, fai in modo che i giorni contino.” – Muhammad Ali",
  "“Il segreto per andare avanti è iniziare.” – Mark Twain",
  "“L'eccellenza non è un atto, ma un'abitudine.” – Aristotele"
];

function getTodayStr() { return new Date().toISOString().split('T')[0]; }
function getCurrentMonthStr() { return new Date().toISOString().slice(0, 7); }
function getFirstDayOfCurrentMonthStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`; }

function getNormalizedDate(d) {
  if (!d) return getTodayStr();
  if (typeof d !== 'string' && typeof d !== 'number') return getTodayStr();
  return String(d).split('T')[0].split(' ')[0];
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
  
  const [activeTab, setActiveTab] = useState('home');
  const [diagnosticaStato, setDiagnosticaStato] = useState({ ok: true, anomalie: [] });
  const [aforismaGiorno, setAforismaGiorno] = useState('');

  // AI ASSISTANT
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([{ role: 'ai', text: 'Ciao! Sono l\'assistente virtuale BW Solutions. Chiedimi aggiornamenti su commesse, clienti o ore lavorate!' }]);

  // CLIENTS & CONTRACTS
  const [dbClienti, setDbClienti] = useState(SAMPLE_CLIENTI);
  const [modalCliente, setModalCliente] = useState(null);

  const [dbCommesse, setDbCommesse] = useState(SAMPLE_COMMESSE);
  const [modalCommessa, setModalCommessa] = useState(null);

  // NOTES & PDM
  const [dbAppunti, setDbAppunti] = useState(SAMPLE_APPUNTI);
  const [appuntiClienteSel, setAppuntiClienteSel] = useState('');
  const [appuntiProgettoSel, setAppuntiProgettoSel] = useState('');
  const [nuovoAppuntoTesto, setNuovoAppuntoTesto] = useState('');
  const [modalNuovaNota, setModalNuovaNota] = useState(false);

  // CLOUD ARUBA NEXTCLOUD MOCK FILE EXPLORER
  const [cloudFolder, setCloudFolder] = useState('Root');
  const [cloudPathHistory, setCloudPathHistory] = useState(['Root']);

  // RAPPORTINI FILTERS
  const [filtroRapportinoCliente, setFiltroRapportinoCliente] = useState('Tutti');
  const [filtroRapportinoTecnico, setFiltroRapportinoTecnico] = useState('Tutti');
  const [filtroRapportinoMese, setFiltroRapportinoMese] = useState(getCurrentMonthStr());
  const [searchRapportinoText, setSearchRapportinoText] = useState('');

  // FORM INSERIMENTO ORE
  const [categoriaForm, setCategoriaForm] = useState('lavoro');
  const [formData, setFormData] = useState({
    dipendente: 'Da Assegnare', cliente: '', progetto: '', data: getTodayStr(), data_fine: getTodayStr(),
    usaIntervallo: false, ore: 8, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0, note: '', stato: 'consuntivo'
  });

  // PLANNER
  const [plannerWeekStart, setPlannerWeekStart] = useState(getMondayOfCurrentWeek());

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const [storicoCompleto, setStoricoCompleto] = useState(SAMPLE_STORICO);

  // CARTELLE ATTIVITÀ ACCORDION
  const [cartelleAperte, setCartelleAperte] = useState({ 'Da Assegnare': true, 'Luca Pera': true });
  const toggleCartella = (nome) => setCartelleAperte(prev => ({ ...prev, [nome]: !prev[nome] }));

  // MODALS & EDITING
  const [filtroMeseReport, setFiltroMeseReport] = useState(getCurrentMonthStr());
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

  // CANVAS FIRMA DIGITAL TOUCH
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const listaDipendenti = Object.values(UTENTI).map(u => u.nome);
  const safeStorico = Array.isArray(storicoCompleto) ? storicoCompleto : [];

  const listaClientiCompleta = useMemo(() => {
    return Array.from(new Set([...LISTA_CLIENTI_BASE, ...dbClienti.map(c => c.ragione_sociale)])).sort();
  }, [dbClienti]);

  const dipendentiVisibili = currentUser?.ruolo === 'admin' ? listaDipendenti : (currentUser ? [currentUser.nome] : []);
  const mostraDaAssegnare = currentUser?.ruolo === 'admin';

  function canEditItem(item) { if (!currentUser) return false; if (currentUser.ruolo === 'admin') return true; return matchNomeDipendente(item?.dipendente, currentUser.nome); }

  function navigateTo(targetTab) {
    setActiveTab(targetTab);
  }

  const fetchClienti = async () => {
    try {
      const res = await fetch('/api/clienti');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setDbClienti(data);
      }
    } catch (e) { console.log("Uso clienti standard local fallback."); }
  };

  const fetchCommesse = async () => {
    try {
      const res = await fetch('/api/commesse');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setDbCommesse(data);
      }
    } catch (e) { console.log("Uso commesse standard local fallback."); }
  };

  const fetchAppunti = async () => {
    try {
      const res = await fetch('/api/appunti');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const adattati = data.map(a => ({
            ...a,
            cliente: a.cliente_id ? (dbClienti.find(c => c.id === a.cliente_id)?.ragione_sociale || 'Generico') : 'Generico',
            progetto: a.titolo,
            data_ora: a.created_at
          }));
          setDbAppunti(adattati);
        }
      }
    } catch (e) { console.log("Uso appunti standard local fallback."); }
  };

  const fetchProgrammati = async () => {
    try {
      const res = await fetch(`/api/gestisci?mode=all&_t=${Date.now()}`);
      if (res.ok) {
        const dati = await res.json();
        if (Array.isArray(dati) && dati.length > 0) setStoricoCompleto(dati);
      }
    } catch (e) { console.log("Uso storico standard local fallback."); }
  };

  useEffect(() => {
    setIsMounted(true);
    const randIndex = Math.floor(Math.random() * AFORISMI.length);
    setAforismaGiorno(AFORISMI[randIndex]);

    try { const saved = localStorage.getItem('bw_user'); if (saved) setCurrentUser(JSON.parse(saved)); } catch (e) {}
  }, []);

  useEffect(() => {
    if (currentUser && isMounted) {
      fetchClienti();
      fetchCommesse();
      fetchAppunti();
      fetchProgrammati();
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
    e.preventDefault(); 
    const user = UTENTI[loginForm.username.toLowerCase().trim()];
    if (user && user.pass === loginForm.password) { 
      setCurrentUser(user); 
      localStorage.setItem('bw_user', JSON.stringify(user)); 
      setFormData(prev => ({ ...prev, dipendente: user.ruolo === 'admin' ? 'Da Assegnare' : user.nome })); 
      navigateTo('home'); 
    } else { 
      setStatusMessage({ type: 'error', text: 'Credenziali non valide. Prova luca / !luca123?' }); 
    }
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
      const testoProgetto = (formData.progetto || '').toLowerCase(); 
      const testoCliente = (formData.cliente || '').toLowerCase();
      const eRichiestaAssenza = categoriaForm === 'ferie' || categoriaForm === 'permesso' || testoProgetto.includes('ferie') || testoProgetto.includes('permesso') || testoProgetto.includes('rol') || testoCliente.includes('assenze');

      let statoDaImpostare = formData.stato;
      if (eRichiestaAssenza && currentUser?.ruolo !== 'admin') { statoDaImpostare = 'in_approvazione'; }

      const nuovoIntervento = {
        id: Date.now(),
        ...formData,
        stato: statoDaImpostare
      };

      setStoricoCompleto(prev => [nuovoIntervento, ...prev]);

      // Try API sync if available
      fetch('/api/salva', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuovoIntervento) }).catch(() => {});

      const msgOk = statoDaImpostare === 'in_approvazione' ? `Richiesta assenza inviata per approvazione!` : `Registrazione effettuata con successo!`;
      setStatusMessage({ type: 'success', text: msgOk });
      handleResetForm();
    } catch (err) { setStatusMessage({ type: 'error', text: 'Errore durante la registrazione.' }); } 
    finally { setLoading(false); }
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
    const aggiornato = {
      ...modalItem,
      cliente: clienteEffettivo.trim(),
      progetto: progettoEffettivo.trim(),
      note: noteEffettive.trim(),
      ore: oreEffettive,
      ore_backoffice: oreBackofficeEffettive,
      ore_trasferta: oreTrasfertaEffettive,
      ore_straordinario: oreStraordinarioEffettive,
      dipendente: dipendenteEffettivo || modalItem.dipendente,
      stato: 'consuntivo'
    };

    setStoricoCompleto(prev => prev.map(item => item.id === modalItem.id ? aggiornato : item));
    
    fetch('/api/gestisci', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(aggiornato) }).catch(() => {});

    setModalItem(null);
    setLoading(false);
  };

  const handleSalvaCliente = async (e) => {
    e.preventDefault(); 
    if (!modalCliente.ragione_sociale.trim()) return;
    const nuovo = { id: modalCliente.id || `cli_${Date.now()}`, ...modalCliente };
    setDbClienti(prev => {
      const idx = prev.findIndex(c => c.id === nuovo.id);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = nuovo; return copy; }
      return [nuovo, ...prev];
    });
    setModalCliente(null);
    fetch('/api/clienti', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuovo) }).catch(() => {});
  };

  const handleSalvaCommessa = async (e) => {
    e.preventDefault(); 
    if (!modalCommessa.titolo.trim()) return;
    const nuova = { id: modalCommessa.id || `com_${Date.now()}`, ore_utilizzate: 0, ...modalCommessa };
    setDbCommesse(prev => [nuova, ...prev]);
    setModalCommessa(null);
    fetch('/api/commesse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuova) }).catch(() => {});
  };

  const handleSalvaAppunto = async () => {
    if (!appuntiClienteSel || !appuntiProgettoSel || !nuovoAppuntoTesto.trim()) return;
    const nuovo = {
      id: `app_${Date.now()}`,
      cliente: appuntiClienteSel,
      progetto: appuntiProgettoSel,
      testo: nuovoAppuntoTesto.trim(),
      autore: currentUser?.nome || 'Sistema',
      versione: 1,
      created_at: new Date().toISOString()
    };
    setDbAppunti(prev => [nuovo, ...prev]);
    setNuovoAppuntoTesto('');
    setModalNuovaNota(false);
    fetch('/api/appunti', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuovo) }).catch(() => {});
  };

  const handleAskAI = () => {
    if (!aiInput.trim()) return;
    const q = aiInput.toLowerCase();
    let reply = "I dati inseriti nel sistema sono in perfetto stato. Dimmi pure se ti servono dettagli su una commessa o sui rapportini.";
    if (q.includes('commess') || q.includes('budget')) {
      reply = `Ci sono ${dbCommesse.length} commesse attive nel sistema. La commessa AROL è vicina al budget fissato.`;
    } else if (q.includes('ferie') || q.includes('assenz')) {
      const pendingFerie = safeStorico.filter(s => isAssenza(s) && s.stato === 'in_approvazione');
      reply = pendingFerie.length > 0 ? `Ci sono ${pendingFerie.length} richieste di ferie in attesa di approvazione dall'admin.` : `Non ci sono richieste di ferie pendenti in questo momento.`;
    } else if (q.includes('ore') || q.includes('lavoro')) {
      const tot = safeStorico.reduce((a, b) => a + Number(b.ore || 0) + Number(b.ore_backoffice || 0), 0);
      reply = `Nel sistema sono registrate un totale di ${tot} ore di lavoro erogate su vari cantieri.`;
    }

    setAiMessages(prev => [...prev, { role: 'user', text: aiInput }, { role: 'ai', text: reply }]);
    setAiInput('');
  };

  const openEditModal = (item) => {
    if (!item || !canEditItem(item)) return;
    setModalItem(item);
    setOreEffettive(item.ore || 0); setOreBackofficeEffettive(item.ore_backoffice || 0); setOreTrasfertaEffettive(item.ore_trasferta || 0); setOreStraordinarioEffettive(item.ore_straordinario || 0);
    setDipendenteEffettivo(isItemDaAssegnare(item) ? (currentUser?.ruolo === 'admin' ? 'Da Assegnare' : currentUser?.nome) : item.dipendente);
    setClienteEffettivo(item.cliente || ''); setProgettoEffettivo(item.progetto || ''); setNoteEffettive(item.note || '');
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => { setIsDrawing(false); };
  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const attivitaPerRapportiniConcluse = useMemo(() => {
    return safeStorico.filter(item => {
      if (!item || isAssenza(item)) return false;
      if (item.stato !== 'consuntivo') return false;
      if (currentUser?.ruolo !== 'admin' && !matchNomeDipendente(item.dipendente, currentUser?.nome)) return false;
      const dataStr = getNormalizedDate(item.data);
      if (filtroRapportinoMese && !dataStr.startsWith(filtroRapportinoMese)) return false;
      if (filtroRapportinoCliente !== 'Tutti' && item.cliente !== filtroRapportinoCliente) return false;
      if (filtroRapportinoTecnico !== 'Tutti' && !matchNomeDipendente(item.dipendente, filtroRapportinoTecnico)) return false;
      if (searchRapportinoText.trim()) {
        const query = searchRapportinoText.toLowerCase();
        const cli = toText(item.cliente).toLowerCase();
        const prog = toText(item.progetto).toLowerCase();
        const tech = toText(item.dipendente).toLowerCase();
        if (!cli.includes(query) && !prog.includes(query) && !tech.includes(query)) return false;
      }
      return true;
    }).sort((a, b) => new Date(getNormalizedDate(b.data)) - new Date(getNormalizedDate(a.data)));
  }, [safeStorico, filtroRapportinoMese, filtroRapportinoCliente, filtroRapportinoTecnico, searchRapportinoText, currentUser]);

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

  const isAlessandro = formData.dipendente === 'Alessandro Ciule';
  const todayStr = getTodayStr();
  const daAssegnareItems = safeStorico.filter(isItemDaAssegnare);
  const giorniMancantiUtente = currentUser?.nome ? getGiorniLavorativiMancanti(safeStorico, currentUser.nome) : [];
  const mieAttivitaArretrato = safeStorico.filter(s => s && currentUser?.nome && matchNomeDipendente(s.dipendente, currentUser.nome) && s.stato !== 'consuntivo' && s.stato !== 'annullato' && getNormalizedDate(s.data) <= todayStr);
  const mieAttivitaProssime = safeStorico.filter(s => s && currentUser?.nome && matchNomeDipendente(s.dipendente, currentUser.nome) && s.stato !== 'consuntivo' && s.stato !== 'annullato' && getNormalizedDate(s.data) > todayStr);
  const giorniSettimanaPlanner = get7DaysOfWeek(plannerWeekStart);

  if (!isMounted) return null;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans text-slate-100">
        <Head>
          <title>BW Solutions | Login ERP</title>
        </Head>
        <div className="w-full max-w-md bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-700">
          <div className="flex flex-col items-center text-center space-y-2 pb-6 border-b border-slate-700 mb-6">
            <div className="bg-sky-500 text-white font-black text-3xl w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30 mb-2">bw</div>
            <h1 className="text-2xl font-black text-white tracking-tight">BW Solutions S.r.l.</h1>
            <span className="text-xs text-sky-400 font-bold uppercase tracking-widest">Enterprise ERP Hub</span>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Username</label>
              <input type="text" required placeholder="es. luca / giampaolo / federico" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required placeholder="Password..." value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-sky-500 outline-none transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg hover:text-white transition-colors cursor-pointer">{showPassword ? '👁️' : '🙈'}</button>
              </div>
            </div>
            {statusMessage && <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold">{statusMessage.text}</div>}
            <button type="submit" className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-black py-4 rounded-xl shadow-xl shadow-sky-500/20 transition-all text-sm mt-2 cursor-pointer">Accedi al Gestionale ➔</button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-700/60 text-center text-[11px] text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Account Demo Disponibili:</p>
            <p>Admin: <code className="text-sky-400 font-mono">luca</code> / <code className="text-sky-400 font-mono">!luca123?</code></p>
            <p>User: <code className="text-sky-400 font-mono">giampaolo</code> / <code className="text-sky-400 font-mono">!giampaolo123?</code></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row pb-24 md:pb-0">
      <Head>
        <title>BW Solutions | Hub ERP Enterprise</title>
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .no-print { display: none !important; }
            #print-area, #print-area * { visibility: visible; }
            #print-area { position: absolute; left: 0; top: 0; width: 100%; }
          }
        `}</style>
      </Head>
      <datalist id="lista-aziende">{listaClientiCompleta.map((azienda, index) => <option key={index} value={azienda} />)}</datalist>

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between p-5 md:h-screen sticky top-0 z-40 border-r border-slate-800 shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-center space-x-3 cursor-pointer pb-6 border-b border-slate-800" onClick={() => navigateTo('home')}>
            <div className="bg-sky-500 text-slate-950 font-black text-xl w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">bw</div>
            <div>
              <span className="font-bold text-lg text-white block leading-none">BW Solutions</span>
              <span className="text-[10px] text-sky-400 font-bold uppercase tracking-widest block mt-1">Enterprise ERP</span>
            </div>
          </div>

          <nav className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-1.5 overflow-x-auto md:overflow-x-visible text-sm font-semibold">
            <button onClick={() => navigateTo('home')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'home' ? 'bg-sky-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>🏠 Home</button>
            <button onClick={() => navigateTo('planner')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'planner' ? 'bg-sky-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📅 Planner Team</button>
            <button onClick={() => navigateTo('nuovo')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'nuovo' ? 'bg-sky-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📝 Inserisci Ore</button>
            <button onClick={() => navigateTo('programmati')} className={`w-full px-4 py-3 rounded-xl flex items-center justify-between transition-all cursor-pointer ${activeTab === 'programmati' ? 'bg-sky-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>
              <div className="flex gap-3">⏳ Attività</div>
              {(mostraDaAssegnare && daAssegnareItems.length > 0) && <span className="bg-amber-500 text-white font-black px-2 py-0.5 rounded-full text-[10px]">{daAssegnareItems.length}</span>}
            </button>
            
            <button onClick={() => navigateTo('rapportini')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'rapportini' ? 'bg-sky-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📄 Rapportini PDF</button>
            <button onClick={() => navigateTo('commesse')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'commesse' ? 'bg-sky-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📐 Commesse &amp; Budget</button>
            <button onClick={() => navigateTo('anagrafiche')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'anagrafiche' ? 'bg-sky-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>🏢 Anagrafiche</button>
            <button onClick={() => navigateTo('appunti')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'appunti' ? 'bg-sky-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📓 Appunti PDM</button>
            <button onClick={() => navigateTo('documenti')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'documenti' ? 'bg-sky-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📂 Cloud Aruba</button>
            
            {currentUser?.ruolo === 'admin' && (
              <button onClick={() => navigateTo('cruscotto')} className={`w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${activeTab === 'cruscotto' ? 'bg-sky-500 text-slate-950 font-bold shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}>📊 Reportistica</button>
            )}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="px-3 py-2 bg-slate-800/80 rounded-xl text-[10px] font-bold flex items-center justify-between border border-slate-700">
            <span className="text-slate-400">Diagnostica App:</span>
            <span className="text-emerald-400">🟢 Sistema OK</span>
          </div>
          <div className="hidden md:flex bg-slate-800 p-3 rounded-2xl items-center justify-between">
            <div>
              <span className="text-white font-bold text-xs block truncate">{currentUser?.nome}</span>
              <span className="text-[10px] text-sky-400 uppercase font-bold">{currentUser?.ruolo}</span>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer text-sm">🚪</button>
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

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-base flex items-center gap-2"><span>🤖</span> BW Assistente AI</h3>
                  <p className="text-xs text-slate-300">Assistente intelligente per domande su cantieri, ore e commesse.</p>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-2 text-xs">
                  {aiMessages.map((msg, i) => (
                    <div key={i} className={`p-2.5 rounded-xl ${msg.role === 'user' ? 'bg-sky-600 text-white text-right font-medium' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                      {msg.text}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAskAI()} placeholder="Chiedimi ad es. 'quante ore ho registrato?'" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                  <button onClick={handleAskAI} className="bg-sky-500 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl cursor-pointer hover:bg-sky-400">Invia</button>
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
                <button onClick={() => setPlannerWeekStart(getMondayOfCurrentWeek())} className="px-3 py-1.5 text-xs font-bold bg-sky-500 text-slate-950 rounded-lg cursor-pointer">Oggi</button>
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
                              <div key={idx} onClick={() => openEditModal(ev)} className="p-1.5 mb-1 rounded-lg bg-sky-50 text-sky-900 border border-sky-200 text-[10px] font-bold truncate cursor-pointer hover:bg-sky-100 shadow-xs">
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
                  <input type="text" list="lista-aziende" required placeholder="Seleziona o digita il cliente..." value={formData.cliente} onChange={e => setFormData({ ...formData, cliente: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Progetto / Dettaglio *</label>
                  <input type="text" required placeholder="Descrizione attività svolta..." value={formData.progetto} onChange={e => setFormData({ ...formData, progetto: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><label className="block text-xs font-bold text-slate-500 mb-1">Ore Cantiere</label><input type="number" step="0.5" value={formData.ore} onChange={e => setFormData({ ...formData, ore: parseFloat(e.target.value) })} className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold" /></div>
                <div><label className="block text-xs font-bold text-sky-600 mb-1">Backoffice</label><input type="number" step="0.5" value={formData.ore_backoffice} onChange={e => setFormData({ ...formData, ore_backoffice: parseFloat(e.target.value) })} className="w-full p-3 border border-sky-200 bg-sky-50 rounded-xl text-sm font-bold" /></div>
                {isAlessandro && <div><label className="block text-xs font-bold text-purple-600 mb-1">Trasferta</label><input type="number" step="0.5" value={formData.ore_trasferta} onChange={e => setFormData({ ...formData, ore_trasferta: parseFloat(e.target.value) })} className="w-full p-3 border border-purple-200 bg-purple-50 rounded-xl text-sm font-bold" /></div>}
                <div><label className="block text-xs font-bold text-amber-600 mb-1">Straordinario</label><input type="number" step="0.5" value={formData.ore_straordinario} onChange={e => setFormData({ ...formData, ore_straordinario: parseFloat(e.target.value) })} className="w-full p-3 border border-amber-200 bg-amber-50 rounded-xl text-sm font-bold" /></div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Note Intervento</label>
                <textarea rows={2} placeholder="Eventuali annotazioni per il cliente..." value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className="w-full p-3 border border-slate-200 rounded-xl text-xs outline-none"></textarea>
              </div>

              {statusMessage && <div className={`p-4 rounded-xl text-xs font-bold ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>{statusMessage.text}</div>}

              <div className="flex gap-3">
                <button type="button" onClick={handleResetForm} className="w-1/3 py-3.5 bg-slate-100 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-200 cursor-pointer transition-colors">🧹 Svuota Form</button>
                <button type="submit" disabled={loading} className="w-2/3 py-3.5 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-md cursor-pointer hover:bg-slate-800 transition-colors">{loading ? 'Salvataggio...' : 'Salva Registrazione 🚀'}</button>
              </div>
            </form>
          </div>
        )}

        {/* TAB ATTIVITÀ */}
        {activeTab === 'programmati' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">⏳ Repository Attività &amp; Interventi</h2>
                <p className="text-xs text-slate-500 mt-1">Sfoglia il registro attività diviso per cartelle collaboratore.</p>
              </div>
              <button onClick={fetchProgrammati} className="bg-sky-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow cursor-pointer hover:bg-sky-500">🔄 Aggiorna Dati</button>
            </div>

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
                          <div key={item.id} className="pt-2 flex justify-between items-center p-2 rounded-xl hover:bg-slate-50">
                            <div onClick={() => openEditModal(item)} className="cursor-pointer flex-1">
                              <div className="font-bold text-xs text-slate-900">{item.cliente}</div>
                              <div className="text-[11px] text-slate-500">{item.progetto} ({getNormalizedDate(item.data)})</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {!isAssenza(item) && item.stato === 'consuntivo' && (
                                <button onClick={() => setModalRapportino(item)} className="bg-slate-900 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg hover:bg-slate-800 cursor-pointer">📄 Rapportino PDF</button>
                              )}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.stato === 'consuntivo' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                {item.stato === 'consuntivo' ? 'Consuntivato' : 'In Programma'}
                              </span>
                            </div>
                          </div>
                        ))}
                        {attivitaDip.length === 0 && <p className="text-xs text-slate-400 p-2">Nessuna attività registrata per questo utente.</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB RAPPORTINI PDF */}
        {activeTab === 'rapportini' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">📄 Centro Stampa Rapportini di Lavoro (PDF)</h2>
                <p className="text-xs text-slate-500 mt-1">Genera e stampa i rapportini tecnici delle <strong>sole attività già svolte e consuntivate</strong> con firma digitale touch del cliente.</p>
              </div>

              {/* FILTRI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border text-xs">
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Mese Intervento</label>
                  <input type="month" value={filtroRapportinoMese} onChange={e => setFiltroRapportinoMese(e.target.value)} className="w-full p-2 bg-white border rounded-xl font-bold outline-none" />
                </div>
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Cliente</label>
                  <select value={filtroRapportinoCliente} onChange={e => setFiltroRapportinoCliente(e.target.value)} className="w-full p-2 bg-white border rounded-xl font-semibold outline-none">
                    <option value="Tutti">Tutti i Clienti</option>
                    {listaClientiCompleta.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {currentUser?.ruolo === 'admin' && (
                  <div>
                    <label className="font-bold text-slate-500 mb-1 block">Tecnico Esecutore</label>
                    <select value={filtroRapportinoTecnico} onChange={e => setFiltroRapportinoTecnico(e.target.value)} className="w-full p-2 bg-white border rounded-xl font-semibold outline-none">
                      <option value="Tutti">Tutti i Tecnici</option>
                      {listaDipendenti.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="font-bold text-slate-500 mb-1 block">Cerca Testo</label>
                  <input type="text" placeholder="Progetto o note..." value={searchRapportinoText} onChange={e => setSearchRapportinoText(e.target.value)} className="w-full p-2 bg-white border rounded-xl font-medium outline-none" />
                </div>
              </div>

              {/* LISTA RRAPPORTINI PRONTI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {attivitaPerRapportiniConcluse.map((item, idx) => (
                  <div key={item.id || idx} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-400 shadow-xs transition-all space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black uppercase text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">{toText(item.cliente)}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">{getNormalizedDate(item.data)}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{toText(item.progetto)}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>👤 {toText(item.dipendente)}</span>
                        <span>•</span>
                        <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">✅ Consuntivato ({(Number(item.ore || 0) + Number(item.ore_backoffice || 0))}h)</span>
                      </div>
                      {item.note && <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-lg line-clamp-2">📝 {toText(item.note)}</p>}
                    </div>
                    
                    <button onClick={() => setModalRapportino(item)} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs">
                      <span>✍️ Apri e Firma Rapportino PDF</span>
                    </button>
                  </div>
                ))}
                {attivitaPerRapportiniConcluse.length === 0 && (
                  <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-400">
                    Nessun intervento concluso trovato con i filtri selezionati. Assicurati che l'attività sia nello stato "Consuntivato".
                  </div>
                )}
              </div>
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
              <button onClick={() => setModalCommessa({ codice_commessa: '', titolo: '', cliente: LISTA_CLIENTI_BASE[0], budget_ore: 50, stato: 'aperta' })} className="bg-sky-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow cursor-pointer hover:bg-sky-500">+ Nuova Commessa</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dbCommesse.map(com => {
                const perc = Math.min(100, Math.round(((com.ore_utilizzate || 0) / (com.budget_ore || 1)) * 100));
                return (
                  <div key={com.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{com.codice_commessa} • {com.cliente}</span>
                        <h3 className="font-bold text-slate-900 text-base mt-1">{com.titolo}</h3>
                      </div>
                      <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-xl">{com.ore_utilizzate || 0} / {com.budget_ore || 0} Ore</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Avanzamento Budget</span>
                        <span>{perc}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className={`h-full ${perc > 90 ? 'bg-rose-500' : perc > 75 ? 'bg-amber-500' : 'bg-sky-500'}`} style={{ width: `${perc}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB ANAGRAFICHE */}
        {activeTab === 'anagrafiche' && (
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">🏢 Anagrafica Clienti</h2>
              <button onClick={() => setModalCliente({ ragione_sociale: '', partita_iva: '', indirizzo: '', email: '', telefono: '' })} className="bg-sky-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow cursor-pointer hover:bg-sky-500">+ Nuovo Cliente</button>
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
                      <td className="p-3 text-slate-600">{c.partita_iva || '-'}</td>
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
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-sky-600 uppercase">{app.cliente}</span>
                    <span className="text-[10px] font-bold text-slate-400">v{app.versione || 1}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{app.progetto}</h3>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl line-clamp-3">{app.testo}</p>
                  <span className="text-[10px] text-slate-400 block pt-1">Autore: {app.autore}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CLOUD ARUBA */}
        {activeTab === 'documenti' && (
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">📂 Documenti Cloud Aruba / Nextcloud</h2>
                <p className="text-xs text-slate-500 mt-0.5">Sfoglia le cartelle remote e i file sincronizzati del cloud aziendale.</p>
              </div>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100">🟢 Aruba Sync Attivo</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 p-3 rounded-xl">
              <span>Percorso:</span>
              {cloudPathHistory.map((p, idx) => (
                <span key={idx} onClick={() => { setCloudFolder(p); setCloudPathHistory(cloudPathHistory.slice(0, idx + 1)); }} className="cursor-pointer hover:text-sky-600">
                  / {p}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              <div onClick={() => { setCloudFolder('Cartelle Commesse'); setCloudPathHistory([...cloudPathHistory, 'Cartelle Commesse']); }} className="p-4 bg-slate-50 rounded-2xl border hover:border-sky-400 cursor-pointer flex items-center gap-3">
                <span className="text-2xl">📁</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Cartelle Commesse 2026</h4>
                  <span className="text-[10px] text-slate-400">12 Elementi</span>
                </div>
              </div>

              <div onClick={() => { setCloudFolder('Disegni CAD'); setCloudPathHistory([...cloudPathHistory, 'Disegni CAD']); }} className="p-4 bg-slate-50 rounded-2xl border hover:border-sky-400 cursor-pointer flex items-center gap-3">
                <span className="text-2xl">📁</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Schemi Elettrici &amp; CAD</h4>
                  <span className="text-[10px] text-slate-400">8 Elementi</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">Specifica_Tecnica_ALSTOM.pdf</h4>
                    <span className="text-[10px] text-slate-400">2.4 MB • 14 Lug 2026</span>
                  </div>
                </div>
                <button onClick={() => alert('Download avviato dal Cloud Aruba...')} className="text-xs font-bold text-sky-600 hover:underline cursor-pointer">📥 Scarica</button>
              </div>
            </div>
          </div>
        )}

        {/* TAB REPORTISTICA */}
        {activeTab === 'cruscotto' && currentUser?.ruolo === 'admin' && (
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">📊 Reportistica Buste Paga &amp; Fatturazione</h2>
                <p className="text-xs text-slate-500 mt-1">Consuntivi mensili ore erogate divisi per collaboratore e cantiere.</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="month" value={filtroMeseReport} onChange={e => setFiltroMeseReport(e.target.value)} className="p-2 border rounded-xl text-xs font-bold outline-none" />
                <button onClick={exportCSVPaghe} className="bg-sky-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer hover:bg-sky-500 shadow-xs">📥 Esporta CSV Paghe</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold uppercase border-b border-slate-200">
                    <th className="p-3">Collaboratore</th>
                    <th className="p-3 text-center">Cantiere (h)</th>
                    <th className="p-3 text-center">Backoffice (h)</th>
                    <th className="p-3 text-center">Trasferta (h)</th>
                    <th className="p-3 text-center">Straordinario (h)</th>
                    <th className="p-3 text-center">Assenze (h)</th>
                    <th className="p-3 text-right">Totale Oregata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {listaDipendenti.map(nomeDip => {
                    const eventi = safeStorico.filter(item => item && getNormalizedDate(item.data).startsWith(filtroMeseReport) && matchNomeDipendente(item.dipendente, nomeDip) && item.stato === 'consuntivo');
                    const oreCantiere = eventi.filter(i => !isAssenza(i)).reduce((a, b) => a + Number(b.ore || 0), 0);
                    const oreBackoffice = eventi.filter(i => !isAssenza(i)).reduce((a, b) => a + Number(b.ore_backoffice || 0), 0);
                    const oreTrasferta = eventi.filter(i => !isAssenza(i)).reduce((a, b) => a + Number(b.ore_trasferta || 0), 0);
                    const oreStraordinario = eventi.filter(i => !isAssenza(i)).reduce((a, b) => a + Number(b.ore_straordinario || 0), 0);
                    const oreAssenze = eventi.filter(i => isAssenza(i)).reduce((a, b) => a + Number(b.ore || 0), 0);
                    const tot = oreCantiere + oreBackoffice + oreStraordinario + oreAssenze;
                    return (
                      <tr key={nomeDip} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{nomeDip}</td>
                        <td className="p-3 text-center text-slate-800">{oreCantiere}</td>
                        <td className="p-3 text-center text-sky-600">{oreBackoffice}</td>
                        <td className="p-3 text-center text-purple-600">{oreTrasferta}</td>
                        <td className="p-3 text-center text-amber-600">{oreStraordinario}</td>
                        <td className="p-3 text-center text-rose-600">{oreAssenze}</td>
                        <td className="p-3 text-right font-black text-slate-900">{tot} h</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODALI MODIFICA CLIENTE, COMMESSA, APPUNTI, MODIFICA ATTIVITÀ & RAPPORTINO PDF */}
      {modalCliente && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">{modalCliente.id ? 'Modifica Cliente' : 'Nuovo Cliente'}</h3>
            <form onSubmit={handleSalvaCliente} className="space-y-3 text-xs">
              <input type="text" placeholder="Ragione Sociale *" required value={modalCliente.ragione_sociale} onChange={e=>setModalCliente({...modalCliente, ragione_sociale: e.target.value})} className="w-full p-3 border rounded-xl outline-none" />
              <input type="text" placeholder="Partita IVA / CF" value={modalCliente.partita_iva || ''} onChange={e=>setModalCliente({...modalCliente, partita_iva: e.target.value})} className="w-full p-3 border rounded-xl outline-none" />
              <input type="text" placeholder="Indirizzo" value={modalCliente.indirizzo || ''} onChange={e=>setModalCliente({...modalCliente, indirizzo: e.target.value})} className="w-full p-3 border rounded-xl outline-none" />
              <div className="grid grid-cols-2 gap-2">
                <input type="email" placeholder="Email" value={modalCliente.email || ''} onChange={e=>setModalCliente({...modalCliente, email: e.target.value})} className="p-3 border rounded-xl outline-none" />
                <input type="text" placeholder="Telefono" value={modalCliente.telefono || ''} onChange={e=>setModalCliente({...modalCliente, telefono: e.target.value})} className="p-3 border rounded-xl outline-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalCliente(null)} className="w-1/2 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Annulla</button>
                <button type="submit" className="w-1/2 py-3 bg-sky-600 text-white font-bold rounded-xl cursor-pointer">Salva Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalCommessa && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Nuova Commessa</h3>
            <form onSubmit={handleSalvaCommessa} className="space-y-3 text-xs">
              <input type="text" placeholder="Codice Commessa (es. COM-2026-05)" required value={modalCommessa.codice_commessa} onChange={e=>setModalCommessa({...modalCommessa, codice_commessa: e.target.value})} className="w-full p-3 border rounded-xl outline-none" />
              <input type="text" placeholder="Titolo Commessa *" required value={modalCommessa.titolo} onChange={e=>setModalCommessa({...modalCommessa, titolo: e.target.value})} className="w-full p-3 border rounded-xl outline-none" />
              <div>
                <label className="font-bold text-slate-500 mb-1 block">Cliente Associato</label>
                <select value={modalCommessa.cliente} onChange={e=>setModalCommessa({...modalCommessa, cliente: e.target.value})} className="w-full p-3 border rounded-xl outline-none">
                  {listaClientiCompleta.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <input type="number" placeholder="Budget Ore" value={modalCommessa.budget_ore} onChange={e=>setModalCommessa({...modalCommessa, budget_ore: parseFloat(e.target.value)})} className="w-full p-3 border rounded-xl outline-none" />
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModalCommessa(null)} className="w-1/2 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Annulla</button>
                <button type="submit" className="w-1/2 py-3 bg-sky-600 text-white font-bold rounded-xl cursor-pointer">Salva Commessa</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalNuovaNota && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-xs shadow-2xl">
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

      {modalItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Dettaglio / Consuntivazione Intervento</h3>
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
              <button onClick={() => setModalItem(null)} className="w-1/3 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">Chiudi</button>
              <button onClick={handleConfermaChiudi} className="w-2/3 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl cursor-pointer">Salva &amp; Consuntiva 🚀</button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE STAMPA RRAPPORTINO PDF A4 CON FIRMA DIGITALE TOUCH */}
      {modalRapportino && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div id="print-area" className="bg-white rounded-3xl max-w-2xl w-full p-8 space-y-6 text-slate-900 my-auto shadow-2xl border border-slate-200">
            {/* INTESTAZIONE */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="bg-sky-500 text-slate-950 font-black text-lg w-8 h-8 rounded-lg flex items-center justify-center">bw</div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">BW SOLUTIONS S.R.L.</h2>
                </div>
                <p className="text-[10px] text-slate-500 font-medium">Ingegneria &amp; Soluzioni Industriali Enterprise</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-3 py-1 rounded-lg border border-sky-100 block">RAPPORTINO N. #{modalRapportino.id || '1001'}</span>
                <span className="text-[10px] text-slate-400 font-bold mt-1 block">Data: {getNormalizedDate(modalRapportino.data)}</span>
              </div>
            </div>

            {/* TABELLA DATI CLIENTE & TECNICO */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Cliente Committente</span>
                <span className="font-bold text-slate-900 text-sm block mt-0.5">{toText(modalRapportino.cliente)}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Tecnico Esecutore</span>
                <span className="font-bold text-slate-900 text-sm block mt-0.5">{toText(modalRapportino.dipendente)}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Commessa / Descrizione Progetto</span>
                <span className="font-bold text-slate-800 text-xs block mt-0.5">{toText(modalRapportino.progetto)}</span>
              </div>
            </div>

            {/* TABELLA ORE */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-bold text-slate-700 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Voce Attività</th>
                    <th className="p-3 text-right">Ore Lavorate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">Ore Intervento in Cantiere</td>
                    <td className="p-3 text-right font-bold text-slate-900">{modalRapportino.ore || 0} h</td>
                  </tr>
                  {Number(modalRapportino.ore_backoffice || 0) > 0 && (
                    <tr>
                      <td className="p-3 font-semibold text-sky-800">Ore Attività Backoffice / Progettazione</td>
                      <td className="p-3 text-right font-bold text-sky-800">{modalRapportino.ore_backoffice} h</td>
                    </tr>
                  )}
                  {Number(modalRapportino.ore_trasferta || 0) > 0 && (
                    <tr>
                      <td className="p-3 font-semibold text-purple-800">Ore Viaggio / Trasferta</td>
                      <td className="p-3 text-right font-bold text-purple-800">{modalRapportino.ore_trasferta} h</td>
                    </tr>
                  )}
                  {Number(modalRapportino.ore_straordinario || 0) > 0 && (
                    <tr>
                      <td className="p-3 font-semibold text-amber-900">Ore Straordinarie Saldate</td>
                      <td className="p-3 text-right font-bold text-amber-900">{modalRapportino.ore_straordinario} h</td>
                    </tr>
                  )}
                  <tr className="bg-slate-50 font-black text-slate-900">
                    <td className="p-3 uppercase">TOTALE ORE INTERVENTO</td>
                    <td className="p-3 text-right text-sm">{(Number(modalRapportino.ore || 0) + Number(modalRapportino.ore_backoffice || 0) + Number(modalRapportino.ore_straordinario || 0))} h</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* NOTE TECNICHE */}
            {modalRapportino.note && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Note Tecniche di Cantiere</span>
                <p className="text-slate-800 font-medium italic whitespace-pre-wrap">{toText(modalRapportino.note)}</p>
              </div>
            )}

            {/* FIRME */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
              <div className="space-y-4">
                <span className="font-bold text-slate-500 text-[10px] uppercase block">Firma del Tecnico Esecutore</span>
                <div className="border-b-2 border-dashed border-slate-300 h-16 flex items-end pb-1">
                  <span className="text-slate-600 font-serif italic text-sm">{toText(modalRapportino.dipendente)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700 text-[10px] uppercase block">Firma Cliente (Touch / Pennino)</span>
                  {hasSignature && (
                    <button type="button" onClick={clearSignature} className="text-[10px] text-rose-600 font-bold hover:underline cursor-pointer no-print">Cancella</button>
                  )}
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden relative">
                  <canvas 
                    ref={canvasRef} 
                    width={280} 
                    height={90} 
                    onMouseDown={startDrawing} 
                    onMouseMove={draw} 
                    onMouseUp={stopDrawing} 
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing} 
                    onTouchMove={draw} 
                    onTouchEnd={stopDrawing}
                    className="w-full h-20 bg-white cursor-crosshair touch-none"
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[10px] text-slate-400 font-medium">
                      Firma con il dito o mouse qui
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* BOTTONI D'AZIONE */}
            <div className="flex gap-3 pt-4 no-print border-t border-slate-100">
              <button onClick={() => setModalRapportino(null)} className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">Chiudi</button>
              <button onClick={() => { if(typeof window !== 'undefined') window.print(); }} className="w-2/3 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-2">
                <span>🖨️ Stampa / Salva in PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() { return <ErrorBoundary><HomeContent /></ErrorBoundary>; }
