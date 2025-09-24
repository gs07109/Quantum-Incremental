import React from "react";

function formatCost(c) {
  const parts = [];
  if (c.atoms) parts.push(`${c.atoms.toLocaleString()} A`);
  if (c.energy) parts.push(`${c.energy.toLocaleString()} E`);
  if (c.quarks) parts.push(`${c.quarks.toLocaleString()} Q`);
  return parts.join(" + ");
}

export default function UpgradeList({ upgrades, buyUpgrade, atoms, energy, quarks }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {upgrades.map((u) => (
        <div className="card" key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="card-title">{u.name}</div>
            <div className="muted">{u.desc}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="small">{u.applied ? "Purchased" : formatCost(u.cost || { atoms: 0, energy: 0, quarks: 0 })}</div>
            <button className="tiny" onClick={() => buyUpgrade(u.id)} disabled={u.applied || (u.cost?.atoms || 0) > atoms || (u.cost?.energy || 0) > energy || (u.cost?.quarks || 0) > quarks }>
              {u.applied ? "✓" : "Buy"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
