import React from "react";

export default function ResearchTree({ research = [], doResearch, resources }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr",gap:8}}>
      {research.map(r => (
        <div key={r.id} style={{padding:8,borderRadius:8,background:"rgba(255,255,255,0.02)"}}>
          <div style={{fontWeight:600}}>{r.name}</div>
          <div className="small">{r.desc}</div>
          <div className="small" style={{marginTop:6}}>Cost: {Math.round(r.cost).toLocaleString()} {r.prereq.length ? `• Prereq: ${r.prereq.join(", ")}` : ""}</div>
          <div style={{marginTop:6}}><button className="tiny" onClick={() => doResearch(r.id)} disabled={r.researched || resources.quantum < r.cost}>{r.researched ? "Researched" : "Research"}</button></div>
        </div>
      ))}
    </div>
  );
}
