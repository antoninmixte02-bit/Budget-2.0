import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Calendar, Plus, Trash2, Settings, ChevronDown, ChevronUp } from 'lucide-react';

export default function BudgetApp() {
  const [setup, setSetup] = useState({
    revenu: 0,
    charges: 0,
    dettes: 0,
    epargne: 0,
    moisDebut: new Date().toISOString().slice(0, 7),
  });

  const [entries, setEntries] = useState({});
  const [showSetup, setShowSetup] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [todayInput, setTodayInput] = useState('');
  const [dateSelectionnee, setDateSelectionnee] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  // Charger les données au démarrage
  useEffect(() => {
    try {
      const setupData = localStorage.getItem('budget:setup');
      if (setupData) setSetup(JSON.parse(setupData));

      const entriesData = localStorage.getItem('budget:entries');
      if (entriesData) setEntries(JSON.parse(entriesData));

      const showSetupData = localStorage.getItem('budget:showSetup');
      if (showSetupData) setShowSetup(JSON.parse(showSetupData));
    } catch (e) {
      console.log('Première utilisation');
    }
    setLoading(false);
  }, []);

  // Sauvegarder le setup
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('budget:setup', JSON.stringify(setup));
        localStorage.setItem('budget:showSetup', JSON.stringify(showSetup));
      } catch (e) {
        console.error(e);
      }
    }
  }, [setup, showSetup, loading]);

  // Sauvegarder les entrées
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('budget:entries', JSON.stringify(entries));
      } catch (e) {
        console.error(e);
      }
    }
  }, [entries, loading]);

  // Calculs
  const [annee, mois] = setup.moisDebut.split('-').map(Number);
  const joursDansLeMois = new Date(annee, mois, 0).getDate();
  const budgetDisponible = setup.revenu - setup.charges - setup.dettes - setup.epargne;
  const tauxJournalier = joursDansLeMois > 0 ? budgetDisponible / joursDansLeMois : 0;

  // Générer les jours du mois
  const jours = [];
  for (let j = 1; j <= joursDansLeMois; j++) {
    const dateStr = `${setup.moisDebut}-${String(j).padStart(2, '0')}`;
    jours.push(dateStr);
  }

  // Calculer le solde cumulé
  const calculerSoldes = () => {
    let solde = budgetDisponible;
    let cumulGain = 0;
    return jours.map((date) => {
      const depense = entries[date] !== undefined ? entries[date] : null;
      const ligne = {
        date,
        solde: solde,
        tauxJour: tauxJournalier,
        depense: depense,
        diff: depense !== null ? tauxJournalier - depense : null,
        gainCumule: cumulGain,
        soldeApres: solde,
      };
      if (depense !== null) {
        const diff = tauxJournalier - depense;
        cumulGain += diff;
        solde -= depense;
        ligne.gainCumule = cumulGain;
        ligne.soldeApres = solde;
      }
      return ligne;
    });
  };

  const soldes = calculerSoldes();
  const aujourdhui = new Date().toISOString().slice(0, 10);
  const ligneAujourdhui = soldes.find((l) => l.date === aujourdhui);
  const dernieresLignes = soldes.filter((l) => entries[l.date] !== undefined);
  const totalDepense = dernieresLignes.reduce((s, l) => s + (l.depense || 0), 0);
  const gainTotal = dernieresLignes.reduce((s, l) => s + (l.diff || 0), 0);
  const soldeActuel = budgetDisponible - totalDepense;

  const enregistrerDepense = () => {
    const val = parseFloat(todayInput);
    if (!isNaN(val) && val >= 0) {
      setEntries({ ...entries, [dateSelectionnee]: val });
      setTodayInput('');
    }
  };

  const supprimerEntree = (date) => {
    const newEntries = { ...entries };
    delete newEntries[date];
    setEntries(newEntries);
  };

  const reinitialiserMois = () => {
    if (confirm('Réinitialiser toutes les dépenses du mois ?')) {
      setEntries({});
    }
  };

  const formatDate = (dateStr) => {
    const [a, m, j] = dateStr.split('-');
    return `${j}/${m}`;
  };

  const formatMois = (m) => {
    const [annee, mois] = m.split('-');
    const noms = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    return `${noms[parseInt(mois) - 1]} ${annee}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-400 text-sm tracking-widest uppercase">Chargement</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=JetBrains+Mono:wght@300;400;500;600&display=swap');
        .font-mono-fin { font-family: 'JetBrains Mono', monospace; font-feature-settings: "tnum"; }
        .grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-12 border-b border-stone-300 pb-8">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-xs tracking-[0.3em] uppercase text-stone-500 font-mono-fin">Livre de Comptes</p>
            <p className="text-xs tracking-widest uppercase text-stone-500 font-mono-fin">{formatMois(setup.moisDebut)}</p>
          </div>
          <h1 className="text-5xl font-light tracking-tight text-stone-900" style={{ fontStyle: 'italic' }}>
            Budget
          </h1>
        </header>

        {/* Configuration */}
        <section className="mb-10 bg-white border border-stone-200 shadow-sm">
          <button
            onClick={() => setShowSetup(!showSetup)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings size={16} className="text-stone-500" strokeWidth={1.5} />
              <span className="text-sm tracking-widest uppercase text-stone-700">Configuration</span>
            </div>
            {showSetup ? <ChevronUp size={18} className="text-stone-400" /> : <ChevronDown size={18} className="text-stone-400" />}
          </button>

          {showSetup && (
            <div className="px-6 pb-6 pt-2 grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-stone-100">
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Mois</label>
                <input
                  type="month"
                  value={setup.moisDebut}
                  onChange={(e) => setSetup({ ...setup, moisDebut: e.target.value })}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 text-stone-900 font-mono-fin focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Revenu mensuel</label>
                <input
                  type="number"
                  value={setup.revenu || ''}
                  placeholder="0"
                  onChange={(e) => setSetup({ ...setup, revenu: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 text-stone-900 font-mono-fin focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Charges mensuelles</label>
                <input
                  type="number"
                  value={setup.charges || ''}
                  placeholder="0"
                  onChange={(e) => setSetup({ ...setup, charges: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 text-stone-900 font-mono-fin focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Dettes mensualisées</label>
                <input
                  type="number"
                  value={setup.dettes || ''}
                  placeholder="0"
                  onChange={(e) => setSetup({ ...setup, dettes: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 text-stone-900 font-mono-fin focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2 flex items-center gap-2">
                  <PiggyBank size={12} strokeWidth={1.5} />
                  Épargne (mise de côté en début de mois)
                </label>
                <input
                  type="number"
                  value={setup.epargne || ''}
                  placeholder="0"
                  onChange={(e) => setSetup({ ...setup, epargne: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 text-stone-900 font-mono-fin focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>
            </div>
          )}
        </section>

        {/* Synthèse */}
        <section className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-stone-900 text-stone-50 p-5">
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone-400 mb-2">Budget disponible</p>
            <p className="text-2xl font-light font-mono-fin">{budgetDisponible.toFixed(0)}</p>
            <p className="text-[10px] text-stone-500 mt-1">après charges & épargne</p>
          </div>
          <div className="bg-white border border-stone-200 p-5">
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone-500 mb-2">Taux / jour</p>
            <p className="text-2xl font-light font-mono-fin text-stone-900">{tauxJournalier.toFixed(2)}</p>
            <p className="text-[10px] text-stone-400 mt-1">sur {joursDansLeMois} jours</p>
          </div>
          <div className="bg-white border border-stone-200 p-5">
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone-500 mb-2">Solde restant</p>
            <p className="text-2xl font-light font-mono-fin text-stone-900">{soldeActuel.toFixed(0)}</p>
            <p className="text-[10px] text-stone-400 mt-1">{dernieresLignes.length} jour(s) saisi(s)</p>
          </div>
          <div className={`p-5 ${gainTotal >= 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
            <p className="text-[10px] tracking-[0.2em] uppercase text-stone-500 mb-2 flex items-center gap-1">
              {gainTotal >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {gainTotal >= 0 ? 'Économisé' : 'Dépassement'}
            </p>
            <p className={`text-2xl font-light font-mono-fin ${gainTotal >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
              {gainTotal >= 0 ? '+' : ''}{gainTotal.toFixed(2)}
            </p>
            <p className="text-[10px] text-stone-500 mt-1">cumul du mois</p>
          </div>
        </section>

        {/* Saisie pour une date au choix */}
        <section className="mb-10 bg-white border border-stone-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Calendar size={16} className="text-stone-500" strokeWidth={1.5} />
            <h2 className="text-sm tracking-widest uppercase text-stone-700">
              Saisie d'une dépense
            </h2>
          </div>

          <div className="mb-4">
            <label className="block text-xs tracking-widest uppercase text-stone-500 mb-2">Date</label>
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="date"
                value={dateSelectionnee}
                min={`${setup.moisDebut}-01`}
                max={`${setup.moisDebut}-${String(joursDansLeMois).padStart(2, '0')}`}
                onChange={(e) => {
                  setDateSelectionnee(e.target.value);
                  setTodayInput('');
                }}
                className="px-3 py-2.5 bg-stone-50 border border-stone-200 text-stone-900 font-mono-fin focus:outline-none focus:border-stone-900 transition-colors"
              />
              <button
                onClick={() => {
                  setDateSelectionnee(aujourdhui);
                  setTodayInput('');
                }}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs tracking-widest uppercase transition-colors"
              >
                Aujourd'hui
              </button>
              {dateSelectionnee === aujourdhui && (
                <span className="text-[10px] tracking-widest uppercase text-amber-700 ml-1">· Jour actuel</span>
              )}
            </div>
          </div>

          {dateSelectionnee >= `${setup.moisDebut}-01` && dateSelectionnee <= `${setup.moisDebut}-${String(joursDansLeMois).padStart(2, '0')}` ? (
            <div>
              <p className="text-xs text-stone-500 mb-3">
                Taux de référence pour ce jour : <span className="font-mono-fin text-stone-900">{tauxJournalier.toFixed(2)}</span>
                {entries[dateSelectionnee] !== undefined && (
                  <span className="ml-2 text-amber-700">
                    · Dépense déjà saisie : <span className="font-mono-fin">{entries[dateSelectionnee].toFixed(2)}</span>
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono-fin text-sm">€</span>
                  <input
                    type="number"
                    value={todayInput}
                    onChange={(e) => setTodayInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && enregistrerDepense()}
                    placeholder={entries[dateSelectionnee] !== undefined ? `Modifier (${entries[dateSelectionnee]})` : 'Dépense du jour'}
                    className="w-full pl-8 pr-3 py-3 bg-stone-50 border border-stone-200 text-stone-900 font-mono-fin focus:outline-none focus:border-stone-900 transition-colors"
                  />
                </div>
                <button
                  onClick={enregistrerDepense}
                  className="px-6 py-3 bg-stone-900 text-stone-50 hover:bg-stone-700 transition-colors flex items-center gap-2 text-sm tracking-widest uppercase"
                >
                  <Plus size={14} strokeWidth={2} />
                  {entries[dateSelectionnee] !== undefined ? 'Modifier' : 'Saisir'}
                </button>
                {entries[dateSelectionnee] !== undefined && (
                  <button
                    onClick={() => supprimerEntree(dateSelectionnee)}
                    className="px-4 py-3 bg-stone-50 border border-stone-200 text-stone-500 hover:text-red-600 hover:border-red-300 transition-colors"
                    title="Supprimer cette saisie"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                )}
              </div>
              {entries[dateSelectionnee] !== undefined && (
                <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-stone-500">Dépensé</p>
                    <p className="font-mono-fin text-stone-900 mt-1">{entries[dateSelectionnee].toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-stone-500">Différence</p>
                    <p className={`font-mono-fin mt-1 ${(tauxJournalier - entries[dateSelectionnee]) >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {(tauxJournalier - entries[dateSelectionnee]) >= 0 ? '+' : ''}{(tauxJournalier - entries[dateSelectionnee]).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase text-stone-500">Solde après</p>
                    <p className="font-mono-fin text-stone-900 mt-1">
                      {(soldes.find(l => l.date === dateSelectionnee)?.soldeApres ?? 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-stone-500 italic">
              La date sélectionnée n'est pas dans le mois actuel. Modifiez la configuration ou choisissez une autre date.
            </p>
          )}
        </section>

        {/* Tableau des jours */}
        <section className="mb-10 bg-white border border-stone-200 shadow-sm">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-stone-50 transition-colors border-b border-stone-100"
          >
            <span className="text-sm tracking-widest uppercase text-stone-700">Historique du mois</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-400 font-mono-fin">{dernieresLignes.length} / {joursDansLeMois}</span>
              {showHistory ? <ChevronUp size={18} className="text-stone-400" /> : <ChevronDown size={18} className="text-stone-400" />}
            </div>
          </button>

          {showHistory && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="px-4 py-3 text-left text-[10px] tracking-widest uppercase text-stone-500 font-medium">Date</th>
                    <th className="px-4 py-3 text-right text-[10px] tracking-widest uppercase text-stone-500 font-medium">Solde</th>
                    <th className="px-4 py-3 text-right text-[10px] tracking-widest uppercase text-stone-500 font-medium">€/jour</th>
                    <th className="px-4 py-3 text-right text-[10px] tracking-widest uppercase text-stone-500 font-medium">Dépense</th>
                    <th className="px-4 py-3 text-right text-[10px] tracking-widest uppercase text-stone-500 font-medium">Diff.</th>
                    <th className="px-4 py-3 text-right text-[10px] tracking-widest uppercase text-stone-500 font-medium">Cumul</th>
                    <th className="px-4 py-3 text-right text-[10px] tracking-widest uppercase text-stone-500 font-medium">Total</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {soldes.map((ligne, i) => {
                    const estAujourdhui = ligne.date === aujourdhui;
                    const estSelectionnee = ligne.date === dateSelectionnee;
                    const aDepense = ligne.depense !== null;
                    return (
                      <tr
                        key={ligne.date}
                        onClick={() => {
                          setDateSelectionnee(ligne.date);
                          setTodayInput('');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`border-b border-stone-100 transition-colors cursor-pointer ${
                          estSelectionnee ? 'bg-stone-100' : estAujourdhui ? 'bg-amber-50' : 'hover:bg-stone-50'
                        }`}
                      >
                        <td className="px-4 py-3 font-mono-fin text-stone-900">
                          {formatDate(ligne.date)}
                          {estAujourdhui && <span className="ml-2 text-[9px] tracking-widest uppercase text-amber-700">Auj.</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-mono-fin text-stone-600">
                          {aDepense || i === 0 ? ligne.solde.toFixed(0) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono-fin text-stone-500">
                          {ligne.tauxJour.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono-fin text-stone-900">
                          {aDepense ? ligne.depense.toFixed(2) : '—'}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono-fin ${aDepense ? (ligne.diff >= 0 ? 'text-emerald-700' : 'text-red-700') : 'text-stone-300'}`}>
                          {aDepense ? `${ligne.diff >= 0 ? '+' : ''}${ligne.diff.toFixed(2)}` : '—'}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono-fin ${aDepense ? (ligne.gainCumule >= 0 ? 'text-emerald-700' : 'text-red-700') : 'text-stone-300'}`}>
                          {aDepense ? `${ligne.gainCumule >= 0 ? '+' : ''}${ligne.gainCumule.toFixed(2)}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono-fin text-stone-900">
                          {aDepense ? ligne.soldeApres.toFixed(0) : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {aDepense && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                supprimerEntree(ligne.date);
                              }}
                              className="text-stone-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={14} strokeWidth={1.5} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Bilan final */}
        <section className="mb-10 bg-stone-900 text-stone-50 p-8">
          <p className="text-[10px] tracking-[0.3em] uppercase text-stone-400 mb-4">Finalité du mois</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-stone-500 mb-1 flex items-center gap-1">
                <PiggyBank size={11} strokeWidth={1.5} /> Épargne mise de côté
              </p>
              <p className="text-3xl font-light font-mono-fin">{setup.epargne.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-stone-500 mb-1 flex items-center gap-1">
                <Wallet size={11} strokeWidth={1.5} /> Reste en poche
              </p>
              <p className="text-3xl font-light font-mono-fin">{soldeActuel.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-stone-500 mb-1 flex items-center gap-1">
                {gainTotal >= 0 ? <TrendingUp size={11} strokeWidth={1.5} /> : <TrendingDown size={11} strokeWidth={1.5} />}
                Bilan dépenses
              </p>
              <p className={`text-3xl font-light font-mono-fin ${gainTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {gainTotal >= 0 ? '+' : ''}{gainTotal.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-stone-800">
            <p className="text-[10px] tracking-widest uppercase text-stone-500 mb-2">Total économisé en fin de mois (projection)</p>
            <p className="text-4xl font-light font-mono-fin" style={{ fontStyle: 'italic' }}>
              {(setup.epargne + Math.max(0, gainTotal)).toFixed(2)} <span className="text-base text-stone-500 not-italic">€</span>
            </p>
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-stone-200">
          <p className="text-[10px] tracking-widest uppercase text-stone-400">Données sauvegardées localement</p>
          <button
            onClick={reinitialiserMois}
            className="text-[10px] tracking-widest uppercase text-stone-500 hover:text-red-600 transition-colors"
          >
            Réinitialiser le mois
          </button>
        </div>
      </div>
    </div>
  );
}
