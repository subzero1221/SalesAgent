
import { NextResponse } from "next/server";
import { findImageMatchesForVariant } from "@/lib/actions/geminiFindImageMatches";

export async function POST(req) {
  try {
    const { image, variants } = await req.json();

    if (!image || !variants || variants.length === 0) {
      return NextResponse.json(
        { error: "სურათი ან ვარიანტები არასწორია" },
        { status: 400 },
      );
    }

    const match = await findImageMatchesForVariant(image, variants);

    console.log("AI გადაწყვეტილება:", match);

    return NextResponse.json({ match });
  } catch (error) {
    console.error("IMAGE MATCH ROUTE ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
