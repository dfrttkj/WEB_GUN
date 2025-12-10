console.log("create.js loaded");

/* =========================
   STATE
========================= */

const TEAM_ID_MIN = 1;
const TEAM_ID_MAX = 249;

let currentMode = "tdm"; // "tdm" | "ffa"

// Player state
const playersState = new Map(); // playerId -> { name: string, teamId: number|null }

// Teams
let teams = [];              // { id:number, name:string, color:string }
let usedTeamIds = new Set(); // used ids

// Game settings
const gameSettings = {
    cooldownMs: 500,
    durationMin: 10,
    lives: 3
};

// Presets for Simple mode
const COOLDOWN_PRESETS = {
    fast: 250,
    intermediate: 500,
    slow: 800
};

// Example IDs (later WebSocket)
let availablePlayerIDs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

/* =========================
   DOM
========================= */

const modeOverlay = document.getElementById("modeOverlay");
const modeContinueBtn = document.getElementById("modeContinueBtn");
const modeCards = document.querySelectorAll(".mode-card");

const boxTitle = document.getElementById("boxTitle");
const playersView = document.getElementById("playersView");
const teamsView = document.getElementById("teamsView");
const playersTabBtn = document.getElementById("playersTabBtn");
const teamsTabBtn = document.getElementById("teamsTabBtn");

const playerTableBody = document.getElementById("playerTableBody");

const teamNameInput = document.getElementById("teamNameInput");
const addTeamBtn = document.getElementById("addTeamBtn");
const teamTableBody = document.getElementById("teamTableBody");

const settingsSimpleBtn = document.getElementById("settingsSimpleBtn");
const settingsAdvancedBtn = document.getElementById("settingsAdvancedBtn");
const settingsSimpleView = document.getElementById("settingsSimpleView");
const settingsAdvancedView = document.getElementById("settingsAdvancedView");

const simpleDurationSection = document.getElementById("simpleDurationSection");
const advancedDurationSection = document.getElementById("advancedDurationSection");

const cooldownMsInput = document.getElementById("cooldownMsInput");
const durationMinInput = document.getElementById("durationMinInput");
const livesInput = document.getElementById("livesInput");

// NEW: Lives stepper (Simple view)
const livesMinusBtn = document.getElementById("livesMinusBtn");
const livesPlusBtn = document.getElementById("livesPlusBtn");
const livesSimpleInput = document.getElementById("livesSimpleInput");

const createGameBtn = document.getElementById("createGameBtn");
const createError = document.getElementById("createError");


/* =========================
   HELPERS
========================= */

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function clampInt(value, min, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return min;
    const i = Math.floor(n);
    if (i < min) return min;
    if (i > max) return max;
    return i;
}

function setError(msg) {
    if (!createError) return;
    createError.textContent = msg ? String(msg) : "";
}

function hexToRgb(hex) {
    if (!hex) return null;
    let h = String(hex).trim();
    if (h.startsWith("#")) h = h.slice(1);
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    if (h.length !== 6) return null;

    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);

    if ([r, g, b].some(n => Number.isNaN(n))) return null;
    return { r, g, b };
}

function rgba({ r, g, b }, a) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function findTeamById(teamId) {
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].id === teamId) return teams[i];
    }
    return null;
}

function getNextFreeTeamId() {
    for (let id = TEAM_ID_MIN; id <= TEAM_ID_MAX; id++) {
        if (!usedTeamIds.has(id)) return id;
    }
    return null;
}


/* =========================
   TEAM PICKER POPUP
========================= */

let teamPickerEl = null;

function onDocPointerDown(ev) {
    if (!teamPickerEl) return;
    if (teamPickerEl.contains(ev.target)) return;
    closeTeamPicker();
}

function onDocKeyDown(ev) {
    if (ev.key === "Escape") closeTeamPicker();
}

