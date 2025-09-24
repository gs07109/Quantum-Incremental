import React from "react";

export default function MetaControls({ autos, setAutos }) {
  return (
    <div>
      <h3>Automation</h3>
      <label style={{display:"flex",alignItems:"center",gap:8}}>
        <input type="checkbox" checked={autos.enabled} onChange={(e)=>setAutos({...autos, enabled:e.target.checked})} />
        <span className="small">Enable auto-buyers (unlock via research)</span>
      </label>
    </div>
  );
}
