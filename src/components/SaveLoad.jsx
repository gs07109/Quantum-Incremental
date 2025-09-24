import React, { useState } from "react";

export default function SaveLoad({ exportString, importString, save, load }) {
  const [txt, setTxt] = useState("");
  return (
    <div>
      <h3>Save / Load / Export</h3>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button className="tiny" onClick={save}>Save</button>
        <button className="tiny" onClick={load}>Load</button>
        <button className="tiny" onClick={() => { const s = exportString(); setTxt(s); navigator.clipboard?.writeText(s); alert("Export copied to clipboard"); }}>Export</button>
        <button className="tiny" onClick={() => { importString(txt); setTxt(""); alert("Imported"); }}>Import</button>
      </div>
      <textarea style={{width:"100%",marginTop:8}} value={txt} onChange={(e)=>setTxt(e.target.value)} placeholder="Paste import string here"></textarea>
    </div>
  );
}
