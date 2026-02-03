"use client"
import Link from "next/link";
import AddProductBox from "./AddProductBox";
import { Package, MessageSquare, Power, Activity, Info } from "lucide-react";
import { useState } from "react";
import { toggleBotStatus } from "@/lib/actions/shopActions";

export default function SingleShop({ shop, userId, productCount }) {
const [isBotEnabled, setIsBotEnabled] = useState(shop.bot_enabled);
  if (!shop)
    return (
      <div className="p-8 text-center font-black uppercase italic">
        Shop not found...
      </div>
    );

  
  const used = shop.messages_sent_this_month || 0;
  const limit = shop.message_limit || 50;
  const percentage = Math.min((used / limit) * 100, 100);
  
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
    <div className="p-4 lg:p-8 bg-[#fafafa] min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        {/* 1. Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            {shop.name}
          </h1>
          <button
            onClick={toggleBot}
            className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${
              isBotEnabled
                ? "bg-green-50 border-green-100 text-green-700"
                : "bg-red-50 border-red-100 text-red-700"
            }`}
          >
            <Power size={12} /> {isBotEnabled ? "Active" : "Paused"}
          </button>
        </div>

        {/* 2. Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Inventory */}
          <Link
            href={`/dashboard/user/${userId}/shop/${shop.id}/products`}
            className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm hover:border-black transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-xl text-black">
                <Package size={20} />
              </div>
              <div>
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">
                  მარაგი
                </p>
                <h2 className="text-xl font-black italic">{productCount} პროდუქტი</h2>
              </div>
            </div>
            <span className="text-blue-600 text-[12px] font-black italic underline font-sans">
              ნახვა
            </span>
          </Link>

          {/* Usage */}
          <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-xl text-black">
              <Activity size={20} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-baseline mb-1">
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">
                  გამოყენებულია
                </p>
                <span className="text-[10px] font-black font-sans">
                  {used}/{limit}
                </span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-black h-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Telegram */}
          <div
            className={`p-5 rounded-[24px] border flex items-center gap-4 ${
              shop.telegram_chat_id
                ? "bg-blue-50 border-blue-100"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div
              className={`p-3 rounded-xl ${shop.telegram_chat_id ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-400"}`}
            >
              <MessageSquare size={20} />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                Telegram
              </p>
              <h2
                className={`text-[11px] font-black uppercase ${shop.telegram_chat_id ? "text-blue-600" : "text-gray-400"}`}
              >
                {shop.telegram_chat_id ? "Connected" : "Not Linked"}
              </h2>
            </div>
          </div>
        </div>

        {/* 3. Main Content Section (AddProductBox Left | Banner Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* AddProductBox (Now on the Left) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-2">
              <AddProductBox shopId={shop.id} userId={userId} />
            </div>
          </div>

          {/* Banner / Explanation (Now on the Right & Fixed Height) */}
          <div className="lg:col-span-4 h-full">
            <div className="bg-gray-900 text-white p-8 rounded-[32px] shadow-lg sticky top-8 flex flex-col justify-between min-h-[450px]">
              <div>
                <div className="p-3 bg-white/10 rounded-2xl w-fit mb-6">
                  <Info className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-black mb-4 uppercase italic leading-tight">
                  როგორ მუშაობს?
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  უბრალოდ ჩააკოპირე პოსტის ტექსტი მარცხენა ველში.
                  <span className="text-white block mt-2 underline decoration-blue-500 underline-offset-4">
                    ჩვენი AI ავტომატურად ამოიღებს:
                  </span>
                </p>
                <ul className="mt-4 space-y-2 text-[11px] font-black uppercase tracking-wider text-gray-300">
                  <li className="flex items-center gap-2 italic">
                    ✓ პროდუქტის სახელს
                  </li>
                  <li className="flex items-center gap-2 italic">
                    ✓ ფასს და ვალუტას
                  </li>
                  <li className="flex items-center gap-2 italic">
                    ✓ ზომებს და აღწერას
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-3">
                <div className="flex gap-2">
                  <span className="bg-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase font-sans">
                    Gemini 2.0
                  </span>
                  <span className="bg-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase font-sans">
                    AI Agent
                  </span>
                </div>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                  Ready to process your inventory
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
