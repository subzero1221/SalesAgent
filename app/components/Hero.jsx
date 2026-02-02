import Link from "next/link";

export default function Hero() {
return (
  <div className="flex flex-col min-h-screen bg-[#fafafa]">
    {/* Hero Section */}
    <section className="flex-1 max-w-4xl mx-auto py-32 text-center px-6">
      <h1 className="text-5xl font-black tracking-tighter uppercase text-black leading-tight">
        SalesAgent — აგროვებს შეკვეთებს, <br />
        <span className="text-gray-400">როცა შენ არ ხარ ონლაინ</span>
      </h1>
      <p className="mt-8 text-xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto">
        Messenger და Instagram კლიენტები არ იკარგება.
        <br />
        ბოტი აგროვებს მისამართს და ტელეფონს, შენ იღებ მზად მოთხოვნას.
      </p>

      <div className="mt-12">
        <Link
          href="/login"
          className="px-10 py-5 bg-black text-white rounded-[2rem] font-black uppercase text-xs tracking-widest hover:shadow-2xl hover:shadow-black/20 transition-all duration-500"
        >
          დაიწყე ახლავე
        </Link>
      </div>
    </section>

    {/* --- FOOTER SECTION --- */}
    <footer className="w-full py-12 border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="text-sm font-black uppercase tracking-tighter text-black">
            SalesAgent.ge
          </span>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            © 2026 ყველა უფლება დაცულია
          </span>
        </div>

        {/* Practical Links */}
        <div className="flex items-center gap-8">
          <Link
            href="/privacy"
            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/Terms-of-service"
            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          >
            Terms of Service
          </Link>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-green-700">
            Platform Stable
          </span>
        </div>
      </div>
    </footer>
  </div>
);
}
