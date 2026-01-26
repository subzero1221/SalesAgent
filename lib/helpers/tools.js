export function isComplete(required, draft) {
  return required.every((f) => draft[f] && String(draft[f]).trim() !== "");
}

export function smartMergeDraft(base = {}, incoming = {}) {
  const out = { ...base };

  // 1. Specs-ის დამუშავება (აქ ვუშვებთ გადაწერას, რადგან კლიენტმა შეიძლება ზომა შეცვალოს)
  if (incoming.specs) {
    out.specs = {
      ...(out.specs || {}),
      ...incoming.specs,
    };
  }

  // 2. დანარჩენი ველების დამუშავება
  for (const key in incoming) {
    if (key === "specs") continue; // უკვე დავამუშავეთ

    const incomingVal = incoming[key];
    const isBaseEmpty = !out[key] || String(out[key]).trim() === "";
    const isIncomingFull =
      incomingVal !== undefined &&
      incomingVal !== null &&
      String(incomingVal).trim() !== "";

    // პროდუქტიც შეიძლება შეიცვალოს, ამიტომ მასაც გადავაწერთ
    if (key === "product" && isIncomingFull) {
      out[key] = incomingVal;
    }
    // ტელეფონი და მისამართი - მხოლოდ მაშინ ვწერთ, თუ ცარიელია
    else if (isBaseEmpty && isIncomingFull) {
      out[key] = incomingVal;
    }
  }

  return out;
}
