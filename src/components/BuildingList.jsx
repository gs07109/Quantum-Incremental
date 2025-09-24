import React from "react";

function fmt(n, digits = 0) {
  if (n >= 1e6) return n.toExponential(2);
  return Number.isInteger(n) ? n.toLocaleString() : n.toFixed(digits);
}

function costToString(cost) {
  const parts = [];
  if ((cost.atoms || 0) > 0) parts.push(`${(cost.atoms).toLocaleString()} A`);
  if ((cost.energy || 0) > 0) parts.push(`${(cost.energy).toLocaleString()} E`);
  if ((cost.quarks || 0) > 0) parts.push(`${(cost.quarks).toLocaleString()} Q`);
  return parts.length ? parts.join(" + ") : "Free";
}

export default function BuildingList({ buildings = [], getNextCostFor, buyBuilding, buyMaxBuilding, game }) {
  const atoms = game?.atoms || 0;
  const energy = game?.energy || 0;
  const quarks = game?.quarks || 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {buildings.map((b) => {
        const nextCost = getNextCostFor(b);
        // produce string describing outputs (apply multiplier for simple display)
        const outputs = [];
        const mult = b.multiplier || 1;
        if ((b.baseOutput?.atoms || 0) !== 0) outputs.push(`${(b.baseOutput.atoms * mult).toFixed(2)} A/s`);
        if ((b.baseOutput?.energy || 0) !== 0) outputs.push(`${(b.baseOutput.energy * mult).toFixed(2)} E/s`);
        if ((b.baseOutput?.quarks || 0) !== 0) outputs.push(`${(b.baseOutput.quarks * mult).toFixed(4)} Q/s`);

        const canAfford = (nextCost.atoms || 0) <= atoms && (nextCost.energy || 0) <= energy && (nextCost.quarks || 0) <= quarks;

        return (
          <div className="card" key={b.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div className="card-title">{b.name}</div>
                <div className="muted">{b.description}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="big-num">{b.amount}</div>
                <div className="muted">Owned</div>
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <div className="small">Produces: {outputs.length ? outputs.join(" • ") : "—"}</div>
              <div className="small">Upkeep/mod: {b.energyModifier ? b.energyModifier.toFixed(2) : "1.00"}</div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button className="tiny" onClick={() => buyBuilding(b.id)} disabled={!canAfford}>
                Buy ×1 ({costToString(nextCost)})
              </button>
              <button className="tiny" onClick={() => buyMaxBuilding(b.id)} disabled={!canAfford}>
                Buy Max
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
