import React from "react";

export default function ResourcePanel({ game }) {
  // compute per-second production from buildings
  let atomsPerSec = 0, energyPerSec = 0, quarksPerSec = 0;
  for (const b of game.buildings) {
    if (b.amount <= 0) continue;
    const m = b.multiplier || 1;
    const atomsOut = (b.baseOutput.atoms || 0) * b.amount * m;
    let energyOut = (b.baseOutput.energy || 0) * b.amount * m;
    if (energyOut < 0) energyOut *= (b.energyModifier ?? 1);
    const quarksOut = (b.baseOutput.quarks || 0) * b.amount * m;
    atomsPerSec += atomsOut;
    energyPerSec += energyOut;
    quarksPerSec += quarksOut;
  }

  return (
    <div>
      <h2>Resources</h2>
      <div className="res-row"><strong>Atoms:</strong> {Math.floor(game.atoms).toLocaleString()} <span className="muted">(+{atomsPerSec.toFixed(2)}/s)</span></div>
      <div className="res-row"><strong>Energy:</strong> {Math.floor(game.energy).toLocaleString()} <span className="muted">({energyPerSec >= 0 ? '+' : ''}{energyPerSec.toFixed(2)}/s)</span></div>
      <div className="res-row"><strong>Quarks:</strong> {Math.floor(game.quarks).toLocaleString()} <span className="muted">(+{quarksPerSec.toFixed(3)}/s)</span></div>
    </div>
  );
}
