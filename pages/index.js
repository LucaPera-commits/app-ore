import { useState, useEffect } from 'react';
import Head from 'next/head';

// --- COMPONENTI LOGHI VETTORIALI AD ALTA DEFINIZIONE ---
const LogoBW = ({ className = "h-10" }) => (
  <div className={`flex items-center ${className}`}>
    <svg viewBox="0 0 240 150" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Punto arancione del logo bw */}
      <circle cx="24" cy="132" r="11" fill="#F99F48" />
      {/* Tratto vettoriale della "bw" */}
      <path 
        d="M 20 128 C 38 75, 75 30, 105 14 C 112 10, 118 16, 114 24 C 95 60, 75 100, 72 106 C 85 80, 105 55, 125 55 C 138 55, 148 70, 150 90 C 160 65, 180 16, 210 14 C 228 12, 230 36, 205 85 C 180 135, 150 115, 120 85 C 100 65, 90 85, 80 110" 
        stroke="#1E293B" 
        strokeWidth="13" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Testo bw solutions */}
      <text x="52" y="142" fontFamily="'Inter', system-ui, sans-serif" fontWeight="500" fontSize="28" fill="#1E293B" letterSpacing="-0.5">bw solutions</text>
    </svg>
  </div>
);

const LogoZoeAnna = ({ className = "h-8" }) => (
  <div className={`flex items-center ${className}`}>
    <svg viewBox="0 0 280 140" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Foglia Superiore Verde */}
      <path d="M 90 60 C 90 15, 180 10, 205 55 C 160 25, 110 40, 90 60 Z" fill="#22C55E"/>
      <path d="M 110 55 C 130 30, 170 25, 200 45 C 160 28, 125 40, 110 55 Z" fill="#16A34A"/>
      {/* Foglia Inferiore Rossa */}
      <path d="M 190 80 C 190 125, 100 130, 75 85 C 120 115, 170 100, 190 80 Z" fill="#EF4444"/>
      <path d="M 170 85 C 150 110, 110 115, 80 95 C 120 112, 155 100, 170 85 Z" fill="#DC2626"/>
      {/* Testo Zo&annA S.R.L */}
      <text x="140" y="78" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="bold" fontSize="28" fill="#0F172A">Zo&amp;annA S.R.L</text>
    </svg>
  </div>
);

