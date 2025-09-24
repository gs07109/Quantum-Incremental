import React from "react";
export default function Stats({ coins, totalCoins, cps, prestige }) {
  const fmt = n => Math.round(n).toLocaleString();
  return (
    <div style={{marginBottom:12}}>
      <div>Quantum: {fmt(coins)}</div>
      <div>Total: {fmt(totalCoins)}</div>
      <div>Rate: {fmt(cps)}/s</div>
      <div>Prestige: {prestige.level} (×{prestige.antimatter.toFixed(3)})</div>
    </div>
  );
}
