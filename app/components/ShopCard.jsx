"use client";
import { toggleBotStatus } from "@/lib/actions/shopActions";
import Link from "next/link";
import { useState } from "react";

export default function ShopCard({ shop }) {
  const [isBotEnabled, setIsBotEnabled] = useState(shop.bot_enabled);

  // 1. გამოვთვალოთ ლიმიტები
  const limits = { demo: 100, starter: 1000, pro: 5000 };
  const maxLimit = limits[shop.shop_plan] || 100;
  const used = shop.messages_sent_this_month || 0;
  const percentage = Math.min((used / maxLimit) * 100, 100);

  // 2. Telegram-ის ლინკი (შეცვალე შენი ბოტის სახელით)
  const botUsername = "Lead_confirmed_bot";
  const telegramLink = `https://t.me/${botUsername}?start=${shop.id}`;

  const progressColor =
    percentage > 90
      ? "bg-red-500"
      : percentage > 70
        ? "bg-orange-500"
        : "bg-blue-600";

 
  const toggleBot = async () => {
    const newState = !isBotEnabled;

  
    setIsBotEnabled(newState);
    try { 
      await toggleBotStatus(shop.id, newState);
    } catch (error) {
      setIsBotEnabled(!newState);
      alert("ვერ მოხერხდა განახლება!");
    }
  };

  return (
    // დავამატეთ max-w-md (დაახლოებით 450px) რომ უფრო განიერი იყოს
    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm hover:shadow-lg transition-all group max-w-md w-full">
      <div className="flex justify-between items-start mb-6">
        <div className="h-14 w-14 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl font-bold text-gray-900 group-hover:bg-black group-hover:text-white transition-colors">
          {shop.name[0]}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-100">
              {shop.shop_plan}
            </span>
            <button
              onClick={toggleBot}
              className={`px-3 py-1 rounded-full cursor-pointer text-[10px] font-bold uppercase tracking-wider transition-all ${
                isBotEnabled
                  ? "bg-green-50 text-green-600 hover:bg-green-100"
                  : "bg-red-50 text-red-600 hover:bg-red-100"
              }`}
            >
              {isBotEnabled ? "● Active" : "○ Paused"}
            </button>
          </div>

          {/* Telegram Status Badge */}
          {shop.telegram_chat_id ? (
            <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
              ✓ Telegram Connected
            </span>
          ) : (
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
              Telegram Missing
            </span>
          )}
        </div>
      </div>

      <h3 className="text-xl font-extrabold text-gray-900 mb-1">{shop.name}</h3>
      <p className="text-xs text-gray-400 font-mono mb-6">
        ID: {shop.facebook_page_id}
      </p>

      {/* --- Usage Section --- */}
      <div className="mb-8">
        <div className="flex justify-between text-[14px] font-bold mb-2 uppercase tracking-tight">
          <span className="text-gray-400">ამ თვეში გამოყენებულია</span>
          <span className={percentage > 90 ? "text-red-600" : "text-gray-900"}>
            {used.toLocaleString()} / {maxLimit.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${progressColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* --- Telegram Connect Button --- */}
      {!shop.telegram_chat_id && (
        <a
          href={telegramLink}
          target="_blank"
          className="w-full mb-6 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#229ED9] text-white text-xs font-black uppercase tracking-widest hover:bg-[#1c84b5] transition-all"
        >
          დააკავშირე Telegram
        </a>
      )}


      <div className="grid grid-cols-2 gap-3">
        <Link
          href={`/dashboard/${shop.id}/sessions`}
          className="flex items-center justify-center py-4 rounded-2xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 transition-all shadow-sm"
        >
          სესიები
        </Link>
        <Link
          href={`/dashboard/${shop.id}/billing`}
          className="flex items-center justify-center py-4 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-sm"
        >
          Upgrade Plan
        </Link>
      </div>
    </div>
  );
}
