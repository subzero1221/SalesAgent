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
import { useParams } from "next/navigation";

export default function SingleSessionPage() {
  const params = useParams();
  const shopId = params.shopId;
  const sessionId = params.sessionId;

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
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="animate-pulse">ჩატის ისტორია იტვირთება...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-10 bg-red-50 rounded-3xl border border-red-100 mx-6">
        <p className="text-red-500 font-medium mb-4">
          შეცდომა მონაცემების წამოღებისას.
        </p>
        <Link
          href={`/dashboard/${shopId}/sessions`}
          className="text-sm text-red-600 underline"
        >
          უკან დაბრუნება
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 lg:px-0">
      {/* Navigation & Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/${shopId}/sessions`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          სესიების სიაში დაბრუნება
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-3xl flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                სესია:{" "}
                <span className="text-blue-600">
                  {sessionId.slice(-8).toUpperCase()}
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {new Date(session.created_at).toLocaleString("ka-GE", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-4 py-1.5 rounded-2xl text-xs font-bold uppercase tracking-wider ${
                session.state === "completed"
                  ? "bg-green-50 text-green-600 border border-green-100"
                  : "bg-blue-50 text-blue-600 border border-blue-100"
              }`}
            >
              {session.state}
            </span>
            <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="space-y-6 bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100/50">
        {session.messages?.map((msg, idx) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? "justify-start" : "justify-end"}`}
            >
              {/* User avatar – left side */}
              {isUser && (
                <div className="w-10 h-10 rounded-3xl bg-blue-600 flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}

              {/* Message + timestamp */}
              <div className="flex flex-col space-y-1.5 max-w-[85%] md:max-w-[70%]">
                <div
                  className={`
                    px-5 py-4 rounded-3xl shadow-sm leading-relaxed text-[15px] font-medium whitespace-pre-wrap break-words
                    ${
                      isUser
                        ? "bg-white text-gray-800 border border-gray-200 rounded-bl-[20px]"
                        : "bg-blue-600 text-white rounded-br-[20px]"
                    }
                  `}
                >
                  {msg.content}
                </div>

                <div
                  className={`text-[10px] font-medium text-gray-400 uppercase tracking-tighter ${
                    isUser ? "text-left" : "text-right"
                  }`}
                >
                  {msg.timestamp
                    ? new Date(msg.timestamp).toLocaleTimeString("ka-GE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </div>

              {/* Bot avatar – right side */}
              {!isUser && (
                <div className="w-10 h-10 rounded-3xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-5 h-5 text-blue-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
