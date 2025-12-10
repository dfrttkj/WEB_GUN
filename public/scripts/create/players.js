import { on } from "./events.js";
import { escapeHtml, hexToRgb, rgba } from "./utils.js";
import { ensurePlayers, findTeamById, setPlayerName, setPlayerTeam, state } from "./state.js";

let teamPickerEl = null;

function closeTeamPicker() {
  if (!teamPickerEl) return;

  teamPickerEl.remove();
  teamPickerEl = null;

  document.removeEventListener("pointerdown", onDocPointerDown, true);
  document.removeEventListener("keydown", onDocKeyDown, true);

  const scroller = document.querySelector(".table-scroll");
  if (scroller) scroller.removeEventListener("scroll", closeTeamPicker);
}

function onDocPointerDown(ev) {
  if (!teamPickerEl) return;
  if (teamPickerEl.contains(ev.target)) return;
  closeTeamPicker();
}

function onDocKeyDown(ev) {
  if (ev.key === "Escape") closeTeamPicker();
}

function renderTeamCellHTML(teamId) {
  if (state.mode === "ffa") {
    return `
      <span class="team-pill team-pill--muted" style="--team-color:#9d9da1">
        <span class="team-pill__dot"></span>
        <span class="team-pill__text">FFA</span>
      </span>
    `;
  }

  if (!teamId) {
    return `
      <span class="team-pill team-pill--muted">
        <span class="team-pill__text">Select team</span>
      </span>
    `;
  }

  const t = findTeamById(teamId);
  if (!t) {
    return `
      <span class="team-pill team-pill--muted">
        <span class="team-pill__text">Select team</span>
      </span>
    `;
  }

  const color = t.color || "#9d9da1";
  const name = t.name || "Team";

  return `
    <span class="team-pill" style="--team-color:${color}">
      <span class="team-pill__dot"></span>
      <span class="team-pill__text">${escapeHtml(name)}</span>
    </span>
  `;
}

function applyTeamRowTint(rowEl, teamId) {
  if (!rowEl) return;

  if (state.mode !== "tdm") {
    rowEl.style.backgroundImage = "";
    rowEl.style.backgroundColor = "";
    return;
  }

  if (!teamId) {
    rowEl.style.backgroundImage = "";
    rowEl.style.backgroundColor = "";
    return;
  }

  const team = findTeamById(teamId);
  if (!team || !team.color) {
    rowEl.style.backgroundImage = "";
    rowEl.style.backgroundColor = "";
    return;
  }

  const rgb = hexToRgb(team.color);
  if (!rgb) {
    rowEl.style.backgroundImage = "";
    rowEl.style.backgroundColor = "";
    return;
  }

  const g = `linear-gradient(90deg,
    ${rgba(rgb, 0.22)} 0%,
    ${rgba(rgb, 0.12)} 35%,
    ${rgba(rgb, 0.06)} 52%,
    ${rgba(rgb, 0.00)} 62%
  )`;

  rowEl.style.backgroundImage = g;
  rowEl.style.backgroundColor = "transparent";
}

function openTeamPicker(anchorCell, playerId) {
  if (state.mode !== "tdm") return;

  closeTeamPicker();

  const menu = document.createElement("div");
  menu.className = "team-picker";
  menu.setAttribute("role", "listbox");

  const noneBtn = document.createElement("button");
  noneBtn.type = "button";
  noneBtn.className = "team-picker__item";
  noneBtn.dataset.teamId = "";
  noneBtn.innerHTML = `
    <span class="team-picker__dot" style="--dot-color:#9d9da1"></span>
    <span class="team-picker__label">None</span>
    <span class="team-picker__meta"></span>
  `;
  menu.appendChild(noneBtn);

  const sorted = state.teams.slice().sort((a, b) => a.id - b.id);

  if (sorted.length === 0) {
    const empty = document.createElement("div");
    empty.className = "team-picker__empty";
    empty.innerText = "No teams created yet.";
    menu.appendChild(empty);
  } else {
    for (let i = 0; i < sorted.length; i++) {
      const t = sorted[i];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "team-picker__item";
      btn.dataset.teamId = String(t.id);
      btn.innerHTML = `
        <span class="team-picker__dot" style="--dot-color:${t.color || "#9d9da1"}"></span>
        <span class="team-picker__label">${escapeHtml(t.name)}</span>
        <span class="team-picker__meta">#${t.id}</span>
      `;
      menu.appendChild(btn);
    }
  }

  menu.addEventListener("click", (ev) => {
    const item = ev.target.closest(".team-picker__item");
    if (!item) return;

    const raw = item.dataset.teamId;
    const teamId = raw ? Number(raw) : null;

    setPlayerTeam(playerId, teamId);

    // Update UI for that cell
    anchorCell.innerHTML = renderTeamCellHTML(teamId);

    const row = anchorCell.closest("tr");
    applyTeamRowTint(row, teamId);

    closeTeamPicker();
  });

  document.body.appendChild(menu);
  teamPickerEl = menu;

  const rect = anchorCell.getBoundingClientRect();
  const padding = 8;

  let left = rect.left;
  let top = rect.bottom + 8;

  const maxLeft = window.innerWidth - menu.offsetWidth - padding;
  if (left > maxLeft) left = maxLeft;
  if (left < padding) left = padding;

  const spaceBelow = window.innerHeight - rect.bottom;
  if (spaceBelow < 300) top = rect.top - menu.offsetHeight - 8;

  const maxTop = window.innerHeight - menu.offsetHeight - padding;
  if (top > maxTop) top = maxTop;
  if (top < padding) top = padding;

  menu.style.left = `${Math.round(left)}px`;
  menu.style.top = `${Math.round(top)}px`;

  document.addEventListener("pointerdown", onDocPointerDown, true);
  document.addEventListener("keydown", onDocKeyDown, true);

  const scroller = document.querySelector(".table-scroll");
  if (scroller) scroller.addEventListener("scroll", closeTeamPicker);
}

