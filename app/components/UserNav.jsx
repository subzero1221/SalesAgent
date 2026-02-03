"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation"; // დავამატეთ ნავიგაციისთვის
import {
  ChevronDown,
  Store,
  BarChart3,
  Package,
  History,
  Check,
} from "lucide-react";

export default function 
UserNav({ user, shops }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

 
  const currentShopId = pathname.split("/")[2];
  const selectedShop =
    shops.find((s) => s.id === currentShopId) || shops[0] || null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShopSwitch = (shop) => {

    const pathParts = pathname.split("/");
    const currentPage = pathParts[3] || "/sessions"; 

  
    router.push(`/dashboard/${shop.id}/${currentPage}`);

    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center cursor-pointer gap-3 px-3 py-2 rounded-xl transition-all border ${
          isOpen
            ? "bg-gray-50 border-gray-200 shadow-sm"
            : "border-transparent hover:bg-gray-50 hover:border-gray-100"
        }`}
      >
        <div className="flex flex-col items-end hidden md:flex text-right">
          <span className="text-xs font-bold text-gray-900 leading-none mb-1">
            {selectedShop ? selectedShop.name : user.email.split("@")[0]}
          </span>
          <span className={ selectedShop ? "text-[9px] text-green-600 uppercase tracking-widest font-black bg-green-50 px-1.5 py-0.5 rounded" : "text-[9px] text-gray-400 uppercase tracking-widest font-black bg-gray-50 px-1.5 py-0.5 rounded"}>
           {selectedShop ? "Active Shop" : "No Active Shop"}
          </span>
        </div>
        <div
          className={`p-1 rounded-full transition-colors ${isOpen ? "bg-gray-200" : "bg-gray-100"}`}
        >
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[115%] w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl shadow-gray-200/50 z-[100] animate-in fade-in zoom-in duration-200">
          {shops.length > 1 && (
            <div className="mb-2 pb-2 border-b border-gray-50">
              <p className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                Switch Shop
              </p>
              <div className="space-y-1">
                {shops.map((shop) => (
                  <button
                    key={shop.id}
                    onClick={() => handleShopSwitch(shop)} 
                    className={`w-full flex items-center cursor-pointer justify-between px-3 py-2 text-sm rounded-lg transition-all ${
                      selectedShop?.id === shop.id
                        ? "bg-gray-900 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Store
                        className={`w-4 h-4 flex-shrink-0 ${selectedShop?.id === shop.id ? "text-gray-300" : "text-gray-400"}`}
                      />
                      <span className="truncate font-medium">{shop.name}</span>
                    </div>
                    {selectedShop?.id === shop.id && (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedShop && (
            <div className="space-y-0.5">
              <p className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                Manage Shop
              </p>
              <MenuLink
                href={`/dashboard/${selectedShop.id}/sessions`}
                icon={<History className="w-4 h-4" />}
                label="სესიები"
                onClick={() => setIsOpen(false)}
              />
              <MenuLink
                href={`/dashboard/${selectedShop.id}/requests`}
                icon={<BarChart3 className="w-4 h-4" />}
                label="გაყიდვები"
                onClick={() => setIsOpen(false)}
              />
              <MenuLink
                href={`/dashboard/${selectedShop.id}/products`}
                icon={<Package className="w-4 h-4" />}
                label="ინვენტარი"
                onClick={() => setIsOpen(false)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, icon, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-all group border border-transparent hover:border-gray-100"
    >
      <span className="text-gray-400 group-hover:text-black transition-colors">
        {icon}
      </span>
      {label}
    </Link>
  );
}
