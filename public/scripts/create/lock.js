import { digestHex } from "./utils.js";
import { emit } from "./events.js";

// Local storage key
const STORAGE_KEY_UNLOCKED = "createUnlocked";

// SHA-256("pleitegeier") in hex (variable intentionally not obvious)
const __v = "1e39bbafec56004c3a27ab6906aa88aef5e9b4a6c823639634ae73c5b94c88c9";

export function initLock(dom) {
  let isUnlocked = localStorage.getItem(STORAGE_KEY_UNLOCKED) === "true";

  function applyLockedState(locked) {
    isUnlocked = !locked;
    localStorage.setItem(STORAGE_KEY_UNLOCKED, String(isUnlocked));

    dom.lockIcon.textContent = locked ? "🔒" : "🔓";

    dom.unlockInputWrap.classList.toggle("show", locked);
    if (locked) {
      dom.unlockInput.value = "";
      dom.unlockInput.focus();
    }

    dom.contentShell.classList.toggle("is-locked", locked);
    dom.lockedOverlay.classList.toggle("hidden", !locked);

    emit("lock:changed", { unlocked: isUnlocked });
  }

  async function tryUnlock() {
    const value = (dom.unlockInput.value || "").trim();
    try {
      const h = await digestHex(value);
      if (h === __v) {
        applyLockedState(false);
        return;
      }
    } catch (err) {
      console.warn("Unlock check failed:", err);
    }

    dom.unlockInput.value = "";
    dom.unlockInput.placeholder = "Wrong password";
    setTimeout(() => (dom.unlockInput.placeholder = "Password"), 900);
  }

  dom.lockToggleBtn.addEventListener("click", () => {
    if (isUnlocked) applyLockedState(true);
    else dom.unlockInput.focus();
  });

  dom.unlockInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      tryUnlock();
    }
  });

  // Apply initial
  applyLockedState(!isUnlocked);

  return {
    isUnlocked: () => isUnlocked,
    setLocked: (locked) => applyLockedState(Boolean(locked)),
  };
}
