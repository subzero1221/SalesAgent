"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti"; // npm install canvas-confetti

export default function SuccessPage({shopId, userId}) {
  const router = useRouter();
  

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-xl text-center border border-gray-100">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-2">გილოცავთ!</h1>
        <p className="text-gray-500 mb-8">
          თქვენი პრემიუმ პაკეტი წარმატებით გააქტიურდა. SalesAgent-ის სრული
          შესაძლებლობები უკვე ხელმისაწვდომია.
        </p>

        <button
          onClick={() =>
            router.push(`/dashboard/user/${userId}/shop/${shopId}`)
          }
          className="w-full py-4 bg-black cursor-pointer text-white rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95"
        >
          დაბრუნება დეშბორდზე ➝
        </button>
      </div>
    </div>
  );
}