// --- CONFIGURAZIONE UTENTI E PASSWORD ---
const UTENTI = {
  'luca': { nome: 'Luca Pera', pass: 'luca123', ruolo: 'admin' },
  'giampaolo': { nome: 'Giampaolo Lauro', pass: 'giampaolo123', ruolo: 'user' },
  'federico': { nome: 'Federico Boagno', pass: 'federico123', ruolo: 'user' },
  'alessandro': { nome: 'Alessandro Ciule', pass: 'alessandro123', ruolo: 'user' },
  'davide': { nome: 'Davide Procopio', pass: 'davide123', ruolo: 'user' }
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
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  useEffect(() => {
    const saved = localStorage.getItem('bw_user');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = UTENTI[loginForm.username.toLowerCase().trim()];
    if (user && user.pass === loginForm.password) {
      setCurrentUser(user);
      localStorage.setItem('bw_user', JSON.stringify(user));
      setFormData(prev => ({ ...prev, dipendente: user.nome }));
    } else {
      alert("Credenziali non valide! Verifica utente e password.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bw_user');
    setLoginForm({ username: '', password: '' });
  };

  const [activeTab, setActiveTab] = useState('nuovo');
  
  const getTodayStr = () => new Date().toISOString().split('T')[0];
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

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({ ...prev, dipendente: currentUser.nome }));
    }
  }, [currentUser]);

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [programmati, setProgrammati] = useState([]);
  const [storicoCompleto, setStoricoCompleto] = useState([]);
  const [loadingProgrammati, setLoadingProgrammati] = useState(false);
  const [filtroDipendente, setFiltroDipendente] = useState('Tutti');

  const [modalItem, setModalItem] = useState(null);
  const [oreEffettive, setOreEffettive] = useState(8);
  const [oreBackofficeEffettive, setOreBackofficeEffettive] = useState(0);
  const [oreTrasfertaEffettive, setOreTrasfertaEffettive] = useState(0);

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
      
      if (currentUser?.ruolo === 'admin') {
        const resAll = await fetch('/api/gestisci?mode=all');
        if (resAll.ok) setStoricoCompleto(await resAll.json());
      }
    } catch (e) { console.error(e); } 
    finally { setLoadingProgrammati(false); }
  };

  useEffect(() => {
    if (currentUser) fetchProgrammati();
  }, [activeTab, currentUser]);

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
    } catch (err) { setStatusMessage({ type: 'error', text: 'Errore di connessione al server.' }); } 
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
          ore_effettive: oreEffettive, ore_backoffice: oreBackofficeEffettive, ore_trasferta: oreTrasfertaEffettive
        })
      });
      if (res.ok) { setModalItem(null); fetchProgrammati(); }
    } catch (e) { alert("Errore durante il salvataggio."); } 
    finally { setLoading(false); }
  };

  const handleElimina = async (item) => {
    if (!confirm(`Sei sicuro di voler annullare l'attività per "${item.cliente}"?`)) return;
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

  // --- SCHERMATA LOGIN ELEGANTE ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
        
        {/* Elementi Decorativi di Sfondo */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md relative z-10">
          
          {/* Card Glassmorphic */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-6">
            
            {/* LOGHI PRINCIPALI */}
            <div className="flex flex-col items-center text-center space-y-4 pb-2 border-b border-slate-800/80">
              
              {/* Logo BW Solutions */}
              <div className="bg-white px-6 py-3 rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
                <LogoBW className="h-12" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Gestionale Ore &amp; Attività</h1>
                <p className="text-xs text-slate-400 mt-1">Accedi al portale per la consuntivazione delle ore</p>
              </div>
            </div>

            {/* FORM DI LOGIN */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Utente</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm">👤</span>
                  <input 
                    type="text" 
                    required 
                    value={loginForm.username} 
                    onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} 
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" 
                    placeholder="Es. luca" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 text-sm">🔒</span>
                  <input 
                    type="password" 
                    required 
                    value={loginForm.password} 
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} 
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-sky-600/25 transition-all text-sm mt-2"
              >
                Accedi al Portale ➔
              </button>
            </form>

            {/* LOGO PARENT ZO&ANNA */}
            <div className="pt-2 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-1.5">Azienda Licenziataria</span>
              <div className="bg-white/95 px-4 py-2 rounded-xl shadow-inner border border-white/20">
                <LogoZoeAnna className="h-7" />
              </div>
            </div>

          </div>

          <p className="text-center text-[11px] text-slate-600 mt-6">
            © {new Date().getFullYear()} bw solutions • Powered by Zo&amp;annA S.R.L.
          </p>
        </div>
      </div>
    );
  }

  const isAlessandro = formData.dipendente === 'Alessandro Ciule';
  const dipendenteFiltro = currentUser.ruolo === 'admin' ? filtroDipendente : currentUser.nome;
  const eventiFiltrati = dipendenteFiltro === 'Tutti' ? programmati : programmati.filter(p => p.dipendente === dipendenteFiltro);
  
  const daConfermare = eventiFiltrati.filter(p => p.data <= getTodayStr());
  const futuri = eventiFiltrati.filter(p => p.data > getTodayStr());
  
  const ieriStr = getYesterdayStr();
  const attivitaInScadenzaRitardo = programmati.filter(p => 
    (currentUser.ruolo === 'admin' || p.dipendente === currentUser.nome) && 
    p.stato === 'pianificato' && 
    p.data < ieriStr
  );

  const listaDipendenti = Object.values(UTENTI).map(u => u.nome);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <Head>
        <title>Gestionale Ore | bw solutions</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <datalist id="lista-aziende">
        {LISTA_CLIENTI.map((azienda, index) => (
          <option key={index} value={azienda} />
        ))}
      </datalist>

      {/* HEADER PRINCIPALE DELL'APP */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* BRANDING DUAL-LOGO */}
          <div className="flex items-center space-x-3">
            <div className="bg-white px-3 py-1 rounded-xl shadow-sm">
              <LogoBW className="h-7" />
            </div>
            <div className="hidden sm:block h-6 w-px bg-slate-800"></div>
            <div className="hidden sm:block bg-white/95 px-2.5 py-1 rounded-lg">
              <LogoZoeAnna className="h-5" />
            </div>
          </div>
          
          {/* MENU DI NAVIGAZIONE */}
          <nav className="flex space-x-1 bg-slate-800/90 p-1 rounded-2xl border border-slate-700/60 text-xs font-semibold">
            <button onClick={() => setActiveTab('nuovo')} className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'nuovo' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'}`}>
              📝 Nuovo Inserimento
            </button>
            <button onClick={() => setActiveTab('programmati')} className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${activeTab === 'programmati' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'}`}>
              <span>⏳ Gestione Attività</span>
              {daConfermare.length > 0 && (
                <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                  {daConfermare.length}
                </span>
              )}
            </button>

            {currentUser.ruolo === 'admin' && (
              <button onClick={() => setActiveTab('report')} className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'report' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'}`}>
                📊 Performance &amp; Report
              </button>
            )}
          </nav>

          {/* BADGE UTENTE LOGGATO */}
          <div className="flex items-center space-x-3 text-xs bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
            <span className="text-slate-200 font-medium">👤 {currentUser.nome}</span>
            <button onClick={handleLogout} className="bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white px-2 py-0.5 rounded-lg transition-all font-semibold">
              Esci
            </button>
          </div>

        </div>
      </header>

      {/* BANNER NOTIFICA RITARDI (>24 ORE) */}
      {attivitaInScadenzaRitardo.length > 0 && (
        <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white text-xs font-semibold px-4 py-3 shadow-md border-b border-rose-800">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-base">🚨</span>
              <span><strong>SOLLECITO CONSUNTIVAZIONE:</strong> Ci sono <strong>{attivitaInScadenzaRitardo.length}</strong> attività concluse da oltre 24 ore in attesa di conferma!</span>
            </div>
            <button onClick={() => setActiveTab('programmati')} className="bg-white text-rose-800 px-3 py-1 rounded-xl text-xs font-bold shadow hover:bg-rose-50 transition-all">
              Vedi Attività ➔
            </button>
          </div>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* TAB 1: NUOVO INSERIMENTO */}
        {activeTab === 'nuovo' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Nuova Registrazione</h2>
                <p className="text-xs text-slate-300 mt-0.5">Inserisci le ore lavorate o pianifica un evento futuro.</p>
              </div>
              <span className="text-3xl bg-white/10 p-2.5 rounded-2xl backdrop-blur-md">📅</span>
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
              
              <button type="submit" disabled={loading} className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg transition-all ${formData.stato === 'pianificato' ? 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/20' : 'bg-gradient-to-r from-sky-600 to-blue-700 shadow-sky-600/20'}`}>
                {loading ? 'Salvataggio in corso...' : (formData.stato === 'pianificato' ? 'Pianifica Evento ⏳' : 'Salva Consuntivo 🚀')}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: GESTIONE ATTIVITÀ */}
        {activeTab === 'programmati' && (
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-6 flex items-center justify-between text-white">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Gestione Attività</h2>
                <p className="text-xs text-slate-300 mt-0.5">Conferma o modifica le ore dei lavori pianificati.</p>
              </div>
              <div className="flex space-x-3">
                {currentUser.ruolo === 'admin' && (
                  <select value={filtroDipendente} onChange={e => setFiltroDipendente(e.target.value)} className="bg-white/10 text-white text-xs px-3 py-1.5 rounded-xl border border-white/20 font-medium">
                    {['Tutti', ...listaDipendenti].map(d => <option key={d} value={d} className="text-black">{d}</option>)}
                  </select>
                )}
                <button onClick={fetchProgrammati} className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-xl border border-white/20 font-medium">🔄 Aggiorna</button>
              </div>
            </div>

            <div className="p-6">
              {loadingProgrammati ? <p className="text-center text-slate-500 py-8 text-sm">Caricamento in corso...</p> : programmati.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <span className="text-4xl block mb-2">🎉</span>
                  <p className="text-sm font-medium">Nessuna attività in sospeso!</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {daConfermare.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-3 flex items-center">🚨 Da Consuntivare (In Attesa)</h3>
                      <div className="space-y-3">
                        {daConfermare.map(item => {
                          const isInRitardo = item.data < ieriStr;
                          return (
                            <div key={item.id} className={`p-4 rounded-2xl border flex flex-col md:flex-row justify-between gap-4 transition-all ${isInRitardo ? 'bg-rose-50/80 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">{item.data}</span>
                                  {isInRitardo && <span className="text-[10px] bg-rose-600 text-white px-2 py-0.5 rounded-md font-bold uppercase">SCADUTO (&gt;24h)</span>}
                                  <span className="text-xs font-semibold text-sky-700">{item.dipendente}</span>
                                </div>
                                <h3 className="font-bold text-slate-900 text-base">{item.cliente}</h3>
                                <p className="text-xs text-slate-600 font-medium">{item.progetto} — <b className="text-slate-800">{item.ore}h previste</b></p>
                              </div>
                              <div className="flex space-x-2 items-center">
                                <button onClick={() => { setModalItem(item); setOreEffettive(item.ore || 8); setOreBackofficeEffettive(item.ore_backoffice || 0); setOreTrasfertaEffettive(item.ore_trasferta || 0); }} className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all">✅ Conferma Ore</button>
                                <button onClick={() => handleElimina(item)} className="px-3 py-2 bg-white text-rose-600 border border-rose-200 text-xs font-bold rounded-xl hover:bg-rose-50 transition-all">🗑️ Annulla</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {futuri.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-3 flex items-center">⏳ Programmati per il Futuro</h3>
                      <div className="space-y-3">
                        {futuri.map(item => (
                          <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex justify-between gap-4">
                            <div>
                              <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-lg mr-2">{item.data}</span>
                              <span className="text-xs font-semibold text-slate-700">{item.dipendente}</span>
                              <h3 className="font-bold text-slate-900 text-base">{item.cliente}</h3>
                              <p className="text-xs text-slate-600 font-medium">{item.progetto}</p>
                            </div>
                            <button onClick={() => handleElimina(item)} className="px-3 py-2 bg-white text-rose-600 border border-rose-200 text-xs font-bold rounded-xl hover:bg-rose-50 transition-all">🗑️ Annulla</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: PERFORMANCE & REPORT (ADMIN LUCA) */}
        {activeTab === 'report' && currentUser.ruolo === 'admin' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Performance &amp; Riepilogo Team</h2>
                  <p className="text-xs text-slate-300 mt-0.5">Valuta la tempestività di consuntivazione e il carico ore per dipendente.</p>
                </div>
                <button onClick={fetchProgrammati} className="text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 font-medium">🔄 Aggiorna</button>
              </div>

              <div className="p-6 space-y-6">
                {listaDipendenti.map(nomeDip => {
                  const attivitaDip = storicoCompleto.filter(s => s.dipendente === nomeDip);
                  const consuntivate = attivitaDip.filter(s => s.stato === 'consuntivo');
                  const inRitardoScadute = attivitaDip.filter(s => s.stato === 'pianificato' && s.data < ieriStr);

                  const totaleRilevante = consuntivate.length + inRitardoScadute.length;
                  const indiceReattivita = totaleRilevante > 0 
                    ? Math.round((consuntivate.length / totaleRilevante) * 100) 
                    : 100;

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
                          <p className="text-[10px] font-bold uppercase text-slate-400">Ore Svolte</p>
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
                          <p className={`text-lg font-bold ${inRitardoScadute.length > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {inRitardoScadute.length}
                          </p>
                        </div>
                      </div>

                      {inRitardoScadute.length > 0 && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                          🚨 <strong>{inRitardoScadute.length}</strong> interventi in ritardo non ancora consuntivati oltre il limite di 24 ore.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TABELLA STORICO COMPLETO */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Storico Dettagliato Attività</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase">
                      <th className="py-3 px-2">Data</th>
                      <th className="py-3 px-2">Tecnico</th>
                      <th className="py-3 px-2">Cliente</th>
                      <th className="py-3 px-2">Commessa</th>
                      <th className="py-3 px-2 text-center">Ore</th>
                      <th className="py-3 px-2 text-center">Stato</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {storicoCompleto.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-2 font-semibold">{item.data}</td>
                        <td className="py-3 px-2 font-medium text-slate-700">{item.dipendente}</td>
                        <td className="py-3 px-2 font-bold text-slate-900">{item.cliente}</td>
                        <td className="py-3 px-2 text-slate-600">{item.progetto}</td>
                        <td className="py-3 px-2 text-center font-bold text-slate-800">{item.ore}h</td>
                        <td className="py-3 px-2 text-center">
                          {item.stato === 'consuntivo' ? (
                            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold">Chiuso ✅</span>
                          ) : item.data < ieriStr ? (
                            <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full font-bold">Scaduto 🚨</span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">Pianificato ⏳</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODALE CONFERMA CHIUSURA */}
      {modalItem && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Conferma Consuntivo</h3>
            <p className="text-xs text-slate-500">
              Stai completando l'attività per <strong className="text-slate-800">{modalItem.cliente}</strong> ({modalItem.progetto}).
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Ore Lavorate</label>
                <input type="number" step="0.5" value={oreEffettive} onChange={e => setOreEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-sm font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-sky-600 mb-1 uppercase">Ore Backoffice</label>
                <input type="number" step="0.5" value={oreBackofficeEffettive} onChange={e => setOreBackofficeEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-sky-50 border-sky-200 text-sm font-bold text-sky-800" />
              </div>
              {modalItem.dipendente === 'Alessandro Ciule' && (
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-purple-600 mb-1 uppercase">🚗 Ore Trasferta</label>
                  <input type="number" step="0.5" value={oreTrasfertaEffettive} onChange={e => setOreTrasfertaEffettive(parseFloat(e.target.value))} className="w-full px-3 py-2 border rounded-xl bg-purple-50 border-purple-200 text-sm font-bold text-purple-800" />
                </div>
              )}
            </div>

            <div className="flex space-x-2 pt-2">
              <button onClick={() => setModalItem(null)} className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">Annulla</button>
              <button onClick={handleConfermaChiudi} disabled={loading} className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all">{loading ? '...' : 'Conferma e Salva ✅'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
