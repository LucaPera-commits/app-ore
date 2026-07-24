import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

// LISTA UTENTI CON RUOLI
const UTENTI = {
  'luca': { nome: 'Luca Pera', pass: '!luca123?', ruolo: 'admin' },
  'giampaolo': { nome: 'Giampaolo Lauro', pass: '!giampaolo123?', ruolo: 'user' },
  'federico': { nome: 'Federico Boagno', pass: '!federico123?', ruolo: 'user' },
  'alessandro': { nome: 'Alessandro Ciule', pass: '!alessandro123?', ruolo: 'user' },
  'davide': { nome: 'Davide Procopio', pass: '!davide123?', ruolo: 'user' },
  'agente': { nome: 'Commerciale Esterno', pass: '!agente123?', ruolo: 'sales' }
};

export default function GeneratorePreventivi() {
  const [currentUser, setCurrentUser] = useState(null);
  const [moduloAttivo, setModuloAttivo] = useState('certificazione'); // 'certificazione' | 'consulenza'

  useEffect(() => {
    const saved = localStorage.getItem('bw_user');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  // --- STATI MODULO CERTIFICAZIONE ---
  const [certData, setCertData] = useState({
    cliente: '',
    distanzaKm: 150,
    costoKmVendita: 0.50,
    costoKmReale: 0.30,
    oreViaggio: 4,
    autostrada: 25,
    ricaricoAutostrada: 0.25,
    giornate: 2,
    orePresenza: 16,
    mdoVendita: 65,
    mdoReale: 34,
    albergoVendita: 80,
    albergoReale: 75,
    pastiVendita: 30,
    pastiReale: 20,
    trasfertaVendita: 40,
    trasfertaReale: 30,
    commercialeAttivo: false
  });

  // Patentini Saldatori (Default 3 saldatori)
  const [patentini, setPatentini] = useState([
    { id: 1, attivo: true, tipo: 'FW', nome: 'Saldatore 1', materiale: 'AISI 304', spessore: 6, diametro: '', rx: false },
    { id: 2, attivo: true, tipo: 'BW', nome: 'Saldatore 2', materiale: 'S355', spessore: 12, diametro: '114.3', rx: true },
    { id: 3, attivo: false, tipo: 'FW', nome: 'Saldatore 3', materiale: 'S275', spessore: 8, diametro: '', rx: false }
  ]);

  // Prezzo Offerta Manuale (per simulazione sconto/maggiorazione)
  const [prezzoOffertaCustom, setPrezzoOffertaCustom] = useState(0);

  // --- STATI MODULO CONSULENZA ---
  const [consData, setConsData] = useState({
    cliente: '',
    consulente: 'Luca Pera',
    tipoAttivita: 'Coordinamento Saldatura', // Tariffa oraria automatica
    giorniMese: 2,
    mesiAttivita: 3,
    oreGiorno: 8,
    commercialeAttivo: false,
    documenti: {
      iso9001: { attivo: false, base: 2500 },
      en3834: { attivo: true, base: 2000 },
      en15085: { attivo: false, base: 3000 },
      iso45001: { attivo: false, base: 2000 },
      en1090: { attivo: true, base: 2500 }
    },
    km: 100,
    autostrada: 15,
    pernottoNotti: 0,
    pastiGg: 2
  });

  // ==========================================
  // CALCOLI LOGICI MODULO CERTIFICAZIONE
  // ==========================================
  // 1. Ricavi e Costi Missione
  const ricavoKm = certData.distanzaKm * certData.costoKmVendita * 2;
  const costoKm = certData.distanzaKm * certData.costoKmReale * 2;

  const ricavoOreViaggio = certData.oreViaggio * certData.mdoVendita;
  const costoOreViaggio = certData.oreViaggio * certData.mdoReale;

  const ricavoMDO = certData.orePresenza * certData.mdoVendita;
  const costoMDO = certData.orePresenza * certData.mdoReale;

  const nottiAlbergo = certData.giornate > 0 ? Math.max(0, Math.ceil(certData.giornate - 1)) : 0;
  const ricavoAlbergo = nottiAlbergo * certData.albergoVendita;
  const costoAlbergo = nottiAlbergo * certData.albergoReale;

  const ricavoPasti = certData.giornate * certData.pastiVendita;
  const costoPasti = certData.giornate * certData.pastiReale;

  const ricavoTrasferta = Math.ceil(certData.giornate) * certData.trasfertaVendita;
  const costoTrasferta = Math.ceil(certData.giornate) * certData.trasfertaReale;

  const ricavoAutostrada = certData.autostrada * (1 + certData.ricaricoAutostrada);
  const costoAutostrada = certData.autostrada;

  const totRicavoMissione = ricavoKm + ricavoOreViaggio + ricavoMDO + ricavoAlbergo + ricavoPasti + ricavoTrasferta + ricavoAutostrada;
  const totCostoMissione = costoKm + costoOreViaggio + costoMDO + costoAlbergo + costoPasti + costoTrasferta + costoAutostrada;
  const margineMissione = totRicavoMissione - totCostoMissione;

  // 2. Patentini Saldatori
  let totRicavoPatentini = 0;
  let totCostoPatentini = 0;
  let numPatentiniAttivi = 0;

  patentini.forEach(p => {
    if (p.attivo) {
      numPatentiniAttivi++;
      let prezzoBaseVendita = 87;
      let costoBaseIIS = 71;
      let costoRX = 0;

      if (p.tipo === 'BW' && p.rx) {
        costoRX = (p.diametro && parseFloat(p.diametro) <= 40 && p.spessore <= 2) ? 95.5 : 67;
        prezzoBaseVendita += Math.round(costoRX * 1.15);
      }

      totRicavoPatentini += prezzoBaseVendita;
      totCostoPatentini += (costoBaseIIS + costoRX);
    }
  });

  const marginePatentini = totRicavoPatentini - totCostoPatentini;
  const feeCommercialePatentini = certData.commercialeAttivo ? totRicavoPatentini * 0.05 : 0;

  // Totali Certificazione
  const totaleCalcolatoCert = totRicavoMissione + totRicavoPatentini;
  const totaleCostiRealiCert = totCostoMissione + totCostoPatentini + feeCommercialePatentini;
  const prezzoOffertaFinaleCert = prezzoOffertaCustom > 0 ? prezzoOffertaCustom : totaleCalcolatoCert;
  const margineRealeNettoCert = prezzoOffertaFinaleCert - totaleCostiRealiCert;
  const percentualeMargineCert = prezzoOffertaFinaleCert > 0 ? (margineRealeNettoCert / prezzoOffertaFinaleCert) * 100 : 0;

  // Break-Even Analysis (Patentini necessari per coprire costi fissi missione)
  const margineSingoloPatentino = 87 - 71; // 16€
  const patentiniBreakEven = margineSingoloPatentino > 0 ? Math.ceil(totCostoMissione / margineSingoloPatentino) : 0;

  // ==========================================
  // CALCOLI LOGICI MODULO CONSULENZA
  // ==========================================
  const tariffeConsulenza = {
    'Coordinamento Saldatura': 75,
    'Incollaggio EN 17460': 85,
    'EN 3834': 65,
    'Redazione documentazione di sistema': 65
  };
  const tariffaOrariaVendita = tariffeConsulenza[consData.tipoAttivita] || 65;
  const costoOrarioInterno = consData.consulente === 'Luca Pera' ? 45 : 40;

  // Pacchetto Documenti
  const docAttivi = Object.values(consData.documenti).filter(d => d.attivo);
  const numDocAttivi = docAttivi.length;
  let percScontoDoc = 0;
  if (numDocAttivi === 2) percScontoDoc = 0.05;
  else if (numDocAttivi >= 3) percScontoDoc = 0.08;

  let totRicavoDocumenti = 0;
  Object.values(consData.documenti).forEach(d => {
    if (d.attivo) {
      totRicavoDocumenti += d.base * (1 - percScontoDoc);
    }
  });

  // Consulenza Oraria / Giornaliera
  const oreConsulenzaTotali = consData.tipoAttivita === 'Redazione documentazione di sistema'
    ? (totRicavoDocumenti / tariffaOrariaVendita)
    : (consData.giorniMese * consData.mesiAttivita * consData.oreGiorno);

  const ricavoConsulenzaOre = consData.tipoAttivita === 'Redazione documentazione di sistema'
    ? 0
    : (oreConsulenzaTotali * tariffaOrariaVendita);

  const costoConsulenzaOre = oreConsulenzaTotali * costoOrarioInterno;

  // Rimborsi
  const tariffaKmCons = consData.consulente === 'Luca Pera' ? 0.65 : 0.50;
  const ricavoRimborsi = (consData.km * tariffaKmCons) + consData.autostrada + (consData.pernottoNotti * 85) + (consData.pastiGg * 30);
  const costoRimborsi = (consData.km * 0.30) + consData.autostrada + (consData.pernottoNotti * 75) + (consData.pastiGg * 20);

  const totaleRicaviConsulenza = ricavoConsulenzaOre + totRicavoDocumenti + ricavoRimborsi;
  const totaleCostiConsulenza = costoConsulenzaOre + costoRimborsi;
  const percFeeCommCons = consData.tipoAttivita === 'Redazione documentazione di sistema' ? 0.08 : 0.05;
  const feeCommercialeCons = consData.commercialeAttivo ? totaleRicaviConsulenza * percFeeCommCons : 0;
  const margineNettoConsulenza = totaleRicaviConsulenza - totaleCostiConsulenza - feeCommercialeCons;

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
        <p className="text-sm font-bold text-slate-500">Accesso non effettuato. Torna alla pagina principale.</p>
      </div>
    );
  }

  const isAdmin = currentUser.ruolo === 'admin';
  const isSales = currentUser.ruolo === 'sales' || isAdmin;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans pb-16">
      <Head>
        <title>Generatore Preventivi | Zo&amp;annA S.R.L.</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      {/* HEADER NAVBAR */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="bg-sky-600 text-white font-extrabold text-sm px-3 py-1.5 rounded-xl shadow">
              ⬅ Torna all'App
            </Link>
            <div>
              <h1 className="font-bold text-base leading-tight">Generatore Preventivi &amp; Offerte</h1>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Zo&amp;annA S.R.L.</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setModuloAttivo('certificazione')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                moduloAttivo === 'certificazione' ? 'bg-sky-500 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🏭 Certificazioni &amp; Patentini
            </button>
            <button
              onClick={() => setModuloAttivo('consulenza')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                moduloAttivo === 'consulenza' ? 'bg-sky-500 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🎯 Consulenza &amp; Sistemi
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* MODULO 1: CERTIFICAZIONI & PATENTINI */}
        {moduloAttivo === 'certificazione' && (
          <div className="space-y-6">
            
            {/* SEZIONE 1: MISSIONE */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200/80 space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <span>📍</span> Dati Missione &amp; Trasferta
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome Cliente</label>
                  <input
                    type="text"
                    value={certData.cliente}
                    onChange={e => setCertData({ ...certData, cliente: e.target.value })}
                    placeholder="Es. ERREPI S.r.l."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Distanza A/R (Km)</label>
                  <input
                    type="number"
                    value={certData.distanzaKm}
                    onChange={e => setCertData({ ...certData, distanzaKm: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Giornate Intervento</label>
                  <input
                    type="number"
                    step="0.5"
                    value={certData.giornate}
                    onChange={e => setCertData({ ...certData, giornate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Ore Presenza Cantiere</label>
                  <input
                    type="number"
                    value={certData.orePresenza}
                    onChange={e => setCertData({ ...certData, orePresenza: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Autostrada (€ A/R)</label>
                  <input
                    type="number"
                    value={certData.autostrada}
                    onChange={e => setCertData({ ...certData, autostrada: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SEZIONE 2: PATENTINI SALDATORI */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>👨‍🔧</span> Qualified Welders (Patentini Saldatori)
                </h2>
                <button
                  onClick={() => setPatentini([...patentini, { id: Date.now(), attivo: true, tipo: 'FW', nome: `Saldatore ${patentini.length + 1}`, materiale: 'S275', spessore: 6, diametro: '', rx: false }])}
                  className="bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                >
                  ➕ Aggiungi Saldatore
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50">
                      <th className="p-2">Attivo</th>
                      <th className="p-2">Nominativo</th>
                      <th className="p-2">Giunto</th>
                      <th className="p-2">Materiale</th>
                      <th className="p-2">Spessore</th>
                      <th className="p-2">Diametro</th>
                      <th className="p-2">RX</th>
                      <th className="p-2 text-right">Prezzo Cliente</th>
                      {isAdmin && <th className="p-2 text-right text-rose-600">Costo IIS</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patentini.map((p, idx) => {
                      let prezzoVendita = 87;
                      let costoIIS = 71;
                      let costoRX = 0;
                      if (p.tipo === 'BW' && p.rx) {
                        costoRX = (p.diametro && parseFloat(p.diametro) <= 40 && p.spessore <= 2) ? 95.5 : 67;
                        prezzoVendita += Math.round(costoRX * 1.15);
                      }

                      return (
                        <tr key={p.id} className={p.attivo ? 'bg-white' : 'bg-slate-50 opacity-50'}>
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={p.attivo}
                              onChange={e => {
                                const next = [...patentini];
                                next[idx].attivo = e.target.checked;
                                setPatentini(next);
                              }}
                              className="w-4 h-4 text-sky-600 rounded"
                            />
                          </td>
                          <td className="p-2 font-bold">{p.nome}</td>
                          <td className="p-2">
                            <select
                              value={p.tipo}
                              onChange={e => {
                                const next = [...patentini];
                                next[idx].tipo = e.target.value;
                                setPatentini(next);
                              }}
                              className="bg-slate-50 border rounded px-1.5 py-0.5 font-bold"
                            >
                              <option value="FW">FW (Angolo)</option>
                              <option value="BW">BW (Testa a testa)</option>
                            </select>
                          </td>
                          <td className="p-2 font-medium">{p.materiale}</td>
                          <td className="p-2 font-medium">{p.spessore} mm</td>
                          <td className="p-2 font-medium">{p.diametro ? `${p.diametro} mm` : '-'}</td>
                          <td className="p-2">
                            {p.tipo === 'BW' ? (
                              <input
                                type="checkbox"
                                checked={p.rx}
                                onChange={e => {
                                  const next = [...patentini];
                                  next[idx].rx = e.target.checked;
                                  setPatentini(next);
                                }}
                              />
                            ) : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="p-2 text-right font-bold text-slate-900">{p.attivo ? `€ ${prezzoVendita}` : '-'}</td>
                          {isAdmin && (
                            <td className="p-2 text-right font-bold text-rose-600">{p.attivo ? `€ ${costoIIS + costoRX}` : '-'}</td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SEZIONE 3: SINTESI PREVENTIVO & MARGINI (SOGGETTA A PERMESSI) */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>💰</span> Offerta Finale &amp; Analisi Margini
                </h2>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-500/30">
                  Patentini per Break-Even: {patentiniBreakEven} saldatori
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Totale Calcolato Offerta</span>
                  <span className="text-xl font-extrabold text-white">€ {totaleCalcolatoCert.toFixed(2)}</span>
                </div>

                {isAdmin && (
                  <div className="bg-slate-800/80 border border-rose-500/30 p-4 rounded-2xl text-center">
                    <span className="text-[10px] font-bold uppercase text-rose-400 block">Costi Reali Interni Totali</span>
                    <span className="text-xl font-extrabold text-rose-300">€ {totaleCostiRealiCert.toFixed(2)}</span>
                  </div>
                )}

                {isAdmin && (
                  <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-2xl text-center">
                    <span className="text-[10px] font-bold uppercase text-emerald-400 block">Margine Reale Netto</span>
                    <span className="text-xl font-extrabold text-emerald-300">
                      € {margineRealeNettoCert.toFixed(2)} ({percentualeMargineCert.toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>

              {/* OPZIONE PROVVIGIONE COMMERCIALE */}
              {isSales && (
                <div className="pt-2 flex items-center justify-between text-xs bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={certData.commercialeAttivo}
                      onChange={e => setCertData({ ...certData, commercialeAttivo: e.target.checked })}
                      className="w-4 h-4 text-sky-500 rounded"
                    />
                    <span className="font-semibold text-slate-300">Includi Fee Commerciale Agente (5%)</span>
                  </label>
                  {certData.commercialeAttivo && (
                    <span className="font-bold text-amber-400">Spetta all'Agente: € {feeCommercialePatentini.toFixed(2)}</span>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

        {/* MODULO 2: CONSULENZA & SISTEMI */}
        {moduloAttivo === 'consulenza' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-200/80 space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b pb-2">
                <span>🎯</span> Preventivo Consulenza &amp; Sistemi di Gestione
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Consulente Assegnato</label>
                  <select
                    value={consData.consulente}
                    onChange={e => setConsData({ ...consData, consulente: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold"
                  >
                    <option value="Luca Pera">Luca Pera</option>
                    <option value="Federico Boagno">Federico Boagno</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Tipo Attività</label>
                  <select
                    value={consData.tipoAttivita}
                    onChange={e => setConsData({ ...consData, tipoAttivita: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-bold"
                  >
                    <option value="Coordinamento Saldatura">Coordinamento Saldatura (€75/h)</option>
                    <option value="Incollaggio EN 17460">Incollaggio EN 17460 (€85/h)</option>
                    <option value="EN 3834">EN 3834 (€65/h)</option>
                    <option value="Redazione documentazione di sistema">Redazione documentazione di sistema (€65/h)</option>
                  </select>
                </div>
              </div>

              {/* SELEZIONE PACCHETTO DOCUMENTI */}
              <div className="pt-2 space-y-2">
                <label className="block text-xs font-bold uppercase text-slate-500">Pacchetti Documentali ISO / EN</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {Object.entries(consData.documenti).map(([key, doc]) => (
                    <label key={key} className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer text-xs font-bold transition-all ${
                      doc.attivo ? 'bg-sky-50 border-sky-300 text-sky-900' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      <span>{key.toUpperCase()}</span>
                      <input
                        type="checkbox"
                        checked={doc.attivo}
                        onChange={e => {
                          const next = { ...consData.documenti };
                          next[key].attivo = e.target.checked;
                          setConsData({ ...consData, documenti: next });
                        }}
                        className="w-4 h-4 text-sky-600 rounded"
                      />
                    </label>
                  ))}
                </div>
                {numDocAttivi > 1 && (
                  <p className="text-[11px] font-bold text-emerald-600 pt-1">
                    🎉 Sconto pacchetto applicato: {(percScontoDoc * 100)}% su tutti i documenti attivi!
                  </p>
                )}
              </div>
            </div>

            {/* SINTESI CONSULENZA */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <span>💰</span> Offerta Finale Consulenza
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Totale Offerta Cliente</span>
                  <span className="text-xl font-extrabold text-white">€ {totaleRicaviConsulenza.toFixed(2)}</span>
                </div>

                {isAdmin && (
                  <div className="bg-slate-800/80 border border-rose-500/30 p-4 rounded-2xl text-center">
                    <span className="text-[10px] font-bold uppercase text-rose-400 block">Costo Interno Consulente</span>
                    <span className="text-xl font-extrabold text-rose-300">€ {totaleCostiConsulenza.toFixed(2)}</span>
                  </div>
                )}

                {isAdmin && (
                  <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-2xl text-center">
                    <span className="text-[10px] font-bold uppercase text-emerald-400 block">Margine Reale Netto</span>
                    <span className="text-xl font-extrabold text-emerald-300">€ {margineNettoConsulenza.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
