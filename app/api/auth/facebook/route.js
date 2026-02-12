import { saveShopData } from "@/lib/actions/shopActions";
import { createDemoSubscription } from "@/lib/actions/subscriptionActions";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  console.log("Auth route hit:", code);
  const ownerId = searchParams.get("state");

  // Safety check: If the user cancels or something fails, Meta won't send a code.
  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }
   
 console.log("REDIRECT URI IS:", process.env.FACEBOOK_REDIRECT_URI);

  try {
    // 1. EXCHANGE CODE FOR SHORT-LIVED USER TOKEN (Valid for ~2 hours)
    // This is the first "handshake" to prove the login code is valid.
    const shortTokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${process.env.FACEBOOK_BUSINESSAPP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&redirect_uri=${process.env.FACEBOOK_REDIRECT_URI}&code=${code}`;
  
    const shortTokenRes = await fetch(shortTokenUrl);
    const shortTokenData = await shortTokenRes.json();

    if (shortTokenData.error) throw new Error(shortTokenData.error.message);
    const shortUserToken = shortTokenData.access_token;

    // 2. UPGRADE TO LONG-LIVED USER TOKEN (Valid for 60 days)
    // You MUST do this so your bot doesn't "die" when the owner logs out.
    const longTokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.FACEBOOK_BUSINESSAPP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&fb_exchange_token=${shortUserToken}`;

    const longTokenRes = await fetch(longTokenUrl);
    const longTokenData = await longTokenRes.json();
    const longUserToken = longTokenData.access_token;

    // 3. GET PERMANENT PAGE ACCESS TOKENS
    // This is the "Gold". When you use a 60-day user token to ask for Page tokens,
    // Meta gives you Page tokens that NEVER EXPIRE (unless the user removes your app).
const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts?fields=name,access_token,id,instagram_business_account,picture{url}&access_token=${longUserToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();
    const pages = pagesData.data; // This is an array of all pages the user allowed.

    // 4. SAVE TO DATABASE (Responsibility Step)
    // Loop through the pages and save the ID and the Secret Token.
    for (const page of pages) {
      // ა) ვინახავთ ბაზაში
    const shop = await saveShopData(page, ownerId);
    await createDemoSubscription(shop.id)
      // ბ) ავტომატური საბსქრაიბი (რომ ბოტი გააქტიურდეს)
      try {
        const subscribeUrl = `https://graph.facebook.com/v21.0/${page.id}/subscribed_apps?access_token=${page.access_token}`;

        const subRes = await fetch(subscribeUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscribed_fields: ["messages", "messaging_postbacks", "feed"],
          }),
        });

        const subData = await subRes.json();
        if (subData.success) {
          console.log(`Webhook subscribed for page: ${page.name}`);
        } else {
          console.error(
            `Failed to subscribe page ${page.name}:`,
            subData.error,
          );
        }
      } catch (err) {
        console.error(`Subscription error for ${page.name}:`, err.message);
      }
    }

    // Success! Send them back to your UI.
    const host = request.headers.get("host"); // იღებს 23d0d72e7a14.ngrok-free.app-ს
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const base = `${protocol}://${host}`;

    return NextResponse.redirect(new URL("/dashboard?status=connected", base));
  } catch (error) {
    console.error("Auth Error:", error.message);
    return NextResponse.json(
      { error: "Failed to authenticate with Meta" },
      { status: 500 },
    );
  }
}
