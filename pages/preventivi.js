import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const UTENTI = {
  'luca': { nome: 'Luca Pera', pass: '!luca123?', ruolo: 'admin' },
  'giampaolo': { nome: 'Giampaolo Lauro', pass: '!giampaolo123?', ruolo: 'user' },
  'federico': { nome: 'Federico Boagno', pass: '!federico123?', ruolo: 'user' },
  'alessandro': { nome: 'Alessandro Ciule', pass: '!alessandro123?', ruolo: 'user' },
  'davide': { nome: 'Davide Procopio', pass: '!davide123?', ruolo: 'user' },
  'agente': { nome: 'Commerciale Esterno', pass: '!agente123?', ruolo: 'sales' }
};

export default function GeneratorePreventiviPro() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('missione'); 
  // Tabs: 'missione' | 'procedure' | 'consulenza' | 'dashboard'

  useEffect(() => {
    const saved = localStorage.getItem('bw_user');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  // ==========================================
  // 1. STATO: DATI GENERALI E MISSIONE
  // ==========================================
  const [datiGen, setDatiGen] = useState({
    cliente: '', indirizzo: '', dataPreventivo: new Date().toISOString().split('T')[0], rifOfferta: '', descProgetto: ''
  });

  const [missione, setMissione] = useState({
    distanzaKm: 190, costoKmVendita: 0.50, costoKmReale: 0.30,
    oreViaggio: 4, mdoVenditaViaggio: 0, mdoRealeViaggio: 0,
    autostrada: 20, ricaricoAutostrada: 0.25,
    giornate: 3, orePresenza: 28, mdoVendita: 60, mdoReale: 34,
    albergoVendita: 80, albergoReale: 75,
    pastiVendita: 20, pastiReale: 20,
    trasfertaVendita: 40, trasfertaReale: 30,
    commercialeAttivo: false
  });

  const [patentini, setPatentini] = useState([
    { id: 1, attivo: true, tipo: 'BW', nome: 'Saldatore 1', materiale: 'S275', spessore: 12, diametro: '114', rx: true },
    { id: 2, attivo: true, tipo: 'FW', nome: 'Saldatore 2', materiale: 'S355', spessore: 6, diametro: '', rx: false }
  ]);

  // ==========================================
  // 2. STATO: PROCEDURE DI SALDATURA
  // ==========================================
  const [procAcciaio, setProcAcciaio] = useState([
    { id: 1, attivo: true, giunto: 'FW sl Piastra', processo: '135', spessore: 15, materiale: 'AISI 304', 
      prove: { vt: { q:1, p:53 }, rx: { q:0, p:65 }, pt: { q:1, p:71 }, traz: { q:0, p:76 }, pieg: { q:0, p:45.5 }, res: { q:0, p:125 }, dur: { q:0, p:71 }, macro: { q:2, p:87 } }
    }
  ]);
  const [procAlluminio, setProcAlluminio] = useState([]);

  // ==========================================
  // 3. STATO: CONSULENZA
  // ==========================================
  const [consulenza, setConsulenza] = useState({
    consulente: 'Luca Pera', tipoAttivita: 'Redazione documentazione di sistema',
    giorniMese: 0, mesiAttivita: 0, oreGiorno: 8,
    km: 0, autostrada: 0, pernotto: 0, pasti: 0
  });

  const [documenti, setDocumenti] = useState({
    iso9001: { nome: 'ISO 9001', attivo: false, base: 2500 },
    en3834: { nome: 'EN 3834', attivo: true, base: 2000 },
    en15085: { nome: 'EN 15085', attivo: false, base: 3000 },
    iso45001: { nome: 'UNI EN ISO 45001', attivo: false, base: 2000 },
    en1090: { nome: 'UNI EN 1090', attivo: true, base: 2500 }
  });

  const [prezzoOffertaCustom, setPrezzoOffertaCustom] = useState(0);

  // ==========================================
  // CALCOLI: MISSIONE
  // ==========================================
  const ricavoKm = missione.distanzaKm * missione.costoKmVendita * 2;
  const costoKm = missione.distanzaKm * missione.costoKmReale * 2;
  const ricavoOreViaggio = missione.oreViaggio * (missione.mdoVenditaViaggio || 0);
  const costoOreViaggio = missione.oreViaggio * (missione.mdoRealeViaggio || 0);
  const ricavoMDO = missione.orePresenza * missione.mdoVendita;
  const costoMDO = missione.orePresenza * missione.mdoReale;
  
  const nottiAlbergo = missione.giornate > 0 ? Math.max(0, Math.ceil(missione.giornate - 1)) : 0;
  const ricavoAlbergo = nottiAlbergo * missione.albergoVendita;
  const costoAlbergo = nottiAlbergo * missione.albergoReale;
  
  const ricavoPasti = missione.giornate * missione.pastiVendita;
  const costoPasti = missione.giornate * missione.pastiReale;
  
  const ggInteri = Math.ceil(missione.giornate);
  const ricavoTrasferta = ggInteri * missione.trasfertaVendita;
  const costoTrasferta = ggInteri * missione.trasfertaReale;
  
  const ricavoAutostrada = missione.autostrada * (1 + (missione.ricaricoAutostrada||0));
  const costoAutostrada = missione.autostrada;

  const totRicavoMissione = ricavoKm + ricavoOreViaggio + ricavoMDO + ricavoAlbergo + ricavoPasti + ricavoTrasferta + ricavoAutostrada;
  const totCostoMissione = costoKm + costoOreViaggio + costoMDO + costoAlbergo + costoPasti + costoTrasferta + costoAutostrada;

  // ==========================================
  // CALCOLI: PATENTINI
  // ==========================================
  let totRicavoPatentini = 0; let totCostoPatentini = 0; let numPatentiniAttivi = 0;
  patentini.forEach(p => {
    if (p.attivo) {
      numPatentiniAttivi++;
      let prezzoVendita = 87; let costoBase = 71; let costoRX = 0;
      if (p.tipo === 'BW' && p.rx) {
        costoRX = (parseFloat(p.diametro) <= 40 && parseFloat(p.spessore) <= 2) ? 95.5 : 67;
        prezzoVendita += Math.round(costoRX * 1.15);
      }
      totRicavoPatentini += prezzoVendita;
      totCostoPatentini += (costoBase + costoRX);
    }
  });

  // ==========================================
  // CALCOLI: PROCEDURE ACCIAIO & ALLUMINIO
  // ==========================================
  const scontoIIS = 0.15;
  let totRicavoProcAcciaio = 0; let totCostoProcAcciaio = 0;
  let totRicavoProcAlluminio = 0; let totCostoProcAlluminio = 0;

  procAcciaio.forEach(p => {
    if (p.attivo) {
      let ricavoProve = 0; let costoProve = 0;
      
      // Auto-Resilienza se spessore >= 12 e non è Inox (AISI)
      const reqResilienza = parseFloat(p.spessore) >= 12 && !p.materiale.toUpperCase().includes('AISI');
      const resQ = reqResilienza ? 3 : p.prove.res.q;

      Object.entries(p.prove).forEach(([key, val]) => {
        let q = key === 'res' ? resQ : val.q;
        ricavoProve += (q * val.p);
        costoProve += (q * val.p * (1 - scontoIIS));
      });
      totRicavoProcAcciaio += (ricavoProve + 270);
      totCostoProcAcciaio += (costoProve + 270); // Certificato costo netto 270
    }
  });

  procAlluminio.forEach(p => {
    if (p.attivo) {
      let ricavoProve = 0; let costoProve = 0;
      Object.entries(p.prove).forEach(([key, val]) => {
        ricavoProve += (val.q * val.p);
        costoProve += (val.q * val.p * (1 - scontoIIS));
      });
      totRicavoProcAlluminio += (ricavoProve + 255);
      totCostoProcAlluminio += (costoProve + 255);
    }
  });

  const totRicavoProcedure = totRicavoProcAcciaio + totRicavoProcAlluminio;
  const totCostoProcedure = totCostoProcAcciaio + totCostoProcAlluminio;

  const totaleRicaviCert = totRicavoMissione + totRicavoPatentini + totRicavoProcedure;
  const feeCommCert = missione.commercialeAttivo ? totaleRicaviCert * 0.05 : 0;
  const totaleCostiRealiCert = totCostoMissione + totCostoPatentini + totCostoProcedure + feeCommCert;

  // ==========================================
  // CALCOLI: CONSULENZA
  // ==========================================
  const docAttivi = Object.values(documenti).filter(d => d.attivo);
  let percScontoDoc = docAttivi.length >= 3 ? 0.08 : (docAttivi.length === 2 ? 0.05 : 0);
  
  let ricavoDoc = 0;
  docAttivi.forEach(d => ricavoDoc += (d.base * (1 - percScontoDoc)));

  const tariffeCons = { 'Coordinamento Saldatura': 75, 'Incollaggio EN 17460': 85, 'EN 3834': 65, 'Redazione documentazione di sistema': 65 };
  const tariffaVenditaCons = tariffeCons[consulenza.tipoAttivita] || 65;
  const costoInternoCons = consulenza.consulente === 'Luca Pera' ? 45 : 40;
  
  const oreConsulenza = consulenza.tipoAttivita === 'Redazione documentazione di sistema' 
    ? (ricavoDoc / tariffaVenditaCons) 
    : (consulenza.giorniMese * consulenza.mesiAttivita * consulenza.oreGiorno);

  const ricavoOreCons = consulenza.tipoAttivita === 'Redazione documentazione di sistema' ? 0 : (oreConsulenza * tariffaVenditaCons);
  const costoOreCons = oreConsulenza * costoInternoCons;

  const tariffaKmCons = consulenza.consulente === 'Luca Pera' ? 0.65 : 0.50;
  const ricavoRimborsi = (consulenza.km * tariffaKmCons) + consulenza.autostrada + (consulenza.pernotto * 85) + (consulenza.pasti * 30);
  const costoRimborsi = (consulenza.km * 0.30) + consulenza.autostrada + (consulenza.pernotto * 75) + (consulenza.pasti * 20);

  const totaleRicaviCons = ricavoOreCons + ricavoDoc + ricavoRimborsi;
  const feeCommCons = missione.commercialeAttivo ? (totaleRicaviCons * (consulenza.tipoAttivita === 'Redazione documentazione di sistema' ? 0.08 : 0.05)) : 0;
  const totaleCostiRealiCons = costoOreCons + costoRimborsi + feeCommCons;

  // ==========================================
  // TOTALI GLOBALI E DASHBOARD
  // ==========================================
  const totalePreventivoCalcolato = totaleRicaviCert + totaleRicaviCons;
  const totaleCostiGlobali = totaleCostiRealiCert + totaleCostiRealiCons;
  const prezzoOffertaFinale = prezzoOffertaCustom > 0 ? prezzoOffertaCustom : totalePreventivoCalcolato;
  const margineNettoGlobale = prezzoOffertaFinale - totaleCostiGlobali;
  const percMargineGlobale = prezzoOffertaFinale > 0 ? (margineNettoGlobale / prezzoOffertaFinale) : 0;

  // Break-Even Patentini
  const margineSingoloPatentino = 87 - 71; 
  const breakEvenPatentini = margineSingoloPatentino > 0 ? Math.ceil(totCostoMissione / margineSingoloPatentino) : 0;

  if (!currentUser) return <div className="p-10 text-center font-bold">Accesso Negato.</div>;
  const isAdmin = currentUser.ruolo === 'admin';
  const isSales = currentUser.ruolo === 'sales' || isAdmin;

  const renderScenari = () => {
    const scenari = [
      { nome: 'Minimo (A Costo)', val: totaleCostiGlobali, alert: '⚠️ Nessun margine' },
      { nome: 'Attuale', val: prezzoOffertaFinale, alert: percMargineGlobale >= 0 ? '✅ OK' : '❌ In perdita' },
      { nome: '+ 5% Margine', val: totaleCostiGlobali * 1.05, alert: '✅ Margine basso' },
      { nome: '+ 10% Margine', val: totaleCostiGlobali * 1.10, alert: '✅ Margine standard' },
      { nome: '+ 15% Margine', val: totaleCostiGlobali * 1.15, alert: '✅ Margine buono' }
    ];

    return (
      <div className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b pb-2 flex justify-between">
          <span>🔄 Simulazione Scenari (What-If)</span>
          <span className="text-xs font-normal text-slate-500">Trova il prezzo ottimale per l'offerta</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase">
                <th className="p-3 rounded-l-xl">Scenario</th>
                <th className="p-3">Prezzo Offerta</th>
                {isAdmin && <th className="p-3">Margine Netto €</th>}
                <th className="p-3">Margine %</th>
                <th className="p-3 rounded-r-xl">Valutazione</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scenari.map((s, i) => {
                const margEuro = s.val - totaleCostiGlobali;
                const margPerc = s.val > 0 ? (margEuro / s.val) : 0;
                return (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{s.nome}</td>
                    <td className="p-3 font-bold text-sky-700">€ {s.val.toFixed(2)}</td>
                    {isAdmin && <td className="p-3 font-semibold text-emerald-600">€ {margEuro.toFixed(2)}</td>}
                    <td className="p-3 font-bold">{(margPerc * 100).toFixed(1)}%</td>
                    <td className="p-3 font-medium">{s.alert}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-16">
      <Head>
        <title>Generatore Preventivi PRO | Zo&amp;annA S.R.L.</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="bg-sky-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow hover:bg-sky-500 transition-all">
              ⬅ App Ore
            </Link>
            <div>
              <h1 className="font-bold text-base leading-tight">Motore Preventivi <span className="text-sky-400">PRO</span></h1>
            </div>
          </div>

          <nav className="flex items-center space-x-1.5 bg-slate-800 p-1 rounded-2xl overflow-x-auto hide-scrollbar">
            {[
              { id: 'missione', icon: '📍', label: 'Dati & Missione' },
              { id: 'procedure', icon: '🔩', label: 'Procedure Saldatura' },
              { id: 'consulenza', icon: '🎯', label: 'Consulenza & Sistemi' },
              { id: 'dashboard', icon: '📊', label: 'Dashboard & Scenari' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* =========================================
            TAB 1: DATI & MISSIONE 
        ========================================= */}
        {activeTab === 'missione' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* ANAGRAFICA */}
              <div className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
                <h2 className="text-sm font-bold border-b pb-2">🏢 Dati Cliente</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nome Cliente</label>
                    <input type="text" value={datiGen.cliente} onChange={e => setDatiGen({...datiGen, cliente: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-sky-200" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Indirizzo</label>
                    <input type="text" value={datiGen.indirizzo} onChange={e => setDatiGen({...datiGen, indirizzo: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-sky-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Data Preventivo</label>
                    <input type="date" value={datiGen.dataPreventivo} onChange={e => setDatiGen({...datiGen, dataPreventivo: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Rif. Offerta</label>
                    <input type="text" value={datiGen.rifOfferta} onChange={e => setDatiGen({...datiGen, rifOfferta: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold outline-none" />
                  </div>
                </div>
              </div>

              {/* MISSIONE */}
              <div className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h2 className="text-sm font-bold">📍 Dati Missione &amp; Trasferta</h2>
                  <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded">Ricavo: € {totRicavoMissione.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Distanza A/R (km)</label>
                    <input type="number" value={missione.distanzaKm} onChange={e => setMissione({...missione, distanzaKm: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">€/Km (Vendita)</label>
                    <input type="number" step="0.1" value={missione.costoKmVendita} onChange={e => setMissione({...missione, costoKmVendita: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-sky-700" />
                  </div>
                  {isAdmin && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-rose-500 mb-1">€/Km (Reale)</label>
                      <input type="number" step="0.1" value={missione.costoKmReale} onChange={e => setMissione({...missione, costoKmReale: Number(e.target.value)})} className="w-full px-3 py-2 border border-rose-200 bg-rose-50 rounded-xl text-xs font-bold text-rose-700" />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Giornate (es. 1.5)</label>
                    <input type="number" step="0.5" value={missione.giornate} onChange={e => setMissione({...missione, giornate: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Ore Presenza</label>
                    <input type="number" value={missione.orePresenza} onChange={e => setMissione({...missione, orePresenza: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">MDO €/h (Vendita)</label>
                    <input type="number" value={missione.mdoVendita} onChange={e => setMissione({...missione, mdoVendita: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-sky-700" />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Autostrada €</label>
                    <input type="number" value={missione.autostrada} onChange={e => setMissione({...missione, autostrada: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">% Ricarico Auto.</label>
                    <input type="number" step="0.05" value={missione.ricaricoAutostrada} onChange={e => setMissione({...missione, ricaricoAutostrada: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
                  </div>
                </div>
              </div>
            </div>

            {/* PATENTINI */}
            <div className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-sm font-bold">👨‍🔧 Patentini Saldatori ({numPatentiniAttivi} attivi)</h2>
                <button onClick={() => setPatentini([...patentini, { id: Date.now(), attivo: true, tipo: 'FW', nome: `Saldatore ${patentini.length + 1}`, materiale: 'S275', spessore: 6, diametro: '', rx: false }])} className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg font-bold">
                  ➕ Aggiungi
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-bold">
                    <tr>
                      <th className="p-2">On</th>
                      <th className="p-2">Nominativo</th>
                      <th className="p-2">Giunto</th>
                      <th className="p-2">Materiale</th>
                      <th className="p-2">Spess. (mm)</th>
                      <th className="p-2">Diam. (mm)</th>
                      <th className="p-2">RX (Se BW)</th>
                      <th className="p-2 text-right">Vendita</th>
                      {isAdmin && <th className="p-2 text-right text-rose-500">Costo IIS</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patentini.map((p, idx) => {
                      let pzVendita = 87; let pzCosto = 71; let rxCost = 0;
                      if (p.tipo === 'BW' && p.rx) {
                        rxCost = (parseFloat(p.diametro) <= 40 && parseFloat(p.spessore) <= 2) ? 95.5 : 67;
                        pzVendita += Math.round(rxCost * 1.15);
                      }
                      return (
                        <tr key={p.id} className={p.attivo ? '' : 'opacity-40'}>
                          <td className="p-2"><input type="checkbox" checked={p.attivo} onChange={e => { const n=[...patentini]; n[idx].attivo=e.target.checked; setPatentini(n); }} /></td>
                          <td className="p-2"><input type="text" value={p.nome} onChange={e => { const n=[...patentini]; n[idx].nome=e.target.value; setPatentini(n); }} className="w-full border rounded px-2 py-1 bg-slate-50 font-bold" /></td>
                          <td className="p-2"><select value={p.tipo} onChange={e => { const n=[...patentini]; n[idx].tipo=e.target.value; setPatentini(n); }} className="border rounded px-2 py-1"><option>FW</option><option>BW</option></select></td>
                          <td className="p-2"><input type="text" value={p.materiale} onChange={e => { const n=[...patentini]; n[idx].materiale=e.target.value; setPatentini(n); }} className="w-20 border rounded px-2 py-1" /></td>
                          <td className="p-2"><input type="number" value={p.spessore} onChange={e => { const n=[...patentini]; n[idx].spessore=e.target.value; setPatentini(n); }} className="w-16 border rounded px-2 py-1" /></td>
                          <td className="p-2"><input type="number" value={p.diametro} onChange={e => { const n=[...patentini]; n[idx].diametro=e.target.value; setPatentini(n); }} className="w-16 border rounded px-2 py-1" /></td>
                          <td className="p-2">{p.tipo === 'BW' && <input type="checkbox" checked={p.rx} onChange={e => { const n=[...patentini]; n[idx].rx=e.target.checked; setPatentini(n); }} />}</td>
                          <td className="p-2 text-right font-bold text-sky-700">€ {pzVendita}</td>
                          {isAdmin && <td className="p-2 text-right font-bold text-rose-500">€ {pzCosto + rxCost}</td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================
            TAB 2: PROCEDURE DI SALDATURA 
        ========================================= */}
        {activeTab === 'procedure' && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs font-bold">
              💡 Nota: La Resilienza (3 provini) viene calcolata in automatico se lo spessore è ≥ 12mm e il materiale NON è Inox (AISI). 
              Lo sconto IIS del 15% è applicato ai costi di laboratorio.
            </div>

            {/* PROCEDURE ACCIAIO */}
            <div className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-sm font-bold flex items-center gap-2"><span>🔩</span> Procedure Acciaio</h2>
                <button onClick={() => setProcAcciaio([...procAcciaio, { id: Date.now(), attivo: true, giunto: 'FW sl Piastra', processo: '135', spessore: 4, materiale: 'S500MC', prove: { vt: { q:1, p:53 }, rx: { q:0, p:65 }, pt: { q:1, p:71 }, traz: { q:0, p:40 }, pieg: { q:0, p:45.5 }, res: { q:0, p:125 }, dur: { q:1, p:71 }, macro: { q:2, p:87 } } }])} className="bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-lg font-bold">➕ Aggiungi Procedura</button>
              </div>

              {procAcciaio.map((proc, pIdx) => {
                const reqRes = parseFloat(proc.spessore) >= 12 && !proc.materiale.toUpperCase().includes('AISI');
                let subTot = 270; let subCosto = 270;
                Object.entries(proc.prove).forEach(([k, v]) => {
                  let q = k === 'res' && reqRes ? 3 : v.q;
                  subTot += (q * v.p);
                  subCosto += (q * v.p * 0.85);
                });

                return (
                  <div key={proc.id} className={`border rounded-2xl p-4 ${proc.attivo ? 'bg-slate-50' : 'bg-slate-100 opacity-60'}`}>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <input type="checkbox" checked={proc.attivo} onChange={e => { const n=[...procAcciaio]; n[pIdx].attivo=e.target.checked; setProcAcciaio(n); }} className="w-5 h-5 text-sky-600 rounded" />
                      <input type="text" value={proc.giunto} onChange={e => { const n=[...procAcciaio]; n[pIdx].giunto=e.target.value; setProcAcciaio(n); }} className="border px-2 py-1 rounded text-xs font-bold w-32" placeholder="Giunto" />
                      <input type="text" value={proc.processo} onChange={e => { const n=[...procAcciaio]; n[pIdx].processo=e.target.value; setProcAcciaio(n); }} className="border px-2 py-1 rounded text-xs w-20" placeholder="Processo" />
                      <input type="number" value={proc.spessore} onChange={e => { const n=[...procAcciaio]; n[pIdx].spessore=e.target.value; setProcAcciaio(n); }} className="border px-2 py-1 rounded text-xs w-16" placeholder="Spess (mm)" />
                      <input type="text" value={proc.materiale} onChange={e => { const n=[...procAcciaio]; n[pIdx].materiale=e.target.value; setProcAcciaio(n); }} className="border px-2 py-1 rounded text-xs w-24" placeholder="Materiale" />
                      
                      <div className="ml-auto text-right">
                        <div className="text-[10px] font-bold text-slate-400">TOT. VENDITA</div>
                        <div className="text-sm font-black text-sky-700">€ {subTot.toFixed(2)}</div>
                      </div>
                      {isAdmin && (
                        <div className="text-right pl-4 border-l border-slate-200">
                          <div className="text-[10px] font-bold text-rose-400">COSTO REALE</div>
                          <div className="text-sm font-black text-rose-600">€ {subCosto.toFixed(2)}</div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {Object.entries(proc.prove).map(([k, v]) => {
                        const labels = { vt: 'VT', rx: 'RX', pt: 'PT', traz: 'Traz.', pieg: 'Pieg.', res: 'Resil.', dur: 'Durez.', macro: 'Macro' };
                        const isRes = k === 'res';
                        return (
                          <div key={k} className={`p-2 border rounded-xl text-center ${isRes && reqRes ? 'bg-amber-100 border-amber-300' : 'bg-white'}`}>
                            <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">{labels[k]} (€{v.p})</label>
                            <input type="number" value={isRes && reqRes ? 3 : v.q} readOnly={isRes && reqRes} onChange={e => { const n=[...procAcciaio]; n[pIdx].prove[k].q=Number(e.target.value); setProcAcciaio(n); }} className="w-full text-center border-b outline-none text-xs font-bold bg-transparent" />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 3: CONSULENZA & SISTEMI 
        ========================================= */}
        {activeTab === 'consulenza' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
                <h2 className="text-sm font-bold border-b pb-2">🎯 Parametri Consulenza</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Consulente Assegnato</label>
                    <select value={consulenza.consulente} onChange={e => setConsulenza({...consulenza, consulente: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold">
                      <option>Luca Pera</option>
                      <option>Federico Boagno</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Tipo Attività</label>
                    <select value={consulenza.tipoAttivita} onChange={e => setConsulenza({...consulenza, tipoAttivita: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold">
                      <option>Redazione documentazione di sistema</option>
                      <option>Coordinamento Saldatura</option>
                      <option>Incollaggio EN 17460</option>
                      <option>EN 3834</option>
                    </select>
                  </div>
                  
                  {consulenza.tipoAttivita !== 'Redazione documentazione di sistema' && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t mt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Gg/Mese</label>
                        <input type="number" value={consulenza.giorniMese} onChange={e => setConsulenza({...consulenza, giorniMese: Number(e.target.value)})} className="w-full px-2 py-1 border rounded text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Mesi</label>
                        <input type="number" value={consulenza.mesiAttivita} onChange={e => setConsulenza({...consulenza, mesiAttivita: Number(e.target.value)})} className="w-full px-2 py-1 border rounded text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Ore/Gg</label>
                        <input type="number" value={consulenza.oreGiorno} onChange={e => setConsulenza({...consulenza, oreGiorno: Number(e.target.value)})} className="w-full px-2 py-1 border rounded text-xs" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
                <h2 className="text-sm font-bold border-b pb-2 flex justify-between">
                  <span>📄 Pacchetti Documentali</span>
                  {percScontoDoc > 0 && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 rounded-lg py-0.5">Sconto {percScontoDoc*100}% attivo</span>}
                </h2>
                <div className="space-y-2">
                  {Object.entries(documenti).map(([k, d]) => (
                    <label key={k} className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-all ${d.attivo ? 'bg-sky-50 border-sky-300' : 'bg-slate-50 hover:bg-slate-100'}`}>
                      <span className="text-xs font-bold text-slate-700">{d.nome}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-400">€ {d.base}</span>
                        <input type="checkbox" checked={d.attivo} onChange={e => { const n={...documenti}; n[k].attivo=e.target.checked; setDocumenti(n); }} className="w-4 h-4 text-sky-600 rounded" />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================
            TAB 4: DASHBOARD & SCENARI 
        ========================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="border-b border-slate-700 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📊</span> Sintesi Economica Totale
                </h2>
                <p className="text-xs text-slate-400">Offerta n. {datiGen.rifOfferta} - {datiGen.cliente}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="space-y-3">
                  <h3 className="text-[10px] uppercase font-bold text-slate-400">Ripartizione Ricavi a Cliente</h3>
                  <div className="bg-slate-800 rounded-xl p-3 text-xs space-y-2 font-medium text-slate-300">
                    <div className="flex justify-between"><span>Missione/Viaggio</span> <span>€ {totRicavoMissione.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Patentini Sald.</span> <span>€ {totRicavoPatentini.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Proc. Saldatura</span> <span>€ {totRicavoProcedure.toFixed(2)}</span></div>
                    <div className="flex justify-between border-t border-slate-700 pt-2 text-sky-400 font-bold">
                      <span>TOT. OFFERTA CALCOLATA</span> <span>€ {totalePreventivoCalcolato.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {isAdmin ? (
                  <div className="space-y-3">
                    <h3 className="text-[10px] uppercase font-bold text-rose-400">Costi Reali Aziendali</h3>
                    <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-3 text-xs space-y-2 font-medium text-rose-300/80">
                      <div className="flex justify-between"><span>Costi Trasferte (Reali)</span> <span>€ {totCostoMissione.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Certificati (netto IIS)</span> <span>€ {totCostoPatentini.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Prove Laboratorio (-15%)</span> <span>€ {totCostoProcedure.toFixed(2)}</span></div>
                      <div className="flex justify-between border-t border-rose-900/50 pt-2 text-rose-400 font-bold">
                        <span>TOT. COSTI REALI</span> <span>€ {totaleCostiGlobali.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-[10px] uppercase font-bold text-slate-400">Validazione</h3>
                    <div className="bg-slate-800 rounded-xl p-4 text-center">
                      <div className="text-4xl mb-2">{percMargineGlobale >= 0 ? '✅' : '❌'}</div>
                      <div className="text-xs font-bold text-white">{percMargineGlobale >= 0 ? 'Offerta in utile' : 'Offerta in perdita'}</div>
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] uppercase font-bold text-emerald-400">Analisi Marginalità</h3>
                    <div className="bg-emerald-950/40 border border-emerald-900/60 rounded-xl p-4 text-center flex flex-col justify-center h-full">
                      <span className="text-[11px] font-medium text-emerald-400/80 mb-1">MARGINE REALE NETTO</span>
                      <span className="text-3xl font-black text-emerald-400 mb-1">€ {margineNettoGlobale.toFixed(2)}</span>
                      <span className="text-sm font-bold text-emerald-500 bg-emerald-950/60 mx-auto px-3 py-1 rounded-full">
                        {(percMargineGlobale * 100).toFixed(1)} %
                      </span>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* WHAT-IF SCENARI */}
            {renderScenari()}

            {/* BREAK-EVEN */}
            {isAdmin && (
              <div className="bg-white rounded-3xl p-6 shadow-md border flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">📍 Break-Even Analysis (Saldatura)</h3>
                  <p className="text-xs text-slate-500">Patentini minimi da vendere per assorbire i costi fissi di missione.</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-600">{breakEvenPatentini}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">Patentini</span>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
