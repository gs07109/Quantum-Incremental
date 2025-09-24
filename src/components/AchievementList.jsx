import React from "react";

export default function AchievementList({ achievements }) {
  return (
    <div className="section">
      <h2>🏆 Achievements</h2>
      <div className="card-grid">
        {achievements
          .filter((a) => a.unlocked)
          .map((a) => (
            <div className="card achievement" key={a.id}>
              <h3>{a.name}</h3>
            </div>
          ))}
      </div>
    </div>
  );
}
