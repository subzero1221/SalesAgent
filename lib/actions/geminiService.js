import { GoogleGenerativeAI} from "@google/generative-ai";
import { getAllProducts, searchInventory } from "./productActions";
import { normalizeStock } from "@/lib/helpers/tools";
import { checkAndGetQuota, incrementMessagesSpent } from "./shopActions";

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
    Analyze user message: "${userText}"
    
    TASK:
    1. Identify intent: "search", "clarify", "greeting", or "reject".
    2. Extract core brand/product name.
    
    RULES:
    - NORMALIZE: If the user writes in Georgian (e.g., "ბოსი", "ადიდასი"), convert to English ("Boss", "Adidas").
    - STRIP: Remove adjectives like "printiani", "magari", "axali".
    - SYNONYMS: If they say "fexsacmeli", "sportuli", it's generic unless a brand is mentioned.
    
    Return JSON ONLY: { "intent": "...", "term": "...", "original_language": "..." }
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```json|```/g, "")
      .trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("🔍 Extraction Error:", error);
    return { intent: "greeting", term: "none" };
  }
}

async function findMatchesInCatalog(searchTerm, catalogNames) {
  const prompt = `
    User is searching for: "${searchTerm}"
    Our available products: [${catalogNames.join(", ")}]
    
    Does "${searchTerm}" match any product in our list (even with typos or synonyms)?
    If yes, return the exact name from our list. If no, return "none".
    Return ONLY JSON: { "matchedName": "..." }
  `;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  const data = JSON.parse(
    result.response
      .text()
      .replace(/```json|```/g, "")
      .trim(),
  );
  return data.matchedName;
}

async function getBusinessPrompt(shop, session, userText) {}

async function getBasicPrompt(shop, session, userText) {
  // 1. მოგვაქვს ყველა პროდუქტი (Starter/Pro - Full List)
  const allProducts = await getAllProducts(shop.id);
  
  // 2. ვაქცევთ კომპაქტურ ტექსტად ტოკენების დასაზოგად
  const inventoryContext = allProducts
    .map((p, index) => {
      const id = index + 1; // UUID-ის ნაცვლად 1, 2, 3...
      const brand = p.brand || "";
      const name = p.name || "";
      const price = p.price || "";
      const visual = p.visual_appearance || "";
      const sizes = p.stock
        ? Object.keys(p.stock)
            .filter((s) => p.stock[s] > 0)
            .join(",")
        : "None";

      // ვინახავთ UUID-ს სესიაში, რომ მერე ვიცოდეთ რომელზეა საუბარი
      p.temp_id = id;

      return `ITEM #${id} | ${brand} ${name} | ${price}₾ | ${visual} | Sizes:[${sizes}]`;
    })
    .join("\n");


  // 3. ვაწყობთ სისტემურ პრომპტს
  return `
    You are an expert sales agent for "${shop.name}".
    Respond ONLY in JSON format.

    ### 📦 FULL INVENTORY
    ${inventoryContext}

    ### 📋 CONTEXT
    - **Current Session Draft:** ${JSON.stringify(session.draft || {})}
    - **Recent History:** ${JSON.stringify(session?.messages?.slice(-6) || [])}
    - **User Said:** "${userText}"

    ### 🛠️ RULES
    1. **Strict Inventory:** If a brand, model, or size isn't in the [FULL INVENTORY], we don't have it.
    2. **Context Persistence:** If the user asks for a size (e.g., "42 მინდა") without naming the product, assume they mean the last product discussed in the history.
    3. **Tone:** Natural Georgian, friendly but professional.Don't greet the user in every message. If the conversation is already ongoing, get straight to the point. Use greetings ONLY in the very first message of the session. 
    4. **Extraction:** Always update "extracted" fields if the user provides new info (size, phone, address) Be efficient. Don't be repetitive.
    5. **Search Accuracy:** When many products are listed, always look for the EXACT brand and model the user mentioned. If multiple colors exist for the same model, ask which color they prefer before finalizing.
    6. **Confirmation:** If user confirms an order, finalize "extracted, ask for number and address". 
    7. **Tone & Behavior (CRITICAL)**: Always maintain a professional, polite, and formal tone. Even if the user uses slang, informal language (e.g., "bicho", "to", "dzmao"), or rude behavior, DO NOT mimic them. Respond in high-standard, polite Georgian. Never use slang.
    8. **JSON Format:** Always respond in the following JSON structure:

    ### 📤 OUTPUT FORMAT (JSON ONLY)
    {
      "reply": "თქვენი პასუხი ქართულად",
      "extracted": {
        "product": "Full Product Name",
        "specs": { "size": "...", "visual_appearance": "...", quantity: ... },
        "phone": "...",
        "address": "..."
      }
    }
  `;
}

export async function aiResponse(shop, session, userText) {
 


 let prompt;

  if(shop.shop_plan === "bussines"){
    prompt = await getBusinessPrompt(shop, session, userText);
  }else{
    prompt = await getBasicPrompt(shop, session, userText);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", generationConfig: { responseMimeType: "application/json" } });
 
  try {
    const result = await model.generateContent(prompt);
    await incrementMessagesSpent(shop.id);

    const finalResponse = JSON.parse(
      result.response
        .text()
        .replace(/```json|```/g, "")
        .trim(),
    );
    return finalResponse;
  } catch (e) {
    console.error("Gemini Final Response Error:", e);
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
     "visual_appearance": ["თეთრი, შავი ძირით და წითელი ლოგოთი"]
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
