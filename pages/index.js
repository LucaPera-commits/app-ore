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
  'SARACINO COSTRUZIONI', 'SARACINO', 'SAVINO', 'SICMA', 'SIMIC S.P.A', 'SPEICH s.r.l', 'STAT', 
  'STAT_BENACCHIO GROUP', 'STUDIO POLIGEO', 'T.M.C', 'TPL_Borgo S.Dalmazzo', 'TSM', 
  'TUBILINE s.r.l', 'VASILY UDODOV', 'VEGLIA'
];

// HELPER GLOBALI PER DATE E MESE SUCCESSIVO
const getTodayStr = () => new Date().toISOString().split('T')[0];
const getCurrentMonthStr = () => new Date().toISOString().slice(0, 7);

const getNextMonthStr = () => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 7);
};

const getNomeMeseText = (annoMeseStr) => {
  if (!annoMeseStr) return '';
  const [year, month] = annoMeseStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
};

const getNormalizedDate = (d) => {
  if (!d) return getTodayStr();
  return String(d).split('T')[0].split(' ')[0];
};

const getGiorniLavorativiMese = (annoMeseStr) => {
  if (!annoMeseStr) return 22;
  const [year, month] = annoMeseStr.split('-').map(Number);
  let count = 0;
  const date = new Date(year, month - 1, 1);
  while (date.getMonth() === month - 1) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) count++;
    date.setDate(date.getDate() + 1);
  }
  return count;
};

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const [categoriaForm, setCategoriaForm] = useState('lavoro');
  const [formData, setFormData] = useState({
    dipendente: '', cliente: '', progetto: '', data: getTodayStr(), data_fine: getTodayStr(),
    usaIntervallo: false, ore: 8, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0, note: '', stato: 'consuntivo'
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [storicoCompleto, setStoricoCompleto] = useState([]);
  const [loadingProgrammati, setLoadingProgrammati] = useState(false);

  // --- STATI SUGGERIMENTI & MODERAZIONE ---
  const [feedbackList, setFeedbackList] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [filtroArchivioAdmin, setFiltroArchivioAdmin] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    categoria: '💡 Nuova Funzionalità',
    valutazione: 5,
    messaggio: ''
  });
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [rispostaApertaId, setRispostaApertaId] = useState(null);
  const [testoRispostaAdmin, setTestoRispostaAdmin] = useState('');

  // --- STATI CARTELE ---
  const [cartelleAperte, setCartelleAperte] = useState({});
  const [sottoCartelleAperte, setSottoCartelleAperte] = useState({});

  const toggleCartella = (nome) => {
    setCartelleAperte(prev => ({ ...prev, [nome]: !prev[nome] }));
  };

  const toggleSottoCartella = (key) => {
    setSottoCartelleAperte(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // --- STATI NEXTCLOUD ARUBA ---
  const [pathNC, setPathNC] = useState('');
  const [searchQueryNC, setSearchQueryNC] = useState('');
  const [risultatiNC, setRisultatiNC] = useState([]);
  const [loadingNC, setLoadingNC] = useState(false);
  const [errorNC, setErrorNC] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // --- STATI REPORTISTICA ---
  const [filtroMeseReport, setFiltroMeseReport] = useState(getCurrentMonthStr());
  const [subTabReport, setSubTabReport] = useState('paghe');
  const [filtroClienteFatturazione, setFiltroClienteFatturazione] = useState('Tutti');

  const [modalItem, setModalItem] = useState(null);
  const [oreEffettive, setOreEffettive] = useState(8);
  const [oreBackofficeEffettive, setOreBackofficeEffettive] = useState(0);
  const [oreTrasfertaEffettive, setOreTrasfertaEffettive] = useState(0);
  const [oreStraordinarioEffettive, setOreStraordinarioEffettive] = useState(0);
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

  useEffect(() => {
    if (categoriaForm === 'ferie') {
      setFormData(prev => ({ ...prev, cliente: 'ASSENZE / GIUSTIFICATIVI', progetto: 'Ferie', ore: 8, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0 }));
    } else if (categoriaForm === 'permesso') {
      setFormData(prev => ({ ...prev, cliente: 'ASSENZE / GIUSTIFICATIVI', progetto: 'Permesso', ore: 4, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0 }));
    } else if (categoriaForm === 'malattia') {
      setFormData(prev => ({ ...prev, cliente: 'ASSENZE / GIUSTIFICATIVI', progetto: 'Malattia', ore: 8, ore_backoffice: 0, ore_trasferta: 0, ore_straordinario: 0 }));
    } else if (categoriaForm === 'lavoro' && formData.cliente === 'ASSENZE / GIUSTIFICATIVI') {
      setFormData(prev => ({ ...prev, cliente: '', progetto: '', ore: 8 }));
    }
  }, [categoriaForm]);

  const fetchProgrammati = async () => {
    setLoadingProgrammati(true);
    try {
      const res = await fetch('/api/gestisci?mode=all');
      if (res.ok) {
        const dati = await res.json();
        setStoricoCompleto(dati);
      }
    } catch (e) { console.error("Errore fetch:", e); } 
    finally { setLoadingProgrammati(false); }
  };

  const fetchFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const isInclude = currentUser?.ruolo === 'admin' && filtroArchivioAdmin;
      const res = await fetch(`/api/feedback?includeDeleted=${isInclude ? 'true' : 'false'}`);
      if (res.ok) {
        const data = await res.json();
        setFeedbackList(data);
      }
    } catch (e) { console.error("Errore caricamento feedback:", e); }
    finally { setLoadingFeedback(false); }
  };

  const handleSilentSync = async () => {
    if (currentUser?.ruolo !== 'admin') return;
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      if (res.ok) fetchProgrammati();
    } catch (e) {}
  };

  useEffect(() => {
    if (currentUser) {
      fetchProgrammati();
      fetchFeedback();
      if (currentUser.ruolo === 'admin') {
        handleSilentSync();
        const interval = setInterval(handleSilentSync, 180000);
        return () => clearInterval(interval);
      }
    }
  }, [currentUser, activeTab, filtroArchivioAdmin]);

  const handleInviaFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.messaggio.trim()) return;
    setLoading(true);
    setFeedbackStatus(null);
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
    const msg = nuovaAzione 
      ? "Vuoi rimuovere questo commento dalla bacheca pubblica? Rimarrà comunque nello storico riservato all'Admin."
      : "Vuoi ripristinare questo commento e renderlo di nuovo visibile a tutti?";
    
    if (!confirm(msg)) return;
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

  // APPROVAZIONE ED ELIMINAZIONE FERIE/PERMESSI ADMIN
  const handleApprovaAssenza = async (item) => {
    setLoading(true);
    try {
      const res = await fetch('/api/gestisci', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          calendar_event_id: item.calendar_event_id,
          stato: 'pianificato',
          chiudi_consuntivo: false
        })
      });
      if (res.ok) fetchProgrammati();
    } catch (e) { alert("Errore durante l'approvazione"); }
    finally { setLoading(false); }
  };

  const handleRifiutaAssenza = async (item) => {
    if (!confirm(`Vuoi RIFIUTARE la richiesta di ${item.progetto} di ${item.dipendente}?`)) return;
    setLoading(true);
    try {
      const res = await fetch('/api/gestisci', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, calendar_event_id: item.calendar_event_id })
      });
      if (res.ok) fetchProgrammati();
    } catch (e) { alert("Errore durante il rifiuto"); }
    finally { setLoading(false); }
  };

  const caricaContenutoNC = async (folderPath = '', search = '') => {
    setLoadingNC(true);
    setErrorNC(null);
    try {
      const res = await fetch(`/api/documenti?folder=${encodeURIComponent(folderPath)}&query=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok) {
        setRisultatiNC(data.risultati || []);
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
    if (activeTab === 'documenti' && !searchQueryNC) {
      caricaContenutoNC(pathNC, '');
    }
  }, [activeTab, pathNC]);

  const handleCercaNextcloud = (e) => {
    e.preventDefault();
    if (!searchQueryNC.trim()) {
      caricaContenutoNC(pathNC, '');
    } else {
      caricaContenutoNC('', searchQueryNC);
    }
  };

  const handleApriCartella = (nuovoPercorso) => {
    setSearchQueryNC('');
    setPathNC(nuovoPercorso);
  };

  const handleTornaSu = () => {
    setSearchQueryNC('');
    const parti = pathNC.split('/').filter(Boolean);
    parti.pop();
    setPathNC(parti.join('/'));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const user = UTENTI[loginForm.username.toLowerCase().trim()];
    if (user && user.pass === loginForm.password) {
      setCurrentUser(user);
      localStorage.setItem('bw_user', JSON.stringify(user));
      setFormData(prev => ({ ...prev, dipendente: user.nome }));
      setActiveTab('home');
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
    if (currentUser?.ruolo !== 'admin') return alert("Solo l'amministratore può sincronizzare.");
    setLoadingProgrammati(true);
    try {
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      alert(data.message || "Sincronizzazione completata.");
      fetchProgrammati();
    } catch (e) {
      alert("Errore di rete.");
    } finally {
      setLoadingProgrammati(false);
    }
  };

  const handleQuickReassign = async (item, nuovoDipendente) => {
    if (currentUser?.ruolo !== 'admin') return alert("Solo l'amministratore può riassegnare le attività.");
    if (!nuovoDipendente || nuovoDipendente === item.dipendente) return;
    try {
      const res = await fetch('/api/gestisci', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id, calendar_event_id: item.calendar_event_id,
          dipendente: nuovoDipendente, chiudi_consuntivo: false
        })
      });
      if (res.ok) fetchProgrammati();
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage(null);
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

      // SE É FERIE O PERMESSO ED È UN DIPENDENTE NORMALE -> STATO VA IN APPROVAZIONE
      let statoDaImpostare = formData.stato;
      if ((categoriaForm === 'ferie' || categoriaForm === 'permesso') && currentUser?.ruolo !== 'admin') {
        statoDaImpostare = 'in_approvazione';
      }

      let salvatiOk = 0;
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

        if (res.ok) salvatiOk++;
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
        setStatusMessage({ type: 'error', text: 'Errore durante il salvataggio.' });
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'Errore server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfermaChiudi = async () => {
    if (!modalItem) return;
    setLoading(true);
    try {
      const res = await fetch('/api/gestisci', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: modalItem.id, calendar_event_id: modalItem.calendar_event_id,
          ore_effettive: oreEffettive, ore_backoffice: oreBackofficeEffettive,
          ore_trasferta: oreTrasfertaEffettive, ore_straordinario: oreStraordinarioEffettive,
          dipendente: dipendenteEffettivo || modalItem.dipendente, chiudi_consuntivo: true
        })
      });
      if (res.ok) { setModalItem(null); fetchProgrammati(); }
    } catch (e) { alert("Errore"); } 
    finally { setLoading(false); }
  };

  const isFerie = (item) => (item.progetto || '').toLowerCase().includes('ferie');
  const isPermesso = (item) => (item.progetto || '').toLowerCase().includes('permesso') || (item.progetto || '').toLowerCase().includes('rol');
  const isMalattia = (item) => (item.progetto || '').toLowerCase().includes('malattia');
  const isAssenza = (item) => isFerie(item) || isPermesso(item) || isMalattia(item) || (item.cliente || '').toLowerCase().includes('assenze');

  const matchNomeDipendente = (nomeDb, filtro) => {
    if (!filtro || filtro === 'Tutti') return true; 
    const db = nomeDb ? nomeDb.toLowerCase().trim() : '';
    const flt = filtro.toLowerCase().trim();

    if (db === flt) return true;
    const partiFiltro = flt.split(' ').filter(Boolean);
    const partiDb = db.split(' ').filter(Boolean);

    return partiFiltro[0] && partiDb[0] && partiFiltro[0] === partiDb[0];
  };

  const canEditItem = (item) => {
    if (!currentUser) return false;
    if (currentUser.ruolo === 'admin') return true;
    return matchNomeDipendente(item?.dipendente, currentUser.nome);
  };

  const handleElimina = async (item) => {
    if (!canEditItem(item)) return alert("Puoi annullare solo le tue attività.");
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
    if (!canEditItem(item)) return alert("Puoi modificare solo le tue attività.");
    setModalItem(item);
    setOreEffettive(item.ore || 0);
    setOreBackofficeEffettive(item.ore_backoffice || 0);
    setOreTrasfertaEffettive(item.ore_trasferta || 0);
    setOreStraordinarioEffettive(item.ore_straordinario || 0);
    setDipendenteEffettivo(item.dipendente === 'Da Assegnare' ? currentUser?.nome : item.dipendente);
  };

  const exportCSVPaghe = () => {
    let csv = "Dipendente;Mese;Ore Cantiere;Ore Backoffice;Ore Trasferta;Ore Straordinario;Ore Ferie;Ore Permessi/ROL;Ore Malattia;Totale Ore Impegnate\n";
    
    listaDipendenti.forEach(nomeDip => {
      const eventi = storicoCompleto.filter(item => {
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
    
    const consuntivi = storicoCompleto.filter(item => {
      const dNorm = getNormalizedDate(item.data);
      const inMese = dNorm && dNorm.startsWith(filtroMeseReport);
      const matchCliente = filtroClienteFatturazione === 'Tutti' || item.cliente === filtroClienteFatturazione;
      return inMese && matchCliente && item.stato === 'consuntivo' && !isAssenza(item);
    });

    consuntivi.sort((a, b) => (a.cliente || '').localeCompare(b.cliente || '')).forEach(row => {
      csv += `"${row.cliente}";"${row.progetto}";"${row.dipendente}";"${getNormalizedDate(row.data)}";"${row.ore || 0}";"${row.ore_backoffice || 0}";"${row.ore_trasferta || 0}";"${row.ore_straordinario || 0}";"${(row.note || '').replace(/"/g, '""')}"\n`;
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

  const listaDipendenti = Object.values(UTENTI).map(u => u.nome);
  const daAssegnareItems = storicoCompleto.filter(p => (!p.dipendente || p.dipendente === 'Da Assegnare' || p.dipendente === '') && p.stato !== 'annullato');
  const dipendentiVisibili = listaDipendenti;

  // CONTEGGI PER CRUSCOTTO COMPITI E AZIONI PENDENTI
  const assenzeDaApprovareAdmin = storicoCompleto.filter(s => (isFerie(s) || isPermesso(s)) && s.stato === 'in_approvazione');
  const feedbackSenzaRisposta = feedbackList.filter(f => !f.risposta && !f.is_deleted);
  const mieAttivitaArretrato = storicoCompleto.filter(s => matchNomeDipendente(s.dipendente, currentUser?.nome) && s.stato !== 'consuntivo' && s.stato !== 'annullato' && getNormalizedDate(s.data) <= todayStr);
  const mieAttivitaProssime = storicoCompleto.filter(s => matchNomeDipendente(s.dipendente, currentUser?.nome) && s.stato !== 'consuntivo' && s.stato !== 'annullato' && getNormalizedDate(s.data) > todayStr);
  const mieiFeedbackRisposti = feedbackList.filter(f => matchNomeDipendente(f.autore, currentUser?.nome) && f.risposta);
  const consuntiviTeamDaChiudere = storicoCompleto.filter(s => s.stato !== 'consuntivo' && s.stato !== 'annullato' && getNormalizedDate(s.data) <= todayStr);

  // CALCOLO DISPONIBILITÀ MESE SUCCESSIVO
  const nextMonthStr = getNextMonthStr();
  const nomeMeseProssimoText = getNomeMeseText(nextMonthStr);
  const giorniLavorativiProssimoMese = getGiorniLavorativiMese(nextMonthStr);
  const oreLavorativeTotaliProssimoMese = giorniLavorativiProssimoMese * 8;

  const riepilogoDisponibilitaProssimoMese = listaDipendenti.map(nomeDip => {
    const eventiDipMese = storicoCompleto.filter(item => {
      const dNorm = getNormalizedDate(item.data);
      return dNorm && dNorm.startsWith(nextMonthStr) && matchNomeDipendente(item.dipendente, nomeDip) && item.stato !== 'annullato';
    });

    const oreImpegnateTotali = eventiDipMese.reduce((acc, curr) => acc + Number(curr.ore || 0) + Number(curr.ore_backoffice || 0) + Number(curr.ore_trasferta || 0), 0);
    const oreDisponibiliResidue = Math.max(0, oreLavorativeTotaliProssimoMese - oreImpegnateTotali);
    const giorniDisponibiliResidui = (oreDisponibiliResidue / 8).toFixed(1);

    return {
      nome: nomeDip,
      oreImpegnateTotali,
      oreDisponibiliResidue,
      giorniDisponibiliResidui
    };
  });

  const renderRigaAttivita = (item, colorTheme) => {
    const normDate = getNormalizedDate(item.data);
    const isAssenzaFlag = isFerie(item) || isPermesso(item) || isMalattia(item);
    const isInApprovazione = item.stato === 'in_approvazione';
    
    let icona = '💼';
    let etichetta = 'Cantiere';
    let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

    if (isFerie(item)) { icona = '🏖️'; etichetta = 'Ferie'; badgeStyle = 'bg-amber-100 text-amber-800 border-amber-300'; }
    else if (isPermesso(item)) { icona = '⏱️'; etichetta = 'Permesso'; badgeStyle = 'bg-indigo-100 text-indigo-800 border-indigo-300'; }
    else if (isMalattia(item)) { icona = '🏥'; etichetta = 'Malattia'; badgeStyle = 'bg-rose-100 text-rose-800 border-rose-300'; }
    else if (Number(item.ore_trasferta || 0) > 0) { icona = '🚗'; etichetta = 'Trasferta'; badgeStyle = 'bg-purple-100 text-purple-800 border-purple-300'; }
    else if (Number(item.ore_backoffice || 0) > 0) { icona = '🖥️'; etichetta = 'Backoffice'; badgeStyle = 'bg-sky-100 text-sky-800 border-sky-300'; }

    const isEditable = canEditItem(item);

    return (
      <div key={item.id} className={`p-3.5 bg-${colorTheme}-50/40 border border-${colorTheme}-200 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-sm`}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 shadow-xs">
              {normDate === todayStr ? 'Oggi' : normDate}
            </span>
            
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border flex items-center gap-1 shadow-xs ${badgeStyle}`}>
              <span>{icona}</span> {etichetta}
            </span>

            {isInApprovazione && (
              <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-lg border border-amber-500 shadow-xs animate-pulse">
                ⏳ In Approvazione Admin
              </span>
            )}

            {Number(item.ore_straordinario || 0) > 0 && (
              <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-300 shadow-xs">
                ⚡ +{item.ore_straordinario}h Straord.
              </span>
            )}
          </div>
          
          <div className="font-bold text-slate-900 text-sm truncate">
            {isAssenzaFlag ? item.progetto : (item.cliente || "Senza Cliente")}
          </div>
          
          {!isAssenzaFlag && (
            <div className="text-xs text-slate-600 truncate max-w-xs">{item.progetto || "Nessun dettaglio"}</div>
          )}
          
          {item.note && (
            <div className="text-[11px] text-slate-500 italic mt-1 bg-white p-1.5 rounded-lg border border-slate-100 max-w-xs truncate shadow-xs">
              📝 {item.note}
            </div>
          )}
          
          {currentUser?.ruolo === 'admin' && (
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Assegna a:</span>
              <select 
                value={item.dipendente || 'Da Assegnare'} 
                onChange={e => handleQuickReassign(item, e.target.value)}
                className={`text-xs font-bold px-2 py-0.5 rounded-lg border outline-none cursor-pointer ${
                  (!item.dipendente || item.dipendente === 'Da Assegnare') ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <option value="Da Assegnare">❓ Da Assegnare</option>
                {listaDipendenti.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="flex space-x-2 w-full md:w-auto mt-2 md:mt-0 items-center h-full">
          {isInApprovazione && currentUser?.ruolo === 'admin' ? (
            <>
              <button onClick={() => handleApprovaAssenza(item)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all whitespace-nowrap">
                ✅ Approva
              </button>
              <button onClick={() => handleRifiutaAssenza(item)} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all whitespace-nowrap">
                ❌ Rifiuta
              </button>
            </>
          ) : isEditable ? (
            <>
              <button onClick={() => openEditModal(item)} className="flex-1 md:flex-none px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-700 whitespace-nowrap transition-all">
                {item.stato === 'consuntivo' ? '✏️ Modifica' : '✅ Conferma'}
              </button>
              <button onClick={() => handleElimina(item)} className="flex-1 md:flex-none px-3 py-1.5 bg-white text-rose-600 border border-rose-200 text-xs font-bold rounded-xl hover:bg-rose-50 whitespace-nowrap transition-all">🗑️ Annulla</button>
            </>
          ) : (
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 whitespace-nowrap flex items-center gap-1">
              🔒 Sola Lettura
            </span>
          )}
        </div>
      </div>
    );
  };

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
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base p-1">
                    {showPassword ? '👁️' : '🙈'}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all text-sm mt-2">Accedi al Portale ➔</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-800 font-sans pb-12">
      <Head>
        <title>BW Solutions APP</title>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2225%22 fill=%22%230284c7%22/><text y=%2255%25%22 x=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2255%22 font-weight=%22900%22 fill=%22white%22 font-family=%22sans-serif%22>bw</text></svg>" />
      </Head>

      <datalist id="lista-aziende">
        {LISTA_CLIENTI.map((azienda, index) => (
          <option key={index} value={azienda} />
        ))}
      </datalist>

      {/* HEADER PRINCIPALE CON LINK A GOOGLE CALENDAR */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="bg-sky-500 text-slate-950 font-black text-base px-2.5 py-1 rounded-xl shadow-sm">bw</div>
            <div>
              <span className="font-bold text-base text-white leading-none block">bw solutions</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase block mt-0.5 tracking-wider">Zo&amp;annA S.R.L.</span>
            </div>
          </div>
          
          <nav className="flex space-x-1.5 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700 text-xs font-semibold overflow-x-auto">
            <button 
              onClick={() => setActiveTab('home')} 
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'home' ? 'bg-sky-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🏠 Home</span>
            </button>

            <button onClick={() => setActiveTab('nuovo')} className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'nuovo' ? 'bg-white text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white'}`}>📝 Inserimento Ore</button>
            
            <button onClick={() => setActiveTab('programmati')} className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1 ${activeTab === 'programmati' ? 'bg-white text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white'}`}>
              <span>⏳ Gestione Attività</span>
              {(daAssegnareItems.length > 0 || (currentUser?.ruolo === 'admin' && assenzeDaApprovareAdmin.length > 0)) && (
                <span className="bg-amber-400 text-slate-950 font-black px-1.5 rounded-full text-[10px]">
                  {daAssegnareItems.length + (currentUser?.ruolo === 'admin' ? assenzeDaApprovareAdmin.length : 0)}
                </span>
              )}
            </button>

            <a 
              href="https://calendar.google.com/" 
              target="_blank" 
              rel="noreferrer" 
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold whitespace-nowrap shadow-sm transition-all flex items-center space-x-1"
            >
              <span>📅 Google Calendar</span>
            </a>
            
            <button onClick={() => setActiveTab('feedback')} className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${activeTab === 'feedback' ? 'bg-white text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white'}`}>
              <span>💡 Suggerimenti</span>
              {feedbackList.length > 0 && (
                <span className="bg-purple-500 text-white font-black px-1.5 py-0.2 rounded-full text-[10px] shadow-xs">
                  {feedbackList.length}
                </span>
              )}
            </button>

            <button onClick={() => setActiveTab('documenti')} className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'documenti' ? 'bg-white text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white'}`}>📂 Cloud Aruba</button>
            
            <a 
              href="https://ug.link/naszoeanna" 
              target="_blank" 
              rel="noreferrer" 
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold whitespace-nowrap shadow-sm transition-all flex items-center space-x-1"
            >
              <span>🖥️ NAS UGREEN</span>
            </a>

            {currentUser?.ruolo === 'admin' && (
              <>
                <button onClick={() => setActiveTab('cruscotto')} className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'cruscotto' ? 'bg-white text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white'}`}>📊 Reportistica Mensile</button>
                <a href="/preventivi" className="px-3.5 py-2 rounded-xl bg-sky-900/60 hover:bg-sky-800 text-sky-200 font-bold whitespace-nowrap border border-sky-700/50">💰 Preventivi</a>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-3 text-xs bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-slate-200 font-semibold">👤 {currentUser?.nome}</span>
            <button onClick={handleLogout} className="bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white px-2 py-0.5 rounded-lg font-bold transition-all">Esci</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* TAB 0: HOME CON CRUSCOTTO OPERATIVO E VISIBILITÀ MESE SUCCESSIVO */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="relative z-10 space-y-3 max-w-2xl">
                <span className="bg-sky-500/20 text-sky-300 text-xs font-extrabold uppercase px-3 py-1 rounded-full border border-sky-500/30">
                  Pannello Operativo Aziendale
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Bentornato, <span className="text-sky-400">{currentUser?.nome}</span>! 👋
                </h1>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Accedi a tutte le risorse aziendali: registra le ore, verifica i giorni liberi dei colleghi o apri Google Calendar.
                </p>
              </div>
              <div className="absolute right-6 bottom-4 text-8xl opacity-10 pointer-events-none select-none">
                🏢
              </div>
            </div>

            {/* CRUSCOTTO OPERATIVO AZIONI & COMPITI PENDENTI */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>🎯</span> Cruscotto Azioni &amp; Compiti Pendenti
                </h3>
                <span className="text-xs text-slate-400 font-semibold">In tempo reale</span>
              </div>

              {currentUser?.ruolo === 'admin' ? (
                /* PANNELLO PENDENZE ADMIN */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div 
                    onClick={() => setActiveTab('programmati')} 
                    className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-900 uppercase">Da Assegnare</span>
                      <span className="text-base font-black text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-lg border border-amber-300">
                        {daAssegnareItems.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 font-medium">Interventi da associare ad un tecnico.</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('programmati')} 
                    className="p-4 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/50 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-purple-900 uppercase">Approvazione Ferie</span>
                      <span className="text-base font-black text-purple-900 bg-purple-200/80 px-2 py-0.5 rounded-lg border border-purple-300">
                        {assenzeDaApprovareAdmin.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-800 font-medium">Richieste ferie/permessi da confermare.</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('programmati')} 
                    className="p-4 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-rose-900 uppercase">Consuntivi Scaduti</span>
                      <span className="text-base font-black text-rose-900 bg-rose-200/80 px-2 py-0.5 rounded-lg border border-rose-300">
                        {consuntiviTeamDaChiudere.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-800 font-medium">Schede ore non ancora consuntivate dal team.</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('feedback')} 
                    className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/50 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-indigo-900 uppercase">Suggerimenti Nuovi</span>
                      <span className="text-base font-black text-indigo-900 bg-indigo-200/80 px-2 py-0.5 rounded-lg border border-indigo-300">
                        {feedbackSenzaRisposta.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-800 font-medium">Idee dipendenti in attesa di risposta.</p>
                  </div>
                </div>
              ) : (
                /* PANNELLO PENDENZE DIPENDENTI */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    onClick={() => setActiveTab('programmati')} 
                    className="p-4 rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/50 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-900 uppercase">Da Consuntivare</span>
                      <span className="text-lg font-black text-rose-900 bg-rose-200/80 px-2.5 py-0.5 rounded-xl border border-rose-300">
                        {mieAttivitaArretrato.length}
                      </span>
                    </div>
                    <p className="text-xs text-rose-800 font-medium">Tue attività passate da confermare.</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('programmati')} 
                    className="p-4 rounded-2xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100/50 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-900 uppercase">Prossimi Interventi</span>
                      <span className="text-lg font-black text-sky-900 bg-sky-200/80 px-2.5 py-0.5 rounded-xl border border-sky-300">
                        {mieAttivitaProssime.length}
                      </span>
                    </div>
                    <p className="text-xs text-sky-800 font-medium">Attività e cantieri già programmati.</p>
                  </div>

                  <div 
                    onClick={() => setActiveTab('feedback')} 
                    className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 uppercase">Risposte Direzione</span>
                      <span className="text-lg font-black text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded-xl border border-emerald-300">
                        {mieiFeedbackRisposti.length}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 font-medium">Risposte ai tuoi suggerimenti.</p>
                  </div>
                </div>
              )}
            </div>

            {/* QUADRO VISIBILITÀ GIORNI LIBERI MESE SUCCESSIVO (PER TUTTI) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span>🗓️</span> Disponibilità Team - Mese Successivo ({nomeMeseProssimoText})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Capienza teorica: <strong className="text-slate-800">{giorniLavorativiProssimoMese} giorni lavorativi ({oreLavorativeTotaliProssimoMese} ore)</strong>
                  </p>
                </div>
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-xl border border-sky-200">
                  Visibile a tutti i collaboratori
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {riepilogoDisponibilitaProssimoMese.map(dip => {
                  const haLibero = Number(dip.giorniDisponibiliResidui) > 0;
                  return (
                    <div key={dip.nome} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2 text-center">
                      <div className="font-bold text-xs text-slate-900 truncate flex items-center justify-center gap-1">
                        <span>👤</span> {dip.nome}
                      </div>
                      
                      <div className={`py-1.5 px-2 rounded-xl text-xs font-black shadow-2xs ${
                        haLibero ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
                      }`}>
                        {dip.giorniDisponibiliResidui} gg liberi
                      </div>

                      <div className="text-[10px] font-semibold text-slate-500">
                        {dip.oreDisponibiliResidue}h libere su {oreLavorativeTotaliProssimoMese}h
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* GRIGLIA PULSANTI DI NAVIGAZIONE */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div onClick={() => setActiveTab('nuovo')} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4 group-hover:scale-110 transition-transform">
                  📝
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Inserimento Ore</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">Registra ore di cantiere, backoffice, trasferte o assenze.</p>
                <span className="text-xs font-bold text-sky-600 flex items-center gap-1">Registra Ora ➔</span>
              </div>

              <div onClick={() => setActiveTab('programmati')} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4 group-hover:scale-110 transition-transform">
                  ⏳
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Gestione Attività</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">Cartelle per dipendente con attività assegnate e concluse.</p>
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">Apri Cartelle ➔</span>
              </div>

              <div onClick={() => setActiveTab('feedback')} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold group-hover:scale-110 transition-transform">
                    💡
                  </div>
                  {feedbackList.length > 0 && (
                    <span className="bg-purple-100 text-purple-800 font-extrabold text-xs px-2.5 py-1 rounded-full border border-purple-200">
                      {feedbackList.length} arrivati
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Suggerimenti App</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">Lascia idee, segnala bug o esprimi la tua opinione sull'app.</p>
                <span className="text-xs font-bold text-purple-600 flex items-center gap-1">Lascia un'idea ➔</span>
              </div>

              <a href="https://calendar.google.com/" target="_blank" rel="noreferrer" className="bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 p-6 rounded-3xl shadow-md hover:shadow-xl transition-all cursor-pointer group border border-amber-400 block">
                <div className="w-12 h-12 bg-white/20 text-slate-950 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4 group-hover:scale-110 transition-transform">
                  📅
                </div>
                <h3 className="font-bold text-slate-950 text-base mb-1">Google Calendar</h3>
                <p className="text-xs text-slate-900 leading-relaxed mb-4">Apri direttamente l'applicazione Google Calendar aziendale.</p>
                <span className="text-xs font-extrabold text-slate-950 flex items-center gap-1">Apri Calendar ➔</span>
              </a>
            </div>
          </div>
        )}

        {/* TAB 1: INSERIMENTO ORE */}
        {activeTab === 'nuovo' && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80 overflow-hidden">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Nuova Registrazione</h2>
                <p className="text-xs text-slate-300 mt-0.5">Inserisci le ore lavorate, pianifica eventi o registra ferie/permessi.</p>
              </div>
              <span className="text-2xl bg-white/10 p-2.5 rounded-2xl">📅</span>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Tipologia Inserimento</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button type="button" onClick={() => setCategoriaForm('lavoro')} className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${categoriaForm === 'lavoro' ? 'bg-slate-900 text-white shadow-sm border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>💼 Lavoro</button>
                  <button type="button" onClick={() => setCategoriaForm('ferie')} className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${categoriaForm === 'ferie' ? 'bg-amber-500 text-white shadow-sm border-amber-500' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>🏖️ Ferie</button>
                  <button type="button" onClick={() => setCategoriaForm('permesso')} className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${categoriaForm === 'permesso' ? 'bg-indigo-600 text-white shadow-sm border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>⏱️ Permesso</button>
                  <button type="button" onClick={() => setCategoriaForm('malattia')} className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${categoriaForm === 'malattia' ? 'bg-rose-600 text-white shadow-sm border-rose-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>🏥 Malattia</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                <button type="button" onClick={() => setFormData({ ...formData, stato: 'consuntivo' })} className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${formData.stato === 'consuntivo' ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600'}`}>✅ Consuntivo (Svolto)</button>
                <button type="button" onClick={() => setFormData({ ...formData, stato: 'pianificato', ore_straordinario: 0 })} className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${formData.stato === 'pianificato' ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600'}`}>⏳ Pianificato (Futuro)</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Dipendente / Tecnico</label>
                  {currentUser?.ruolo === 'admin' ? (
                    <select value={formData.dipendente} onChange={e => setFormData({...formData, dipendente: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-sm">
                      <option value="Da Assegnare">❓ Da Assegnare</option>
                      {listaDipendenti.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  ) : (
                    <input type="text" readOnly value={formData.dipendente} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-medium text-sm cursor-not-allowed" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase text-slate-500">Data o Periodo</label>
                    <label className="text-xs text-sky-700 font-bold flex items-center space-x-1 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={formData.usaIntervallo} 
                        onChange={e => setFormData({ ...formData, usaIntervallo: e.target.checked })}
                        className="rounded text-sky-600"
                      />
                      <span>📆 Attività su più giorni</span>
                    </label>
                  </div>

                  {formData.usaIntervallo ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase">Dal (Inizio)</span>
                        <input type="date" required value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value, data_fine: e.target.value > formData.data_fine ? e.target.value : formData.data_fine })} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-xs" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-0.5 uppercase">Al (Fine)</span>
                        <input type="date" required value={formData.data_fine} min={formData.data} onChange={(e) => setFormData({ ...formData, data_fine: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-xs" />
                      </div>
                    </div>
                  ) : (
                    <input type="date" required value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value, data_fine: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Cliente</label>
                  <input type="text" list="lista-aziende" placeholder="Es. ERREPI s.r.l" required value={formData.cliente} onChange={e => setFormData({ ...formData, cliente: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Progetto / Dettaglio Assenza</label>
                  <input type="text" placeholder="Es. Qualifiche / Ferie estive" required value={formData.progetto} onChange={e => setFormData({ ...formData, progetto: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Ore / Giorno (Std. 8h)</label>
                  <input type="number" step="0.5" min="0" required value={formData.ore} onChange={e => setFormData({ ...formData, ore: parseFloat(e.target.value) })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-sm" />
                </div>

                {categoriaForm === 'lavoro' && (
                  <>
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

                    {formData.stato === 'consuntivo' ? (
                      <div>
                        <label className="block text-xs font-bold uppercase text-amber-600 mb-1.5">⚡ Ore Straordinario</label>
                        <input type="number" step="0.5" min="0" value={formData.ore_straordinario} onChange={e => setFormData({ ...formData, ore_straordinario: parseFloat(e.target.value) })} className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-amber-50/60 font-black text-sm text-amber-900" />
                      </div>
                    ) : (
                      <div className="opacity-50 pointer-events-none">
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">⚡ Ore Straordinario</label>
                        <input type="text" disabled value="Solo a consuntivo" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs italic text-slate-400" />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Note &amp; Dettagli</label>
                <textarea rows={2} placeholder="Note o descrizioni aggiuntive..." value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none"></textarea>
              </div>

              {statusMessage && <div className={`p-4 rounded-xl text-sm font-semibold ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>{statusMessage.text}</div>}
              
              <button type="submit" disabled={loading} className={`w-full text-white font-bold py-3.5 rounded-xl shadow-md transition-all ${formData.stato === 'pianificato' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-900 hover:bg-slate-800'}`}>
                {loading ? 'Salvataggio in corso...' : 'Salva Registro 🚀'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: GESTIONE ATTIVITÀ CON CARTELE E ICONE */}
        {activeTab === 'programmati' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
              <div>
                <h2 className="text-xl font-bold tracking-tight">📁 Gestione Attività Team</h2>
                <p className="text-xs text-slate-300 mt-0.5">Quadro generale presenze e sotto-cartelle tematiche per dipendente.</p>
              </div>

              <div className="flex items-center space-x-2">
                {currentUser?.ruolo === 'admin' && (
                  <button 
                    onClick={handleSyncCalendar} 
                    disabled={loadingProgrammati} 
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50"
                  >
                    {loadingProgrammati ? '⏳ In corso...' : '⬇️ Sincronizza Google'}
                  </button>
                )}
                <button 
                  onClick={fetchProgrammati} 
                  disabled={loadingProgrammati} 
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3.5 py-2 rounded-xl border border-slate-700 font-bold transition-all shadow-sm disabled:opacity-50"
                >
                  {loadingProgrammati ? '⏳' : '🔄 Aggiorna'}
                </button>
              </div>
            </div>

            {/* QUADRO GENERALE DIPENDENTI */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>📊</span> Quadro Generale Dipendenti (A Colpo d'Occhio)
                </h3>
                <span className="text-xs font-semibold text-slate-400">Riepilogo in tempo reale</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold uppercase border-b border-slate-200">
                      <th className="py-2.5 px-3">Dipendente</th>
                      <th className="py-2.5 px-3 text-center">🚨 Da Consuntivare</th>
                      <th className="py-2.5 px-3 text-center">⏳ In Programma</th>
                      <th className="py-2.5 px-3 text-center">✅ Concluse</th>
                      <th className="py-2.5 px-3 text-center">🏖️ Assenze</th>
                      <th className="py-2.5 px-3 text-center">Stato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {dipendentiVisibili.map(dipNome => {
                      const eventiDip = storicoCompleto.filter(e => matchNomeDipendente(e.dipendente, dipNome));
                      const daConsuntivare = eventiDip.filter(e => e.stato !== 'consuntivo' && e.stato !== 'annullato' && getNormalizedDate(e.data) <= todayStr);
                      const inProgramma = eventiDip.filter(e => e.stato !== 'consuntivo' && e.stato !== 'annullato' && getNormalizedDate(e.data) > todayStr);
                      const concluse = eventiDip.filter(e => e.stato === 'consuntivo');
                      const assenze = eventiDip.filter(e => isAssenza(e));

                      return (
                        <tr key={dipNome} className="hover:bg-slate-50 transition-all cursor-pointer" onClick={() => toggleCartella(dipNome)}>
                          <td className="py-3 px-3 font-bold text-slate-900 flex items-center space-x-2">
                            <span>👤</span>
                            <span>{dipNome}</span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {daConsuntivare.length > 0 ? (
                              <span className="bg-rose-100 text-rose-800 font-black px-2.5 py-0.5 rounded-full border border-rose-200">
                                {daConsuntivare.length} da chiudere
                              </span>
                            ) : (
                              <span className="text-slate-400 font-bold">0</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-sky-700">{inProgramma.length}</td>
                          <td className="py-3 px-3 text-center font-bold text-emerald-700">{concluse.length}</td>
                          <td className="py-3 px-3 text-center font-bold text-purple-700">{assenze.length}</td>
                          <td className="py-3 px-3 text-center">
                            {daConsuntivare.length > 0 ? (
                              <span className="text-[10px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded-lg">Attenzione</span>
                            ) : (
                              <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-lg">Aggiornato</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CARTELLA DA ASSEGNARE */}
            {(currentUser?.ruolo === 'admin' || daAssegnareItems.length > 0) && (
              <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl overflow-hidden shadow-sm transition-all">
                <div 
                  onClick={() => toggleCartella('Da Assegnare')}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-amber-100/50 transition-all select-none"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{cartelleAperte['Da Assegnare'] ? '📂' : '📁'}</span>
                    <div>
                      <h3 className="font-bold text-amber-950 text-base">Attività Da Assegnare</h3>
                      <p className="text-xs text-amber-800">Eventi non ancora associati ad un tecnico</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full">
                      {daAssegnareItems.length} da assegnare
                    </span>
                    <span className="text-amber-900 font-bold text-xs bg-amber-200/80 px-3 py-1.5 rounded-xl border border-amber-300">
                      {cartelleAperte['Da Assegnare'] ? '▲ Chiudi Cartella' : '▼ Apri Cartella'}
                    </span>
                  </div>
                </div>

                {cartelleAperte['Da Assegnare'] && (
                  <div className="p-5 border-t border-amber-200 bg-white space-y-3">
                    {daAssegnareItems.length === 0 ? (
                      <p className="text-xs text-amber-700 font-semibold py-2">✅ Tutte le attività sono state assegnate ai dipendenti!</p>
                    ) : (
                      daAssegnareItems.map(item => renderRigaAttivita(item, 'amber'))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* CARTELE DIPENDENTI */}
            <div className="space-y-4">
              {dipendentiVisibili.map(dipNome => {
                const eventiDip = storicoCompleto.filter(e => matchNomeDipendente(e.dipendente, dipNome));
                const interventiLavoro = eventiDip.filter(e => !isAssenza(e) && Number(e.ore_backoffice || 0) === 0 && e.stato !== 'consuntivo' && e.stato !== 'annullato');
                const backofficeProgetti = eventiDip.filter(e => !isAssenza(e) && Number(e.ore_backoffice || 0) > 0 && e.stato !== 'consuntivo' && e.stato !== 'annullato');
                const assenzeGiustificativi = eventiDip.filter(e => isAssenza(e) && e.stato !== 'consuntivo' && e.stato !== 'annullato');
                const concluseConsuntivate = eventiDip.filter(e => e.stato === 'consuntivo');

                const isAperta = !!cartelleAperte[dipNome];

                return (
                  <div key={dipNome} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                    <div 
                      onClick={() => toggleCartella(dipNome)}
                      className="bg-slate-900 hover:bg-slate-800 text-white p-5 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-sky-500 text-slate-950 font-extrabold rounded-2xl flex items-center justify-center text-lg shadow-sm">
                          {isAperta ? '📂' : '📁'}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg leading-tight">{dipNome}</h3>
                          <span className="text-xs text-slate-400 font-medium">Cartella Personale Attività</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 text-xs font-bold">
                          <span className="bg-sky-500/20 text-sky-300 px-2.5 py-1 rounded-xl border border-sky-500/30">
                            💼 {interventiLavoro.length + backofficeProgetti.length} Attivi
                          </span>
                          <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                            ✅ {concluseConsuntivate.length} Conclusi
                          </span>
                        </div>
                        <span className="text-sky-400 font-bold text-xs bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                          {isAperta ? '▲ Chiudi Cartella' : '▼ Apri Cartella'}
                        </span>
                      </div>
                    </div>

                    {isAperta && (
                      <div className="p-5 space-y-4 bg-slate-50/50">
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                          <div onClick={() => toggleSottoCartella(`${dipNome}_lavoro`)} className="p-3.5 bg-sky-50/80 hover:bg-sky-100/80 flex items-center justify-between cursor-pointer border-b border-sky-100 select-none">
                            <div className="flex items-center space-x-2.5">
                              <span className="text-xl">💼</span>
                              <span className="font-bold text-slate-900 text-sm">Interventi Lavoro &amp; Cantiere</span>
                            </div>
                            <span className="bg-sky-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full">{interventiLavoro.length}</span>
                          </div>
                          {sottoCartelleAperte[`${dipNome}_lavoro`] && (
                            <div className="p-4 space-y-2 bg-white">
                              {interventiLavoro.length === 0 ? <p className="text-xs text-slate-400 py-2 text-center">Nessun intervento in programma.</p> : interventiLavoro.map(item => renderRigaAttivita(item, getNormalizedDate(item.data) < todayStr ? 'rose' : 'sky'))}
                            </div>
                          )}
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                          <div onClick={() => toggleSottoCartella(`${dipNome}_backoffice`)} className="p-3.5 bg-indigo-50/80 hover:bg-indigo-100/80 flex items-center justify-between cursor-pointer border-b border-indigo-100 select-none">
                            <div className="flex items-center space-x-2.5">
                              <span className="text-xl">🖥️</span>
                              <span className="font-bold text-slate-900 text-sm">Backoffice &amp; Progetti Interni</span>
                            </div>
                            <span className="bg-indigo-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full">{backofficeProgetti.length}</span>
                          </div>
                          {sottoCartelleAperte[`${dipNome}_backoffice`] && (
                            <div className="p-4 space-y-2 bg-white">
                              {backofficeProgetti.length === 0 ? <p className="text-xs text-slate-400 py-2 text-center">Nessun backoffice programmato.</p> : backofficeProgetti.map(item => renderRigaAttivita(item, 'indigo'))}
                            </div>
                          )}
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                          <div onClick={() => toggleSottoCartella(`${dipNome}_assenze`)} className="p-3.5 bg-purple-50/80 hover:bg-purple-100/80 flex items-center justify-between cursor-pointer border-b border-purple-100 select-none">
                            <div className="flex items-center space-x-2.5">
                              <span className="text-xl">🏖️</span>
                              <span className="font-bold text-slate-900 text-sm">Ferie, Permessi &amp; Malattie</span>
                            </div>
                            <span className="bg-purple-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full">{assenzeGiustificativi.length}</span>
                          </div>
                          {sottoCartelleAperte[`${dipNome}_assenze`] && (
                            <div className="p-4 space-y-2 bg-white">
                              {assenzeGiustificativi.length === 0 ? <p className="text-xs text-slate-400 py-2 text-center">Nessuna assenza programmata.</p> : assenzeGiustificativi.map(item => renderRigaAttivita(item, 'purple'))}
                            </div>
                          )}
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                          <div onClick={() => toggleSottoCartella(`${dipNome}_concluse`)} className="p-3.5 bg-emerald-50/80 hover:bg-emerald-100/80 flex items-center justify-between cursor-pointer border-b border-emerald-100 select-none">
                            <div className="flex items-center space-x-2.5">
                              <span className="text-xl">✅</span>
                              <span className="font-bold text-slate-900 text-sm">Storico Attività Concluse</span>
                            </div>
                            <span className="bg-emerald-600 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-full">{concluseConsuntivate.length}</span>
                          </div>
                          {sottoCartelleAperte[`${dipNome}_concluse`] && (
                            <div className="p-4 space-y-2 bg-white">
                              {concluseConsuntivate.length === 0 ? <p className="text-xs text-slate-400 py-2 text-center">Nessuna attività conclusa.</p> : concluseConsuntivate.sort((a, b) => new Date(getNormalizedDate(b.data)) - new Date(getNormalizedDate(a.data))).map(item => renderRigaAttivita(item, 'emerald'))}
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

        {/* TAB 3: SUGGERIMENTI E FEEDBACK SULL'APP */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80 overflow-hidden">
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <span>💡 Suggerimenti &amp; Feedback App</span>
                    <span className="bg-purple-600 text-white text-xs px-2.5 py-0.5 rounded-full font-black">
                      {feedbackList.length}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">Aiutaci a migliorare l'applicazione: proponi nuove funzioni o segnala problemi.</p>
                </div>
                <span className="text-2xl bg-white/10 p-2.5 rounded-2xl">🚀</span>
              </div>

              <form onSubmit={handleInviaFeedback} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Tipo di Suggerimento</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: '💡 Nuova Funzionalità', label: '💡 Nuova Funzione' },
                      { id: '🐞 Segnalazione Problema', label: '🐞 Bug / Problema' },
                      { id: '⭐ Opinione / Voto App', label: '⭐ Opinione App' },
                      { id: '✏️ Altro Suggerimento', label: '✏️ Altro' }
                    ].map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFeedbackForm({ ...feedbackForm, categoria: item.id })}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          feedbackForm.categoria === item.id 
                            ? 'bg-purple-600 text-white shadow-sm border-purple-600' 
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Autore</label>
                    <input type="text" readOnly value={currentUser?.nome || ''} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-medium text-sm cursor-not-allowed" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Valutazione Generica App</label>
                    <div className="flex space-x-2 pt-1">
                      {[1, 2, 3, 4, 5].map(v => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setFeedbackForm({ ...feedbackForm, valutazione: v })}
                          className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                            feedbackForm.valutazione >= v ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          {v} ⭐
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Messaggio / Dettagli del Suggerimento</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Spiega cosa vorresti aggiungere, modificare o cosa secondo te non funziona bene..."
                    value={feedbackForm.messaggio}
                    onChange={e => setFeedbackForm({ ...feedbackForm, messaggio: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-purple-200"
                  ></textarea>
                </div>

                {feedbackStatus && (
                  <div className={`p-4 rounded-xl text-sm font-semibold ${
                    feedbackStatus.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {feedbackStatus.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !feedbackForm.messaggio.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all text-sm disabled:opacity-50"
                >
                  {loading ? 'Invio in corso...' : 'Invia Suggerimento alla Squadra 🚀'}
                </button>
              </form>
            </div>

            {/* LISTA BACHECA SUGGERIMENTI E PANNELLO MODERAZIONE */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span>💬</span> Bacheca Idee &amp; Feedback ({feedbackList.length})
                  </h3>
                  <p className="text-xs text-slate-400">Suggerimenti inviati dai collaboratori</p>
                </div>

                <div className="flex items-center space-x-3">
                  {currentUser?.ruolo === 'admin' && (
                    <button 
                      onClick={() => setFiltroArchivioAdmin(!filtroArchivioAdmin)}
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all ${
                        filtroArchivioAdmin 
                          ? 'bg-purple-900 text-white border-purple-800 shadow' 
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {filtroArchivioAdmin ? '📂 Mostra Tutti (Inc. Archiviati)' : '📌 Solo Bacheca Pubblica'}
                    </button>
                  )}
                  <button onClick={fetchFeedback} disabled={loadingFeedback} className="text-xs text-sky-600 font-bold hover:underline">
                    {loadingFeedback ? '⏳' : '🔄 Ricarica'}
                  </button>
                </div>
              </div>

              {loadingFeedback ? (
                <p className="text-center py-8 text-xs text-slate-400 font-medium">Caricamento suggerimenti in corso...</p>
              ) : feedbackList.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-dashed rounded-2xl text-xs text-slate-400">
                  <span className="text-3xl block mb-1">💡</span>
                  Nessun suggerimento visibile al momento.
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbackList.map((fb) => (
                    <div 
                      key={fb.id} 
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        fb.is_deleted 
                          ? 'bg-rose-50/40 border-rose-200 opacity-75' 
                          : 'bg-slate-50/80 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-900">👤 {fb.autore}</span>
                          <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-lg border border-purple-200">
                            {fb.categoria}
                          </span>
                          {fb.is_deleted && (
                            <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-lg shadow-2xs">
                              🔒 Archiviato Admin
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                            {'⭐'.repeat(Number(fb.valutazione || 5))}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(fb.created_at || fb.data_ora).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                        {fb.messaggio}
                      </p>

                      {fb.risposta && (
                        <div className="bg-sky-50/90 border border-sky-200 p-3 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold text-sky-900 uppercase tracking-wider flex items-center gap-1">
                              <span>💬</span> Risposta della Direzione
                            </span>
                            {fb.risposta_at && (
                              <span className="text-[9px] text-sky-600 font-medium">
                                {new Date(fb.risposta_at).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-sky-950 font-semibold leading-relaxed">
                            {fb.risposta}
                          </p>
                        </div>
                      )}

                      {currentUser?.ruolo === 'admin' && (
                        <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setRispostaApertaId(rispostaApertaId === fb.id ? null : fb.id);
                                setTestoRispostaAdmin(fb.risposta || '');
                              }}
                              className="text-[11px] font-bold bg-sky-100 hover:bg-sky-200 text-sky-800 px-3 py-1 rounded-lg border border-sky-300 transition-all"
                            >
                              {fb.risposta ? '✏️ Modifica Risposta' : '💬 Rispondi al Dipendente'}
                            </button>
                          </div>

                          <button
                            onClick={() => handleToggleSoftDelete(fb.id, fb.is_deleted)}
                            className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition-all ${
                              fb.is_deleted 
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300' 
                                : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border-rose-300'
                            }`}
                          >
                            {fb.is_deleted ? '🔄 Ripristina in Bacheca' : '🗑️ Rimuovi dalla Bacheca'}
                          </button>
                        </div>
                      )}

                      {currentUser?.ruolo === 'admin' && rispostaApertaId === fb.id && (
                        <div className="p-3 bg-white border border-sky-200 rounded-xl space-y-2 mt-2">
                          <textarea
                            rows={2}
                            placeholder="Scrivi una risposta pubblica da parte della direzione..."
                            value={testoRispostaAdmin}
                            onChange={e => setTestoRispostaAdmin(e.target.value)}
                            className="w-full text-xs font-medium p-2.5 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-sky-200"
                          ></textarea>
                          <div className="flex justify-end space-x-2">
                            <button onClick={() => setRispostaApertaId(null)} className="px-3 py-1 text-xs font-bold text-slate-500 bg-slate-100 rounded-lg">Annulla</button>
                            <button onClick={() => handleInviaRispostaAdmin(fb.id)} disabled={loading} className="px-4 py-1 text-xs font-bold text-white bg-sky-600 rounded-lg shadow-sm">Pubblica Risposta ✅</button>
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ESPLORATORE ARUBA NEXTCLOUD */}
        {activeTab === 'documenti' && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80 overflow-hidden space-y-6">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight">📂 Esploratore Documenti Cloud (Aruba)</h2>
                <p className="text-xs text-slate-300 mt-0.5">Consulta e scarica file Word, Excel e PDF da Nextcloud Aruba.</p>
              </div>
              <span className="text-2xl bg-white/10 p-2.5 rounded-2xl">☁️</span>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm border border-blue-800">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🖥️</span>
                  <div>
                    <h4 className="font-bold text-sm">Devi gestire file sul Server NAS UGREEN?</h4>
                    <p className="text-xs text-blue-200">Accedi direttamente all'interfaccia di UGREEN per sfogliare e caricare nuovi file.</p>
                  </div>
                </div>
                <a href="https://ug.link/naszoeanna" target="_blank" rel="noreferrer" className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm">
                  Apri NAS UGREEN ➔
                </a>
              </div>

              <div className="space-y-3">
                <form onSubmit={handleCercaNextcloud} className="flex gap-2">
                  <input type="text" value={searchQueryNC} onChange={e => setSearchQueryNC(e.target.value)} placeholder="Filtra / Cerca un file su Aruba (es. ALSTOM)..." className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
                  <button type="submit" disabled={loadingNC} className="bg-sky-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs">{loadingNC ? '...' : 'Cerca 🔍'}</button>
                </form>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                {risultatiNC.map((item, idx) => (
                  <div key={idx} className="p-3.5 hover:bg-slate-50 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 truncate cursor-pointer" onClick={() => item.isFolder && handleApriCartella(item.percorso)}>
                      <span className="text-2xl">{item.isFolder ? '📁' : '📄'}</span>
                      <span className="font-bold text-sm text-slate-800 truncate">{item.nome}</span>
                    </div>
                    {!item.isFolder && (
                      <a href={`/api/download?path=${encodeURIComponent(item.percorso)}&forceDownload=true`} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold">📥 Scarica</a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CENTRO REPORTISTICA MENSILE */}
        {activeTab === 'cruscotto' && currentUser?.ruolo === 'admin' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">📊 Centro Reportistica Mensile</h2>
                  <p className="text-xs text-slate-300 mt-0.5">Esporta dati pronti per lo Studio Paghe e la Fatturazione Clienti.</p>
                </div>

                <div className="flex items-center space-x-2 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
                  <button 
                    onClick={() => setSubTabReport('paghe')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      subTabReport === 'paghe' ? 'bg-sky-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    💶 Report Buste Paga
                  </button>
                  <button 
                    onClick={() => setSubTabReport('fatturazione')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      subTabReport === 'fatturazione' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    🧾 Report Fatturazione
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <div className="flex items-center space-x-3">
                  <label className="text-xs font-bold uppercase text-slate-400">Mese di Riferimento:</label>
                  <input 
                    type="month" 
                    value={filtroMeseReport} 
                    onChange={e => setFiltroMeseReport(e.target.value)} 
                    className="bg-slate-800 text-white text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 outline-none" 
                  />
                </div>

                {subTabReport === 'paghe' ? (
                  <button 
                    onClick={exportCSVPaghe} 
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all flex items-center space-x-2"
                  >
                    <span>📥 Esporta Excel/CSV per Paghe</span>
                  </button>
                ) : (
                  <button 
                    onClick={exportCSVFatturazione} 
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all flex items-center space-x-2"
                  >
                    <span>📥 Esporta Excel/CSV per Fatture</span>
                  </button>
                )}
              </div>
            </div>

            {/* SUB-TAB 1: REPORT BUSTE PAGA */}
            {subTabReport === 'paghe' && (
              <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80 p-6 space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span>💶</span> Prospetto Ore Dipendenti ({filtroMeseReport})
                  </h3>
                  <p className="text-xs text-slate-500">Riepilogo ore ordinarie, straordinari e giustificativi da trasmettere al consulente del lavoro.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold uppercase border-b">
                        <th className="py-3 px-3">Dipendente</th>
                        <th className="py-3 px-3 text-center">Cantiere</th>
                        <th className="py-3 px-3 text-center">Backoffice</th>
                        <th className="py-3 px-3 text-center">Trasferta</th>
                        <th className="py-3 px-3 text-center text-amber-900 bg-amber-50">⚡ Straordinari</th>
                        <th className="py-3 px-3 text-center text-amber-700">Ferie</th>
                        <th className="py-3 px-3 text-center text-indigo-700">Permessi</th>
                        <th className="py-3 px-3 text-center text-rose-700">Malattia</th>
                        <th className="py-3 px-3 text-center font-black">Totale Impegnate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {listaDipendenti.map(nomeDip => {
                        const eventi = storicoCompleto.filter(item => {
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

                        return (
                          <tr key={nomeDip} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-bold text-slate-900">{nomeDip}</td>
                            <td className="py-3 px-3 text-center font-bold">{oreCantiere} h</td>
                            <td className="py-3 px-3 text-center font-bold text-sky-700">{oreBackoffice} h</td>
                            <td className="py-3 px-3 text-center font-bold text-purple-700">{oreTrasferta} h</td>
                            <td className="py-3 px-3 text-center font-extrabold text-amber-900 bg-amber-50">{oreStraordinario} h</td>
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

            {/* SUB-TAB 2: REPORT FATTURAZIONE CLIENTE */}
            {subTabReport === 'fatturazione' && (
              <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80 p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <span>🧾</span> Report Ore da Fatturare per Cliente ({filtroMeseReport})
                    </h3>
                    <p className="text-xs text-slate-500">Dettaglio interventi svolti in cantiere e backoffice suddivisi per commessa.</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Filtra Cliente:</span>
                    <select 
                      value={filtroClienteFatturazione} 
                      onChange={e => setFiltroClienteFatturazione(e.target.value)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 outline-none"
                    >
                      <option value="Tutti">Tutti i Clienti</option>
                      {LISTA_CLIENTI.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold uppercase border-b">
                        <th className="py-3 px-3">Data</th>
                        <th className="py-3 px-3">Cliente</th>
                        <th className="py-3 px-3">Commessa / Progetto</th>
                        <th className="py-3 px-3">Eseguito da</th>
                        <th className="py-3 px-3 text-center">Cantiere</th>
                        <th className="py-3 px-3 text-center">Backoffice</th>
                        <th className="py-3 px-3 text-center">Trasferta</th>
                        <th className="py-3 px-3 text-center text-amber-900 bg-amber-50">Straordinari</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {storicoCompleto
                        .filter(item => {
                          const dNorm = getNormalizedDate(item.data);
                          const inMese = dNorm && dNorm.startsWith(filtroMeseReport);
                          const matchCliente = filtroClienteFatturazione === 'Tutti' || item.cliente === filtroClienteFatturazione;
                          return inMese && matchCliente && item.stato === 'consuntivo' && !isAssenza(item);
                        })
                        .sort((a, b) => new Date(getNormalizedDate(b.data)) - new Date(getNormalizedDate(a.data)))
                        .map(item => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-slate-500 font-bold">{getNormalizedDate(item.data)}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{item.cliente}</td>
                            <td className="py-2.5 px-3 text-slate-700">{item.progetto}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">{item.dipendente}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-900">{item.ore || 0} h</td>
                            <td className="py-2.5 px-3 text-center font-bold text-sky-700">{item.ore_backoffice || 0} h</td>
                            <td className="py-2.5 px-3 text-center font-bold text-purple-700">{item.ore_trasferta || 0} h</td>
                            <td className="py-2.5 px-3 text-center font-extrabold text-amber-900 bg-amber-50">{item.ore_straordinario || 0} h</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* MODALE EDITING / CONFERMA CONSUNTIVO */}
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
              {(modalItem.dipendente === 'Da Assegnare' || currentUser?.ruolo === 'admin') && (
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-indigo-500 mb-1 uppercase">Svolto da:</label>
                  <select value={dipendenteEffettivo} onChange={e => setDipendenteEffettivo(e.target.value)} className="w-full px-3 py-2 border rounded-xl bg-indigo-50 border-indigo-200 text-sm font-bold text-indigo-800">
                    <option value="Da Assegnare" disabled>❓ Da Assegnare</option>
                    {listaDipendenti.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Ore Cantiere / Assenza</label>
                <input type="number" step="0.5" value={oreEffettive} onChange={e => setOreEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-sm font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-sky-600 mb-1 uppercase">Ore Backoffice</label>
                <input type="number" step="0.5" value={oreBackofficeEffettive} onChange={e => setOreBackofficeEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-sky-50 border-sky-200 text-sm font-bold text-sky-800" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-amber-600 mb-1 uppercase">⚡ Ore Straordinario</label>
                <input type="number" step="0.5" min="0" value={oreStraordinarioEffettive} onChange={e => setOreStraordinarioEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-amber-50 border-amber-300 text-sm font-extrabold text-amber-900" />
              </div>
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
