import Image from "next/image";

export function Logo() {
  return (
    <div className="flex items-center gap-2 group cursor-pointer">
    
      <div className="bg-black p-1.5 rounded-lg group-hover:rotate-12 transition-transform shrink-0 flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="SalesAgent Logo"
          width={32} 
          height={32} 
          className="object-contain invert" 
        />
      </div>

     
      <span className="text-xl font-black tracking-tighter uppercase italic">
        Sales<span className="text-gray-400">Agent</span>
      </span>
    </div>
  );
}
