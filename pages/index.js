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
  const [activeTab, setActiveTab] = useState('programmati');

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

  // --- STATI PER ESPLORATORE DOCUMENTI NEXTCLOUD ---
  const [pathNC, setPathNC] = useState('');
  const [searchQueryNC, setSearchQueryNC] = useState('');
  const [risultatiNC, setRisultatiNC] = useState([]);
  const [loadingNC, setLoadingNC] = useState(false);
  const [errorNC, setErrorNC] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [filtroAssegnazione, setFiltroAssegnazione] = useState('Tutti');
  const [filtroDipendente, setFiltroDipendente] = useState('Tutti');

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
    try {
      const res = await fetch('/api/gestisci?mode=all');
      if (res.ok) {
        const dati = await res.json();
        setStoricoCompleto(dati);
      }
    } catch (e) { console.error("Errore fetch:", e); } 
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

  // CARICAMENTO ISTANTANEO CONTENUTO NEXTCLOUD
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

  // APERTURA CONSULTAZIONE ONLINE SENZA LOGIN (VIA SHARE API)
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
                <input type="text" required value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm" placeholder="Inserisci nome utente" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm pr-12" placeholder="Inserisci password" />
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

  const matchAssegnazione = (dipDb, filtroAss) => {
    if (!filtroAss || filtroAss === 'Tutti') return true;
    const isDaAssegnare = !dipDb || dipDb === 'Da Assegnare' || dipDb === '';
    if (filtroAss === 'Da Assegnare') return isDaAssegnare;
    if (filtroAss === 'Assegnate') return !isDaAssegnare;
    return true;
  };

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
  const targetDipendente = currentUser.ruolo === 'admin' ? filtroDipendente : currentUser.nome;

  const attivitaPianificateAttive = storicoCompleto.filter(p => {
    const isChiuso = p.stato === 'consuntivo' || p.stato === 'annullato';
    if (isChiuso) return false;

    const passAssegnazione = matchAssegnazione(p.dipendente, filtroAssegnazione);
    const passDipendente = matchNomeDipendente(p.dipendente, targetDipendente);

    return passAssegnazione && passDipendente;
  });

  const attivitaArchiviate = storicoCompleto.filter(p => {
    const isChiuso = p.stato === 'consuntivo' || p.stato === 'annullato';
    if (!isChiuso) return false;

    const passAssegnazione = matchAssegnazione(p.dipendente, filtroAssegnazione);
    const passDipendente = matchNomeDipendente(p.dipendente, targetDipendente);

    return passAssegnazione && passDipendente;
  });

  const todayStr = getTodayStr();
  const daConfermare = attivitaPianificateAttive.filter(p => getNormalizedDate(p.data) <= todayStr);
  const ieriStr = getYesterdayStr();
  const attivitaInScadenzaRitardo = attivitaPianificateAttive.filter(p => getNormalizedDate(p.data) < ieriStr);

  const listaDipendenti = Object.values(UTENTI).map(u => u.nome);

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

  const giorniLavorativiTotaliMese = getGiorniLavorativiMese(filtroMese);
  const oreLavorativeTotaliMese = giorniLavorativiTotaliMese * 8;

  const renderRigaAttivita = (item, colorTheme) => {
    const normDate = getNormalizedDate(item.data);
    const badgeAssenza = isFerie(item) ? '🏖️ Ferie' : isPermesso(item) ? '⏱️ Permesso' : isMalattia(item) ? '🏥 Malattia' : null;

    return (
      <div key={item.id} className={`p-3 bg-${colorTheme}-50/30 border border-${colorTheme}-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
              {normDate === todayStr ? 'Oggi' : normDate}
            </span>
            {badgeAssenza ? (
              <span className="text-[10px] font-extrabold bg-purple-100 text-purple-800 px-2 py-0.5 rounded border border-purple-200">
                {badgeAssenza}
              </span>
            ) : (
              <span className="font-bold text-slate-900 text-sm truncate">{item.cliente || "Senza Cliente"}</span>
            )}
          </div>
          <div className="text-xs text-slate-600 truncate max-w-xs">{item.progetto || "Nessun dettaglio"}</div>
          
          {currentUser.ruolo === 'admin' && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Assegnato a:</span>
              <select 
                value={item.dipendente || 'Da Assegnare'} 
                onChange={e => handleQuickReassign(item, e.target.value)}
                className={`text-xs font-bold px-2 py-0.5 rounded border outline-none cursor-pointer ${
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
          <button onClick={() => openEditModal(item)} className="flex-1 md:flex-none px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-700 whitespace-nowrap">✅ Conferma</button>
          <button onClick={() => handleElimina(item)} className="flex-1 md:flex-none px-3 py-1.5 bg-white text-rose-600 border border-rose-200 text-xs font-bold rounded-lg hover:bg-rose-50 whitespace-nowrap">🗑️ Annulla</button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans pb-12">
      <Head>
        <title>Gestionale Ore &amp; Documenti | bw solutions</title>
      </Head>

      <datalist id="lista-aziende">
        {LISTA_CLIENTI.map((azienda, index) => (
          <option key={index} value={azienda} />
        ))}
      </datalist>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="bg-sky-600 text-white font-bold text-base px-2.5 py-1 rounded-lg">bw</div>
            <div>
              <span className="font-bold text-base text-slate-900 leading-none block">bw solutions</span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase block mt-0.5">Zo&amp;annA S.R.L.</span>
            </div>
          </div>
          
          <nav className="flex space-x-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-semibold overflow-x-auto">
            <button onClick={() => setActiveTab('nuovo')} className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'nuovo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>📝 Nuovo Inserimento</button>
            <button onClick={() => setActiveTab('programmati')} className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1 ${activeTab === 'programmati' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>
              <span>⏳ Gestione Attività</span>
              {daConfermare.length > 0 && <span className="bg-amber-400 text-slate-950 font-bold px-1.5 rounded-full text-[10px]">{daConfermare.length}</span>}
            </button>
            <button onClick={() => setActiveTab('documenti')} className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'documenti' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>📂 Documenti Cloud</button>
            {currentUser.ruolo === 'admin' && (
              <>
                <button onClick={() => setActiveTab('cruscotto')} className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'cruscotto' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>📊 Cruscotto</button>
                <button onClick={() => setActiveTab('report')} className={`px-3 py-2 rounded-xl transition-all whitespace-nowrap ${activeTab === 'report' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>⚡ Performance</button>
                <a href="/preventivi" className="px-3 py-2 rounded-xl bg-sky-100 text-sky-800 font-bold whitespace-nowrap">💰 Preventivi</a>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-slate-700 font-semibold">👤 {currentUser.nome}</span>
            <button onClick={handleLogout} className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded-lg font-bold">Esci</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* TAB 1: NUOVO INSERIMENTO */}
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

        {/* TAB 2: GESTIONE ATTIVITÀ */}
        {activeTab === 'programmati' && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80 overflow-hidden">
            <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Gestione Attività</h2>
                <p className="text-xs text-slate-300 mt-0.5">Sincronizzazione Automatica Attiva 🔄</p>
              </div>
            </div>

            <div className="p-6">
              {loadingProgrammati ? (
                <p className="text-center text-slate-500 py-8 text-sm">Caricamento in corso...</p>
              ) : attivitaPianificateAttive.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <span className="text-4xl block mb-2">🎉</span>
                  <p className="text-sm font-medium">Nessuna attività in sospeso per i filtri selezionati!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Array.from(new Set(attivitaPianificateAttive.map(e => e.dipendente || 'Da Assegnare'))).map(dipNome => {
                    const attivitaDip = attivitaPianificateAttive.filter(e => (e.dipendente || 'Da Assegnare') === dipNome);
                    const inRitardo = attivitaDip.filter(e => getNormalizedDate(e.data) < todayStr);
                    const oggi = attivitaDip.filter(e => getNormalizedDate(e.data) === todayStr);
                    const future = attivitaDip.filter(e => getNormalizedDate(e.data) > todayStr);

                    return (
                      <div key={dipNome} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-slate-100 px-4 py-3 flex items-center justify-between border-b border-slate-200">
                          <h3 className={`font-bold text-base flex items-center gap-2 ${dipNome === 'Da Assegnare' ? 'text-indigo-600' : 'text-slate-800'}`}>
                            <span>{dipNome === 'Da Assegnare' ? '❓' : '👤'}</span> {dipNome}
                          </h3>
                          <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-lg border">{attivitaDip.length} attive</span>
                        </div>

                        <div className="p-4 space-y-4 bg-white">
                          {inRitardo.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-bold text-rose-600 uppercase mb-2 border-b border-rose-100 pb-1">🚨 Da Consuntivare (Scadute)</h4>
                              <div className="space-y-2">{inRitardo.map(item => renderRigaAttivita(item, 'rose'))}</div>
                            </div>
                          )}
                          {oggi.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-bold text-amber-600 uppercase mb-2 border-b border-amber-100 pb-1">⏳ In programma Oggi</h4>
                              <div className="space-y-2">{oggi.map(item => renderRigaAttivita(item, 'amber'))}</div>
                            </div>
                          )}
                          {future.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-bold text-sky-600 uppercase mb-2 border-b border-sky-100 pb-1">📅 Pianificate Future</h4>
                              <div className="space-y-2">{future.map(item => renderRigaAttivita(item, 'sky'))}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ESPLORATORE FILE E CARTELLE CON ACCESSO OSPITE SENZA CREDENZIALI */}
        {activeTab === 'documenti' && (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200/80 overflow-hidden space-y-6">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight">📂 Esploratore Documenti Cloud</h2>
                <p className="text-xs text-slate-300 mt-0.5">Consulta e scarica file Word, Excel e PDF in tempo reale senza dover inserire credenziali.</p>
              </div>
              <span className="text-2xl bg-white/10 p-2.5 rounded-2xl">☁️</span>
            </div>

            <div className="p-6 space-y-6">
              
              {/* BARRA DI NAVIGAZIONE E RICERCA */}
              <div className="space-y-3">
                <form onSubmit={handleCercaNextcloud} className="flex gap-2">
                  <input 
                    type="text" 
                    value={searchQueryNC} 
                    onChange={e => setSearchQueryNC(e.target.value)} 
                    placeholder="Filtra / Cerca un file o una commessa (es. ALSTOM)..." 
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

                {/* BREADCRUMB PERCORSO */}
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

              {errorNC && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                  ⚠️ {errorNC}
                </div>
              )}

              {/* LISTA FILE E CARTELLE CON DOPPIO PULSANTE SENZA LOGIN */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-400 border-b pb-2">
                  <span>{isSearchMode ? `Risultati Ricerca (${risultatiNC.length})` : `Contenuto Cartella (${risultatiNC.length})`}</span>
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
                                {/* PULSANTE 1: VISUALIZZA IN ANTEPRIMA WEB SENZA CREDENZIALI */}
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

                                {/* PULSANTE 2: DOWNLOAD DIRETTO SUL PROPRIO DISPOSITIVO */}
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
