import { createClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import { createTbcPayment } from "@/lib/payments/TBC"; // lib-იდან ვიძახებთ

export async function POST(req) {
  const supabase = await createClient();
  const { shopId, plan } = await req.json(); // provider აღარ გვინდა, რადგან ვიცით რომ TBC-ა

  // ფასების ლოგიკა (აუცილებლად სერვერზე!)
  const PRICES = {
    demo: 0,
    starter: 49,
    pro: 149,
    business: 299,
  };
  const amount = PRICES[plan];

  if (!amount) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    // 🛑 ნაბიჯი 1: აუცილებლად ვქმნით ჩანაწერს ბაზაში (PENDING)
    // თუ ამას არ იზამ, Webhook ვერ გაიგებს ვის ჩაურთოს პლანი!
    const { data: payment, error: insertError } = await supabase
      .from("payments")
      .insert({
        shop_id: shopId,
        amount: amount,
        currency: "GEL",
        status: "pending",
        provider: "tbc", // ხელით ვუწერთ "tbc"-ს
        plan_type: plan,
      })
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);

    // 🛑 ნაბიჯი 2: ვქმნით ლინკს TBC-სთან
    // payment.id-ს ვატანთ, რომ TBC-მ დაგვიბრუნოს Webhook-ში
    const tbcData = await createTbcPayment(amount, payment.id);
    console.log("🔥 TBC RAW RESPONSE:", JSON.stringify(tbcData, null, 2));

    if (!tbcData || !tbcData.links || !tbcData.links[0]) {
      // თუ ლინკი არ არის, ე.ი. შეცდომაა. ვაბრუნებთ შეცდომის ტექსტს
      throw new Error(tbcData.title || tbcData.detail || "TBC API Failed");
    }

    const redirectUrl = tbcData.links[0].uri;
    const bankPayId = tbcData.payId;

    // 🛑 ნაბიჯი 3: ვაახლებთ ბაზას TBC-ის Pay ID-ით
    await supabase
      .from("payments")
      .update({ provider_order_id: bankPayId })
      .eq("id", payment.id);

    // ვაბრუნებთ ლინკს
    return NextResponse.json({ url: redirectUrl });
  } catch (error) {
    console.error("TBC API Error:", error);
    return NextResponse.json(
      { error: "გადახდის შექმნა ვერ მოხერხდა" },
      { status: 500 },
    );
  }
}