function closeTeamPicker() {
    if (!teamPickerEl) return;

    teamPickerEl.remove();
    teamPickerEl = null;

    document.removeEventListener("pointerdown", onDocPointerDown, true);
    document.removeEventListener("keydown", onDocKeyDown, true);

    const scroller = document.querySelector(".table-scroll");
    if (scroller) scroller.removeEventListener("scroll", closeTeamPicker);
}

function renderTeamCellHTML(teamId) {
    if (currentMode === "ffa") {
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

    if (currentMode !== "tdm") {
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
    if (currentMode !== "tdm") return;

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

    const sorted = teams.slice().sort((a, b) => a.id - b.id);

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

        const st = playersState.get(playerId);
        if (!st) return;

        const raw = item.dataset.teamId;
        const teamId = raw ? Number(raw) : null;

        st.teamId = Number.isFinite(teamId) ? teamId : null;

        anchorCell.innerHTML = renderTeamCellHTML(st.teamId);
        const row = anchorCell.closest("tr");
        applyTeamRowTint(row, st.teamId);

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
    if (spaceBelow < 300) {
        top = rect.top - menu.offsetHeight - 8;
    }

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


/* =========================
   PLAYERS TABLE
========================= */

function ensurePlayersState() {
    for (let i = 0; i < availablePlayerIDs.length; i++) {
        const id = availablePlayerIDs[i];
        if (!playersState.has(id)) {
            playersState.set(id, { name: "", teamId: null });
        }
    }
}

function enforceMaxLengthContenteditable(cell, maxLength = 32, onAfterChange = null) {
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

function refreshAllPlayerRows() {
    const rows = document.querySelectorAll(".player-row");
    rows.forEach(row => {
        const pid = Number(row.getAttribute("data-player-id"));
        if (!Number.isFinite(pid)) return;

        const st = playersState.get(pid);
        const teamId = st ? st.teamId : null;

        const teamCell = row.querySelector(".player-team-cell");
        if (teamCell) {
            teamCell.innerHTML = renderTeamCellHTML(teamId);
            teamCell.classList.toggle("team-locked", currentMode === "ffa");
        }

        applyTeamRowTint(row, teamId);
    });
}

function renderPlayerTable() {
    if (!playerTableBody) return;

    ensurePlayersState();
    playerTableBody.innerHTML = "";

    for (let i = 0; i < availablePlayerIDs.length; i++) {
        const id = availablePlayerIDs[i];
        const state = playersState.get(id);

        const row = document.createElement("tr");
        row.classList.add("player-row");
        row.setAttribute("data-player-id", String(id));

        row.innerHTML = `
            <td>${id}</td>
            <td class="name-cell" contenteditable="true" spellcheck="false"></td>
            <td class="player-team-cell" data-player-id="${id}" tabindex="0" aria-haspopup="listbox"></td>
        `;

        playerTableBody.appendChild(row);

        const nameCell = row.querySelector(".name-cell");
        nameCell.innerText = state.name || "";
        enforceMaxLengthContenteditable(nameCell, 32, (value) => {
            const st = playersState.get(id);
            if (st) st.name = value;
        });

        const teamCell = row.querySelector(".player-team-cell");
        teamCell.innerHTML = renderTeamCellHTML(state.teamId);

        applyTeamRowTint(row, state.teamId);
    }

    refreshAllPlayerRows();
}

renderPlayerTable();


/* =========================
   LEFT PANEL: SWITCH (Players <-> Teams)
========================= */

function setLeftMode(mode) {
    closeTeamPicker();

    const isPlayers = mode === "players";

    if (playersView) playersView.classList.toggle("hidden", !isPlayers);
    if (teamsView) teamsView.classList.toggle("hidden", isPlayers);

    if (boxTitle) boxTitle.innerText = isPlayers ? "Players" : "Teams";

    if (playersTabBtn) {
        playersTabBtn.classList.toggle("active", isPlayers);
        playersTabBtn.setAttribute("aria-selected", String(isPlayers));
    }

    if (teamsTabBtn) {
        teamsTabBtn.classList.toggle("active", !isPlayers);
        teamsTabBtn.setAttribute("aria-selected", String(!isPlayers));
    }
}

if (playersTabBtn) playersTabBtn.addEventListener("click", () => setLeftMode("players"));
if (teamsTabBtn) teamsTabBtn.addEventListener("click", () => {
    if (teamsTabBtn.disabled) return;
    setLeftMode("teams");
});

setLeftMode("players");


/* =========================
   TEAMS LOGIC (IDs 1–249 + reuse gaps)
========================= */

function renderTeamsTable() {
    if (!teamTableBody) return;

    teamTableBody.innerHTML = "";

    const sorted = teams.slice().sort((a, b) => a.id - b.id);

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

        teamTableBody.appendChild(row);
    }
}

function addTeam(rawName) {
    const trimmed = (rawName ?? "").trim();
    if (trimmed.length === 0) return;

    const name = trimmed.length > 32 ? trimmed.substring(0, 32) : trimmed;

    const newId = getNextFreeTeamId();
    if (newId === null) {
        alert("Maximum number of custom teams reached (1–249).");
        return;
    }

    teams.push({ id: newId, name: name, color: "#9d9da1" });
    usedTeamIds.add(newId);

    renderTeamsTable();
    refreshAllPlayerRows();
}

function removeTeamById(teamId) {
    teams = teams.filter(t => t.id !== teamId);
    usedTeamIds.delete(teamId);

    for (const st of playersState.values()) {
        if (st.teamId === teamId) st.teamId = null;
    }

    renderTeamsTable();
    refreshAllPlayerRows();
}

function setTeamColor(teamId, color) {
    for (let i = 0; i < teams.length; i++) {
        if (teams[i].id === teamId) {
            teams[i].color = color;
            return;
        }
    }
}

if (addTeamBtn && teamNameInput) {
    addTeamBtn.addEventListener("click", () => {
        addTeam(teamNameInput.value);
        teamNameInput.value = "";
        teamNameInput.focus();
    });

    teamNameInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTeam(teamNameInput.value);
            teamNameInput.value = "";
        }
    });
}

