import { NextResponse } from "next/server";
import Stripe from "stripe";
import { upgradeSubscription } from "@/lib/actions/subscriptionActions";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Use service role key to bypass RLS for the upgrade


export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { shopId, planName } = session.metadata;
    
   const success = await upgradeSubscription(shopId, planName);
  }

  return NextResponse.json({ received: true });
}