function enforceMaxLengthContenteditable(cell, maxLength, onAfterChange) {
  cell.addEventListener("input", () => {
    let text = cell.innerText.replace(/\n/g, "");
    if (text.length > maxLength) {
      text = text.substring(0, maxLength);
      cell.innerText = text;

      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(cell);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    if (onAfterChange) onAfterChange(cell.innerText.replace(/\n/g, ""));
  });
}

function refreshAllPlayerRows(dom) {
  const rows = dom.playerTableBody.querySelectorAll("tr[data-player-id]");
  rows.forEach(row => {
    const pid = Number(row.getAttribute("data-player-id"));
    if (!Number.isFinite(pid)) return;

    const st = state.players.get(pid);
    const teamId = st ? st.teamId : null;

    const teamCell = row.querySelector(".players-team-cell");
    if (teamCell) {
      teamCell.innerHTML = renderTeamCellHTML(teamId);
      teamCell.classList.toggle("team-locked", state.mode === "ffa");
    }

    applyTeamRowTint(row, teamId);
  });
}

function renderPlayerTable(dom) {
  ensurePlayers();
  dom.playerTableBody.innerHTML = "";

  for (let i = 0; i < state.availablePlayerIDs.length; i++) {
    const id = state.availablePlayerIDs[i];
    const st = state.players.get(id);

    const row = document.createElement("tr");
    row.classList.add("player-row");
    row.setAttribute("data-player-id", String(id));

    row.innerHTML = `
      <td>${id}</td>
      <td class="name-cell" contenteditable="true" spellcheck="false"></td>
      <td class="players-team-cell" data-player-id="${id}" tabindex="0" aria-haspopup="listbox"></td>
    `;

    dom.playerTableBody.appendChild(row);

    const nameCell = row.querySelector(".name-cell");
    nameCell.innerText = st?.name || "";
    enforceMaxLengthContenteditable(nameCell, 32, (value) => setPlayerName(id, value));

    const teamCell = row.querySelector(".players-team-cell");
    teamCell.innerHTML = renderTeamCellHTML(st?.teamId ?? null);

    applyTeamRowTint(row, st?.teamId ?? null);
  }

  refreshAllPlayerRows(dom);
}

export function initPlayers(dom) {
  renderPlayerTable(dom);

  // Click -> open team picker
  document.addEventListener("click", (e) => {
    if (state.mode !== "tdm") return;

    const cell = e.target.closest(".players-team-cell");
    if (!cell) return;

    const playerId = Number(cell.getAttribute("data-player-id"));
    if (!Number.isFinite(playerId)) return;

    openTeamPicker(cell, playerId);
  });

  // Keyboard open
  document.addEventListener("keydown", (e) => {
    if (state.mode !== "tdm") return;

    const active = document.activeElement;
    if (!active?.classList?.contains("players-team-cell")) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const playerId = Number(active.getAttribute("data-player-id"));
      if (!Number.isFinite(playerId)) return;
      openTeamPicker(active, playerId);
    }
  });

  // Close picker when switching views
  on("left:viewChanged", () => closeTeamPicker());

  // Refresh when teams change (names/colors) or mode changes
  on("teams:changed", () => refreshAllPlayerRows(dom));
  on("mode:changed", () => {
    closeTeamPicker();
    refreshAllPlayerRows(dom);
  });
}
