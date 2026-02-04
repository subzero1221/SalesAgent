const { supabaseAdmin } = require("../supabaseAdmin");

export async function createDemoSubscription(shopId) {
  const { error } = await supabaseAdmin.from("subscriptions").insert([
    {
      shop_id: shopId,
      plan_type: "demo",
      status: "active",
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      billing_cycle: "once",
    },
  ]);

  if (error) {
    console.error(
      "Critical Error: Could not create demo subscription:",
      error.message,
    );
    // აქ შეგიძლია ჩაამატო შეტყობინება შენთვის (მაგ. Telegram-ზე)
    throw error;
  }

  return true;
}
