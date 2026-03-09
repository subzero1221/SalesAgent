"use client";
import {useRouter } from "next/navigation";

export default function CancelledPage( {userId, shopId} ) {

  const router = useRouter();



  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-xl text-center border border-gray-100">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-2">
          გადახდა შეწყდა
        </h1>
        <p className="text-gray-500 mb-8">
          ოპერაცია გაუქმდა. თუ რაიმე პრობლემა შეგექმნათ, გთხოვთ სცადოთ თავიდან
          ან მოგვწეროთ.
        </p>

        <button
          onClick={() =>
            router.push(`/dashboard/user/${userId}/shop/${shopId}`)
          }
          className="w-full py-4 cursor-pointer bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
        >
          სცადეთ თავიდან ➝
        </button>
      </div>
    </div>
  );
}