document.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".remove-btn");
    if (!removeBtn) return;

    const teamId = Number(removeBtn.getAttribute("data-team-id"));
    if (!Number.isFinite(teamId)) return;

    removeTeamById(teamId);
});

document.addEventListener("input", (e) => {
    const colorInput = e.target.closest(".color-input");
    if (!colorInput) return;

    const teamId = Number(colorInput.getAttribute("data-team-id"));
    if (!Number.isFinite(teamId)) return;

    const color = colorInput.value;
    setTeamColor(teamId, color);

    const dot = document.querySelector(`.color-dot[data-team-id="${teamId}"]`);
    if (dot) dot.style.setProperty("--dot-color", color);

    refreshAllPlayerRows();
});


/* =========================
   PLAYER -> TEAM PICKER HOOKS
========================= */

document.addEventListener("click", (e) => {
    if (currentMode !== "tdm") return;

    const cell = e.target.closest(".player-team-cell");
    if (!cell) return;

    const playerId = Number(cell.getAttribute("data-player-id"));
    if (!Number.isFinite(playerId)) return;

    openTeamPicker(cell, playerId);
});

document.addEventListener("keydown", (e) => {
    if (currentMode !== "tdm") return;

    const active = document.activeElement;
    if (!active || !active.classList || !active.classList.contains("player-team-cell")) return;

    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const playerId = Number(active.getAttribute("data-player-id"));
        if (!Number.isFinite(playerId)) return;
        openTeamPicker(active, playerId);
    }
});


/* =========================
   SETTINGS (Simple <-> Advanced)
========================= */

function setSettingsMode(mode) {
    const isSimple = mode === "simple";

    settingsSimpleBtn.classList.toggle("active", isSimple);
    settingsAdvancedBtn.classList.toggle("active", !isSimple);

    settingsSimpleBtn.setAttribute("aria-selected", String(isSimple));
    settingsAdvancedBtn.setAttribute("aria-selected", String(!isSimple));

    settingsSimpleView.classList.toggle("hidden", !isSimple);
    settingsAdvancedView.classList.toggle("hidden", isSimple);

    syncSettingsUI();
}

