import OpenAI from "openai";
import { shopData } from "@/data/inventory";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

  return {
    reply: raw,
    extracted: {},
    completed: false,
  };
}

export async function aiResponse(shop, session, userText) {
  const res = await openai.chat.completions.create({
    model: "gpt-4.1",
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content: `
You are an AI sales assistant for the shop "${shop?.name ?? shopData.name}".

Language: Georgian
Tone: ${shop.style.tone}
Max sentences: ${shop.style.max_sentences}

Rules:
- Speak Georgian naturally. Be short.
- If the user greets (e.g., "სალამი", "გამარჯობა", "salami"), greet back only ONCE per session.
- Do NOT start every message with a greeting.
- Never claim “we have it” or “we don’t have it” unless it is explicitly provided in context.
- If the user asks availability/models, be honest: say you can confirm via phone or ask for 1 detail (size/brand/color) then request phone.
- If the user refuses to give phone until confirmation, respond politely: explain you can’t see stock here and offer: leave phone for quick confirmation.
- Ask at most ONE question per message.
- If draft already contains phone/need, never ask for phone/need again.
- If required fields are complete, reply with a short confirmation and stop asking questions.

Required fields:
${shop.required_fields.map((f) => `- ${f}`).join("\n")}

Questions:
${Object.entries(shop.questions)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Respond ONLY in valid JSON.
`,
      },
      {
        role: "user",
        content: `
Known conversation data:
${JSON.stringify(session?.draft ?? {})}

User message:
"${userText}"

Return JSON in this format:
{
  "reply": string,
  "extracted": object,
  "completed": boolean
}
`,
      },
    ],
  });

  const raw = res.choices?.[0]?.message?.content ?? "";
  return parseAiJson(raw); // ✅ return { reply, extracted, completed }
}
