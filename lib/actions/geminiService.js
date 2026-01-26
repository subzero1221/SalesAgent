import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { supabaseAdmin } from "../supabaseAdmin";
import { searchInventory } from "./productActions";

// Gemini-ს ინიციალიზაცია
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export function parseAiJson(raw) {
  if (!raw || typeof raw !== "string") {
    return { reply: "", extracted: {}, completed: false };
  }
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {}
    }
  }
  return { reply: raw, extracted: {}, completed: false };
}

async function getSearchTerm(userText) {
  const prompt = `
    Analyze the user's message: "${userText}"
    Extract ONLY the product name or category they are interested in.
    If they are not asking for a product, return "none".
    CRITICAL RULES:
  - If the user is just greeting (e.g., "salami", "gamarjoba", "hi"), return {"term": "none"}.
  - "Salami" is a Georgian greeting, NOT a product in this context.
  - If no product is mentioned, return {"term": "none"}.
  `;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    // 💡 ეს დაამატე, რომ აიძულო Gemini მხოლოდ სუფთა JSON დაგიბრუნოს
    generationConfig: { responseMimeType: "application/json" },
  });

  const result = await model.generateContent(prompt);
  const responseText = result.response.text(); // აქედან ვიღებთ ტექსტურ პასუხს

  try {
    // 💡 ტექსტი უნდა ვაქციოთ JS ობიექტად
    const parsed = JSON.parse(responseText);
    return parsed.term; // ახლა უკვე დაბრუნდება "Terrex" და არა undefined
  } catch (error) {
    console.error("JSON parsing error:", error);
    return "none";
  }
}

