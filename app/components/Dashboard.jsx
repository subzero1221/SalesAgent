import ShopCard from "@/app/components/ShopCard";
import RequestTable from "@/app/components/RequestTable";
import AddProductBox from "./AddProductBox";
import Link from "next/link";

export default function Dashboard({ shops, requests }) {

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
          <button className="bg-black text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
            + ახალი მაღაზია
          </button>
        </div>

        {/* Shops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
        <Link
          href={`/dashboard/${shops[0]?.id}/products`}
          className="text-sm font-bold text-black hover:underline flex items-center gap-1"
        >
          ინვენტარის ნახვა
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            {/* გადავცემთ პირველი მაღაზიის ID-ს (დროებით, სანამ სელექტორს დაამატებ) */}
            <AddProductBox shopId={shops[0]?.id} userId={shops[0]?.user_id} />
          </div>
          <div className="bg-gray-900 text-white p-8 rounded-3xl flex flex-col justify-center">
            <h3 className="text-xl font-bold mb-2">როგორ მუშაობს?</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              უბრალოდ ჩააკოპირე ფეისბუქ/ინსტაგრამ პოსტის ტექსტი მარცხენა ველში. აგენტი ავტომატურად ამოიღებს დასახელებას, ფასს და
              ზომებს. სასურველია მიუთითოთ ნივთის დასახელება(ბრენდი/მოდელი), ეს აგენტს გახდის ორმაგად ეფექტურს.
            </p>
            <div className="mt-6 flex gap-2">
              <span className="bg-white/10 px-3 py-1 rounded-full text-[10px]">
                AI Powered
              </span>
              <span className="bg-white/10 px-3 py-1 rounded-full text-[10px]">
                Gemini 2.0
              </span>
            </div>
          </div>
        </div>

        {/* Recent Requests Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            ბოლო მოთხოვნები
            <span className="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-md font-bold">
              {requests.length}
            </span>
          </h2>
          <RequestTable requests={requests} />
        </div>
      </div>
    </div>
  );
}
