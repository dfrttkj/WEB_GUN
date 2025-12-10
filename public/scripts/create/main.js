import { getDom } from "./dom.js";
import { initLock } from "./lock.js";
import { initModes } from "./modes.js";
import { initLeftPanel } from "./leftPanel.js";
import { initTeams } from "./teams.js";
import { initPlayers } from "./players.js";
import { initSettings } from "./settings.js";
import { initCreateAction } from "./createAction.js";
import { ensurePlayers } from "./state.js";

const dom = getDom();

// Ensure base state exists
ensurePlayers();

// Init features
const lockApi = initLock(dom);
initModes(dom, lockApi);
initLeftPanel(dom);
initTeams(dom);
initPlayers(dom);
initSettings(dom);
initCreateAction(dom);

// Optional: expose for debugging
window.__create = { lockApi };
console.log("create/main.js initialized");
