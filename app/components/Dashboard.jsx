import ShopCard from "@/app/components/ShopCard";
import RequestTable from "@/app/components/RequestTable";
import AddProductBox from "./AddProductBox";
import Link from "next/link";

export default function Dashboard({ shops, userId }) {

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              მართე შენი მაღაზიები და მოთხოვნები
            </p>
          </div>
          <Link href="/facebook-connect" className="bg-black text-white px-6 cursor-pointer py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
            + ახალი მაღაზია
          </Link>
        </div>

        {/* Shops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} userId={userId} />
          ))}
        </div>
      </div>
    </div>
  );
}
