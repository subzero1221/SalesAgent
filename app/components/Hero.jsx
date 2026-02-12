import Link from "next/link";
import Footer from "./Footer";
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  MessageCircle,
  Facebook,
  RefreshCcw,
} from "lucide-react";
import PriceCardForLandingPage from "./PriceCardForLandingPage";

export default function Hero() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] selection:bg-black selection:text-white font-sans">
      {/* Background Pattern - Subtle Modern Touch */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      <div className="relative z-10 flex-1">
        {/* 1. Hero Section */}
        <section className="max-w-6xl mx-auto pt-32 pb-20 px-6 text-center">
          {/* New Feature Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              New: FB Auto-Import & Comment Reply
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-black leading-[0.9] mb-8">
            SalesAgent <br />
            <span className="text-gray-300">Working 24/7</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
            შენი პირადი თანამშრომელი. ის პასუხობს კომენტარებს, აგზავნის დეტალებს
            პირადში და იღებს შეკვეთებს, სანამ შენ ისვენებ.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-4 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-800 hover:scale-105 transition-all shadow-xl shadow-black/5 flex items-center gap-2"
            >
              უფასო ცდა <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* 2. New Features Grid (Bento Style) */}
        <section id="features" className="max-w-6xl mx-auto px-6 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Auto Import */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <RefreshCcw className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-3">
                Auto-Import
              </h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                დადე პოსტი Facebook-ზე? სისტემა ავტომატურად წამოიღებს ფოტოს,
                ფასს და აღწერას ბაზაში. ხელით დამატება აღარ გჭირდება.
              </p>
            </div>

            {/* Feature 2: Comment & DM */}
            <div className="bg-black p-8 rounded-[2rem] shadow-xl text-white md:scale-105 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-32 bg-gray-800 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
              <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                <MessageCircle className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-3 relative z-10">
                Smart Replies
              </h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed relative z-10">
                აგენტი პასუხობს კომენტარებს საჯაროდ, ხოლო დეტალებს და ყიდვის
                ლინკს აგზავნის პირადში (DM).
              </p>
            </div>

            {/* Feature 3: Meta Integration */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Facebook className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-3">
                Meta Verified
              </h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                ოფიციალური ინტეგრაცია Meta-სთან. უსაფრთხო კავშირი Facebook და
                Instagram გვერდებთან.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Pricing Section */}
        <section className="py-24 px-6 border-t border-gray-100 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">
                ტარიფები
              </h2>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
                დაიწყე უფასოდ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PriceCardForLandingPage
                title="Free"
                price="0₾"
                features={[
                  "1 მაღაზია",
                  "50 მესიჯი/თვე",
                  "Telegram ნოტიფიკაცია",
                  "ბაზისური AI",
                ]}
              />
              <PriceCardForLandingPage
                title="Starter"
                price="79₾"
                featured={true}
                features={[
                  "2 მაღაზია",
                  "1000 მესიჯი/თვე",
                  "Auto-Import (FB)",
                  "Comment Reply",
                  "პრიორიტეტული სუპორტი",
                ]}
              />
              <PriceCardForLandingPage
                title="Pro"
                price="179₾"
                features={[
                  "3 მაღაზია",
                  "3000 მესიჯი/თვე",
                  "ულიმიტო პროდუქცია",
                  "Smart Sales Logic",
                  "პირადი მენეჯერი",
                ]}
              />
            </div>
          </div>
        </section>

        {/* 4. Trust Badges */}
        <section className="py-12  bg-white ">
          <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400">
              <ShieldCheck size={18} /> SSL Secured
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400">
              <Zap size={18} /> 99.9% Uptime
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400">
              <CheckCircle2 size={18} /> Facebook & Instagram Ready
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
