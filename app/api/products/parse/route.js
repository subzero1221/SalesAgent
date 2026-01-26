import { NextResponse } from "next/server";
import { parseProductFromText } from "@/lib/actions/geminiService";

export async function POST(req) {
  try {
    const { text } = await req.json();
    const productData = await parseProductFromText(text);

    console.log("სერვერმა დაამუშავა:", productData);

    if (!productData) {
      return NextResponse.json(
        { error: "მონაცემები ცარიელია" },
        { status: 422 },
      );
    }

    const result = Array.isArray(productData) ? productData[0] : productData;

    return NextResponse.json(result);
  } catch (error) {
    console.error("API ROUTE ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
