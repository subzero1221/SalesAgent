
import PricingCard from "@/app/components/PricingCard";

export default async function BillingPageRenderer({ shop }) {


  const plans = [
    {
      name: "demo",
      price: "0",
      limit: "100",
      features: ["AI Chatbot", "Basic Analytics", "Meta Integration"],
      color: "gray",
    },
    {
      name: "starter",
      price: "49",
      limit: "1,000",
      features: ["Everything in Demo", "Priority AI Response", "Email Support"],
      color: "blue",
      recommended: true,
    },
    {
      name: "pro",
      price: "149",
      limit: "5,000",
      features: ["Unlimited Leads", "Advanced Context", "24/7 Support"],
      color: "purple",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black text-gray-900 mb-2">
          გამოწერის მართვა
        </h1>
        <p className="text-gray-500">აირჩიეთ თქვენს ბიზნესზე მორგებული გეგმა</p>
      </div>

      {/* Current Status Mini-Bar */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-12 flex flex-col md:flex-row justify-between items-center shadow-sm">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            თქვენი პაკეტი
          </p>
          <h2 className="text-xl font-bold text-gray-900 capitalize">
            {shop.plan_type} Plan
          </h2>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            ვადა იწურება
          </p>
          <p className="text-gray-900 font-semibold">
            {shop.plan_expires_at
              ? new Date(shop.plan_expires_at).toLocaleDateString()
              : "No active plan"}
          </p>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <PricingCard
            key={plan.name}
            plan={plan}
            isCurrent={shop.shop_plan === plan.name}
            shopId={shop.id}
          />
        ))}
      </div>
    </div>
  );
}
