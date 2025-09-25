import React from "react";
import { RESOURCE_COLORS } from "../App";

export default function UpgradeList({ upgrades, resources, buyUpgrade, getNextCostFor }) {
  return (
    <section>
      <h2>Upgrades</h2>
      {upgrades.map((upgrade) => {
        const nextCost = getNextCostFor(upgrade.id);
        const canAfford = Object.entries(nextCost).every(
          ([res, cost]) => resources[res] >= cost
        );

        return (
          <div key={upgrade.id} className="upgrade-item">
            <span>{upgrade.name}</span>
            <button
              disabled={!canAfford}
              onClick={() => buyUpgrade(upgrade.id)}
              title={Object.entries(nextCost)
                .map(([res, cost]) => `${res}: ${cost}`)
                .join("\n")}
            >
              Buy {upgrade.name} (
              {Object.entries(nextCost).map(([res, cost], i) => (
                <span
                  key={res}
                  style={{ color: RESOURCE_COLORS[res] }}
                >
                  {cost} {res}
                  {i < Object.entries(nextCost).length - 1 ? ", " : ""}
                </span>
              ))}
              )
            </button>
          </div>
        );
      })}
    </section>
  );
}
