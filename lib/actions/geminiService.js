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
    Analyze: "${userText}"
    Task: Extract search intent and product info.
    
    RULES:
    1. INTENT: 
       - "search": User mentions a brand/product (e.g., "Hermes", "Bikkembergs").
       - "clarify": User asks for size, color, or price for the current item (e.g., "42 zoma", "shavi aris?", "ra girs?").
       - "greeting": Just "salami", "rogor khar?".
    2. TERM: Extract ONLY the brand or model. 
    3. IMPORTANT: Ignore generic words like "zoma", "fexsacmeli", "ზომა" as the product term.

    Return JSON ONLY: { "intent": "search" | "clarify" | "greeting", "term": "brand name or none" }
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    return parsed; // აბრუნებს მთლიან ობიექტს {intent, term}
  } catch (error) {
    console.error("🔍 Search Term Error:", error);
    return { intent: "greeting", term: "none" };
  }
}

export async function aiResponse(shop, session, userText) {
  let products = [];
  let inventoryContext = "";

  // 1. ვიგებთ იუზერის განზრახვას
  const analysis = await getSearchTerm(userText);
  const currentDraftProduct = session?.draft?.product;

  let activeTerm = "none";

  // 2. ლოგიკური გადართვა
  if (analysis.intent === "search") {
    activeTerm = analysis.term;
    // თუ ახალ ბრენდს ეძებს, ძველს ვშლით
    if (
      currentDraftProduct &&
      activeTerm.toLowerCase() !== currentDraftProduct.toLowerCase()
    ) {
      console.log("🔄 SWITCHING PRODUCT:", activeTerm);
      session.draft = null;
    }
  } else if (analysis.intent === "clarify" && currentDraftProduct) {
    // თუ აზუსტებს (მაგ. "42 zoma"), ვიყენებთ უკვე არსებულ პროდუქტს
    activeTerm = currentDraftProduct;
  } else {
    activeTerm = analysis.term; // "none" ან greeting
  }

  // 3. ძებნა ბაზაში
  if (activeTerm && activeTerm !== "none") {
    products = await searchInventory(activeTerm);

    // ❌ აქ აღარ ვაკეთებთ პირდაპირ return-ს, რომ ლუპში არ შევიდეთ
    if (products.length === 0) {
      // თუ ბაზამ მაინც ვერაფერი იპოვა, ვინარჩუნებთ კონტექსტს
      inventoryContext = `NOT_FOUND: მომხმარებელი ეძებს "${activeTerm}", მაგრამ ბაზაში არ არის. უთხარი თავაზიანად.`;
    } else {
      const formatProduct = (p) => {
        const sizes = p.stock
          ? Object.keys(p.stock)
              .filter((s) => p.stock[s] > 0)
              .join(", ")
          : "None";
        return `მოდელი: ${p.name}, visuals: ${p.visual_appearance || "სტანდარტული"}, ხელმისაწვდომი ზომები: [${sizes}]`;
      };

      inventoryContext =
        products.length > 1
          ? `FOUND MATCHES: ${products.map(formatProduct).join(" | ")}. Ask to choose one.`
          : `FOUND PRODUCT: ${formatProduct(products[0])}. Proceed to collect size and delivery info.`;
    }
  } else {
    inventoryContext =
      "მომხმარებელი მოგესალმა ან ზოგად კითხვას სვამს. მიესალმე თბილად და ჰკითხე რა აინტერესებს.";
  }

  // 4. Gemini-ს პასუხის გენერაცია
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `
  You are an expert sales agent for "${shop.name}".

  ### 📦 CONTEXT
  - **Inventory:** ${inventoryContext}
  - **Current Draft:** ${JSON.stringify(session.draft || {})}
  - **Recent messages:** ${JSON.stringify(session?.messages?.slice(-5) || [])}
  - **User Message:** "${userText}"

  ### 🛠️ STRICT RULES
  1. **Accuracy:** ONLY confirm sizes listed in [ხელმისაწვდომი ზომები].
  2. **No Gypsy Mode:** If user rejects or changes brand, STOP pushing.
  3. **No Hallucinations:** If a visual appearance or size is not in inventory, say we don't have it.
  4. **Natural Speech:** Don't use the word "Default". Say "სტანდარტული" or "როგორც ფოტოზეა".
  5. **Collect:** Confirm Product, Size, visual, Phone, and Address for order.

  ### 📤 OUTPUT (JSON ONLY)
  {
    "reply": "Your Georgian response",
    "extracted": {
      "product": "name",
      "quantity": 1,
      "specs": { "color": "...", "size": "...", "volume": "..." },
      "phone": "...",
      "address": "...",
      "visual_appearance": "..."
    }
  }
  `;

  try {
    const result = await model.generateContent(prompt);
    const finalResponse = JSON.parse(
      result.response
        .text()
        .replace(/```json|```/g, "")
        .trim(),
    );
    return finalResponse;
  } catch (e) {
    console.error("Gemini Error:", e);
    return {
      reply: "ბოდიში, ტექნიკური ხარვეზია. კიდევ სცადეთ.",
      extracted: null,
    };
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
      "name": "ნივთის ბრენდი დასახელება",
      "brand":"ნივთის ბრენდი",
      "price": რიცხვი (მხოლოდ ციფრი),
      "description": "მოკლე აღწერა",
      "stock": {
        "KEY": "VALUE",
     },
     "visual_appearance": "თეთრი, შავი ძირით და წითელი ლოგოთი"
    }
    
    ინსტრუქცია "stock"-ისთვის:
    1. თუ ტექსტში არის ფეხსაცმლის/ტანსაცმლის ზომები (მაგ: 40, 42, L, XL), ჩაწერე ასე: {"40": 10, "42": 10}.
    2. თუ ტექსტში არის მოცულობა (მაგ: 50ml, 100ml, 1L), ჩაწერე ასე: {"50ml": 10, "100ml": 10}.
    3. რაოდენობად (value) სტანდარტულად აიღე 10, თუ ტექსტში სხვა ციფრი არ არის მითითებული.

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
