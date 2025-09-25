import React from "react";
import { RESOURCE_COLORS } from "../App";

export default function BuildingList({
  buildings,
  buyBuilding,
  buyMaxBuilding,
  getNextCost,
  resources, // should be like { atoms: ..., energy: ..., quarks: ... }
}) {
  if (!buildings || !resources) return null; // safety check

  return (
    <section>
      <h2>Buildings</h2>
      {buildings.map((b) => {
        const nextCost = getNextCost(b.id) || {}; // ensure object
        const canAfford = Object.entries(nextCost).every(
          ([res, cost]) => (resources[res] ?? 0) >= cost
        );

        return (
          <div key={b.id} className="building-item">
            <span>{b.name}</span>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {Object.entries(nextCost).map(([res, cost], i) => (
                <span key={res} style={{ color: RESOURCE_COLORS[res] }}>
                  {cost} {res}
                  {i < Object.entries(nextCost).length - 1 ? ", " : ""}
                </span>
              ))}
            </div>
            <button
              disabled={!canAfford}
              onClick={() => buyBuilding(b.id)}
            >
              Buy 1
            </button>
            <button
              disabled={!canAfford}
              onClick={() => buyMaxBuilding(b.id)}
            >
              Buy Max
            </button>
            <div>Owned: {b.amount}</div>
          </div>
        );
      })}
    </section>
  );
}
