import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function GeneratorePreventiviPro() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('missione'); 
  // Tabs: 'missione' | 'procedure' | 'consulenza' | 'dashboard' | 'archivio'

  const [archivio, setArchivio] = useState([]);
  const [loadingDb, setLoadingDb] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bw_user');
    if (saved) setCurrentUser(JSON.parse(saved));
    fetchArchivio();
  }, []);

  const fetchArchivio = async () => {
    try {
      const res = await fetch('/api/preventivi');
      if (res.ok) setArchivio(await res.json());
    } catch (e) { console.error(e); }
  };

  // ==========================================
  // STATI: PARAMETRI GLOBALI MODIFICABILI (Novità!)
  // ==========================================
  const [parametri, setParametri] = useState({
    scontoIIS: 0.15,
    costoCertificatoAcciaio: 270,
    costoCertificatoAlluminio: 255,
    costoBasePatentinoIIS: 71,
    prezzoBasePatentinoCliente: 87,
    feeCommercialePatentini: 0.05,
    feeCommercialeSistemi: 0.08
  });

  const [datiGen, setDatiGen] = useState({
    id: null, cliente: '', indirizzo: '', dataPreventivo: new Date().toISOString().split('T')[0], rifOfferta: '', descProgetto: '', stato: 'Bozza'
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

  const [procAcciaio, setProcAcciaio] = useState([
    { id: 1, attivo: true, giunto: 'FW sl Piastra', processo: '135', spessore: 15, materiale: 'AISI 304', 
      prove: { vt: { q:1, p:53 }, rx: { q:0, p:65 }, pt: { q:1, p:71 }, traz: { q:0, p:76 }, pieg: { q:0, p:45.5 }, res: { q:0, p:125 }, dur: { q:0, p:71 }, macro: { q:2, p:87 } }
    }
  ]);
  const [procAlluminio, setProcAlluminio] = useState([]);

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
  // MOTORE DI CALCOLO
  // ==========================================
  const totRicavoMissione = (missione.distanzaKm * missione.costoKmVendita * 2) + (missione.oreViaggio * (missione.mdoVenditaViaggio || 0)) + (missione.orePresenza * missione.mdoVendita) + (Math.max(0, Math.ceil(missione.giornate - 1)) * missione.albergoVendita) + (missione.giornate * missione.pastiVendita) + (Math.ceil(missione.giornate) * missione.trasfertaVendita) + (missione.autostrada * (1 + (missione.ricaricoAutostrada||0)));
  const totCostoMissione = (missione.distanzaKm * missione.costoKmReale * 2) + (missione.oreViaggio * (missione.mdoRealeViaggio || 0)) + (missione.orePresenza * missione.mdoReale) + (Math.max(0, Math.ceil(missione.giornate - 1)) * missione.albergoReale) + (missione.giornate * missione.pastiReale) + (Math.ceil(missione.giornate) * missione.trasfertaReale) + missione.autostrada;

  let totRicavoPatentini = 0; let totCostoPatentini = 0; let numPatentiniAttivi = 0;
  patentini.forEach(p => {
    if (p.attivo) {
      numPatentiniAttivi++;
      let prezzoVendita = parametri.prezzoBasePatentinoCliente; 
      let costoBase = parametri.costoBasePatentinoIIS; 
      let costoRX = 0;
      if (p.tipo === 'BW' && p.rx) {
        costoRX = (parseFloat(p.diametro) <= 40 && parseFloat(p.spessore) <= 2) ? 95.5 : 67;
        prezzoVendita += Math.round(costoRX * 1.15);
      }
      totRicavoPatentini += prezzoVendita;
      totCostoPatentini += (costoBase + costoRX);
    }
  });

  let totRicavoProcAcciaio = 0; let totCostoProcAcciaio = 0;
  procAcciaio.forEach(p => {
    if (p.attivo) {
      let ricavoProve = 0; let costoProve = 0;
      const reqRes = parseFloat(p.spessore) >= 12 && !p.materiale.toUpperCase().includes('AISI');
      Object.entries(p.prove).forEach(([k, v]) => {
        let q = (k === 'res' && reqRes) ? 3 : v.q;
        ricavoProve += (q * v.p); costoProve += (q * v.p * (1 - parametri.scontoIIS));
      });
      totRicavoProcAcciaio += (ricavoProve + parametri.costoCertificatoAcciaio);
      totCostoProcAcciaio += (costoProve + parametri.costoCertificatoAcciaio); 
    }
  });

  const totRicavoProcedure = totRicavoProcAcciaio; // Aggiungere logica Alluminio se serve
  const totCostoProcedure = totCostoProcAcciaio;

  const totaleRicaviCert = totRicavoMissione + totRicavoPatentini + totRicavoProcedure;
  const feeCommCert = missione.commercialeAttivo ? totaleRicaviCert * parametri.feeCommercialePatentini : 0;
  const totaleCostiRealiCert = totCostoMissione + totCostoPatentini + totCostoProcedure + feeCommCert;

  // Consulenza
  const docAttivi = Object.values(documenti).filter(d => d.attivo);
  let percScontoDoc = docAttivi.length >= 3 ? 0.08 : (docAttivi.length === 2 ? 0.05 : 0);
  let ricavoDoc = 0; docAttivi.forEach(d => ricavoDoc += (d.base * (1 - percScontoDoc)));
  const tariffeCons = { 'Coordinamento Saldatura': 75, 'Incollaggio EN 17460': 85, 'EN 3834': 65, 'Redazione documentazione di sistema': 65 };
  const tariffaVenditaCons = tariffeCons[consulenza.tipoAttivita] || 65;
  const costoInternoCons = consulenza.consulente === 'Luca Pera' ? 45 : 40;
  const oreConsulenza = consulenza.tipoAttivita === 'Redazione documentazione di sistema' ? (ricavoDoc / tariffaVenditaCons) : (consulenza.giorniMese * consulenza.mesiAttivita * consulenza.oreGiorno);
  const ricavoOreCons = consulenza.tipoAttivita === 'Redazione documentazione di sistema' ? 0 : (oreConsulenza * tariffaVenditaCons);
  const costoOreCons = oreConsulenza * costoInternoCons;
  const totaleRicaviCons = ricavoOreCons + ricavoDoc;
  const totaleCostiRealiCons = costoOreCons;

  const totalePreventivoCalcolato = totaleRicaviCert + totaleRicaviCons;
  const totaleCostiGlobali = totaleCostiRealiCert + totaleCostiRealiCons;
  const prezzoOffertaFinale = prezzoOffertaCustom > 0 ? prezzoOffertaCustom : totalePreventivoCalcolato;
  const margineNettoGlobale = prezzoOffertaFinale - totaleCostiGlobali;

  // ==========================================
  // FUNZIONI DI SALVATAGGIO DB
  // ==========================================
  const salvaPreventivo = async () => {
    if (!datiGen.cliente) return alert("Inserisci almeno il Nome Cliente!");
    setLoadingDb(true);
    const payload = {
      cliente: datiGen.cliente,
      rif_offerta: datiGen.rifOfferta,
      data_preventivo: datiGen.dataPreventivo,
      totale_vendita: prezzoOffertaFinale,
      totale_costi: totaleCostiGlobali,
      margine: margineNettoGlobale,
      stato: datiGen.stato,
      autore: currentUser.nome,
      dati_completi: { parametri, datiGen, missione, patentini, procAcciaio, consulenza, documenti, prezzoOffertaCustom }
    };

    try {
      const url = '/api/preventivi';
      const method = datiGen.id ? 'PUT' : 'POST';
      if (datiGen.id) payload.id = datiGen.id;

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        alert("Preventivo salvato nel database!");
        fetchArchivio();
        setActiveTab('archivio');
      } else { alert("Errore di salvataggio"); }
    } catch (e) { alert("Errore di rete"); }
    setLoadingDb(false);
  };

  const caricaPreventivo = (item) => {
    const d = item.dati_completi;
    if (d.parametri) setParametri(d.parametri);
    setDatiGen({ ...d.datiGen, id: item.id, stato: item.stato });
    setMissione(d.missione);
    setPatentini(d.patentini);
    setProcAcciaio(d.procAcciaio);
    setConsulenza(d.consulenza);
    setDocumenti(d.documenti);
    setPrezzoOffertaCustom(d.prezzoOffertaCustom || 0);
    setActiveTab('dashboard');
  };

  if (!currentUser) return <div className="p-10 text-center font-bold">Accesso Negato.</div>;
  const isAdmin = currentUser.ruolo === 'admin';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-16">
      <Head>
        <title>Generatore Preventivi PRO | Zo&amp;annA S.R.L.</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="bg-sky-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl shadow hover:bg-sky-500 transition-all">⬅ App Ore</Link>
            <h1 className="font-bold text-base leading-tight">Motore Preventivi <span className="text-sky-400">CRM</span></h1>
          </div>
          <nav className="flex items-center space-x-1.5 bg-slate-800 p-1 rounded-2xl overflow-x-auto">
            {[{ id: 'missione', icon: '📍', label: 'Missione' }, { id: 'procedure', icon: '🔩', label: 'Procedure' }, { id: 'consulenza', icon: '🎯', label: 'Consulenza' }, { id: 'dashboard', icon: '📊', label: 'Dashboard' }, { id: 'archivio', icon: '📂', label: 'Archivio' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${ activeTab === tab.id ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-300 hover:bg-slate-700' }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* PARTE COMUNE: IMPOSTAZIONI GLOBALI (Visibile su Dati, Procedure, Consulenza) */}
        {isAdmin && activeTab !== 'archivio' && activeTab !== 'dashboard' && (
          <div className="mb-6 bg-slate-900 text-white p-4 rounded-3xl shadow flex flex-wrap gap-4 items-center text-xs">
            <span className="font-bold text-amber-400">⚙️ Parametri Liberi:</span>
            <label className="flex items-center gap-2">Sconto Lab: <input type="number" step="0.01" value={parametri.scontoIIS} onChange={e=>setParametri({...parametri, scontoIIS: Number(e.target.value)})} className="w-16 px-1 rounded text-slate-900 font-bold" /></label>
            <label className="flex items-center gap-2">Costo Cert. Acciaio: <input type="number" value={parametri.costoCertificatoAcciaio} onChange={e=>setParametri({...parametri, costoCertificatoAcciaio: Number(e.target.value)})} className="w-16 px-1 rounded text-slate-900 font-bold" /></label>
            <label className="flex items-center gap-2">Base Costo Patentino: <input type="number" value={parametri.costoBasePatentinoIIS} onChange={e=>setParametri({...parametri, costoBasePatentinoIIS: Number(e.target.value)})} className="w-16 px-1 rounded text-slate-900 font-bold" /></label>
            <label className="flex items-center gap-2">Vendita Base Patentino: <input type="number" value={parametri.prezzoBasePatentinoCliente} onChange={e=>setParametri({...parametri, prezzoBasePatentinoCliente: Number(e.target.value)})} className="w-16 px-1 rounded text-slate-900 font-bold" /></label>
          </div>
        )}

        {/* TAB 1: DATI E MISSIONE */}
        {activeTab === 'missione' && (
           <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
                 <h2 className="text-sm font-bold border-b pb-2">🏢 Anagrafica Documento</h2>
                 <div className="grid grid-cols-2 gap-3">
                   <div className="col-span-2">
                     <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nome Cliente</label>
                     <input type="text" value={datiGen.cliente} onChange={e => setDatiGen({...datiGen, cliente: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold outline-none" />
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
               
               <div className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
                 <div className="flex justify-between items-center border-b pb-2">
                   <h2 className="text-sm font-bold">📍 Missione</h2>
                   <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded">Ricavo: € {totRicavoMissione.toFixed(2)}</span>
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                   <div><label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Distanza A/R (km)</label><input type="number" value={missione.distanzaKm} onChange={e => setMissione({...missione, distanzaKm: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" /></div>
                   <div><label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">€/Km (Vendita)</label><input type="number" step="0.1" value={missione.costoKmVendita} onChange={e => setMissione({...missione, costoKmVendita: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-sky-700" /></div>
                   {isAdmin && <div><label className="block text-[10px] font-bold uppercase text-rose-500 mb-1">€/Km (Reale)</label><input type="number" step="0.1" value={missione.costoKmReale} onChange={e => setMissione({...missione, costoKmReale: Number(e.target.value)})} className="w-full px-3 py-2 border border-rose-200 bg-rose-50 rounded-xl text-xs font-bold text-rose-700" /></div>}
                   <div><label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Giornate (es. 1.5)</label><input type="number" step="0.5" value={missione.giornate} onChange={e => setMissione({...missione, giornate: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" /></div>
                   <div><label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Ore Presenza</label><input type="number" value={missione.orePresenza} onChange={e => setMissione({...missione, orePresenza: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" /></div>
                   <div><label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">MDO €/h (Vendita)</label><input type="number" value={missione.mdoVendita} onChange={e => setMissione({...missione, mdoVendita: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-sky-700" /></div>
                 </div>
               </div>
             </div>

             <div className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
               <div className="flex justify-between items-center border-b pb-2">
                 <h2 className="text-sm font-bold">👨‍🔧 Patentini Saldatori ({numPatentiniAttivi} attivi)</h2>
                 <button onClick={() => setPatentini([...patentini, { id: Date.now(), attivo: true, tipo: 'FW', nome: `Saldatore ${patentini.length + 1}`, materiale: 'S275', spessore: 6, diametro: '', rx: false }])} className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg font-bold">➕ Aggiungi</button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-xs">
                   <thead className="bg-slate-50 text-slate-500 uppercase font-bold">
                     <tr><th className="p-2">On</th><th className="p-2">Nominativo</th><th className="p-2">Giunto</th><th className="p-2">Materiale</th><th className="p-2">Spess.</th><th className="p-2">Diam.</th><th className="p-2">RX (Se BW)</th></tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {patentini.map((p, idx) => (
                       <tr key={p.id} className={p.attivo ? '' : 'opacity-40'}>
                         <td className="p-2"><input type="checkbox" checked={p.attivo} onChange={e => { const n=[...patentini]; n[idx].attivo=e.target.checked; setPatentini(n); }} /></td>
                         <td className="p-2"><input type="text" value={p.nome} onChange={e => { const n=[...patentini]; n[idx].nome=e.target.value; setPatentini(n); }} className="w-full border rounded px-2 py-1" /></td>
                         <td className="p-2"><select value={p.tipo} onChange={e => { const n=[...patentini]; n[idx].tipo=e.target.value; setPatentini(n); }} className="border rounded px-2 py-1"><option>FW</option><option>BW</option></select></td>
                         <td className="p-2"><input type="text" value={p.materiale} onChange={e => { const n=[...patentini]; n[idx].materiale=e.target.value; setPatentini(n); }} className="w-20 border rounded px-2 py-1" /></td>
                         <td className="p-2"><input type="number" value={p.spessore} onChange={e => { const n=[...patentini]; n[idx].spessore=e.target.value; setPatentini(n); }} className="w-16 border rounded px-2 py-1" /></td>
                         <td className="p-2"><input type="number" value={p.diametro} onChange={e => { const n=[...patentini]; n[idx].diametro=e.target.value; setPatentini(n); }} className="w-16 border rounded px-2 py-1" /></td>
                         <td className="p-2">{p.tipo === 'BW' && <input type="checkbox" checked={p.rx} onChange={e => { const n=[...patentini]; n[idx].rx=e.target.checked; setPatentini(n); }} />}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
           </div>
        )}

        {/* TAB 2: PROCEDURE */}
        {activeTab === 'procedure' && (
          <div className="space-y-4">
             {procAcciaio.map((proc, pIdx) => {
               const reqRes = parseFloat(proc.spessore) >= 12 && !proc.materiale.toUpperCase().includes('AISI');
               return (
                 <div key={proc.id} className="border rounded-2xl p-4 bg-white shadow-sm space-y-3">
                   <div className="flex flex-wrap items-center gap-3">
                     <input type="checkbox" checked={proc.attivo} onChange={e => { const n=[...procAcciaio]; n[pIdx].attivo=e.target.checked; setProcAcciaio(n); }} className="w-5 h-5" />
                     <input type="text" value={proc.giunto} onChange={e => { const n=[...procAcciaio]; n[pIdx].giunto=e.target.value; setProcAcciaio(n); }} className="border px-2 py-1 rounded text-xs font-bold w-32" />
                     <input type="text" value={proc.processo} onChange={e => { const n=[...procAcciaio]; n[pIdx].processo=e.target.value; setProcAcciaio(n); }} className="border px-2 py-1 rounded text-xs w-20" />
                     <input type="number" value={proc.spessore} onChange={e => { const n=[...procAcciaio]; n[pIdx].spessore=e.target.value; setProcAcciaio(n); }} className="border px-2 py-1 rounded text-xs w-16" placeholder="Spess." />
                     <input type="text" value={proc.materiale} onChange={e => { const n=[...procAcciaio]; n[pIdx].materiale=e.target.value; setProcAcciaio(n); }} className="border px-2 py-1 rounded text-xs w-24" placeholder="Mat." />
                   </div>
                   <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                     {Object.entries(proc.prove).map(([k, v]) => (
                       <div key={k} className="p-2 border rounded-xl text-center bg-slate-50">
                         <label className="block text-[9px] font-bold uppercase text-slate-500 mb-1">{k}</label>
                         <div className="flex flex-col gap-1">
                           <input type="number" value={k === 'res' && reqRes ? 3 : v.q} readOnly={k === 'res' && reqRes} onChange={e => { const n=[...procAcciaio]; n[pIdx].prove[k].q=Number(e.target.value); setProcAcciaio(n); }} className="w-full text-center border text-xs font-bold" title="Quantità" />
                           <input type="number" value={v.p} onChange={e => { const n=[...procAcciaio]; n[pIdx].prove[k].p=Number(e.target.value); setProcAcciaio(n); }} className="w-full text-center border-b text-[10px] text-sky-600 bg-transparent outline-none" title="Prezzo €" />
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )
             })}
             <button onClick={() => setProcAcciaio([...procAcciaio, { id: Date.now(), attivo: true, giunto: 'Nuovo', processo: '135', spessore: 10, materiale: 'S355', prove: { vt: { q:1, p:53 }, rx: { q:0, p:65 }, pt: { q:1, p:71 }, traz: { q:0, p:76 }, pieg: { q:0, p:45.5 }, res: { q:0, p:125 }, dur: { q:0, p:71 }, macro: { q:1, p:87 } } }])} className="w-full py-3 border-2 border-dashed border-sky-300 text-sky-700 font-bold rounded-2xl hover:bg-sky-50">➕ Aggiungi Procedura Acciaio</button>
          </div>
        )}

        {/* TAB 3: CONSULENZA */}
        {activeTab === 'consulenza' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 shadow-md border space-y-4">
              <h2 className="text-sm font-bold border-b pb-2">📄 Documenti Sistema (Prezzi Editabili)</h2>
              <div className="space-y-2">
                {Object.entries(documenti).map(([k, d]) => (
                  <div key={k} className="flex items-center justify-between p-2 rounded-xl border bg-slate-50">
                    <span className="text-xs font-bold">{d.nome}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400">€ Base</span>
                      <input type="number" value={d.base} onChange={e => { const n={...documenti}; n[k].base=Number(e.target.value); setDocumenti(n); }} className="w-20 px-2 py-1 border rounded text-xs font-bold text-sky-700" />
                      <input type="checkbox" checked={d.attivo} onChange={e => { const n={...documenti}; n[k].attivo=e.target.checked; setDocumenti(n); }} className="w-5 h-5 ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DASHBOARD (CON SALVATAGGIO) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 shadow-xl space-y-6 border border-slate-700">
              <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><span>📊</span> Cruscotto Offerta</h2>
                <div className="flex items-center gap-3">
                  <select value={datiGen.stato} onChange={e=>setDatiGen({...datiGen, stato: e.target.value})} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-white border border-slate-600">
                    <option>Bozza</option><option>Inviato</option><option>Accettato</option><option>Rifiutato</option>
                  </select>
                  <button onClick={salvaPreventivo} disabled={loadingDb} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm">
                    {loadingDb ? '⏳...' : '💾 Salva nel Database'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-2xl p-5 text-center border border-slate-700">
                  <span className="text-xs font-bold text-sky-400 uppercase">Prezzo Finale al Cliente</span>
                  <div className="text-4xl font-black text-white my-2">€ {prezzoOffertaFinale.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400">Totale calcolato base: € {totalePreventivoCalcolato.toFixed(2)}</div>
                </div>
                {isAdmin && (
                  <div className="bg-emerald-950/40 rounded-2xl p-5 text-center border border-emerald-900/50">
                    <span className="text-xs font-bold text-emerald-500 uppercase">Margine Netto Reale</span>
                    <div className="text-4xl font-black text-emerald-400 my-2">€ {margineNettoGlobale.toFixed(2)}</div>
                    <div className="text-[10px] text-emerald-600/80">Costi coperti: € {totaleCostiGlobali.toFixed(2)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ARCHIVIO CRM */}
        {activeTab === 'archivio' && (
          <div className="bg-white rounded-3xl p-6 shadow-lg border space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-lg font-bold">📂 Archivio Preventivi (CRM)</h2>
              <button onClick={fetchArchivio} className="text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg">🔄 Aggiorna</button>
            </div>
            
            {archivio.length === 0 ? (
              <p className="text-center text-slate-400 py-10">Nessun preventivo salvato.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-b">
                      <th className="p-3">Data</th>
                      <th className="p-3">Rif</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">Vendita</th>
                      {isAdmin && <th className="p-3">Margine</th>}
                      <th className="p-3">Stato</th>
                      <th className="p-3 text-right">Azione</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {archivio.map(item => (
                      <tr key={item.id} className="hover:bg-sky-50 transition-all group">
                        <td className="p-3 font-medium text-slate-600">{item.data_preventivo}</td>
                        <td className="p-3 font-bold text-slate-800">{item.rif_offerta || '-'}</td>
                        <td className="p-3 font-bold text-slate-900">{item.cliente}</td>
                        <td className="p-3 font-bold text-sky-700">€ {item.totale_vendita?.toFixed(2)}</td>
                        {isAdmin && <td className="p-3 font-bold text-emerald-600">€ {item.margine?.toFixed(2)}</td>}
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                            item.stato === 'Accettato' ? 'bg-emerald-100 text-emerald-700' :
                            item.stato === 'Bozza' ? 'bg-slate-100 text-slate-600' :
                            item.stato === 'Inviato' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                          }`}>{item.stato}</span>
                        </td>
                        <td className="p-3 text-right">
                          <button onClick={() => caricaPreventivo(item)} className="bg-white border shadow-sm px-3 py-1.5 rounded-lg font-bold text-sky-600 hover:bg-sky-50">✏️ Apri/Modifica</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
