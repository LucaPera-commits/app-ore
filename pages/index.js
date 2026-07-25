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

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getCurrentMonthStr = () => new Date().toISOString().slice(0, 7);
  const getYesterdayStr = () => {
    const t = new Date(); t.setDate(t.getDate() - 1);
    return t.toISOString().split('T')[0];
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

  const [categoriaForm, setCategoriaForm] = useState('lavoro');
  const [formData, setFormData] = useState({
    dipendente: '', cliente: '', progetto: '', data: getTodayStr(),
    ore: 8, ore_backoffice: 0, ore_trasferta: 0, note: '', stato: 'consuntivo'
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [storicoCompleto, setStoricoCompleto] = useState([]);
  const [loadingProgrammati, setLoadingProgrammati] = useState(false);

  // --- STATO APERTURA/CHIUSURA CARTELE (CHIUSE DI DEFAULT) ---
  const [cartelleAperte, setCartelleAperte] = useState({});
  const [dipendenteSubTabs, setDipendenteSubTabs] = useState({});

  const toggleCartella = (nome) => {
    setCartelleAperte(prev => ({ ...prev, [nome]: !prev[nome] }));
  };

  // --- STATI PER ESPLORATORE DOCUMENTI NEXTCLOUD ARUBA ---
  const [pathNC, setPathNC] = useState('');
  const [searchQueryNC, setSearchQueryNC] = useState('');
  const [risultatiNC, setRisultatiNC] = useState([]);
  const [loadingNC, setLoadingNC] = useState(false);
  const [errorNC, setErrorNC] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

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

  useEffect(() => {
    if (categoriaForm === 'ferie') {
      setFormData(prev => ({ ...prev, cliente: 'ASSENZE / GIUSTIFICATIVI', progetto: 'Ferie', ore: 8, ore_backoffice: 0, ore_trasferta: 0 }));
    } else if (categoriaForm === 'permesso') {
      setFormData(prev => ({ ...prev, cliente: 'ASSENZE / GIUSTIFICATIVI', progetto: 'Permesso', ore: 4, ore_backoffice: 0, ore_trasferta: 0 }));
    } else if (categoriaForm === 'malattia') {
      setFormData(prev => ({ ...prev, cliente: 'ASSENZE / GIUSTIFICATIVI', progetto: 'Malattia', ore: 8, ore_backoffice: 0, ore_trasferta: 0 }));
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
      if (currentUser.ruolo === 'admin') {
        handleSilentSync();
        const interval = setInterval(handleSilentSync, 180000);
        return () => clearInterval(interval);
      }
    }
  }, [currentUser, activeTab]);

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

  const handleApriOnlineSenzaLogin = async (percorso) => {
    try {
      const res = await fetch(`/api/share?path=${encodeURIComponent(percorso)}`);
      const data = await res.json();
      if (res.ok && data.shareUrl) {
        window.open(data.shareUrl, '_blank');
      } else {
        alert("Impossibile aprire l'anteprima cloud. Usa il pulsante Scarica File.");
      }
    } catch (e) {
      alert("Errore durante l'apertura del documento.");
    }
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
      const res = await fetch('/api/salva', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage({ type: 'success', text: data.message });
        setFormData(prev => ({ ...prev, cliente: '', progetto: '', note: '', ore_backoffice: 0, ore_trasferta: 0 }));
        setCategoriaForm('lavoro');
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
    let csv = "Data;Dipendente;Categoria;Cliente;Commessa / Progetto;Ore Cantiere;Ore Backoffice;Ore Trasferta;Totale Ore;Note\n";
    datiDaEsportare.forEach(row => {
      const tot = Number(row.ore || 0) + Number(row.ore_backoffice || 0) + Number(row.ore_trasferta || 0);
      const cat = isFerie(row) ? "Ferie" : isPermesso(row) ? "Permesso" : isMalattia(row) ? "Malattia" : "Lavoro";
      csv += `"${getNormalizedDate(row.data)}";"${row.dipendente}";"${cat}";"${row.cliente}";"${row.progetto}";"${row.ore || 0}";"${row.ore_backoffice || 0}";"${row.ore_trasferta || 0}";"${tot}";"${(row.note || '').replace(/"/g, '""')}"\n`;
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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
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

  const isAlessandro = formData.dipendente === 'Alessandro Ciule';
  const todayStr = getTodayStr();
  const ieriStr = getYesterdayStr();

  const listaDipendenti = Object.values(UTENTI).map(u => u.nome);

  const daAssegnareItems = storicoCompleto.filter(p => (!p.dipendente || p.dipendente === 'Da Assegnare' || p.dipendente === '') && p.stato !== 'annullato');
  
  const dipendentiVisibili = currentUser.ruolo === 'admin' 
    ? listaDipendenti 
    : listaDipendenti.filter(d => matchNomeDipendente(d, currentUser.nome));

  const tuttiEventiMese = storicoCompleto.filter(item => {
    const dNorm = getNormalizedDate(item.data);
    const isInMese = dNorm && dNorm.startsWith(filtroMese);
    const matchDip = matchNomeDipendente(item.dipendente, filtroCruscottoDip);
    const matchCliente = filtroCruscottoCliente === 'Tutti' || item.cliente === filtroCruscottoCliente;
    return isInMese && matchDip && matchCliente && item.stato !== 'annullato';
  });

  const consuntiviMese = tuttiEventiMese.filter(item => item.stato === 'consuntivo');

  const totMeseCantiere = consuntiviMese.filter(i => !isAssenza(i)).reduce((a, b) => a + Number(b.ore || 0), 0);
  const totMeseBackoffice = consuntiviMese.filter(i => !isAssenza(i)).reduce((a, b) => a + Number(b.ore_backoffice || 0), 0);
  const totMeseTrasferta = consuntiviMese.filter(i => !isAssenza(i)).reduce((a, b) => a + Number(b.ore_trasferta || 0), 0);

  const totMeseFerie = consuntiviMese.filter(i => isFerie(i)).reduce((a, b) => a + Number(b.ore || 0), 0);
  const totMesePermesso = consuntiviMese.filter(i => isPermesso(i)).reduce((a, b) => a + Number(b.ore || 0), 0);
  const totMeseMalattia = consuntiviMese.filter(i => isMalattia(i)).reduce((a, b) => a + Number(b.ore || 0), 0);

  const giorniLavorativiTotaliMese = getGiorniLavorativiMese(filtroMese);
  const oreLavorativeTotaliMese = giorniLavorativiTotaliMese * 8;

  const riepilogoCapienzaDipendenti = listaDipendenti.map(nomeDip => {
    const eventiDipMese = storicoCompleto.filter(item => {
      const dNorm = getNormalizedDate(item.data);
      return dNorm && dNorm.startsWith(filtroMese) && matchNomeDipendente(item.dipendente, nomeDip) && item.stato !== 'annullato';
    });

    const oreLavoro = eventiDipMese.filter(i => !isAssenza(i)).reduce((a, b) => a + Number(b.ore || 0) + Number(b.ore_backoffice || 0) + Number(b.ore_trasferta || 0), 0);
    const oreFerie = eventiDipMese.filter(i => isFerie(i)).reduce((a, b) => a + Number(b.ore || 0), 0);
    const orePermesso = eventiDipMese.filter(i => isPermesso(i)).reduce((a, b) => a + Number(b.ore || 0), 0);
    const oreMalattia = eventiDipMese.filter(i => isMalattia(i)).reduce((a, b) => a + Number(b.ore || 0), 0);

    const oreImpegnateTotali = oreLavoro + oreFerie + orePermesso + oreMalattia;
    const oreDisponibiliResidue = oreLavorativeTotaliMese - oreImpegnateTotali;
    const giorniDisponibiliResidui = (oreDisponibiliResidue / 8).toFixed(1);

    return {
      nome: nomeDip,
      oreLavoro,
      oreFerie,
      orePermesso,
      oreMalattia,
      oreImpegnateTotali,
      oreDisponibiliResidue,
      giorniDisponibiliResidui
    };
  });

  const renderRigaAttivita = (item, colorTheme) => {
    const normDate = getNormalizedDate(item.data);
    const badgeAssenza = isFerie(item) ? '🏖️ Ferie' : isPermesso(item) ? '⏱️ Permesso' : isMalattia(item) ? '🏥 Malattia' : null;

    return (
      <div key={item.id} className={`p-3.5 bg-${colorTheme}-50/40 border border-${colorTheme}-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm`}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
              {normDate === todayStr ? 'Oggi' : normDate}
            </span>
            {badgeAssenza ? (
              <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-lg border border-purple-200">
                {badgeAssenza}
              </span>
            ) : (
              <span className="font-bold text-slate-900 text-sm truncate">{item.cliente || "Senza Cliente"}</span>
            )}
          </div>
          <div className="text-xs text-slate-600 truncate max-w-xs">{item.progetto || "Nessun dettaglio"}</div>
          {item.note && <div className="text-[11px] text-slate-400 italic mt-0.5 truncate max-w-xs">📝 {item.note}</div>}
          
          {currentUser.ruolo === 'admin' && (
            <div className="mt-2 flex items-center gap-2">
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

        <div className="flex space-x-2 w-full md:w-auto mt-2 md:mt-0">
          <button onClick={() => openEditModal(item)} className="flex-1 md:flex-none px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-emerald-700 whitespace-nowrap transition-all">
            {item.stato === 'consuntivo' ? '✏️ Modifica' : '✅ Conferma'}
          </button>
          <button onClick={() => handleElimina(item)} className="flex-1 md:flex-none px-3 py-1.5 bg-white text-rose-600 border border-rose-200 text-xs font-bold rounded-xl hover:bg-rose-50 whitespace-nowrap transition-all">🗑️ Annulla</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-800 font-sans pb-12">
      <Head>
        <title>Gestionale Ore &amp; Documenti | bw solutions</title>
      </Head>

      <datalist id="lista-aziende">
        {LISTA_CLIENTI.map((azienda, index) => (
          <option key={index} value={azienda} />
        ))}
      </datalist>

      {/* HEADER PRINCIPALE */}
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
              {daAssegnareItems.length > 0 && <span className="bg-amber-400 text-slate-950 font-black px-1.5 rounded-full text-[10px]">{daAssegnareItems.length}</span>}
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

            {currentUser.ruolo === 'admin' && (
              <>
                <button onClick={() => setActiveTab('cruscotto')} className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'cruscotto' ? 'bg-white text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white'}`}>📊 Cruscotto</button>
                <button onClick={() => setActiveTab('report')} className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'report' ? 'bg-white text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white'}`}>⚡ Performance</button>
                <a href="/preventivi" className="px-3.5 py-2 rounded-xl bg-sky-900/60 hover:bg-sky-800 text-sky-200 font-bold whitespace-nowrap border border-sky-700/50">💰 Preventivi</a>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-3 text-xs bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <span className="text-slate-200 font-semibold">👤 {currentUser.nome}</span>
            <button onClick={handleLogout} className="bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white px-2 py-0.5 rounded-lg font-bold transition-all">Esci</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* TAB 0: SCHERMATA PRINCIPALE (HOME) */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 rounded-3xl p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="relative z-10 space-y-3 max-w-2xl">
                <span className="bg-sky-500/20 text-sky-300 text-xs font-extrabold uppercase px-3 py-1 rounded-full border border-sky-500/30">
                  Pannello Operativo Aziendale
                </span>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Bentornato, <span className="text-sky-400">{currentUser.nome}</span>! 👋
                </h1>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Accedi a tutte le risorse aziendali: registra le ore, consulta il Cloud Aruba o accedi direttamente al Server NAS UGREEN.
                </p>
              </div>
              <div className="absolute right-6 bottom-4 text-8xl opacity-10 pointer-events-none select-none">
                🏢
              </div>
            </div>

            {daAssegnareItems.length > 0 && currentUser.ruolo === 'admin' && (
              <div className="bg-amber-50/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">❓</span>
                  <div>
                    <h3 className="font-bold text-amber-900 text-sm">Ci sono {daAssegnareItems.length} attività ancora "Da Assegnare"</h3>
                    <p className="text-xs text-amber-700">Assegna ciascuna attività al relativo dipendente nella sezione Attività.</p>
                  </div>
                </div>
                <button onClick={() => setActiveTab('programmati')} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm whitespace-nowrap">
                  Vedi Cartella ➔
                </button>
              </div>
            )}

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

              <div onClick={() => setActiveTab('documenti')} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4 group-hover:scale-110 transition-transform">
                  📂
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">Cloud Aruba</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">Consulta tavole PDF, documenti ed Excel da Nextcloud Aruba.</p>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">Esplora Aruba ➔</span>
              </div>

              <a href="https://ug.link/naszoeanna" target="_blank" rel="noreferrer" className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-6 rounded-3xl shadow-md hover:shadow-xl transition-all cursor-pointer group border border-blue-800 block">
                <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-4 group-hover:scale-110 transition-transform">
                  🖥️
                </div>
                <h3 className="font-bold text-white text-base mb-1">Server NAS UGREEN</h3>
                <p className="text-xs text-blue-200 leading-relaxed mb-4">Accedi al portale remoto del NAS UGREEN per scaricare e caricare file.</p>
                <span className="text-xs font-bold text-sky-300 flex items-center gap-1">Apri Portale UGREEN ➔</span>
              </a>
            </div>
          </div>
        )}

        {/* TAB 1: NUOVO INSERIMENTO ORE */}
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
                <button type="button" onClick={() => setFormData({ ...formData, stato: 'pianificato' })} className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all ${formData.stato === 'pianificato' ? 'bg-amber-500 border-amber-500 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600'}`}>⏳ Pianificato (Futuro)</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Dipendente / Tecnico</label>
                  {currentUser.ruolo === 'admin' ? (
                    <select value={formData.dipendente} onChange={e => setFormData({...formData, dipendente: e.target.value})} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-sm">
                      <option value="Da Assegnare">❓ Da Assegnare</option>
                      {listaDipendenti.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  ) : (
                    <input type="text" readOnly value={formData.dipendente} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-medium text-sm cursor-not-allowed" />
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Data Attività</label>
                  <input type="date" required value={formData.data} onChange={(e) => setFormData({ ...formData, data: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm" />
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">Ore {categoriaForm !== 'lavoro' ? 'Giustificate' : 'Lavorate'}</label>
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

        {/* TAB 2: GESTIONE ATTIVITÀ CON CARTELE RICHIUDIBILI */}
        {activeTab === 'programmati' && (
          <div className="space-y-6">
            
            {/* INTESTAZIONE E STRUMENTI */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
              <div>
                <h2 className="text-xl font-bold tracking-tight">📁 Gestione Attività per Dipendente</h2>
                <p className="text-xs text-slate-300 mt-0.5">Clicca su una cartella per aprirla e consultare le sotto-schede.</p>
              </div>

              <div className="flex items-center space-x-2">
                {currentUser.ruolo === 'admin' && (
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

            {/* SEZIONE 1: CARTELLA "DA ASSEGNARE" (RICHIUDIBILE) */}
            {(currentUser.ruolo === 'admin' || daAssegnareItems.length > 0) && (
              <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl overflow-hidden shadow-sm transition-all">
                <div 
                  onClick={() => toggleCartella('Da Assegnare')}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-amber-100/50 transition-all select-none"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{cartelleAperte['Da Assegnare'] ? '📂' : '📁'}</span>
                    <div>
                      <h3 className="font-bold text-amber-950 text-base">Attività Da Assegnare</h3>
                      <p className="text-xs text-amber-800">Eventi e commesse non ancora associate ad un tecnico</p>
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
                      <p className="text-xs text-amber-700 font-semibold py-2">
                        ✅ Tutte le attività sono state assegnate ai dipendenti!
                      </p>
                    ) : (
                      daAssegnareItems.map(item => renderRigaAttivita(item, 'amber'))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* SEZIONE 2: CARTELE DIPENDENTI (RICHIUDIBILI) */}
            <div className="space-y-4">
              {dipendentiVisibili.map(dipNome => {
                const eventiDip = storicoCompleto.filter(e => matchNomeDipendente(e.dipendente, dipNome));
                
                const assegnateInCorso = eventiDip.filter(e => e.stato === 'pianificato' || (e.stato !== 'consuntivo' && e.stato !== 'annullato'));
                const concluse = eventiDip.filter(e => e.stato === 'consuntivo');
                const annullateModificate = eventiDip.filter(e => e.stato === 'annullato' || (e.note && e.note.length > 0));

                const isAperta = !!cartelleAperte[dipNome];
                const subTabCorrente = dipendenteSubTabs[dipNome] || 'assegnate';

                return (
                  <div key={dipNome} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all">
                    
                    {/* INTESTAZIONE CARTELLA CLICCABILE */}
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
                          <span className="text-xs text-slate-400 font-medium">Cartella Attività</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 text-xs font-bold">
                          <span className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-xl border border-amber-500/30">
                            📌 {assegnateInCorso.length} Assegnate
                          </span>
                          <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                            ✅ {concluse.length} Concluse
                          </span>
                        </div>
                        <span className="text-sky-400 font-bold text-xs bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
                          {isAperta ? '▲ Chiudi Cartella' : '▼ Apri Cartella'}
                        </span>
                      </div>
                    </div>

                    {/* CONTENUTO CARTELLA - VISIBILE SOLO SE LA CARTELLA È APERTA */}
                    {isAperta && (
                      <div>
                        {/* SOTTO-TAB INTERNI */}
                        <div className="bg-slate-100 border-b border-slate-200 p-2 flex space-x-1 text-xs font-bold overflow-x-auto">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setDipendenteSubTabs({ ...dipendenteSubTabs, [dipNome]: 'assegnate' }); }}
                            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                              subTabCorrente === 'assegnate' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span>📌 Attività Assegnate</span>
                            <span className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded-full text-[10px]">{assegnateInCorso.length}</span>
                          </button>

                          <button 
                            onClick={(e) => { e.stopPropagation(); setDipendenteSubTabs({ ...dipendenteSubTabs, [dipNome]: 'concluse' }); }}
                            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                              subTabCorrente === 'concluse' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span>✅ Attività Concluse</span>
                            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full text-[10px]">{concluse.length}</span>
                          </button>

                          <button 
                            onClick={(e) => { e.stopPropagation(); setDipendenteSubTabs({ ...dipendenteSubTabs, [dipNome]: 'modificate' }); }}
                            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                              subTabCorrente === 'modificate' ? 'bg-white text-indigo-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <span>✏️ Note &amp; Storico Modifiche</span>
                            <span className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded-full text-[10px]">{annullateModificate.length}</span>
                          </button>
                        </div>

                        {/* ELENCO DEGLI INTERVENTI */}
                        <div className="p-5 space-y-3">
                          {subTabCorrente === 'assegnate' && (
                            assegnateInCorso.length === 0 ? (
                              <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                                🎉 Nessuna attività assegnata in sospeso per {dipNome}.
                              </div>
                            ) : (
                              assegnateInCorso.map(item => renderRigaAttivita(item, getNormalizedDate(item.data) < todayStr ? 'rose' : 'sky'))
                            )
                          )}

                          {subTabCorrente === 'concluse' && (
                            concluse.length === 0 ? (
                              <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                                📂 Nessuna attività conclusa registrata per {dipNome}.
                              </div>
                            ) : (
                              concluse
                                .sort((a, b) => new Date(getNormalizedDate(b.data)) - new Date(getNormalizedDate(a.data)))
                                .map(item => renderRigaAttivita(item, 'emerald'))
                            )
                          )}

                          {subTabCorrente === 'modificate' && (
                            annullateModificate.length === 0 ? (
                              <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                                📝 Nessun intervento con modifiche o annullamenti per {dipNome}.
                              </div>
                            ) : (
                              annullateModificate.map(item => renderRigaAttivita(item, 'indigo'))
                            )
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

        {/* TAB 3: ESPLORATORE ARUBA NEXTCLOUD + PROMEMORIA UGREEN */}
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
                <a 
                  href="https://ug.link/naszoeanna" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all whitespace-nowrap shadow-sm"
                >
                  Apri NAS UGREEN ➔
                </a>
              </div>

              <div className="space-y-3">
                <form onSubmit={handleCercaNextcloud} className="flex gap-2">
                  <input 
                    type="text" 
                    value={searchQueryNC} 
                    onChange={e => setSearchQueryNC(e.target.value)} 
                    placeholder="Filtra / Cerca un file o una commessa su Aruba (es. ALSTOM)..." 
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-sky-200"
                  />
                  <button type="submit" disabled={loadingNC} className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm">
                    {loadingNC ? '...' : 'Cerca 🔍'}
                  </button>
                  {(searchQueryNC || isSearchMode) && (
                    <button type="button" onClick={() => { setSearchQueryNC(''); setIsSearchMode(false); caricaContenutoNC(pathNC, ''); }} className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-2.5 rounded-xl text-xs">
                      ✖ Reset
                    </button>
                  )}
                </form>

                {!isSearchMode && (
                  <div className="flex items-center justify-between bg-slate-100 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold">
                    <div className="flex items-center space-x-1.5 overflow-x-auto">
                      <button onClick={() => setPathNC('')} className="text-sky-700 font-bold hover:underline">🏠 Cloud Aruba</button>
                      {pathNC.split('/').filter(Boolean).map((part, idx, arr) => {
                        const targetPath = arr.slice(0, idx + 1).join('/');
                        return (
                          <span key={targetPath} className="flex items-center space-x-1.5">
                            <span className="text-slate-400">/</span>
                            <button onClick={() => setPathNC(targetPath)} className="text-slate-800 hover:underline font-bold">{part}</button>
                          </span>
                        );
                      })}
                    </div>

                    {pathNC && (
                      <button onClick={handleTornaSu} className="bg-white hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all shadow-sm whitespace-nowrap">
                        ⬆️ Cartella Superiore
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-400 border-b pb-2">
                  <span>Contenuto Cartella Aruba ({risultatiNC.length})</span>
                  <button onClick={() => caricaContenutoNC(pathNC, searchQueryNC)} disabled={loadingNC} className="text-sky-600 hover:underline text-[11px] uppercase">
                    {loadingNC ? '⏳ Aggiornamento...' : '🔄 Ricarica'}
                  </button>
                </div>

                {loadingNC ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-medium">
                    <span className="animate-spin inline-block text-xl mb-1">⏳</span>
                    <p>Lettura file da Nextcloud in corso...</p>
                  </div>
                ) : risultatiNC.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 border border-dashed rounded-2xl">
                    <span className="text-3xl block mb-1">📂</span>
                    <p className="font-bold">Cartella vuota o nessun elemento trovato.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                    {risultatiNC.map((item, idx) => {
                      const ext = (item.nome.split('.').pop() || '').toLowerCase();
                      const isInline = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'txt'].includes(ext);

                      return (
                        <div key={idx} className="p-3.5 hover:bg-slate-50/80 flex items-center justify-between gap-4 transition-all">
                          <div className="flex items-center space-x-3 overflow-hidden flex-1 cursor-pointer" onClick={() => item.isFolder && handleApriCartella(item.percorso)}>
                            <span className="text-2xl">{item.isFolder ? '📁' : (isInline ? '📄' : '📊')}</span>
                            <div className="truncate">
                              <span className={`font-bold text-sm block truncate ${item.isFolder ? 'text-sky-900 hover:underline' : 'text-slate-800'}`}>
                                {item.nome}
                              </span>
                              <span className="text-[11px] text-slate-400 block truncate">{item.percorso || '/'}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {item.isFolder ? (
                              <button onClick={() => handleApriCartella(item.percorso)} className="bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all">
                                Apri Cartella ➔
                              </button>
                            ) : (
                              <>
                                {isInline ? (
                                  <a 
                                    href={`/api/download?path=${encodeURIComponent(item.percorso)}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm flex items-center space-x-1"
                                  >
                                    <span>👁️ Leggi PDF</span>
                                  </a>
                                ) : (
                                  <button 
                                    onClick={() => handleApriOnlineSenzaLogin(item.percorso)}
                                    className="bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm flex items-center space-x-1"
                                  >
                                    <span>👁️ Guarda Online</span>
                                  </button>
                                )}

                                <a 
                                  href={`/api/download?path=${encodeURIComponent(item.percorso)}&forceDownload=true`} 
                                  className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1"
                                >
                                  <span>📥 Scarica</span>
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CRUSCOTTO MENSILE */}
        {activeTab === 'cruscotto' && currentUser.ruolo === 'admin' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">📊 Cruscotto Mensile &amp; Presenze</h2>
                  <p className="text-xs text-slate-300 mt-0.5">Riepilogo consuntivi e suddivisione ore di lavoro e assenze.</p>
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

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2">
                <div className="bg-slate-800/80 border border-slate-700 p-2.5 rounded-2xl text-center">
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">Cantiere</span>
                  <span className="text-base font-bold text-white">{totMeseCantiere} h</span>
                </div>
                <div className="bg-slate-800/80 border border-sky-500/30 p-2.5 rounded-2xl text-center">
                  <span className="text-[9px] font-bold uppercase text-sky-400 block">Backoffice</span>
                  <span className="text-base font-bold text-sky-300">{totMeseBackoffice} h</span>
                </div>
                <div className="bg-slate-800/80 border border-purple-500/30 p-2.5 rounded-2xl text-center">
                  <span className="text-[9px] font-bold uppercase text-purple-400 block">Trasferta</span>
                  <span className="text-base font-bold text-purple-300">{totMeseTrasferta} h</span>
                </div>
                <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-2xl text-center">
                  <span className="text-[9px] font-bold uppercase text-amber-400 block">🏖️ Ferie</span>
                  <span className="text-base font-bold text-amber-300">{totMeseFerie} h</span>
                </div>
                <div className="bg-indigo-950/40 border border-indigo-500/30 p-2.5 rounded-2xl text-center">
                  <span className="text-[9px] font-bold uppercase text-indigo-400 block">⏱️ Permessi</span>
                  <span className="text-base font-bold text-indigo-300">{totMesePermesso} h</span>
                </div>
                <div className="bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-2xl text-center">
                  <span className="text-[9px] font-bold uppercase text-rose-400 block">🏥 Malattia</span>
                  <span className="text-base font-bold text-rose-300">{totMeseMalattia} h</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <span>📅</span> Disponibilità &amp; Giornate Lavorative Residue Mese
                  </h3>
                  <p className="text-xs text-slate-500">
                    Giorni lavorativi teorici nel mese: <strong className="text-slate-800">{giorniLavorativiTotaliMese} giorni ({oreLavorativeTotaliMese} ore)</strong>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {riepilogoCapienzaDipendenti.map(dip => {
                  const haDisponibilita = Number(dip.giorniDisponibiliResidui) > 0;
                  return (
                    <div key={dip.nome} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>👤</span> {dip.nome}
                        </span>
                        <span className={`px-3 py-1 rounded-xl text-xs font-black shadow-sm ${
                          haDisponibilita 
                            ? 'bg-emerald-500 text-white' 
                            : Number(dip.giorniDisponibiliResidui) === 0 
                            ? 'bg-amber-500 text-white' 
                            : 'bg-rose-600 text-white'
                        }`}>
                          {dip.giorniDisponibiliResidui} giorni liberi ({dip.oreDisponibiliResidue}h)
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-white p-2 rounded-xl border border-slate-200">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Lavoro</span>
                          <span className="font-bold text-slate-800">{dip.oreLavoro}h</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-amber-200">
                          <span className="text-[9px] uppercase font-bold text-amber-600 block">Ferie / Perm.</span>
                          <span className="font-bold text-amber-800">{dip.oreFerie + dip.orePermesso}h</span>
                        </div>
                        <div className="bg-white p-2 rounded-xl border border-rose-200">
                          <span className="text-[9px] uppercase font-bold text-rose-600 block">Malattia</span>
                          <span className="font-bold text-rose-800">{dip.oreMalattia}h</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: REPORT PERFORMANCE */}
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
                  const attivitaDip = storicoCompleto.filter(s => matchNomeDipendente(s.dipendente, nomeDip));
                  const consuntivate = attivitaDip.filter(s => s.stato === 'consuntivo');
                  const inRitardoScadute = attivitaDip.filter(s => s.stato !== 'consuntivo' && s.stato !== 'annullato' && getNormalizedDate(s.data) < ieriStr);

                  const totaleRilevante = consuntivate.length + inRitardoScadute.length;
                  const indiceReattivita = totaleRilevante > 0 ? Math.round((consuntivate.length / totaleRilevante) * 100) : 100;

                  const totOreLavorate = consuntivate.filter(i => !isAssenza(i)).reduce((acc, curr) => acc + Number(curr.ore || 0), 0);
                  const totOreBackoffice = consuntivate.filter(i => !isAssenza(i)).reduce((acc, curr) => acc + Number(curr.ore_backoffice || 0), 0);
                  const totOreTrasferta = consuntivate.filter(i => !isAssenza(i)).reduce((acc, curr) => acc + Number(curr.ore_trasferta || 0), 0);

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

      {/* MODALE EDITING */}
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
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Ore Lavorate / Assenza</label>
                <input type="number" step="0.5" value={oreEffettive} onChange={e => setOreEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-sm font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-sky-600 mb-1 uppercase">Ore Backoffice</label>
                <input type="number" step="0.5" value={oreBackofficeEffettive} onChange={e => setOreBackofficeEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-sky-50 border-sky-200 text-sm font-bold text-sky-800" />
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
