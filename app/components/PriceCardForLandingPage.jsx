import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PriceCardForLandingPage({ title, price, features, featured = false }) {
      return (
        <div
          className={`p-8 rounded-[2.5rem] border ${featured ? "bg-black text-white border-black scale-105 shadow-2xl" : "bg-gray-50 border-gray-100 text-black"}`}
        >
          <h3 className="text-sm font-black uppercase tracking-widest mb-2">
            {title}
          </h3>
          <div className="text-4xl font-black mb-6">
            {price}
            <span className="text-xs uppercase ml-1">/თვე</span>
          </div>
          <ul className="space-y-3 mb-8">
            {features.map((f, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-[11px] font-bold opacity-80 uppercase text-left"
              >
                <CheckCircle2
                  size={12}
                  className={featured ? "text-green-400" : "text-black"}
                />{" "}
                {f}
              </li>
            ))}
          </ul>

          {/* ყველა ღილაკი აგზავნის ლოგინზე */}
          <Link
            href="/login"
            className={`w-full block text-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              featured
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            დაიწყე უფასოდ
          </Link>
        </div>
      );
    };
