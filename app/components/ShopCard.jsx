import Link from "next/link";

export default function ShopCard({ shop }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-900 group-hover:bg-black group-hover:text-white transition-colors">
          {shop.name[0]}
        </div>
        <div
          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            shop.bot_enabled
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {shop.bot_enabled ? "Active" : "Paused"}
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">{shop.name}</h3>
      <p className="text-xs text-gray-400 font-mono mb-4">
        ID: {shop.facebook_page_id}
      </p>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">რეჟიმი:</span>
          <span className="font-medium text-gray-900 capitalize">
            {shop.mode.replace("_", " ")}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">ველები:</span>
          <div className="flex gap-1">
            {shop.required_fields.map((field) => (
              <span
                key={field}
                className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-medium text-gray-600"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Link href={`/dashboard/${shop.id}/sessions`} className="w-full py-3 px-3 rounded-2xl cursor-pointer bg-gray-50 text-gray-900 text-sm font-bold hover:bg-gray-900 hover:text-white transition-all">
        სესიების ნახვა
      </Link>
    </div>
  );
}
