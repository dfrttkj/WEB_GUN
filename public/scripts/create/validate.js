import { findTeamById, ensurePlayers, state } from "./state.js";

export function validateCreate() {
  ensurePlayers();

  // Names must be set
  for (let i = 0; i < state.availablePlayerIDs.length; i++) {
    const id = state.availablePlayerIDs[i];
    const st = state.players.get(id);
    const name = (st?.name ?? "").trim();
    if (!name) return `Player ${id} needs a name.`;
  }

  if (state.mode === "tdm") {
    if (state.teams.length < 2) return "Team Deathmatch requires at least 2 teams.";

    const usedByPlayers = new Set();

    for (let i = 0; i < state.availablePlayerIDs.length; i++) {
      const id = state.availablePlayerIDs[i];
      const st = state.players.get(id);

      if (!st || !st.teamId) return `Assign a team for player ${id}.`;
      if (!findTeamById(st.teamId)) return `Player ${id} has an invalid team selection.`;

      usedByPlayers.add(st.teamId);
    }

    if (usedByPlayers.size < 2) {
      return "Players must be split across at least 2 different teams.";
    }
  }

  // Settings sanity
  if (!Number.isFinite(state.settings.cooldownMs) || state.settings.cooldownMs < 0) return "Cooldown must be 0 or more.";
  if (state.settings.cooldownMs > 600000) return "Cooldown is too high.";

  if (!Number.isFinite(state.settings.lives) || state.settings.lives < 1) return "Lives must be at least 1.";
  if (state.settings.lives > 99) return "Lives is too high.";

  if (state.mode === "ffa") {
    if (!Number.isFinite(state.settings.durationMin) || state.settings.durationMin < 1) return "Game length must be at least 1 minute.";
    if (state.settings.durationMin > 999) return "Game length is too high.";
  }

  return null;
}
