import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function normalizeStock(stock) {
  if (!stock || typeof stock !== "object") return {};

  const normalized = {};
  for (const [key, value] of Object.entries(stock)) {
    // გასაღების გასუფთავება (მაგ: " 40 " -> "40")
    const cleanKey = key.toString().trim();
    // მნიშვნელობის რიცხვად ქცევა
    const cleanValue = Number(value) || 10;
    normalized[cleanKey] = cleanValue;
  }
  return normalized;
}

export async function parsePostToProduct(caption, imageUrl) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `
    შენ ხარ მონაცემთა ექსტრაქტორი. შენი დავალებაა Facebook პოსტის ტექსტიდან პროდუქტის მონაცემების ამოღება ინვენტარისთვის.

    პოსტის ტექსტი: "${caption}"
    სურათის ლინკი: "${imageUrl || "არ არის"}"

    დააბრუნე JSON ზუსტად ამ ფორმატში:
    {
      "is_product": true ან false (თუ პოსტი არ არის გაყიდვაზე, მაგ: მილოცვა, ხუმრობა, დააბრუნე false),
      "name": "ნივთის ბრენდი + მოდელი (ინგლისურად, მაგ: Adidas Gazelle)",
      "brand": "მხოლოდ ბრენდი (მაგ: Adidas)",
      "price": რიცხვი (მხოლოდ ციფრი. თუ ფასი არ წერია, ჩაწერე 0),
      "description": "პროდუქტის მოკლე აღწერა ქართულად (მოაშორე ზედმეტი მარკეტინგული ტექსტი)",
      "stock": {
        "KEY": 10
      },
      "visual_appearance": ["აღწერა ვიზუალის, მაგ: თეთრი შავი ზოლებით"]
    }
    
    ინსტრუქცია "stock"-ისთვის:
    1. თუ ტექსტში არის ფეხსაცმლის/ტანსაცმლის ზომები (მაგ: 40, 42, L, XL), ჩაწერე ასე: {"40": 10, "42": 10}.
    2. თუ ტექსტში არის მოცულობა (მაგ: 50ml, 100ml), ჩაწერე ასე: {"50ml": 10, "100ml": 10}.
    3. რაოდენობად (value) სტანდარტულად აიღე 10, თუ ტექსტში კონკრეტული მარაგის რაოდენობა არ არის მითითებული.
    4. თუ ზომები საერთოდ არ წერია, ჩაწერე: {"Standard": 10}.

    თუ მონაცემს ვერ იპოვი, გამოიყენე null, მაგრამ სტრუქტურა არ დაარღვიო.
  `;

  try {
    const result = await model.generateContent(prompt);
    let parsedData = JSON.parse(result.response.text());

    // თუ პროდუქტი არ არის, პირდაპირ ვაბრუნებთ
    if (!parsedData.is_product) return parsedData;

    // ნორმალიზაცია stock ობიექტისთვის
    if (parsedData && parsedData.stock) {
      parsedData.stock = normalizeStock(parsedData.stock);
    }

    return parsedData;
  } catch (error) {
    console.error("Parsing error:", error);
    return null;
  }
}