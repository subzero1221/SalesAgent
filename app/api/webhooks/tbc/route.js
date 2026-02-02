import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

// კონფიგურაცია იგივე უნდა იყოს, რაც PricingCard-ში
const PLAN_CONFIG = {
  starter: { msg_limit: 1000, prod_limit: 100 },
  pro: { msg_limit: 3000, prod_limit: 200 },
  business: { msg_limit: 10000, prod_limit: 500 },
};

export async function POST(req) {
  try {
    const body = await req.json();

    // TBC-ს Webhook-ის სტრუქტურა:
    // ხანდახან მოდის { PaymentId, Status }, ხანდახან { payId, status }
    // გადაამოწმე TBC-ს დოკუმენტაციაში ან console.log-ით პირველ ჯერზე.
    const paymentId = body.PaymentId || body.payId;
    const status = body.Status || body.status;

    console.log(`🔔 TBC Webhook: ID=${paymentId}, Status=${status}`);

    // 1. ვპოულობთ გადახდას ჩვენს ბაზაში (PAYMENTS table)
    const { data: payment, error: fetchError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("provider_order_id", paymentId)
      .single();

    if (fetchError || !payment) {
      console.error("❌ Payment not found in DB");
      return new NextResponse("Order not found", { status: 404 });
    }

    // 2. თუ უკვე დამუშავებულია, არაფერს ვაკეთებთ (200 OK)
    if (payment.status === "succeeded") {
      return new NextResponse("Already Processed", { status: 200 });
    }

    // 3. თუ სტატუსი წარმატებულია -> ვიწყებთ განახლებებს
    if (status === "Succeeded") {
      const selectedPlan = PLAN_CONFIG[payment.plan_type]; // მაგ: 'starter'

      // A. Payment Status -> succeeded
      await supabaseAdmin
        .from("payments")
        .update({ status: "succeeded" })
        .eq("id", payment.id);

      // B. Create Subscription (1 თვე)
      await supabaseAdmin.from("subscriptions").insert({
        shop_id: payment.shop_id,
        plan_type: payment.plan_type,
        status: "active",
        start_date: new Date(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)), // +1 თვე
        billing_cycle: "monthly",
      });

      // C. Update Shop Limits & Reset Counter
      await supabaseAdmin
        .from("shops")
        .update({
          message_limit: selectedPlan.msg_limit,
          product_limit: selectedPlan.prod_limit,
          messages_sent_this_month: 0, // განულება
        })
        .eq("id", payment.shop_id);

      console.log(
        `✅ Success! Shop ${payment.shop_id} upgraded to ${payment.plan_type}`,
      );
    } else if (status === "Failed") {
      // თუ ჩაიშალა
      await supabaseAdmin
        .from("payments")
        .update({ status: "failed" })
        .eq("id", payment.id);
    }

    // ბანკს ვაბრუნებთ OK-ს
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("🚨 Webhook Error:", error);
    // მაინც 200-ს ვაბრუნებთ ხოლმე, რომ ბანკმა არ "დაგვბომბოს",
    // მაგრამ რეალურ გარემოში ჯობია 400/500 დააბრუნო, რომ TBC-მ თავიდან ცადოს.
    return new NextResponse("Webhook Error", { status: 500 });
  }
}
