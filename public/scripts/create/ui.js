export function setError(dom, msg) {
  if (!dom?.createError) return;
  dom.createError.textContent = msg ? String(msg) : "";
}

export function clearError(dom) {
  setError(dom, "");
}
