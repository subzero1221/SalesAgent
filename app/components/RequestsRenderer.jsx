"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  User,
  MapPin,
  Sparkles,
  Phone,
} from "lucide-react";

export default function RequestRenderer({
  requests,
  count,
  totalPages,
  currentPage,
  shopId,
}) {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950">
            შემოსული მოთხოვნები
          </h1>
          <p className="text-sm text-gray-700 font-bold mt-1">
            სულ ნაპოვნია {count} ჩანაწერი
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-100/80">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-900 border-b border-gray-200">
                  მომხმარებელი
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-900 border-b border-gray-200">
                  პროდუქტი & დეტალები
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-900 border-b border-gray-200">
                  ვიზუალი / მოთხოვნა
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-900 border-b border-gray-200">
                  მისამართი
                </th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-gray-900 border-b border-gray-200">
                  თარიღი
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  {/* მომხმარებელი - შავი ტექსტით */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-black" />
                        <span className="text-sm font-bold text-black">
                          {req.customer_name || "უცნობი"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-bold text-gray-900">
                          {req.request?.phone || "არ არის"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* პროდუქტი - მკვეთრი კონტრასტით */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-black text-black">
                        {req.request?.product || "დასახელება არ არის"}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {req.request?.specs?.size && (
                          <span className="px-2 py-0.5 rounded-md bg-black text-[10px] font-black text-white uppercase">
                            ზომა: {req.request.specs.size}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* აღწერა - მუქი ნაცრისფერი უკეთესი წაკითხვისთვის */}
                  <td className="px-6 py-5">
                    <div className="flex gap-2 items-start max-w-[220px]">
                      <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-900 font-medium leading-relaxed">
                        {req.request?.specs?.visual_appearance ||
                          "აღწერა არ არის მითითებული"}
                      </p>
                    </div>
                  </td>

                  {/* მისამართი - მკვეთრად */}
                  <td className="px-6 py-5">
                    <div className="flex gap-2 items-start">
                      <MapPin className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-xs font-bold text-gray-900">
                        {req.request?.address || "მისამართი არ არის"}
                      </span>
                    </div>
                  </td>

                  {/* თარიღი */}
                  <td className="px-6 py-5">
                    <span className="text-xs font-black text-gray-900 tabular-nums">
                      {new Date(req.created_at).toLocaleDateString("ka-GE")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination - შავი ღილაკებით */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <p className="text-xs text-gray-900 font-bold">
            გვერდი{" "}
            <span className="text-blue-600 font-black">{currentPage}</span> /{" "}
            {totalPages}
          </p>
          <div className="flex gap-2">
            <Link
              href={`/dashboard/${shopId}/requests?page=${currentPage - 1}`}
              className={`p-2 rounded-lg border-2 border-gray-200 bg-white transition-all ${currentPage <= 1 ? "pointer-events-none opacity-20" : "hover:border-black hover:bg-black hover:text-white"}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <Link
              href={`/dashboard/${shopId}/requests?page=${currentPage + 1}`}
              className={`p-2 rounded-lg border-2 border-gray-200 bg-white transition-all ${currentPage >= totalPages ? "pointer-events-none opacity-20" : "hover:border-black hover:bg-black hover:text-white"}`}
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
