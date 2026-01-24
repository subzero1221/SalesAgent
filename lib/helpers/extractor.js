export function extractPhone(text = "") {
  const t = String(text);

  // Normalize: remove spaces, dashes, parentheses
  const cleaned = t.replace(/[^\d+]/g, "");

  // 1) +995XXXXXXXXX
  const m1 = cleaned.match(/\+995\d{9}\b/);
  if (m1) return m1[0];

  // 2) 995XXXXXXXXX (without +)
  const m2 = cleaned.match(/\b995\d{9}\b/);
  if (m2) return `+${m2[0]}`;

  // 3) Local Georgian mobile: 9 digits starting with 5 (e.g., 5XXXXXXXX)
  const m3 = cleaned.match(/\b5\d{8}\b/);
  if (m3) return `+995${m3[0]}`;

  return null;
}


export function looksLikeAddress(text = "") {
  const t = text.toLowerCase();

  // Georgian keywords often used in addresses
  const kw = [
    "ქუჩ",
    "ქ.",
    "ქუჩა",
    "გამზ",
    "გამზირი",
    "კორპუს",
    "სადარბაზო",
    "სართ",
    "ბინა",
    "უბანი",
    "მიკრორაი",
    "მისამართ",
  ];

  const hasKw = kw.some((k) => t.includes(k));
  const hasNumber = /\d/.test(t);

  return hasNumber && hasKw;
}