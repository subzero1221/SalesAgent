import { handleTelegramUpdate } from "@/lib/actions/telegramActions";
import { NextResponse } from "next/server";


export async function POST(req) {
  console.log("🔥 Webhook Hit!");
  try {
    const update = await req.json();
    console.log("📦 Update Data:", JSON.stringify(update, null, 2));
    
    await handleTelegramUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}