export async function aiResponse(shop, session, userText) {
  const searchTerm = await getSearchTerm(userText);
  let products = [];
 if (searchTerm !== "none") {
   console.log("Specific term failed, trying full user text search...");
   // ვცდილობთ მოვძებნოთ ორიგინალი ტექსტით, იქნებ შიგნით "Terrex" იმალება
   products = await searchInventory(userText);
 }

  

  let inventoryContext = "";

  if (searchTerm === "none") {
    inventoryContext =
      "მომხმარებელი ჯერ არაფერს ეძებს. უბრალოდ მიესალმე და ჰკითხე რა აინტერესებს.";
  } else if (products.length > 0) {
    inventoryContext = `მარაგშია ეს მოდელები: ${JSON.stringify(products)}. შესთავაზე მომხმარებელს.`;
  } else {
    inventoryContext = `მომხმარებელი ეძებს "${searchTerm}", მაგრამ ბაზაში ვერაფერი ვნახეთ. 
    უთხარი, რომ მოდელი ვერ დააზუსტე და სთხოვე დაგიწეროს ზუსტი დასახელება, რათა გადაამოწმო.`;
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json", 
    },
  });

  const prompt = `
  You are an expert sales agent for the shop "${shop.name}".
  
  [CONTEXT]
  Inventory: ${inventoryContext}
  Current Order Draft: ${JSON.stringify(session.draft)}
  Current Session last messages: ${JSON.stringify(session?.messages)}
  User Message: "${userText}"

  [YOUR GOAL]
  Guide the user through the sales funnel to complete an order. Be friendly and professional.

  [SALES STEPS]
  1. Greet: If it's the start, say hello and ask what they need.
  2. Consult: If they ask generally, suggest items from the Inventory.
  3. Specify: Once a product is mentioned, check the Inventory for its specific attributes (e.g., size/color for shoes, volume/power for appliances). Ask for these missing details one by one.
  4. Collect Data: Once product specs are clear, ask for a phone number and delivery address.

  [CRITICAL RULES]
  - NO REPETITIVE GREETINGS: If the conversation is ongoing, do not say "Hello" again.
  - BE DYNAMIC: Do not strictly ask for "size" if the product is a kitchen appliance. Ask for relevant specs (liters, model, etc.) based on the Inventory.
  - STYLE: Use natural Georgian conversational style. Use slang like "კი ბატონო", "მშვენიერია", "არაა პრობლემა" where appropriate. Don't be a robot.
  - SMART TRIGGER: If user says "I want to buy", check what info is missing and ask for it.
  - GREETING RECOGNITION: Recognize Georgian greetings even in Latin script. (e.g., "salami", "salat", "baro", "gamarjoba" all mean "Hello"). 
    Do not confuse "salami" with the food/meat; in this context, it is ALWAYS a greeting.
    - CHECK DRAFT FIRST: Before asking a question, check the "Current Order Draft". 
      If 'product', 'size', or 'specs' are already filled there, DO NOT ask for them again.
  - ACKNOWLEDGE: If the user provides new info, acknowledge it (e.g., "43 ზომა, გასაგებია") and move to the next missing piece of info.
  - CONTEXT RECOVERY: If the user says "same address" or "same number" (e.g., "igivea", "იგივე მისამართზე"), find the actual value from the [Recent History] and put it into the "extracted" JSON fields. 
  - DO NOT leave fields empty if the information exists in the history.


  [OUTPUT FORMAT]
  Return ONLY a valid JSON:
  {
    "reply": "Your response in Georgian",
    "extracted": { 
      "product": "identified product name", 
      "specs": { "color": "...", "size": "...", "volume": "...", "any_other": "..." }, 
      "phone": "extracted phone", 
      "address": "extracted address" 
    }
  }
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```json|```/g, "")
      .trim();
    return JSON.parse(text);
  } catch (e) {
    console.error("Gemini Error:", e);
    return { reply: "ბოდიში, ხარვეზია. დაგიკავშირდებით.", extracted: null };
  }
}

export async function parseProductFromText(rawText) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `
    შენ ხარ მონაცემთა ექსტრაქტორი. შენი დავალებაა ქართული ტექსტიდან პროდუქტის მონაცემების ამოღება.
    ტექსტი: "${rawText}"

    დააბრუნე JSON ამ ფორმატში:
    {
      "name": "დასახელება",
      "brand":"ნივთის ბრენდი",
      "price": რიცხვი (მხოლოდ ციფრი),
      "description": "მოკლე აღწერა",
      "stock": { "ზომა/ტიპი": რაოდენობა (თუ არ წერია, ჩაწერე 1) }
    }
    თუ რამე მონაცემს ვერ იპოვი, ჩაწერე null.
  `;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Parsing error:", error);
    return null;
  }
}

export async function handleCustomerQuery(query, shopId) {
  try {
    // 1. გამოვიტანოთ პროდუქტები ბაზიდან ამ მაღაზიისთვის
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shopId);

    if (error) throw error;

    // 2. მოვამზადოთ კონტექსტი Gemini-სთვის
    const inventoryContext = products
      .map(
        (p) =>
          `სახელი: ${p.name}, ფასი: ${p.price}₾, აღწერა: ${p.description}, ზომები/მარაგი: ${JSON.stringify(p.stock)}`,
      )
      .join("\n");

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      შენ ხარ ქართული ონლაინ მაღაზიის ასისტენტი. 
      აი ჩვენი ინვენტარი:
      ${inventoryContext}

      მომხმარებლის კითხვა: "${query}"

      ინსტრუქცია:
      1. თუ გვაქვს მსგავსი პროდუქტი, უპასუხე მეგობრულად, დაუწერე ფასი და უთხარი რომელ ზომებშია.
      2. თუ არ გვაქვს, შესთავაზე ყველაზე მიახლოებული ვარიანტი რაც გვაქვს.
      3. თუ საერთოდ არაფერია მსგავსი, უთხარი რომ ამჯერად არ გვაქვს, მაგრამ მალე დაგვემატება.
      
      უპასუხე მხოლოდ ქართულად, მოკლედ და კონკრეტულად.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Chat Service Error:", error);
    return "ბოდიში, ტექნიკური ხარვეზია. სცადეთ მოგვიანებით.";
  }
}
