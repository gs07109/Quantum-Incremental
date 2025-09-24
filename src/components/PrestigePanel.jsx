import React from "react";

export default function PrestigePanel({ prestige, ascend, requirement, total }) {
  return (
    <div>
      <h3>Prestige (Ascend)</h3>
      <div className="small">Level: {prestige.level} • Mult: ×{prestige.antimatter.toFixed(3)}</div>
      <div className="small" style={{marginTop:6}}>Next ascend requirement: {Math.round(requirement).toLocaleString()} total quantum</div>
      <div style={{marginTop:8}}>
        <button className="tiny" onClick={ascend} disabled={total < requirement}>Ascend</button>
      </div>
    </div>
  );
}
