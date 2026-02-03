"use client";
import { useState } from "react";
import PaymentModal from "./PaymentModal"; // დარწმუნდი, რომ ეს ფაილი სწორ ადგილასაა

export default function PricingCard({ plan, isCurrent, shopId }) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. ხსნის მოდალს
  const handleUpgradeClick = () => {
    if (isCurrent) return;
    setIsModalOpen(true);
  };

  // 2. ამუშავებს გადახდას (გადაეცემა მოდალს)
  const processPayment = async (provider) => {
    setLoading(true); // ღილაკი დატრიალდება მოდალში

    try {
      // ვიძახებთ ჩვენს ახალ, უნივერსალურ API-ს
      const res = await fetch(`/api/payments/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopId: shopId,
          plan: plan.name,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "გადახდის შექმნა ვერ მოხერხდა");
      }

      // 3. გადავდივართ ბანკის გვერდზე
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("ბანკის ლინკი არ დაბრუნდა");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("შეცდომა: " + error.message);
      setLoading(false); // ვაჩერებთ ლოადერს
      setIsModalOpen(false); // ვხურავთ მოდალს, რომ იუზერმა თავიდან სცადოს
    }
  };

  return (
    <>
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

        <h3 className="text-xl font-black capitalize mb-2">
          {plan.label || plan.name}
        </h3>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-4xl font-black">₾{plan.price}</span>
          <span className="text-gray-400 text-sm font-medium">/თვეში</span>
        </div>

        <p className="text-sm font-bold text-blue-600 mb-6">
          {plan.limit} მესიჯი
        </p>

        <ul className="space-y-4 mb-8">
          {plan.features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-3 text-sm text-gray-600"
            >
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
          onClick={handleUpgradeClick}
          disabled={isCurrent || loading}
          className={`w-full py-4 cursor-pointer rounded-2xl font-bold text-sm transition-all flex justify-center items-center ${
            isCurrent
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800 active:scale-95"
          }`}
        >
          {isCurrent ? "Active Plan" : `Upgrade to ${plan.label || plan.name}`}
        </button>
      </div>

      {/* Payment Modal Component */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => !loading && setIsModalOpen(false)}
        plan={plan}
        loading={loading}
        onSelectProvider={processPayment}
      />
    </>
  );
}
