"use client";
import { useQuery } from "@tanstack/react-query";
import { getSessionsByShop } from "@/lib/services/sessionService";
import Link from "next/link";
import { ChevronRight, MessageCircle } from "lucide-react";

export default function SessionsPage({ shopId }) {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ["sessions", shopId],
    queryFn: () => getSessionsByShop(shopId),
  });

  if (isLoading)
    return <div className="p-10 text-gray-500">იტვირთება ჩატები...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-8 flex items-center gap-2 text-gray-800">
        <MessageCircle className="text-blue-600 w-6 h-6" /> აქტიური ჩატები
      </h1>

      {/* მოვაშორეთ p-12 აქედან */}
      <div className="space-y-4">
        {sessions?.map((session) => (
          <Link
            key={session.id}
            href={`/dashboard/${shopId}/sessions/${session.id}`}
            className="block group"
          >
            {/* დავამატეთ px-6 py-5 შიდა ქარდისთვის */}
            <div className="bg-white px-6 py-5 rounded-2xl shadow-sm border border-gray-100 group-hover:border-blue-300 group-hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                    ID: {session.sender_id.slice(-6)}
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
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

              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {sessions?.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 mt-6">
          <p className="text-gray-400 font-medium">
            აქტიური ჩატები ჯერჯერობით არ გაქვს
          </p>
        </div>
      )}
    </div>
  );
}
