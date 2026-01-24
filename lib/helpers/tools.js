export function isComplete(required, draft) {
  return required.every((f) => draft[f] && String(draft[f]).trim() !== "");
}

export function mergeWithoutOverwrite(base = {}, incoming = {}) {
  const out = { ...base };

  for (const [k, v] of Object.entries(incoming || {})) {
    const baseHas =
      out[k] !== undefined && out[k] !== null && String(out[k]).trim() !== "";

    const incomingHas =
      v !== undefined && v !== null && String(v).trim() !== "";

    if (!baseHas && incomingHas) out[k] = v;
  }

  return out;
}
