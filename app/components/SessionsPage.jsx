"use client";
import { useQuery } from "@tanstack/react-query";
import { getSessionsByShop } from "@/lib/services/sessionService";
import Link from "next/link";
import { ChevronRight, MessageCircle, ArrowLeft } from "lucide-react";

export default function SessionsPage({ shopId, userId }) {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions", shopId],
    queryFn: () => getSessionsByShop(shopId),
  });

  if (isLoading)
    return (
      <div className="p-10 text-gray-500 font-black uppercase text-xs tracking-widest animate-pulse">
        იტვირთება ჩატები...
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-5">
        <Link
          href={`/dashboard/user/${userId}/shop/${shopId}`}
          className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-gray-400 hover:text-black group shadow-sm"
        >
          <ArrowLeft
            size={24}
            className="group-hover:-translate-x-1 transition-transform"
          />
        </Link>

        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase sans-serif flex items-center gap-3 text-gray-950">
            <MessageCircle className="text-blue-600 w-8 h-8" /> აქტიური ჩატები
          </h1>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
            მართე მიმდინარე დიალოგები რეალურ დროში
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {sessions?.map((session) => (
          <Link
            key={session.id}
            href={`/dashboard/user/${userId}/shop/${shopId}/sessions/${session.id}`}
            className="block group"
          >
            <div className="bg-white px-6 py-5 rounded-3xl shadow-sm border border-gray-100 group-hover:border-black group-hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                    ID: {session.sender_id.slice(-6)}
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-tighter border ${
                      session.state === "completed"
                        ? "bg-green-50 text-green-700 border-green-100"
                        : "bg-amber-50 text-amber-700 border-amber-100"
                    }`}
                  >
                    {session.state}
                  </span>
                </div>

                <p className="text-sm text-gray-600 truncate pr-6 leading-relaxed font-medium">
                  {session.messages?.[session.messages.length - 1]?.content ||
                    "მესიჯები არ არის..."}
                </p>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {sessions?.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 mt-6">
          <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">
            აქტიური ჩატები ჯერჯერობით არ გაქვს
          </p>
        </div>
      )}
    </div>
  );
}
