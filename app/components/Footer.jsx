import Link from "next/link";
import { Mail, Phone, Facebook, MessageCircle } from "lucide-react"; // დარწმუნდი რომ lucide-react დაინსტალირებული გაქვს
import { Logo } from "./Logo";

export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-gray-100 bg-gray-200">
      <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Brand & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <Logo />
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            © 2026 ყველა უფლება დაცულია
          </span>
          {/* Contact Info - ბანკისთვის აუცილებელი დეტალები */}
          <div className="flex flex-col gap-1 mt-2">
            <a
              href="tel:+995551559812"
              className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-black transition-colors"
            >
              <Phone size={12} /> 551 55 98 12
            </a>
            <a
              href="mailto:bkelekhsaevi@gmail.com"
              className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-black transition-colors"
            >
              <Mail size={12} /> bkelekhsaevi@gmail.com
            </a>
          </div>
        </div>

        {/* Practical Links & Socials */}
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-6">
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
            <Link
              href="/refund-policy"
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
            >
              Refund Policy
            </Link>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <Link
              href="https://wa.me/995551559812"
              target="_blank"
              className="text-gray-400 hover:text-green-500 transition-colors"
            >
              <MessageCircle size={18} />
            </Link>
            <Link
              href="https://www.facebook.com/beso.qelexsaevi"
              target="_blank"
              className="text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Facebook size={18} />
            </Link>
          </div>
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
  );
}