function getCooldownPresetName(ms) {
    if (ms === COOLDOWN_PRESETS.fast) return "fast";
    if (ms === COOLDOWN_PRESETS.intermediate) return "intermediate";
    if (ms === COOLDOWN_PRESETS.slow) return "slow";
    return null;
}

function markActiveButtons() {
    document.querySelectorAll('[data-cooldown-preset]').forEach(btn => btn.classList.remove("active"));
    const preset = getCooldownPresetName(gameSettings.cooldownMs);
    if (preset) {
        const btn = document.querySelector(`[data-cooldown-preset="${preset}"]`);
        if (btn) btn.classList.add("active");
    }

    document.querySelectorAll('[data-duration-min]').forEach(btn => btn.classList.remove("active"));
    const durBtn = document.querySelector(`[data-duration-min="${gameSettings.durationMin}"]`);
    if (durBtn) durBtn.classList.add("active");
}

function syncLivesStepperUI() {
    if (!livesSimpleInput) return;

    livesSimpleInput.value = String(gameSettings.lives);

    if (livesMinusBtn) livesMinusBtn.disabled = gameSettings.lives <= 1;
    if (livesPlusBtn) livesPlusBtn.disabled = gameSettings.lives >= 99;
}

function syncSettingsUI() {
    markActiveButtons();

    cooldownMsInput.value = String(gameSettings.cooldownMs);
    durationMinInput.value = String(gameSettings.durationMin);
    livesInput.value = String(gameSettings.lives);

    syncLivesStepperUI();
}

function setGameSettings(partial) {
    if (typeof partial.cooldownMs === "number") gameSettings.cooldownMs = clampInt(partial.cooldownMs, 0, 600000);
    if (typeof partial.durationMin === "number") gameSettings.durationMin = clampInt(partial.durationMin, 0, 999);
    if (typeof partial.lives === "number") gameSettings.lives = clampInt(partial.lives, 0, 99);
    syncSettingsUI();
}

settingsSimpleBtn.addEventListener("click", () => setSettingsMode("simple"));
settingsAdvancedBtn.addEventListener("click", () => setSettingsMode("advanced"));

syncSettingsUI();

document.addEventListener("click", (e) => {
    const cooldownBtn = e.target.closest("[data-cooldown-preset]");
    if (cooldownBtn) {
        const preset = cooldownBtn.getAttribute("data-cooldown-preset");
        const ms = COOLDOWN_PRESETS[preset];
        if (typeof ms === "number") setGameSettings({ cooldownMs: ms });
        return;
    }

    const durBtn = e.target.closest("[data-duration-min]");
    if (durBtn) {
        const min = Number(durBtn.getAttribute("data-duration-min"));
        if (Number.isFinite(min)) setGameSettings({ durationMin: min });
    }
});

cooldownMsInput.addEventListener("input", () => {
    const v = Number(cooldownMsInput.value);
    if (Number.isFinite(v)) setGameSettings({ cooldownMs: v });
});

durationMinInput.addEventListener("input", () => {
    const v = Number(durationMinInput.value);
    if (Number.isFinite(v)) setGameSettings({ durationMin: v });
});

livesInput.addEventListener("input", () => {
    const v = Number(livesInput.value);
    if (Number.isFinite(v)) setGameSettings({ lives: v });
});

// Lives stepper events (Simple)
if (livesMinusBtn) {
    livesMinusBtn.addEventListener("click", () => {
        setGameSettings({ lives: gameSettings.lives - 1 });
    });
}
if (livesPlusBtn) {
    livesPlusBtn.addEventListener("click", () => {
        setGameSettings({ lives: gameSettings.lives + 1 });
    });
}
if (livesSimpleInput) {
    livesSimpleInput.addEventListener("input", () => {
        const v = Number(livesSimpleInput.value);
        if (Number.isFinite(v)) setGameSettings({ lives: v });
    });
}


