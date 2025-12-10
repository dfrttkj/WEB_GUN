import { escapeHtml } from "./utils.js";
import { addTeam, removeTeam, setTeamColor, state } from "./state.js";
import { emit } from "./events.js";

export function initTeams(dom) {
  function render() {
    dom.teamTableBody.innerHTML = "";

    const sorted = state.teams.slice().sort((a, b) => a.id - b.id);

    for (let i = 0; i < sorted.length; i++) {
      const team = sorted[i];
      const teamColor = team.color || "#9d9da1";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${team.id}</td>
        <td>${escapeHtml(team.name)}</td>
        <td>
          <div class="team-actions">
            <label class="color-dot" data-team-id="${team.id}" style="--dot-color:${teamColor}" title="Pick color">
              <input class="color-input" type="color" value="${teamColor}" data-team-id="${team.id}">
            </label>
            <button class="remove-btn" data-team-id="${team.id}" title="Remove" type="button">X</button>
          </div>
        </td>
      `;

      dom.teamTableBody.appendChild(row);
    }
  }

  function tryAddTeam() {
    const name = dom.teamNameInput.value;
    const res = addTeam(name);
    if (res.ok) {
      dom.teamNameInput.value = "";
      dom.teamNameInput.focus();
      render();
      emit("teams:changed", {});
      return;
    }

    if (res.reason === "full") alert("Maximum number of custom teams reached (1–249).");
  }

  dom.addTeamBtn.addEventListener("click", tryAddTeam);
  dom.teamNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      tryAddTeam();
    }
  });

  // Delegation for remove + color
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".remove-btn");
    if (!btn) return;

    const teamId = Number(btn.getAttribute("data-team-id"));
    if (!Number.isFinite(teamId)) return;

    removeTeam(teamId);
    render();
    emit("teams:changed", {});
  });

  document.addEventListener("input", (e) => {
    const input = e.target.closest(".color-input");
    if (!input) return;

    const teamId = Number(input.getAttribute("data-team-id"));
    if (!Number.isFinite(teamId)) return;

    const color = input.value;
    setTeamColor(teamId, color);

    const dot = document.querySelector(`.color-dot[data-team-id="${teamId}"]`);
    if (dot) dot.style.setProperty("--dot-color", color);

    emit("teams:changed", {});
  });

  // Initial render
  render();
}
