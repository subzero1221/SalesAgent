import { Zap } from "lucide-react";


export function Logo() {
  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      <div className="bg-black text-white p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
        <Zap size={18} fill="currentColor" />
      </div>
      <span className="text-xl font-black tracking-tighter uppercase italic">
        Sales<span className="text-gray-400">Agent</span>
      </span>
    </div>
  );
}
