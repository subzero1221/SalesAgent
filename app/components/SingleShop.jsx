"use client";

import Link from "next/link";
import AddProductBox from "./AddProductBox";
import { FaTelegram } from "react-icons/fa";
import {
  Package,
  MessageSquare,
  Power,
  Info,
  ArrowLeft,
  Users,
  Zap,
  Globe,
  Lock,
  Save,
  RefreshCcw,
} from "lucide-react";
import { useState } from "react";
import {
  toggleBotStatus,
  togglePublicReply,
  updateCustomPublicText,
  toggleAutoImport,
} from "@/lib/actions/shopActions";
import { toast } from "sonner";
import InfoBanner from "./InfoBanner";
import Image from "next/image";


export default function SingleShop({
  shop,
  userId,
  productCount,
  sessionCount,
  requestCount,
}) {
  // States
  const [isBotEnabled, setIsBotEnabled] = useState(shop.bot_enabled);
  const [isPublicEnabled, setIsPublicEnabled] = useState(
    shop.answer_publicly || false,
  );
  const [isAutoImportEnabled, setIsAutoImportEnabled] = useState(
    shop.auto_import_products || false,
  );
  const [banner, setBanner] = useState(true);
  const [bannerTwo, setBannerTwo] = useState(true);
  const [customText, setCustomText] = useState(shop.custom_public_text || "");
  const [isSaving, setIsSaving] = useState(false);

  if (!shop)
    return (
      <div className="p-8 text-center font-black uppercase italic text-gray-400">
        Shop not found...
      </div>
    );

  const used = shop.messages_sent_this_month || 0;
  const limit = shop.message_limit || 50;
  const percentage = Math.min((used / limit) * 100, 100);

  // 1. Toggle Main Bot Status
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

  // 2. Toggle Public/Private Mode
  const handleTogglePublic = async () => {
    const newState = !isPublicEnabled;
    setIsPublicEnabled(newState);
    try {
      await togglePublicReply(shop.id, newState);
      toast.success(
        newState ? "ჩაირთო AI საჯარო პასუხი" : "ჩაირთო მხოლოდ პირადი პასუხი",
      );
    } catch (error) {
      setIsPublicEnabled(!newState);
      toast.error("შეცდომა პარამეტრის შეცვლისას");
    }
  };

  // 3. Save Custom Static Text
  const handleSaveText = async () => {
    if (!customText.trim())
      return toast.error("ტექსტი არ შეიძლება იყოს ცარიელი");
    setIsSaving(true);
    try {
      await updateCustomPublicText(shop.id, customText);
      toast.success("ტექსტი წარმატებით შეინახა!");
    } catch (error) {
      toast.error("ვერ მოხერხდა შენახვა");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAutoImport = async () => {
    const newState = !isAutoImportEnabled;
    setIsAutoImportEnabled(newState);
    try {
      await toggleAutoImport(shop.id, newState);
      toast.success(
        newState
          ? "ავტომატური იმპორტი ჩაირთო! პოსტები აისახება ბაზაში."
          : "ავტომატური იმპორტი გაითიშა.",
      );
    } catch (error) {
      setIsAutoImportEnabled(!newState);
      toast.error("შეცდომა პარამეტრის შეცვლისას");
    }
  };

  return (
    <div className="p-4 lg:p-8 bg-[#fafafa] min-h-screen font-sans text-black">
      <div className="max-w-6xl mx-auto">
        {/* --- HEADER SECTION --- */}
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

            {/* --- SHOP LOGO & NAME --- */}
            <div className="flex items-center gap-5">
              {/* Logo Container */}
              <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-black flex-shrink-0 flex items-center justify-center text-white text-2xl font-black italic">
                {shop.logo_url ? (
                  <Image
                    src={shop.logo_url}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                    width={100}
                    height={100}
                  />
                ) : (
                  <span>{shop.name[0]}</span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none">
                    {shop.name}
                  </h1>
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider ${
                      shop.telegram_chat_id
                        ? "bg-blue-50 border-blue-100 text-blue-600"
                        : "bg-gray-100 border-gray-200 text-gray-400"
                    }`}
                  >
                    <FaTelegram
                      className={
                        shop.telegram_chat_id
                          ? "text-blue-500"
                          : "text-gray-300"
                      }
                      size={14}
                    />
                    {shop.telegram_chat_id ? "TG Linked" : "No TG"}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2">
    {/* Facebook Icon & ID */}
    {shop.facebook_page_id && (
      <div className="flex items-center gap-1.5 bg-white border border-gray-100 px-2 py-1 rounded-md shadow-sm">
        <div className="w-4 h-4 bg-[#1877F2] rounded-full flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
        <span className="text-[9px] font-black text-gray-400 tracking-tighter uppercase">
          FB
        </span>
      </div>
    )}

    {/* Instagram Icon & ID */}
    {shop.instagram_page_id && (
      <div className="flex items-center gap-1.5 bg-white border border-gray-100 px-2 py-1 rounded-md shadow-sm">
        <div className="w-4 h-4 bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] rounded-md flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-white">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </div>
        <span className="text-[9px] font-black text-gray-400 tracking-tighter uppercase">
          IG
        </span>
      </div>
    )}
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

        {/* --- STATS GRID --- */}
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
              <span className="text-[10px] font-black">
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

        {/* --- MAIN CONTENT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* Add Product Section */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-2">
              <AddProductBox shopId={shop.id} userId={userId} />
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-6 transition-all hover:shadow-md">
              <div className="flex gap-4 items-start mb-4">
                <button
                  onClick={handleToggleAutoImport}
                  className={`cursor-pointer w-10 h-5 rounded-full relative transition-all ${isAutoImportEnabled ? "bg-orange-500" : "bg-gray-200"}`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isAutoImportEnabled ? "left-6" : "left-1"}`}
                  />
                </button>
                <h3 className="text-sm font-black uppercase italic mb-1">
                  პროდუქტის ავტომატური ატვირთვა (Auto-Import) მხოლოდ ფეისბუქ
                  პოსტებისთვის
                </h3>
              </div>

              {bannerTwo && (
                <InfoBanner
                  setBanner={setBannerTwo}
                  text="ამ ოფციის ჩართვით, ყველა ახალი პოსტი თქვენს გვერდზე ავტომატურად აისახება ბაზაში და მზად იქნება აგენტისთვის პასუხის გასაცემად. დარმუნდით რომ პოსტში არის მითითებული ყველა საჭირო ინფორმაცია ან დაამატეთ ხელით პროდუქტების გვერდიდან (სახელი, ფასი, ზომა) რათა აგენტმა შეძლოს სწორი პასუხის გაცემა."
                  type="warning"
                />
              )}
            </div>

            {/* --- NEW: Public Reply Settings --- */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 transition-all hover:shadow-md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight italic flex items-center gap-2">
                    <MessageSquare size={18} className="text-blue-500" /> საჯარო
                    პასუხის მართვა
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                    აირჩიე, როგორ უპასუხოს ბოტმა კომენტარებში
                  </p>
                </div>

                <button
                  onClick={handleTogglePublic}
                  className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${
                    isPublicEnabled
                      ? "bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {isPublicEnabled ? <Globe size={12} /> : <Lock size={12} />}
                  {isPublicEnabled
                    ? "Public comment answer"
                    : "PRIVATE ANSWER (Static Comment Reply)"}
                </button>
              </div>

              {/* Input for Static Text - Only visible when AI public answer is OFF */}
              {!isPublicEnabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {banner && (
                    <InfoBanner
                      setBanner={setBanner}
                      text="როდესაც საჯარო პასუხი გამორთულია, აგენტი ავტომატურად უპასუხებს მომხმარებლის კომენტარს აქ განსაზღვრულ ტექსტს, ხოლო დეტალურ პასუხს გაუგზავნის პირად შეტყობინებაში."
                    />
                  )}

                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder="მაგ: დეტალები მოგწერეთ პირადში 😊"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-black transition-all pr-32"
                    />
                    <button
                      onClick={handleSaveText}
                      disabled={isSaving}
                      className="absolute cursor-pointer right-2 px-4 py-2 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 disabled:bg-gray-400"
                    >
                      {isSaving ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save size={12} /> Save
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- SIDEBAR INFO --- */}
          <div className="lg:col-span-4">
            <div className="bg-gray-900 text-white p-8 rounded-[32px] shadow-lg flex flex-col justify-between min-h-[420px]">
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
