import Link from "next/link";
import { Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8">
        {/* Animated Icon */}
        <div className="relative mx-auto w-32 h-32 bg-white rounded-[3rem] flex items-center justify-center border border-gray-100 shadow-2xl shadow-gray-200/50">
          <Ghost className="w-12 h-12 text-black animate-bounce" />
          <span className="absolute top-2 right-4 text-[10px] font-black text-gray-200 uppercase">
            404
          </span>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-black">
            გვერდი ვერ მოიძებნა
          </h1>
          <p className="text-md font-medium text-gray-400 leading-relaxed italic px-8">
            როგორც ჩანს, იქ ხარ სადაც, ჯერ მე არ ვყოფილვარ.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block px-12 py-5 bg-black text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
          >
            მთავარ გვერდზე დაბრუნება
          </Link>
        </div>

        {/* Signature Bookmark */}
        <div className="pt-12 flex items-center justify-center gap-3 opacity-20">
          <div className="h-[1px] w-8 bg-black" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">
            SalesAgent.ge
          </span>
          <div className="h-[1px] w-8 bg-black" />
        </div>
      </div>
    </div>
  );
}
