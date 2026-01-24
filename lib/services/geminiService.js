import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { supabaseAuth } from "../supabaseClient";

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

export async function aiResponse(shop, session, userText) {
  // 1. მოვქაჩოთ ინვენტარი ბაზიდან
  const { data: products } = await supabaseAuth
    .from("products")
    .select("*")
    .eq("shop_id", shop.id);

  const inventoryContext =
    products
      ?.map(
        (p) => `- ${p.name}: ${p.price}₾, ზომები: ${JSON.stringify(p.stock)}`,
      )
      .join("\n") || "ინვენტარი ცარიელია";

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
  შენ ხარ მაღაზიის "${shop.name}" ჭკვიანი გაყიდვების აგენტი. 
  
  ჩვენი ინვენტარი:
  ${inventoryContext}

  მიმდინარე შეკვეთის დრაფტი: ${JSON.stringify(session.draft)}
  კლიენტის შეტყობინება: "${userText}"

  შენი მიზანია შეკვეთის გაფორმება ამ ეტაპების მიხედვით:
  1. **გამარჯობა**: გამარჯობას უპასუხე მარტივად:გამარჯობა, რისი შეძენა გსურთ?(salami, სალამი, ბარო გამარჯობას ნიშნავს).
  2. **შერჩევა**: თუ კლიენტი ზოგადად კითხულობს, შესთავაზე ინვენტარიდან რამე.
  3. **დაზუსტება**: თუ კლიენტმა აირჩია მოდელი (მაგ: "Nike"), ჰკითხე სასურველი ზომა და ფერი.
  4. **მონაცემების შეგროვება**: მას შემდეგ რაც მოდელი და ზომა გარკვეულია, სთხოვე ტელეფონის ნომერი და მისამართი.
  5.**სტილი**: ნუ იქნები რობოტი. თუ 5 მოდელი გვაქვს, უთხარი: "ოო, არჩევანი ძალიან დიდია, უამრავი მოდელი გვაქვს. რომელ ბრენდს ანიჭებთ უპირატესობას?"
  

  მნიშვნელოვანი წესები:
  - **არ მიესალმო ყოველ შეტყობინებაზე.** თუ ჩატი უკვე მიმდინარეობს, პირდაპირ გააგრძელე საუბარი.
  - თუ კლიენტმა თქვა "ვიყიდი" ან "მინდა", ჰკითხე: "რომელ ზომას ინებებთ?".
  - თუ კლიენტმა მოგწერა ნომერი ან მისამართი, ამოიღე JSON-ში და დაადასტურე მიღება.
  - იყავი მეგობრული, გამოიყენე სლენგიც თუ საჭიროა (მაგ: "კი ბატონო", "მშვენიერია"), მაგრამ შეინარჩუნე პროფესიონალიზმი.

  დააბრუნე მხოლოდ JSON ფორმატში:
  {
    "reply": "შენი მოკლე პასუხი ქართულად",
    "extracted": { 
      "product": "რა აირჩია", 
      "size": "რა ზომა", 
      "phone": "ტელეფონი", 
      "address": "მისამართი" 
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
