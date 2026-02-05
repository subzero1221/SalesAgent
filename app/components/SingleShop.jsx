"use client";
import Link from "next/link";
import AddProductBox from "./AddProductBox";
import { FaTelegram } from "react-icons/fa";
import {
  Package,
  MessageSquare,
  Power,
  Activity,
  Info,
  ArrowLeft,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toggleBotStatus } from "@/lib/actions/shopActions";
import { toast } from "sonner";

export default function SingleShop({
  shop,
  userId,
  productCount,
  sessionCount,
  requestCount,
}) {
  const [isBotEnabled, setIsBotEnabled] = useState(shop.bot_enabled);

  if (!shop)
    return (
      <div className="p-8 text-center font-black uppercase italic text-gray-400">
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
      toast.success(`ბოტი წარმატებით ${newState ? "ჩაირთო" : "გამოირთო"}!`);
    } catch (error) {
      setIsBotEnabled(!newState);
      toast.error("შეცდომა! სცადეთ თავიდან.");
    }
  };

  return (
    <div className="p-4 lg:p-8 bg-[#fafafa] min-h-screen font-sans text-black">
      <div className="max-w-6xl mx-auto">
        {/* 1. Header Section - აქ ჩაჯდა კომპაქტური Telegram Badge */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/user/${userId}`}
              className="p-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-black group"
            >
              <ArrowLeft
                size={20}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black uppercase tracking-tighter italic">
                  {shop.name}
                </h1>
                {/* პატარა Telegram Badge */}
                <div
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider ${
                    shop.telegram_chat_id
                      ? "bg-blue-50 border-blue-100 text-blue-600"
                      : "bg-gray-100 border-gray-200 text-gray-400"
                  }`}
                >
                  <FaTelegram className="text-blue-500" size={24} />
                  {shop.telegram_chat_id ? "TG Linked" : "No TG"}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={toggleBot}
            className={`flex items-center cursor-pointer gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
              isBotEnabled
                ? "bg-green-50 border-green-100 text-green-700 shadow-sm"
                : "bg-red-50 border-red-100 text-red-700 shadow-sm"
            }`}
          >
            <Power size={12} /> {isBotEnabled ? "Active" : "Paused"}
          </button>
        </div>

        {/* 2. Stats Grid - ოთხივე ბარათი ერთ ხაზზე */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link
            href={`/dashboard/user/${userId}/shop/${shop.id}/products`}
            className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm hover:border-black transition-all flex items-center gap-4"
          >
            <div className="p-3 bg-gray-50 rounded-xl text-black">
              <Package size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                მარაგი
              </p>
              <h2 className="text-lg font-black italic">{productCount}</h2>
            </div>
          </Link>

          <Link
            href={`/dashboard/user/${userId}/shop/${shop.id}/sessions`}
            className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm hover:border-black transition-all flex items-center gap-4"
          >
            <div className="p-3 bg-gray-50 rounded-xl text-black">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                სესიები
              </p>
              <h2 className="text-lg font-black italic">{sessionCount || 0}</h2>
            </div>
          </Link>

          <Link
            href={`/dashboard/user/${userId}/shop/${shop.id}/requests`}
            className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm hover:border-black transition-all flex items-center gap-4"
          >
            <div className="p-3 bg-gray-50 rounded-xl text-black">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                შეკვეთები
              </p>
              <h2 className="text-lg font-black italic">{requestCount || 0}</h2>
            </div>
          </Link>

          <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-center gap-2">
            <div className="flex justify-between items-baseline">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                ლიმიტი
              </p>
              <span className="text-[10px] font-black font-sans">
                {used}/{limit}
              </span>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-black h-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3. Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-2">
              <AddProductBox shopId={shop.id} userId={userId} />
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-gray-900 text-white p-8 rounded-[32px] shadow-lg flex flex-col justify-between min-h-[400px]">
              <div>
                <div className="p-3 bg-white/10 rounded-2xl w-fit mb-6">
                  <Info className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-black mb-4 uppercase italic leading-tight">
                  როგორ მუშაობს?
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  უბრალოდ ჩააკოპირე პოსტის ტექსტი მარცხენა ველში. აგენტი
                  ავტომატურად ამოიღებს მონაცემებს.
                </p>
                <ul className="mt-6 space-y-3 text-[11px] font-black uppercase tracking-wider text-gray-300">
                  <li className="flex items-center gap-3 italic">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />{" "}
                    პროდუქტის სახელს
                  </li>
                  <li className="flex items-center gap-3 italic">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />{" "}
                    ფასს და ვალუტას
                  </li>
                  <li className="flex items-center gap-3 italic">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />{" "}
                    ზომებს და აღწერას
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                <span>Status: System Ready</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse delay-75" />
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse delay-150" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
