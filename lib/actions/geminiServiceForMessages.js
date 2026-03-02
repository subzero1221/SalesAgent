import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAllProducts } from "./productActions";
import { normalizeStock } from "@/lib/helpers/tools";
import { incrementMessagesSpent } from "./shopActions";

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


async function getBusinessPrompt(shop, session, userText, allProducts) {}

async function getBasicPrompt(shop, session, userText, allProducts) {
   

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

     
    
      const hasImage = p.product_image_url ? "YES" : "NO";
      

      return `ITEM #${id} | ${brand} ${name} | ${price}₾ | ${visual} | Sizes:[${sizes}] || ImageAvailable: ${hasImage}`;
    })
    .join("\n");

  
  return `
    You are an expert sales agent for "${shop.name}".
    Your goal is to secure a sale, but you must be accurate.
    Respond ONLY in JSON format.

    ### 📦 FULL INVENTORY (Internal Data)
    ${inventoryContext}

    ### 📋 CONTEXT
    - **History:** ${JSON.stringify(session?.messages?.slice(-6) || [])}
    - **User Said:** "${userText}"

    ### 🛠️ RULES (STRICT ORDER OF OPERATIONS)
    GREET ONCE, then FOLLOW THE STEPS IN ORDER:
    1. **Strict Inventory:** If a brand/model isn't in [FULL INVENTORY], we don't have it.
    1.1 **AMBIGUITY GUARD (SAFE MODE):** - If the user asks generic pointers like "eseni gaqvt?" (do you have these?) or "fasi?" AND there is NO "[SYSTEM: Image...]" note:
       - **DO NOT** guess "Yes".
       - **DO NOT** say "Checking..." (because they might not have sent a photo).
       - **CORRECT RESPONSE:** (Please send a photo or model name so I can check the stock).
    1.2 **VISUAL CONFIRMATION (CRITICAL):** - If the user sends an image, **NEVER** assume it is a 100% match to our stock.
       - **GOOD Response:** "This looks very similar to our **[Inventory Product Name]**. Here is a photo of ours. Is this the one you are looking for?"
       - **ACTION:** You MUST put the ID of that "similar product" in 'product_id_to_show' so the user sees *our* version immediately.   
    2. **Context Persistence:** "42 მინდა" (I want 42) refers to the product discussed in the immediate history.
    3. **Tone:** Professional, polite Georgian. No slang. Do not over-greet.
    4. **Extraction:** efficiently update "extracted" fields.
    5. **Search Accuracy:** Match EXACT brand/model. If multiple colors exist, ask which one.

    6. **GATEKEEPER (MANDATORY SPECS):** - **CRITICAL:** Before asking for "Phone" or "Address", you **MUST** ensure the user has selected a **SIZE** (if the product has sizes).
       - **Scenario:** If user says "I want the black one" (confirming model/color) but hasn't picked a size yet -> **DO NOT** ask for address. 
       - **Action:** Ask: "Which size do you need? We have: [List sizes]."

    7. **Confirmation:** ONLY when **Product + Color + Size** are ALL known, THEN ask for phone number and address to finalize.

    8. **VISUALS (SMART TRIGGER):** - Look at [FULL INVENTORY]. If "ImageAvailable:YES":
       - Return the integer ID (e.g. 1) in "product_id_to_show" IF:
         A) You are mentioning a specific product for the *first time*.
         B) The user explicitly asks to see it (e.g., "foto?").

    9. **VISUALS (SMART TRIGGER):** - Look at [FULL INVENTORY]. If "productFound:YES":
       - Return the integer ID (e.g. 1) in "product_id_to_show" IF:
         A) You are mentioning a specific product for the *first time*.
         B) The user explicitly asks to see it (e.g., "foto?").     

    10. **ANTI-SPAM:** - If the user is just selecting a size, confirming price, or finalizing details for a product *already shown*, set "product_id_to_show": null.

    11. **JSON Format:** Always respond in this exact structure:

    ### 📤 OUTPUT FORMAT (JSON ONLY)
    {
      "reply": "Your natural Georgian response here...",
      "extracted": {
        "product": "Full Product Name or null",
        "specs": { "size": "...", "visual_appearance": "...", "quantity": 1 },
        "phone": "...",
        "address": "..."
      },
      "product_id_to_show": 12 
    }
  `;
}

export async function aiResponse(shop, session, userText) {
  const allProducts = await getAllProducts(shop.id);

  let prompt;

  if (shop.shop_plan === "bussines") {
    prompt = await getBusinessPrompt(shop, session, userText, allProducts);
  } else {
    prompt = await getBasicPrompt(shop, session, userText, allProducts);
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  try {
    const result = await model.generateContent(prompt);
    await incrementMessagesSpent(shop.id);

    const finalResponse = JSON.parse(
      result.response
        .text()
        .replace(/```json|```/g, "")
        .trim(),
    );

    console.log("FINAL RESPONSE:", finalResponse);

   if (finalResponse.product_id_to_show) {
     const rawId = String(finalResponse.product_id_to_show).replace(
       /[^0-9]/g,
       "",
     );
     const tempId = parseInt(rawId);

     
     if (!isNaN(tempId)) {
       const index = tempId - 1;
       const matchedProduct = allProducts[index];

       if (matchedProduct && matchedProduct.product_image_url) {
         finalResponse.product_card = matchedProduct; 
       }
     }
   }

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
