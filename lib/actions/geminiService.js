import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { supabaseAdmin } from "../supabaseAdmin";
import { searchInventory } from "./productActions";
import { normalizeStock } from "@/lib/helpers/tools";

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
  let products = [];
  let inventoryContext = "";

 
  const currentDraftProduct = session?.draft?.product;

  if (currentDraftProduct) {
    console.log("🚀 ORDER IN PROGRESS:", currentDraftProduct);

    
    products = await searchInventory(currentDraftProduct);

    inventoryContext = `PRODUCT ALREADY SELECTED: ${JSON.stringify(products[0] || { name: currentDraftProduct })}. 
    STRICT RULE: The user is providing delivery details or specs. DO NOT search for new products.`;
  } else {
    
    const extractedTerm = await getSearchTerm(userText);
    console.log("🔍 NEW SEARCH TERM:", extractedTerm);

    if (!extractedTerm || extractedTerm === "none") {
      inventoryContext =
        "მომხმარებელი უბრალოდ მოგესალმა. მიესალმე და ჰკითხე რა აინტერესებს.";
    } else {
      products = await searchInventory(extractedTerm);

      if (products.length === 0) {
        return {
          reply: `ბოდიში, "${extractedTerm}" ვერ ვიპოვე. იქნებ სხვა მოდელი გვეცადა?`,
          extracted: null,
        };
      }

      inventoryContext =
        products.length > 1
          ? `FOUND MATCHES: ${JSON.stringify(products)}. Ask them to choose one.`
          : `FOUND PRODUCT: ${JSON.stringify(products[0])}. Proceed with size/color.`;
    }
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `
  You are an expert sales agent for "${shop.name}". 

  ### 📦 CONTEXT
  - **Inventory:** ${inventoryContext}
  - **Current Draft:** ${JSON.stringify(session.draft)}
  - **Recent History:** ${JSON.stringify(session?.messages?.slice(-5))}
  - **User Message:** "${userText}"

  ### 🎯 OBJECTIVE
  If a product is in the [Inventory], it means it IS available. Sell it. 
  Collect: Product name, Quantity, Specs (Size/Color/Volume), Phone, and Address to finish the order.

  ### 🛠️ STRICT RULES
  1. **Stock Confirmation:** If a product is in the Inventory context, it is 100% IN STOCK. Always say "დიახ, გვაქვს".
  2. **No Hallucinations:** Do NOT mention products like "Urban Comfort" or any other item unless it is explicitly listed in the [Inventory] above.
  3. **Dynamic Specs:** Ask for Size, Color, or Volume ONLY if those fields have values in the Inventory. If the field is empty or null, don't ask for it.
  4. **No Redundancy:** Do NOT ask for information that is already present in the [Current Draft].
  5. **Georgian Style:** Be natural and friendly. Use: "კი ბატონო", "მშვენიერია", "გასაგებია".
  6. **Greeting Logic:** "salami", "baro", "gamarjoba" are greetings. If the context is just a greeting, respond warmly without error messages.
  7. **Focus:** If a product is in the Draft, do not switch to another model unless the user asks for a new search.
  8. **Confirmation:** Confirm extracted specs (e.g., "გასაგებია, 44 ზომა") and move to the next missing info.

  ### 📤 OUTPUT (JSON ONLY)
  {
    "reply": "Your Georgian response",
    "extracted": { 
      "product": "name", 
      "quantity": 1, 
      "specs": { "color": "...", "size": "...", "volume": "..." }, 
      "phone": "...", 
      "address": "..." 
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
      "stock": {
        "sizes": "40, 41, 42, 43, L, XL",
        "colors": "შავი, თეთრი",
        "volumes": "100ml, 12 litters"
     },
    }
    თუ რამე მონაცემს ვერ იპოვი, ჩაწერე null.
  `;

  try {
    const result = await model.generateContent(prompt);
    let parsedData = JSON.parse(result.response.text());
    console.log("Raw parsed data:", parsedData);

    // ნორმალიზაცია stock ობიექტისთვის
    if (parsedData && parsedData?.stock) {
      parsedData.stock = normalizeStock(parsedData.stock);
    }
    return parsedData;
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
