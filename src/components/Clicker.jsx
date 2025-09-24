import React from "react";

export default function Clicker({ onClick, power }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <button className="big-button" onClick={onClick}>Synthesize Atoms (+{power})</button>
      <div className="small">Manual synthesis helps start automation.</div>
    </div>
  );
}
