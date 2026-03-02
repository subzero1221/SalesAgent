import { getAllProducts } from "./productActions";

// lib/actions/geminiImageAnalysis.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function detectBrand(imageUrl) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Fast model

    const imageResp = await fetch(imageUrl);
    const base64Image = Buffer.from(await imageResp.arrayBuffer()).toString(
      "base64",
    );

    const prompt = `
      Look at this sneaker/clothing item.
      Identify the BRAND NAME only.
      Examples: "Nike", "Adidas", "Puma", "New Balance".
      If you are unsure or it's unbranded, return "UNKNOWN".
      Output ONLY the single word.
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType: "image/jpeg" } },
    ]);

    const brand = result.response.text().trim().toUpperCase();
    console.log("🕵️ Brand Detected:", brand);
    return brand;
  } catch (error) {
    console.error("Brand Detect Error:", error);
    return "UNKNOWN";
  }
}

export async function processImageQuery(imageUrl, brand, shopId) {

  const allProducts = await getAllProducts(shopId);


  const candidates = allProducts.filter(
    (p) => p.brand && p.brand.toUpperCase().includes(brand),
  );


  if (candidates.length === 0) {
    return {
      reply: `სამწუხაროდ, ამ ეტაპზე ${brand}-ის ფირმის პროდუქცია არ გვაქვს. 😕`,
      productId: null,
    };
  }

 
  const matchId = await runVisualCheck(imageUrl, candidates);


  if (matchId) {
    const product = candidates.find((p) => p.id === matchId);
    return {
      reply: `დიახ! ეს ძალიან ჰგავს ჩვენს მოდელს: **${product.name}**. \nგვაქვს მარაგში! გნებავთ დეტალების ნახვა?`,
      productId: product.id, 
    };
  }

  const suggestion = candidates[0];
  return {
    reply: `ჩვენ გვაქვს ${brand}, მაგრამ ზუსტად ეს მოდელი სამწუხაროდ არ იძებნება. \nთუმცა, გვაქვს მსგავსი მოდელები. მაგალითად: ${suggestion.name}.`,
    productId: suggestion.id,
  };
}


async function runVisualCheck(userImageUrl, candidates) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Use PRO for accuracy

  const userResp = await fetch(userImageUrl);
  const userBase64 = Buffer.from(await userResp.arrayBuffer()).toString(
    "base64",
  );

  const promptParts = [
    {
      text: "Compare USER IMAGE vs CANDIDATES. Return the ID of the exact/closest match. If totally different, return 0.",
    },
    { text: "USER IMAGE:" },
    { inlineData: { data: userBase64, mimeType: "image/jpeg" } },
  ];


  for (const p of candidates.slice(0, 5)) {
    if (p.product_image_url) {
      try {
        const pResp = await fetch(p.product_image_url);
        const pBase64 = Buffer.from(await pResp.arrayBuffer()).toString(
          "base64",
        );
        promptParts.push({ text: `\nID: ${p.id}` });
        promptParts.push({
          inlineData: { data: pBase64, mimeType: "image/jpeg" },
        });
      } catch (e) {}
    }
  }

  const result = await model.generateContent(promptParts);
  const text = result.response.text().replace(/[^0-9]/g, "");
  return parseInt(text) || 0;
}