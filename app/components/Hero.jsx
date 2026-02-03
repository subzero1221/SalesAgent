import Link from "next/link";
import Footer from "./Footer";
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import PriceCardForLandingPage from "./PriceCardForLandingPage";

export default function Hero() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa]">
      {/* 1. Hero Section */}
      <section className="flex-1 max-w-4xl mx-auto py-32 text-center px-6">
        <h1 className="text-5xl font-black tracking-tighter uppercase text-black leading-tight">
          SalesAgent — აგროვებს შეკვეთებს, <br />
          <span className="text-gray-400">როცა შენ არ ხარ ონლაინ</span>
        </h1>
        <p className="mt-8 text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto font-sans">
          Messenger და Instagram კლიენტები არ იკარგება. აგენტი აგროვებს
          პროდუქტს, მისამართს და ტელეფონს, შენ იღებ მზად მოთხოვნას.
        </p>

        <div className="mt-12">
          <Link
            href="/login"
            className="px-10 py-5 bg-black text-white rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:shadow-2xl transition-all"
          >
            შექმენი აგენტი უფასოდ
          </Link>
        </div>
      </section>

      {/* 2. Pricing Section - ბანკის დადასტურებისთვის */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-12">
            ტარიფები
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 italic">
            <PriceCardForLandingPage
              title="Free"
              price="0₾"
              features={["1 მაღაზია", "50 მესიჯი", "Telegram ნოტიფიკაცია"]}
            />
            <PriceCardForLandingPage
              title="Starter"
              price="79₾"
              featured={true}
              features={["2 მაღაზია", "1000 მესიჯი","100 პროდუქტი", "დახმარება 24/7"]}
            />
            <PriceCardForLandingPage
              title="Pro"
              price="179₾"
              features={["3 მაღაზია", "3000 მესიჯი", "200 პროდუქტი", "დახმარება 24/7"]}
            />
          </div>
        </div>
      </section>

      {/* 3. Compliance Info - Meta-სთვის */}
      <section className="py-20 max-w-4xl mx-auto px-6 text-center">
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase">
            <ShieldCheck size={16} /> Meta Verified Integration
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase">
            <Zap size={16} /> Real-time Processing
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


