import Link from "next/link";
import { Lock } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Animated Lock Icon */}
        <div className="relative mx-auto w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center border border-gray-100 shadow-xl shadow-gray-200/50">
          <Lock className="w-10 h-10 text-black stroke-[1.5]" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-4 border-white" />
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-red-500">
            წვდომა შეზღუდულია
          </h2>
          <p className="text-sm font-medium text-black leading-relaxed italic">
            "ამ გვერდის სანახავად საჭიროა ავტორიზაცია. გთხოვთ შეხვიდეთ სისტემაში,
            რომ მართოთ თქვენი მაღაზია."
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex flex-col gap-3">
          <Link
            href="/login"
            className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
          >
            ავტორიზაცია
          </Link>

          <Link
            href="/"
            className="w-full py-5 bg-transparent text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] hover:text-black transition-all"
          >
            მთავარზე დაბრუნება
          </Link>
        </div>

        {/* Tiny Disclaimer */}
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">
          Security Protocol v2.6
        </p>
      </div>
    </div>
  );
}
