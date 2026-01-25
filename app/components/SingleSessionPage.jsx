"use client";
import { useQuery } from "@tanstack/react-query";
import { getSessionById } from "@/lib/services/sessionService";
import {
  User,
  Bot,
  Calendar,
  Loader2,
  ArrowLeft,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";

export default function SingleSessionPage({ sessionId}) {
  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => getSessionById(sessionId),
    enabled: !!sessionId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500 mt-3">იტვირთება...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
        <p className="text-red-500 font-medium mb-4 text-center">
          მონაცემების წამოღება ვერ მოხერხდა
        </p>
        <Link
          href={`/dashboard/${session.shop_id}/sessions`}
          className="text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          სესიების სია
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-8 bg-[#efeae2] min-h-screen">
      {/* Header - kept similar but cleaner */}
      <div className="mb-6">
        <Link
          href={`/dashboard/${session.shop_id}/sessions`}
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-5 text-sm font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          უკან
        </Link>

        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 text-lg">
                  ჩატის სესია #{sessionId.slice(-6).toUpperCase()}
                </h1>
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(session.created_at).toLocaleString("ka-GE", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  session.state === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {session.state}
              </span>
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp-style chat area */}
      <div className="space-y-3 sm:space-y-4">
        {session.messages?.map((msg, idx) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={idx}
              className={`flex items-end gap-2 ${isUser ? "justify-start" : "justify-end"}`}
            >
              {/* Avatar - only on left for user, right for bot */}
              {isUser && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex-shrink-0 mb-1">
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-blue-500/90">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              <div
                className={`flex flex-col max-w-[80%] sm:max-w-[70%] ${!isUser ? "items-end" : ""}`}
              >
                {/* Bubble – WhatsApp colors + corner cut */}
                <div
                  className={`
                    px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed shadow-sm
                    ${
                      isUser
                        ? "bg-[#ffffff] rounded-tl-none border border-gray-200/70"
                        : "bg-[#d9fdd3] rounded-tr-none"
                    }
                  `}
                >
                  {msg.content}
                </div>

                {/* Timestamp – small, subtle */}
                {msg.timestamp && (
                  <span
                    className={`text-[10px] sm:text-xs text-gray-500 mt-1 px-1 ${
                      isUser ? "text-left" : "text-right"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString("ka-GE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>

              {!isUser && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex-shrink-0 mb-1">
                  <div className="w-full h-full rounded-full flex items-center justify-center bg-green-600/90">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {(!session.messages || session.messages.length === 0) && (
          <div className="text-center py-16 text-gray-500 text-sm">
            ამ სესიაში შეტყობინებები არ არის
          </div>
        )}
      </div>
    </div>
  );
}
