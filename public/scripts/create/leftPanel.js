import { on, emit } from "./events.js";
import { state } from "./state.js";

export function initLeftPanel(dom) {
  function setLeftMode(mode) {
    const isPlayers = mode === "players";

    dom.playersView.classList.toggle("hidden", !isPlayers);
    dom.teamsView.classList.toggle("hidden", isPlayers);

    dom.boxTitle.innerText = isPlayers ? "Players" : "Teams";

    dom.playersTabBtn.classList.toggle("active", isPlayers);
    dom.playersTabBtn.setAttribute("aria-selected", String(isPlayers));

    dom.teamsTabBtn.classList.toggle("active", !isPlayers);
    dom.teamsTabBtn.setAttribute("aria-selected", String(!isPlayers));

    emit("left:viewChanged", { view: isPlayers ? "players" : "teams" });
  }

  dom.playersTabBtn.addEventListener("click", () => setLeftMode("players"));

  dom.teamsTabBtn.addEventListener("click", () => {
    if (dom.teamsTabBtn.disabled) return;
    setLeftMode("teams");
  });

  // Mode changes: disable teams tab in FFA and force players view
  on("mode:changed", ({ mode }) => {
    const disableTeams = mode === "ffa";
    dom.teamsTabBtn.disabled = disableTeams;
    if (disableTeams) setLeftMode("players");
  });

  // Initial
  dom.teamsTabBtn.disabled = state.mode === "ffa";
  setLeftMode("players");

  return { setLeftMode };
}
