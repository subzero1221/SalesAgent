import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function findImageMatchesForVariant(imageBase64, variants) {
 try {
   const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

   const prompt = `
      You are an inventory assistant.
      List of variants: ${JSON.stringify(variants)}
      Task: Look at the image and identify which variant from the list matches the product in the image.
      Return ONLY the string of the matching variant. If none match clearly, return "null".
    `;

   // Base64 გასუფთავება (თუ სჭირდება)
   const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

   const imagePart = {
     inlineData: {
       data: cleanBase64,
       mimeType: "image/jpeg",
     },
   };

   const result = await model.generateContent([prompt, imagePart]);
   const responseText = result.response.text();

   // სუფთა პასუხის დაბრუნება (ბრჭყალების და სფეისების გარეშე)
   return responseText.trim().replace(/['"]/g, "");
 } catch (error) {
   console.error("Gemini Image Error:", error);
   return null;
 }
}
