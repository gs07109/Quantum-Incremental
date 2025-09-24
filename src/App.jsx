import React, { useEffect, useRef, useState } from "react";
import Clicker from "./components/Clicker";
import ResourcePanel from "./components/ResourcePanel";
import BuildingList from "./components/BuildingList";
import UpgradeList from "./components/UpgradeList";
import useGameSave from "./hooks/useGameSave";

/* -------------------------
   Data: buildings + upgrades
   ------------------------- */

/*
  Each building uses:
    - baseCosts: { atoms, energy, quarks } (all keys present, 0 if not used)
    - baseOutput: { atoms, energy, quarks } (per second, positive produce, negative consume)
    - costScale: number (growth factor)
*/

const BASE_BUILDINGS = [
  {
    id: "synth",
    name: "Atom Synthesizer",
    description: "Basic atomic synthesizer. Early atom production.",
    baseCosts: { atoms: 10, energy: 0, quarks: 0 },
    baseOutput: { atoms: 0.6, energy: 0, quarks: 0 },
    costScale: 1.12,
  },
  {
    id: "micro_reactor",
    name: "Micro Reactor",
    description: "Small energy producer to power advanced systems.",
    baseCosts: { atoms: 60, energy: 0, quarks: 0 },
    baseOutput: { atoms: 0, energy: 0.6, quarks: 0 },
    costScale: 1.14,
  },
  {
    id: "energy_condenser",
    name: "Energy Condenser",
    description: "Converts energy → atoms. Has energy upkeep (consumes energy).",
    baseCosts: { atoms: 250, energy: 50, quarks: 0 },
    baseOutput: { atoms: 2.5, energy: -0.9, quarks: 0 },
    costScale: 1.16,
  },
  {
    id: "particle_collider",
    name: "Particle Collider",
    description: "Consumes lots of energy to produce rare quarks.",
    baseCosts: { atoms: 1200, energy: 800, quarks: 0 },
    baseOutput: { atoms: 0, energy: -3, quarks: 0.08 },
    costScale: 1.18,
  },
  {
    id: "quantum_lab",
    name: "Quantum Lab",
    description: "Advanced facility — requires quarks. Boosts output.",
    baseCosts: { atoms: 5000, energy: 2000, quarks: 2 },
    baseOutput: { atoms: 6, energy: 2, quarks: 0 },
    costScale: 1.20,
  },
];

const BASE_UPGRADES = [
  {
    id: "u_click_boost",
    name: "Efficient Synthesis",
    desc: "Manual synthesis +2 atoms per click.",
    cost: { atoms: 120, energy: 0, quarks: 0 },
    applied: false,
    apply: (game, setGame) => {
      setGame((g) => ({ ...g, clickPower: (g.clickPower || 1) + 2 }));
    },
  },
  {
    id: "u_reactor_eff",
    name: "Reactor Efficiency",
    desc: "Micro Reactors produce 20% more energy.",
    cost: { atoms: 600, energy: 0, quarks: 0 },
    applied: false,
    apply: (game, setGame) => {
      setGame((g) => ({
        ...g,
        buildings: g.buildings.map((b) =>
          b.id === "micro_reactor" ? { ...b, multiplier: (b.multiplier || 1) * 1.2 } : b
        ),
      }));
    },
  },
  {
    id: "u_condenser_opt",
    name: "Condensation Optimization",
    desc: "Condensers produce +50% atoms and consume 20% less energy.",
    cost: { atoms: 2400, energy: 200, quarks: 0 },
    applied: false,
    apply: (game, setGame) => {
      setGame((g) => ({
        ...g,
        buildings: g.buildings.map((b) =>
          b.id === "energy_condenser"
            ? { ...b, multiplier: (b.multiplier || 1) * 1.5, energyModifier: (b.energyModifier || 1) * 0.8 }
            : b
        ),
      }));
    },
  },
  {
    id: "u_quark_yield",
    name: "Quark Stabilization",
    desc: "Colliders produce +100% quarks.",
    cost: { atoms: 8000, energy: 4000, quarks: 5 },
    applied: false,
    apply: (game, setGame) => {
      setGame((g) => ({
        ...g,
        buildings: g.buildings.map((b) =>
          b.id === "particle_collider" ? { ...b, multiplier: (b.multiplier || 1) * 2 } : b
        ),
      }));
    },
  },
];

/* -------------------------
   Helpers & initial state
   ------------------------- */

function mkInitialGame() {
  return {
    atoms: 0,
    energy: 0,
    quarks: 0,
    totalAtoms: 0,
    totalEnergy: 0,
    totalQuarks: 0,
    clickPower: 1,
    buildings: BASE_BUILDINGS.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      baseCosts: b.baseCosts,
      baseOutput: b.baseOutput,
      costScale: b.costScale,
      amount: 0,
      multiplier: 1,
      energyModifier: 1,
    })),
    upgrades: BASE_UPGRADES.map((u) => ({ ...u })),
    settings: { autosave: true },
  };
}

