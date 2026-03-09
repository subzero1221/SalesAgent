import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { shopId, plan, userId } = await req.json();

    // 1. Define Price IDs from your Stripe Dashboard (Test Mode)
    // Map your plan names to the actual Stripe Price IDs
    const planPrices = {
      starter: "price_1T93OlQ9K5pX6JybRpOYpn5X", // Replace with your real test price ID
      pro: "price_1T93PHQ9K5pX6JybZ7YLY234", // Replace with your real test price ID
      business: "price_1T93PVQ9K5pX6Jyb0zOkabDi", // Replace with your real test price ID
    };

    const priceId = planPrices[plan.toLowerCase()] || planPrices.premium;

    // 2. Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription", // Use "payment" if it's a one-time fee

      // 3. SUCCESS AND CANCEL URLS
      // Note: Make sure NEXT_PUBLIC_BASEURL is in your .env (e.g., your ngrok URL)
      success_url: `${process.env.NEXT_PUBLIC_BASEURL}/dashboard/user/${userId}/shop/${shopId}/payment/success?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASEURL}/dashboard/user/${userId}/shop/${shopId}/payment/cancelled?canceled=true`,

      // 4. METADATA - This is the "ID" we use in the Webhook
      metadata: {
        shopId: shopId,
        planName: plan,
        userId: userId,
      },
    });

    // 5. Return the URL to your frontend
    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Session Error:", err);
    return NextResponse.json(
      { error: err.message }, // This will show you the ACTUAL Stripe error in the alert
      { status: 500 },
    );
  }
}
