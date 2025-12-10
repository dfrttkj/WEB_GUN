import { on } from "./events.js";
import { COOLDOWN_PRESETS, setSettings, state } from "./state.js";

export function initSettings(dom) {
  function setSettingsMode(mode) {
    const isSimple = mode === "simple";

    dom.settingsSimpleBtn.classList.toggle("active", isSimple);
    dom.settingsAdvancedBtn.classList.toggle("active", !isSimple);

    dom.settingsSimpleBtn.setAttribute("aria-selected", String(isSimple));
    dom.settingsAdvancedBtn.setAttribute("aria-selected", String(!isSimple));

    dom.settingsSimpleView.classList.toggle("hidden", !isSimple);
    dom.settingsAdvancedView.classList.toggle("hidden", isSimple);

    syncUI();
  }

  function getCooldownPresetName(ms) {
    if (ms === COOLDOWN_PRESETS.fast) return "fast";
    if (ms === COOLDOWN_PRESETS.intermediate) return "intermediate";
    if (ms === COOLDOWN_PRESETS.slow) return "slow";
    return null;
  }

  function markActiveButtons() {
    document.querySelectorAll("[data-cooldown-preset]").forEach(btn => btn.classList.remove("active"));
    const preset = getCooldownPresetName(state.settings.cooldownMs);
    if (preset) {
      const btn = document.querySelector(`[data-cooldown-preset="${preset}"]`);
      if (btn) btn.classList.add("active");
    }

    document.querySelectorAll("[data-duration-min]").forEach(btn => btn.classList.remove("active"));
    const durBtn = document.querySelector(`[data-duration-min="${state.settings.durationMin}"]`);
    if (durBtn) durBtn.classList.add("active");
  }

  function syncLivesStepper() {
    dom.livesSimpleInput.value = String(state.settings.lives);
    dom.livesMinusBtn.disabled = state.settings.lives <= 1;
    dom.livesPlusBtn.disabled = state.settings.lives >= 99;
  }

  function syncModeVisibility() {
    const showDuration = state.mode === "ffa";
    dom.simpleDurationSection.classList.toggle("hidden", !showDuration);
    dom.advancedDurationSection.classList.toggle("hidden", !showDuration);
  }

  function syncUI() {
    syncModeVisibility();
    markActiveButtons();

    dom.cooldownMsInput.value = String(state.settings.cooldownMs);
    dom.durationMinInput.value = String(state.settings.durationMin);
    dom.livesInput.value = String(state.settings.lives);

    syncLivesStepper();
  }

  dom.settingsSimpleBtn.addEventListener("click", () => setSettingsMode("simple"));
  dom.settingsAdvancedBtn.addEventListener("click", () => setSettingsMode("advanced"));

  document.addEventListener("click", (e) => {
    const cooldownBtn = e.target.closest("[data-cooldown-preset]");
    if (cooldownBtn) {
      const preset = cooldownBtn.getAttribute("data-cooldown-preset");
      const ms = COOLDOWN_PRESETS[preset];
      if (typeof ms === "number") setSettings({ cooldownMs: ms });
      syncUI();
      return;
    }

    const durBtn = e.target.closest("[data-duration-min]");
    if (durBtn) {
      const min = Number(durBtn.getAttribute("data-duration-min"));
      if (Number.isFinite(min)) setSettings({ durationMin: min });
      syncUI();
    }
  });

  dom.cooldownMsInput.addEventListener("input", () => {
    const v = Number(dom.cooldownMsInput.value);
    if (Number.isFinite(v)) setSettings({ cooldownMs: v });
    syncUI();
  });

  dom.durationMinInput.addEventListener("input", () => {
    const v = Number(dom.durationMinInput.value);
    if (Number.isFinite(v)) setSettings({ durationMin: v });
    syncUI();
  });

  dom.livesInput.addEventListener("input", () => {
    const v = Number(dom.livesInput.value);
    if (Number.isFinite(v)) setSettings({ lives: v });
    syncUI();
  });

  dom.livesMinusBtn.addEventListener("click", () => { setSettings({ lives: state.settings.lives - 1 }); syncUI(); });
  dom.livesPlusBtn.addEventListener("click", () => { setSettings({ lives: state.settings.lives + 1 }); syncUI(); });
  dom.livesSimpleInput.addEventListener("input", () => {
    const v = Number(dom.livesSimpleInput.value);
    if (Number.isFinite(v)) setSettings({ lives: v });
    syncUI();
  });

  // Update on mode change
  on("mode:changed", () => syncUI());

  // Initial
  setSettingsMode("simple");
  syncUI();
}
