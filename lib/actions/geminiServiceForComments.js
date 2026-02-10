import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getSearchTerm(postCaption) {
 const model = genAI.getGenerativeModel({
   model: "gemini-2.0-flash",
   generationConfig: { responseMimeType: "application/json" },
 });

 const prompt = `
    Analyze this Facebook Post Caption and identify the PRODUCT being sold.
    
    CAPTION: "${postCaption || ""}"

    TASK:
    - Extract ONLY the main Product Name (Brand + Model).
    - Ignore marketing fluff (e.g., "best price", "sale", "new", "iyideba", "fasi", "delivery").
    - Ignore sizes, colors, and prices. Just the product identity.

    NORMALIZATION RULES:
    - TRANSLATE/TRANSLITERATE Georgian brands/types to English (e.g., "ბოსი" -> "Boss", "ნაიკი" -> "Nike", "ბოტასი" -> "Sneakers", "უთო" -> "Iron").
    - NEVER add words like "Product", "Type", "Shoes"
    - If it's a car, return "Make Model" (e.g. "Toyota Prius").
    - If it's tech, return "Brand Model" (e.g. "Sokany Air Fryer").
    
    Return JSON: { "product_name": "..." }
    (If no product is found, return "none")
  `;

 try {
   const result = await model.generateContent(prompt);
   const data = JSON.parse(result.response.text());
   console.log("🔍 Extracted Product Data:", data);
   // პატარა დაზღვევა: თუ "none" დაბრუნდა, null გავუშვათ
   return data.product_name === "none" ? null : data.product_name;
 } catch (error) {
   console.error("🔍 Product Extraction Error:", error);
   return null;
 }
}

export async function getGeminiResponse(
  userComment,
  postContext,
  foundProducts = [],
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    // ეს უზრუნველყოფს სუფთა JSON-ს
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `
    შენ ხარ ონლაინ მაღაზიის ჭკვიანი კონსულტანტი.
    
    მონაცემები:
    1. პოსტის ტექსტი: "${postContext || "ინფო არ არის"}"
    2. მომხმარებლის კომენტარი: "${userComment}"
    3. ნაპოვნი პროდუქტები ბაზაში: ${JSON.stringify(foundProducts)}

    დავალება:
    - გაეცი პასუხი ქართულად.
    - პრიორიტეტი: თუ "ნაპოვნი პროდუქტები" არ არის ცარიელი, აუცილებლად გამოიყენე იქ არსებული ფასი და ზომები პასუხში.
    - თუ ბაზაში პროდუქტი არ გვაქვს, დაეყრდენი პოსტის ტექსტს.
    - თუ არც ბაზაშია და არც პოსტში, ზრდილობიანად უთხარი, რომ არ გაქვთ.

    დააბრუნე JSON:
    {
      answer: "დააბრუნე რაც შეიძლება მოკლე და კონკრეტული პასუხი, გამოიყენე ბაზის ინფორმაცია თუ გაქვს, თუ არა პოსტის ტექსტი, და თუ არც ერთი არაა, უთხარი რომ არ გაქვთ.",
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("❌ AI Error:", error);
    // Fallback პასუხი ერორის დროს
    return {
      public: "მოგწერეთ პირადში!",
      private: "გამარჯობა, დეტალებს მალე მოგწერთ. 😊",
    };
  }
}