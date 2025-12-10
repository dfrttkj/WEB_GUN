export function getDom() {
  const byId = (id) => document.getElementById(id);

  return {
    // Lock
    lockToggleBtn: byId("lockToggleBtn"),
    lockIcon: byId("lockIcon"),
    unlockInputWrap: byId("unlockInputWrap"),
    unlockInput: byId("unlockInput"),
    contentShell: byId("contentShell"),
    lockedOverlay: byId("lockedOverlay"),

    // Mode overlay
    modeOverlay: byId("modeOverlay"),
    modeContinueBtn: byId("modeContinueBtn"),
    modeCards: Array.from(document.querySelectorAll(".mode-card")),
    changeModeBtn: byId("changeModeBtn"),

    // Left panel
    boxTitle: byId("boxTitle"),
    playersView: byId("playersView"),
    teamsView: byId("teamsView"),
    playersTabBtn: byId("playersTabBtn"),
    teamsTabBtn: byId("teamsTabBtn"),
    playerTableBody: byId("playerTableBody"),

    // Teams
    teamNameInput: byId("teamNameInput"),
    addTeamBtn: byId("addTeamBtn"),
    teamTableBody: byId("teamTableBody"),

    // Settings
    settingsSimpleBtn: byId("settingsSimpleBtn"),
    settingsAdvancedBtn: byId("settingsAdvancedBtn"),
    settingsSimpleView: byId("settingsSimpleView"),
    settingsAdvancedView: byId("settingsAdvancedView"),
    simpleDurationSection: byId("simpleDurationSection"),
    advancedDurationSection: byId("advancedDurationSection"),
    cooldownMsInput: byId("cooldownMsInput"),
    durationMinInput: byId("durationMinInput"),
    livesInput: byId("livesInput"),
    livesMinusBtn: byId("livesMinusBtn"),
    livesPlusBtn: byId("livesPlusBtn"),
    livesSimpleInput: byId("livesSimpleInput"),

    // Create
    createGameBtn: byId("createGameBtn"),
    createError: byId("createError"),
  };
}
