export function isComplete(required, draft) {
  return required.every((field) => {
    const value = draft[field];
    if (!value || String(value).trim() === "") return false;

    if (field === "phone") {
      const digits = String(value).replace(/\D/g, "");
      return digits.length >= 9;
    }

    return true;
  });
}

export function smartMergeDraft(base = {}, incoming = {}) {
  const out = { ...base };

  if (incoming.specs) {
    out.specs = {
      ...(out.specs || {}),
      ...incoming.specs,
    };
  }

  for (const key in incoming) {
    if (key === "specs") continue;

    const incomingVal = incoming[key];
    const isIncomingFull =
      incomingVal !== undefined &&
      incomingVal !== null &&
      String(incomingVal).trim() !== "";

    if (!isIncomingFull) continue;

    const forceUpdateKeys = ["quantity", "product", "phone", "address"];

    if (forceUpdateKeys.includes(key)) {
      if (key === "quantity") {
        out[key] = parseInt(incomingVal) || 1;
      } else if (key === "phone") {
        const oldPhone = String(out[key] || "").replace(/\D/g, "");
        const newPhone = String(incomingVal).replace(/\D/g, "");

        if (newPhone.startsWith(oldPhone) || newPhone.length >= 9) {
          out[key] = newPhone;
        } else if (oldPhone.length > 0 && oldPhone.length < 9) {
          out[key] = oldPhone + newPhone;
        } else {
          out[key] = newPhone;
        }
      } else if (key === "address") {
        const oldAddr = String(out[key] || "").trim();
        const newAddr = String(incomingVal).trim();

        if (oldAddr && !newAddr.includes(oldAddr) && oldAddr !== newAddr) {
          out[key] = `${oldAddr}, ${newAddr}`;
        } else {
          out[key] = newAddr;
        }
      } else {
        out[key] = incomingVal;
      }
    } else if (!out[key] || String(out[key]).trim() === "") {
      out[key] = incomingVal;
    }
  }

  return out;
}

export function normalizeStock(stock) {
  if (!stock) return {};
  const normalized = {};

  for (const [key, value] of Object.entries(stock)) {
    const match = key.match(/(\d+)\s*(?:-|\s+დან\s+|\s+to\s+|dan)\s*(\d+)/);

    if (match) {
      const start = parseInt(match[1]);
      const end = parseInt(match[2]);

      const min = Math.min(start, end);
      const max = Math.max(start, end);

      for (let i = min; i <= max; i++) {
        normalized[i.toString()] = value;
      }
    } else {
      normalized[key] = value;
    }
  }
  return normalized;
}

export const safeTask = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error(`🔥 Async Task Error [${fn.name}]:`, error);
    }
  };
};