/* =========================
   GAME MODE APPLY
========================= */

function setModeSelectionUI(mode) {
    modeCards.forEach(card => {
        const isSelected = card.getAttribute("data-mode") === mode;
        card.classList.toggle("selected", isSelected);
        card.setAttribute("aria-checked", String(isSelected));
    });
}

function applyMode(mode) {
    currentMode = mode === "ffa" ? "ffa" : "tdm";
    setModeSelectionUI(currentMode);
    setError("");

    // Teams tab enabled only for TDM
    const disableTeams = currentMode === "ffa";
    teamsTabBtn.disabled = disableTeams;
    if (disableTeams) setLeftMode("players");

    // Duration only for FFA
    simpleDurationSection.classList.toggle("hidden", currentMode !== "ffa");
    advancedDurationSection.classList.toggle("hidden", currentMode !== "ffa");

    // When switching to FFA: clear teams on players
    if (currentMode === "ffa") {
        for (const st of playersState.values()) st.teamId = null;
        closeTeamPicker();
    }

    refreshAllPlayerRows();
}

modeCards.forEach(card => {
    card.addEventListener("click", () => applyMode(card.getAttribute("data-mode")));
});

modeContinueBtn.addEventListener("click", () => modeOverlay.classList.add("hidden"));

applyMode("tdm");


/* =========================
   CREATE VALIDATION
========================= */

function validateCreate() {
    ensurePlayersState();

    // Names required
    for (let i = 0; i < availablePlayerIDs.length; i++) {
        const id = availablePlayerIDs[i];
        const st = playersState.get(id);
        const name = (st?.name ?? "").trim();
        if (name.length === 0) {
            return `Player ${id} needs a name.`;
        }
    }

    if (currentMode === "tdm") {
        if (teams.length < 2) {
            return "Team Deathmatch requires at least 2 teams.";
        }

        const usedByPlayers = new Set();

        for (let i = 0; i < availablePlayerIDs.length; i++) {
            const id = availablePlayerIDs[i];
            const st = playersState.get(id);

            if (!st || !st.teamId) {
                return `Assign a team for player ${id}.`;
            }
            if (!findTeamById(st.teamId)) {
                return `Player ${id} has an invalid team selection.`;
            }

            usedByPlayers.add(st.teamId);
        }

        if (usedByPlayers.size < 2) {
            return "Players must be split across at least 2 different teams.";
        }
    }

    // Settings validity
    if (!Number.isFinite(gameSettings.cooldownMs) || gameSettings.cooldownMs < 0) {
        return "Cooldown must be 0 or more.";
    }
    if (gameSettings.cooldownMs > 600000) {
        return "Cooldown is too high.";
    }

    if (!Number.isFinite(gameSettings.lives) || gameSettings.lives < 1) {
        return "Lives must be at least 1.";
    }
    if (gameSettings.lives > 99) {
        return "Lives is too high.";
    }

    if (currentMode === "ffa") {
        if (!Number.isFinite(gameSettings.durationMin) || gameSettings.durationMin < 1) {
            return "Game length must be at least 1 minute.";
        }
        if (gameSettings.durationMin > 999) {
            return "Game length is too high.";
        }
    }

    return null;
}

createGameBtn.addEventListener("click", () => {
    const err = validateCreate();
    if (err) {
        setError(err);
        return;
    }

    setError("");

    const payload = {
        mode: currentMode,
        settings: { ...gameSettings },
        players: availablePlayerIDs.map(id => {
            const st = playersState.get(id) || { name: "", teamId: null };
            return {
                id,
                name: (st.name || "").trim(),
                teamId: currentMode === "tdm" ? st.teamId : null
            };
        }),
        teams: currentMode === "tdm" ? teams.slice().sort((a, b) => a.id - b.id) : []
    };

    console.log("Create payload (mock):", payload);
});
