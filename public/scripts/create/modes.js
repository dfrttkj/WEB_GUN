import { emit, on } from "./events.js";
import { clearError } from "./ui.js";
import { setMode, state } from "./state.js";

export function initModes(dom, lockApi) {
  let overlayCompleted = false;

  function setModeSelectionUI(mode) {
    dom.modeCards.forEach(card => {
      const isSelected = card.getAttribute("data-mode") === mode;
      card.classList.toggle("selected", isSelected);
      card.setAttribute("aria-checked", String(isSelected));
    });
  }

  function showOverlay() {
    if (!lockApi.isUnlocked()) return;
    setModeSelectionUI(state.mode);
    dom.modeOverlay.classList.remove("hidden");
    overlayCompleted = false;
  }

  function hideOverlay() {
    dom.modeOverlay.classList.add("hidden");
  }

  function apply(mode) {
    setMode(mode);
    setModeSelectionUI(state.mode);
    clearError(dom);
    emit("mode:changed", { mode: state.mode });
  }

  dom.modeCards.forEach(card => {
    card.addEventListener("click", () => apply(card.getAttribute("data-mode")));
  });

  dom.modeContinueBtn.addEventListener("click", () => {
    hideOverlay();
    overlayCompleted = true;
  });

  dom.changeModeBtn.addEventListener("click", () => {
    if (!lockApi.isUnlocked()) return;
    clearError(dom);
    showOverlay();
  });

  // Respond to lock state
  on("lock:changed", ({ unlocked }) => {
    if (!unlocked) {
      hideOverlay();
      return;
    }
    if (!overlayCompleted) showOverlay();
  });

  // Initial: show overlay if already unlocked
  if (lockApi.isUnlocked()) showOverlay();
}