function safeNum(x) {
  return typeof x === "number" && !Number.isNaN(x) ? x : 0;
}

function scaleCost(baseCosts = { atoms: 0, energy: 0, quarks: 0 }, scale = 1.15, amount = 0) {
  // ensure keys present
  const atoms = safeNum(baseCosts.atoms || 0);
  const energy = safeNum(baseCosts.energy || 0);
  const quarks = safeNum(baseCosts.quarks || 0);
  return {
    atoms: Math.round(atoms * Math.pow(scale, amount)),
    energy: Math.round(energy * Math.pow(scale, amount)),
    quarks: Math.round(quarks * Math.pow(scale, amount)),
  };
}

function canAffordCost(cost, game) {
  if (!cost) return true;
  if ((cost.atoms || 0) > (game.atoms || 0)) return false;
  if ((cost.energy || 0) > (game.energy || 0)) return false;
  if ((cost.quarks || 0) > (game.quarks || 0)) return false;
  return true;
}

/* -------------------------
   App component
   ------------------------- */

export default function App() {
  const [game, setGame] = useState(() => {
    // create initial game but ensure building baseCosts present (defensive)
    const g = mkInitialGame();
    // copy baseCosts from BASE_BUILDINGS
    g.buildings = BASE_BUILDINGS.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      baseCosts: { atoms: b.baseCosts.atoms || 0, energy: b.baseCosts.energy || 0, quarks: b.baseCosts.quarks || 0 },
      baseOutput: { atoms: b.baseOutput.atoms || 0, energy: b.baseOutput.energy || 0, quarks: b.baseOutput.quarks || 0 },
      costScale: b.costScale || 1.15,
      amount: 0,
      multiplier: 1,
      energyModifier: 1,
    }));
    g.upgrades = BASE_UPGRADES.map((u) => ({ ...u }));
    return g;
  });

  const gameRef = useRef(game);
  gameRef.current = game;

  // Save/load using your hook (expects (game, setGame))
  const { saveGame, loadGame, exportString, importString } = useGameSave(game, setGame);

  // Load on mount (hook returns boolean but we don't rely on result)
  useEffect(() => {
    loadGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick loop — 200ms (5 ticks/sec)
  useEffect(() => {
    const tickMs = 200;
    let mounted = true;
    const tick = () => {
      if (!mounted) return;
      const s = gameRef.current;

      let atomsPerSec = 0;
      let energyPerSec = 0;
      let quarksPerSec = 0;

      for (const b of s.buildings) {
        if (!b.amount || b.amount <= 0) continue;
        const m = b.multiplier || 1;
        const energyMod = b.energyModifier ?? 1;
        const amt = b.amount;
        const aOut = safeNum(b.baseOutput.atoms) * amt * m;
        let eOut = safeNum(b.baseOutput.energy) * amt * m;
        if (eOut < 0) eOut *= energyMod; // apply energy modifier to upkeep
        const qOut = safeNum(b.baseOutput.quarks) * amt * m;
        atomsPerSec += aOut;
        energyPerSec += eOut;
        quarksPerSec += qOut;
      }

      const dt = tickMs / 1000;
      setGame((prev) => ({
        ...prev,
        atoms: Math.max(0, prev.atoms + atomsPerSec * dt),
        energy: Math.max(0, prev.energy + energyPerSec * dt),
        quarks: Math.max(0, prev.quarks + quarksPerSec * dt),
        totalAtoms: prev.totalAtoms + atomsPerSec * dt,
        totalEnergy: prev.totalEnergy + Math.max(0, energyPerSec * dt),
        totalQuarks: prev.totalQuarks + Math.max(0, quarksPerSec * dt),
      }));
    };

    const id = setInterval(tick, tickMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // autosave
  useEffect(() => {
    if (!game.settings?.autosave) return;
    const id = setInterval(() => saveGame(), 15000);
    return () => clearInterval(id);
  }, [saveGame, game.settings]);

  /* -------------------------
     Actions: buy building(s), buy upgrade
     ------------------------- */

  function getNextCostFor(building) {
    // building is one of game.buildings objects
    if (!building) return { atoms: 0, energy: 0, quarks: 0 };
    return scaleCost(building.baseCosts, building.costScale, building.amount);
  }

  function buyBuilding(id) {
    setGame((prev) => {
      const idx = prev.buildings.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const b = prev.buildings[idx];
      const cost = scaleCost(b.baseCosts, b.costScale, b.amount);
      if (!canAffordCost(cost, prev)) return prev;
      const nextBuildings = prev.buildings.slice();
      nextBuildings[idx] = { ...b, amount: b.amount + 1 };
      return {
        ...prev,
        atoms: prev.atoms - (cost.atoms || 0),
        energy: prev.energy - (cost.energy || 0),
        quarks: prev.quarks - (cost.quarks || 0),
        buildings: nextBuildings,
      };
    });
  }

  function buyMaxBuilding(id) {
    setGame((prev) => {
      const idx = prev.buildings.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const b = prev.buildings[idx];
      let availAtoms = prev.atoms;
      let availEnergy = prev.energy;
      let availQuarks = prev.quarks;
      let bought = 0;
      let nextAmount = b.amount;
      // simple loop buying until cannot afford; safe guard on iterations
      while (bought < 200000 && true) {
        const cost = scaleCost(b.baseCosts, b.costScale, nextAmount);
        if (cost.atoms <= availAtoms && cost.energy <= availEnergy && cost.quarks <= availQuarks) {
          availAtoms -= cost.atoms;
          availEnergy -= cost.energy;
          availQuarks -= cost.quarks;
          nextAmount++;
          bought++;
        } else break;
      }
      if (bought === 0) return prev;
      const nextBuildings = prev.buildings.slice();
      nextBuildings[idx] = { ...b, amount: b.amount + bought };
      return {
        ...prev,
        atoms: availAtoms,
        energy: availEnergy,
        quarks: availQuarks,
        buildings: nextBuildings,
      };
    });
  }

  function buyUpgrade(upgradeId) {
    setGame((prev) => {
      const idx = prev.upgrades.findIndex((u) => u.id === upgradeId);
      if (idx === -1) return prev;
      const u = prev.upgrades[idx];
      if (u.applied) return prev;
      const cost = u.cost || { atoms: 0, energy: 0, quarks: 0 };
      if (!canAffordCost(cost, prev)) return prev;
      const nextUpgrades = prev.upgrades.slice();
      nextUpgrades[idx] = { ...u, applied: true };
      const afterPurchase = {
        ...prev,
        atoms: prev.atoms - (cost.atoms || 0),
        energy: prev.energy - (cost.energy || 0),
        quarks: prev.quarks - (cost.quarks || 0),
        upgrades: nextUpgrades,
      };
      // call apply to effect changes (it receives (game,setGame))
      if (typeof u.apply === "function") {
        u.apply(afterPurchase, setGame);
      }
      return afterPurchase;
    });
  }

  /* -------------------------
     Manual synth (click)
     ------------------------- */

  function synthManual() {
    setGame((prev) => ({
      ...prev,
      atoms: prev.atoms + (prev.clickPower || 1),
      totalAtoms: prev.totalAtoms + (prev.clickPower || 1),
    }));
  }

  /* -------------------------
     Render
     ------------------------- */

  return (
    <div className="app-root">
      <header className="topbar">
        <h1>Quantum Incremental</h1>
        <div className="top-stats">
          <div>Atoms: <strong>{Math.floor(game.atoms).toLocaleString()}</strong></div>
          <div>Energy: <strong>{Math.floor(game.energy).toLocaleString()}</strong></div>
          <div>Quarks: <strong>{Math.floor(game.quarks).toLocaleString()}</strong></div>
        </div>
      </header>

      <main className="main-grid">
        <section className="panel click-panel">
          <Clicker onClick={synthManual} power={game.clickPower} />
          <div className="small">Manual synthesis helps bootstrap production.</div>
        </section>

        <section className="panel resources-panel">
          <ResourcePanel game={game} />
        </section>

        <section className="panel buildings-panel">
          <h2>Buildings</h2>
          <BuildingList
            buildings={game.buildings}
            getNextCostFor={getNextCostFor}
            buyBuilding={buyBuilding}
            buyMaxBuilding={buyMaxBuilding}
            game={game}
          />
        </section>

        <section className="panel upgrades-panel">
          <h2>Upgrades</h2>
          <UpgradeList upgrades={game.upgrades} buyUpgrade={buyUpgrade} game={game} />
        </section>
      </main>

      <footer className="footer">
        <div className="small">Autosave: {game.settings.autosave ? "ON" : "OFF"}</div>
        <div className="small">Total Atoms: {Math.floor(game.totalAtoms).toLocaleString()}</div>
        <div style={{display:"flex",gap:8}}>
          <button className="tiny" onClick={() => { const s = exportString(); navigator.clipboard?.writeText(s); alert("Save copied to clipboard"); }}>Export</button>
          <button className="tiny" onClick={() => { const txt = prompt("Paste import string"); if (txt) importString(txt); }}>Import</button>
          <button className="tiny" onClick={() => { saveGame(); alert("Saved"); }}>Save</button>
          <button className="tiny" onClick={() => { if (confirm("Hard reset?")) { setGame(mkInitialGame()); localStorage.removeItem("quantum_save_v1"); } }}>Reset</button>
        </div>
      </footer>
    </div>
  );
}
