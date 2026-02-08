"use client";
import { toggleBotStatus } from "@/lib/actions/shopActions";
import Link from "next/link";
import { useState } from "react";
import { MessageSquare, ExternalLink } from "lucide-react"; 



export default function ShopCard({ shop, userId }) {
  const [isBotEnabled, setIsBotEnabled] = useState(shop.bot_enabled);

 
   const used = shop.messages_sent_this_month || 0;
   const limit = shop.message_limit || 50;
   const percentage = Math.min((used / limit) * 100, 100);

  const botUsername = "Lead_confirmed_bot";
  const telegramLink = `https://t.me/${botUsername}?start=${shop.id}`;
  const baseUrl = `/dashboard/user/${userId}/shop/${shop.id}`;

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
    <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all group max-w-md w-full flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="h-14 w-14 rounded-2xl bg-black text-white flex items-center justify-center text-2xl font-black">
            {shop.name[0]}
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-100">
                {shop.shop_plan}
              </span>
              <button
                onClick={toggleBot}
                className={`px-3 py-1 rounded-full cursor-pointer text-[9px] font-black uppercase tracking-wider transition-all ${
                  isBotEnabled
                    ? "bg-green-50 text-green-600 hover:bg-green-100"
                    : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
              >
                {isBotEnabled ? "● ACTIVE" : "○ PAUSED"}
              </button>
            </div>

            {shop.telegram_chat_id ? (
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
                ✓ Telegram Connected
              </span>
            ) : (
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest text-right">
                Telegram Missing
              </span>
            )}
          </div>
        </div>

        <h3 className="text-2xl font-black text-black tracking-tighter mb-1 uppercase">
          {shop.name}
        </h3>
        <p className="text-[10px] text-gray-400 font-bold mb-6 truncate italic">
          FB PAGE: {shop.facebook_page_id}
        </p>

        {/* Usage Section */}
        <div className="mb-8 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
          <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest text-gray-400">
            <span>გამოყენებული ლიმიტი</span>
            <span
              className={
                percentage > 90 ? "text-red-600 font-black" : "text-black"
              }
            >
              {used}/{limit}
            </span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${progressColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Telegram Button - მხოლოდ მაშინ როცა არ არის დაკავშირებული */}
        {!shop.telegram_chat_id && (
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#0088cc] text-white text-[10px] font-black uppercase tracking-[1px] hover:bg-[#0077b5] transition-all shadow-lg shadow-blue-100"
          >
            <MessageSquare size={14} /> დააკავშირე TELEGRAM
          </a>
        )}

        {/* Main Action Button */}
        <Link
          href={baseUrl}
          className="w-full flex items-center justify-center py-4 rounded-2xl bg-black text-white text-[10px] font-black uppercase tracking-[2px] hover:bg-gray-800 transition-all shadow-md"
        >
          მართვა <ExternalLink size={14} className="ml-2" />
        </Link>

        {/* Secondary Links */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href={`${baseUrl}/sessions`}
            className="flex items-center justify-center py-3 rounded-xl bg-gray-100 text-gray-600 text-[9px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
          >
            სესიები
          </Link>
          <Link
            href={`${baseUrl}/billing`}
            className="flex items-center justify-center py-3 rounded-xl bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100 font-black"
          >
            UPGRADE
          </Link>
        </div>
      </div>
    </div>
  );
}
