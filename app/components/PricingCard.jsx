"use client";
import { useRouter } from "next/navigation";

export default function PricingCard({ plan, isCurrent, shopId }) {
  const router = useRouter();

  const handleUpgrade = async () => {
    if (isCurrent) return;

    // 🚀 დროებითი "Mock Upgrade" - სანამ Stripe-ს ჩავრთავთ
    const res = await fetch(`/api/shops/${shopId}/upgrade`, {
      method: "POST",
      body: JSON.stringify({ plan: plan.name }),
    });

    if (res.ok) {
      alert(`გილოცავთ! თქვენი პაკეტი განახლდა: ${plan.name}`);
      router.refresh(); // აახლებს მონაცემებს გვერდზე
    }
  };

  return (
    <div
      className={`relative bg-white rounded-3xl p-8 border-2 transition-all ${
        plan.recommended
          ? "border-blue-500 shadow-xl scale-105 z-10"
          : "border-gray-100"
      }`}
    >
      {plan.recommended && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold">
          Recommended
        </span>
      )}

      <h3 className="text-xl font-black capitalize mb-2">{plan.name}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl font-black">${plan.price}</span>
        <span className="text-gray-400 text-sm font-medium">/თვეში</span>
      </div>

      <p className="text-sm font-bold text-blue-600 mb-6">
        {plan.limit} მესიჯი
      </p>

      <ul className="space-y-4 mb-8">
        {plan.features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={handleUpgrade}
        disabled={isCurrent}
        className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${
          isCurrent
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800 active:scale-95"
        }`}
      >
        {isCurrent ? "Active Plan" : `Upgrade to ${plan.name}`}
      </button>
    </div>
  );
}
