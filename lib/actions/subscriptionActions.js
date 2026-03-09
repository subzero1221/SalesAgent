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

export async function getSubscriptionByShopId(shopId) {
  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("*")
    .eq("shop_id", shopId)
    .single();

  if (error) {
    console.error("Error fetching subscription:", error.message);
    throw error;
  }

  return data;
}

export async function upgradeSubscription(shopId, newPlan) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 30);

  const limits = {
    starter: 1000,
    pro: 3000,
    business: 10000,
    demo: 50, 
  };

  const newLimit = limits[newPlan.toLowerCase()] || 1000;

  // 1. Update the Subscription record
  const { error: subError } = await supabaseAdmin
    .from("subscriptions")
    .update({
      plan_type: newPlan,
      status: "active",
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    })
    .eq("shop_id", shopId);

  // 2. Update the Shop record's message limit
  const { error: shopError } = await supabaseAdmin
    .from("shops")
    .update({
      message_limit: newLimit,
    })
    .eq("id", shopId);

  if (subError || shopError) {
    console.error("Upgrade failed:", subError || shopError);
    return { success: false };
  }

  return { success: true };
}