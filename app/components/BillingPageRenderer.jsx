import PricingCard from "@/app/components/PricingCard";

export default function BillingPageRenderer({ shop, userId, subscription }) {
  // 1. ვარკვევთ, რომელია აქტიური პლანი
  // ვეძებთ აქტიურ გამოწერას (თუ ვერ იპოვა, ესე იგი 'demo'-ზეა)
  const activeSubscription = subscription?.status === "active" ? subscription : null;
  const currentPlanName = activeSubscription ? activeSubscription.plan_type : "demo";

  // 2. შენი ახალი 4 პლანი
  const plans = [
    {
      name: "demo",
      label: "Demo",
      price: "0",
      limit: "50",
      products: "20",
      features: [
        "50 AI პასუხი/თვეში",
        "20 პროდუქტის იმპორტი",
        "ძირითადი რეპორტინგი",
      ],
      color: "gray",
    },
    {
      name: "starter",
      label: "Starter",
      price: "79",
      limit: "1,000",
      products: "100",
      features: ["1,000 AI პასუხი", "100 პროდუქტი", "პრიორიტეტული მხარდაჭერა"],
      color: "blue",
      recommended: true, // ამას გავუკეთებთ "Most Popular" ნიშანს
    },
    {
      name: "pro",
      label: "Pro",
      price: "179",
      limit: "3,000",
      products: "200",
      features: ["3,000 AI პასუხი", "200 პროდუქტი", "Facebook + Instagram"],
      color: "purple",
    },
    {
      name: "business",
      label: "Business",
      price: "299", // ფასი პირობითია, შეცვალე თუ გინდა
      limit: "10,000",
      products: "500",
      features: ["10,000 AI პასუხი", "500 პროდუქტი", "24/7 VIP მენეჯერი"],
      color: "orange",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          აირჩიე შენი გეგმა 🚀
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          გაზარდე გაყიდვები AI-ს დახმარებით. ნებისმიერ დროს შეგიძლია შეცვალო ან
          გააუქმო პაკეტი.
        </p>
      </div>

      {/* Current Status Bar - განახლებული ლოგიკით */}
      <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-2xl p-6 mb-12 flex flex-col md:flex-row justify-between items-center shadow-sm">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div
            className={`w-3 h-3 rounded-full ${activeSubscription ? "bg-green-500" : "bg-gray-400"}`}
          ></div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              მიმდინარე პაკეტი
            </p>
            <h2 className="text-2xl font-bold text-gray-900 capitalize">
              {currentPlanName} Plan
            </h2>
          </div>
        </div>

        <div className="text-right flex flex-col md:items-end">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            სტატუსი / ვადა
          </p>
          <p className="text-gray-900 font-medium bg-gray-100 px-3 py-1 rounded-lg inline-block">
            {activeSubscription
              ? `იწურება: ${new Date(activeSubscription.end_date).toLocaleDateString("ka-GE")}`
              : "უფასო ვერსია (Demo)"}
          </p>
        </div>
      </div>

      {/* Pricing Grid - 4 სვეტი */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <PricingCard
            key={plan.name}
            plan={plan}
            // ვამოწმებთ, არის თუ არა ეს პლანი მიმდინარე
            isCurrent={currentPlanName === plan.name}
            shopId={shop.id}
            userId={userId}
          />
        ))}
      </div>
    </div>
  );
}
