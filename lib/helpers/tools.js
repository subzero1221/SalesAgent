export function isComplete(required, draft) {
  return required.every((f) => draft[f] && String(draft[f]).trim() !== "");
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
      } else {
        out[key] = incomingVal;
      }
    }
    
    else if (!out[key] || String(out[key]).trim() === "") {
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

export function validateColors(colorString) {
  if (!colorString) return true; // თუ ცარიელია, გამოვტოვოთ
  console.log("Validating colors:", colorString);
  // თუ არის ტექსტი, მაგრამ არ აქვს მძიმე და შეიცავს სფეისს (მაგ: "შავი თეთრი")
  // ან უბრალოდ ძალიან გრძელია მძიმის გარეშე
  if (colorString.includes(" ") && !colorString.includes(",")) {
    return false;
  }
  return true;
}