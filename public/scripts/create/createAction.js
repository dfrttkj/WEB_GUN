import { validateCreate } from "./validate.js";
import { setError, clearError } from "./ui.js";
import { state, ensurePlayers } from "./state.js";

export function initCreateAction(dom) {
  dom.createGameBtn.addEventListener("click", () => {
    const err = validateCreate();
    if (err) { setError(dom, err); return; }

    clearError(dom);

    ensurePlayers();

    const payload = {
      mode: state.mode,
      settings: { ...state.settings },
      players: state.availablePlayerIDs.map(id => {
        const st = state.players.get(id) || { name: "", teamId: null };
        return {
          id,
          name: (st.name || "").trim(),
          teamId: state.mode === "tdm" ? st.teamId : null,
        };
      }),
      teams: state.mode === "tdm" ? state.teams.slice().sort((a, b) => a.id - b.id) : [],
    };

    console.log("Create payload (mock):", payload);
  });
}
