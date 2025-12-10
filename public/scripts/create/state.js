import { clampInt } from "./utils.js";

export const TEAM_ID_MIN = 1;
export const TEAM_ID_MAX = 249;

export const COOLDOWN_PRESETS = {
  fast: 250,
  intermediate: 500,
  slow: 800,
};

export const state = {
  mode: "tdm", // "tdm" | "ffa"

  // Example IDs (later via WebSocket)
  availablePlayerIDs: [1,2,3,4,5,6,7,8,9,10,11,12,13,14],

  // playerId -> { name: string, teamId: number|null }
  players: new Map(),

  // teams: { id, name, color }
  teams: [],
  usedTeamIds: new Set(),

  settings: {
    cooldownMs: 500,
    durationMin: 10,
    lives: 3,
  },
};

export function ensurePlayers() {
  for (let i = 0; i < state.availablePlayerIDs.length; i++) {
    const id = state.availablePlayerIDs[i];
    if (!state.players.has(id)) state.players.set(id, { name: "", teamId: null });
  }
}

export function setMode(mode) {
  state.mode = mode === "ffa" ? "ffa" : "tdm";

  // In FFA, teams are not used for players
  if (state.mode === "ffa") {
    for (const st of state.players.values()) st.teamId = null;
  }
}

export function findTeamById(teamId) {
  for (let i = 0; i < state.teams.length; i++) {
    if (state.teams[i].id === teamId) return state.teams[i];
  }
  return null;
}

export function getNextFreeTeamId() {
  for (let id = TEAM_ID_MIN; id <= TEAM_ID_MAX; id++) {
    if (!state.usedTeamIds.has(id)) return id;
  }
  return null;
}

export function addTeam(name) {
  const trimmed = String(name ?? "").trim();
  if (!trimmed) return { ok: false, reason: "empty" };

  const finalName = trimmed.length > 32 ? trimmed.substring(0, 32) : trimmed;

  const newId = getNextFreeTeamId();
  if (newId === null) return { ok: false, reason: "full" };

  state.teams.push({ id: newId, name: finalName, color: "#9d9da1" });
  state.usedTeamIds.add(newId);

  return { ok: true, id: newId };
}

export function removeTeam(teamId) {
  state.teams = state.teams.filter(t => t.id !== teamId);
  state.usedTeamIds.delete(teamId);

  for (const st of state.players.values()) {
    if (st.teamId === teamId) st.teamId = null;
  }
}

export function setTeamColor(teamId, color) {
  for (let i = 0; i < state.teams.length; i++) {
    if (state.teams[i].id === teamId) {
      state.teams[i].color = color;
      return;
    }
  }
}

export function setPlayerName(playerId, name) {
  const st = state.players.get(playerId);
  if (!st) return;
  const raw = String(name ?? "").replace(/\n/g, "");
  st.name = raw.length > 32 ? raw.substring(0, 32) : raw;
}

export function setPlayerTeam(playerId, teamId) {
  const st = state.players.get(playerId);
  if (!st) return;

  if (state.mode !== "tdm") {
    st.teamId = null;
    return;
  }

  const tid = Number(teamId);
  st.teamId = Number.isFinite(tid) ? tid : null;
}

export function setSettings(partial) {
  if (typeof partial.cooldownMs === "number") state.settings.cooldownMs = clampInt(partial.cooldownMs, 0, 600000);
  if (typeof partial.durationMin === "number") state.settings.durationMin = clampInt(partial.durationMin, 1, 999);
  if (typeof partial.lives === "number") state.settings.lives = clampInt(partial.lives, 1, 99);
}
