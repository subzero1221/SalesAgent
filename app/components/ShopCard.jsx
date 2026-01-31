import Link from "next/link";

export default function ShopCard({ shop }) {
  // 1. გამოვთვალოთ ლიმიტი (შენი SQL ლოგიკის შესაბამისად)
  const limits = { demo: 100, starter: 1000, pro: 5000 };
  const maxLimit = limits[shop.shop_plan] || 100;
  const used = shop.messages_sent_this_month || 0;
  const percentage = Math.min((used / maxLimit) * 100, 100);

  // 2. ფერების შერჩევა პროგრესისთვის
  const progressColor =
    percentage > 90
      ? "bg-red-500"
      : percentage > 70
        ? "bg-orange-500"
        : "bg-blue-600";

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center text-xl font-bold text-gray-900 group-hover:bg-black group-hover:text-white transition-colors">
          {shop.name[0]}
        </div>
        <div className="flex gap-2">
          {/* პაკეტის ბეჯი */}
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-100">
            {shop.shop_plan}
          </span>
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
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-1">{shop.name}</h3>
      <p className="text-xs text-gray-400 font-mono mb-4">
        ID: {shop.facebook_page_id}
      </p>

      {/* --- Usage Section --- */}
      <div className="mb-6">
        <div className="flex justify-between text-[11px] font-bold mb-1.5 uppercase tracking-tight">
          <span className="text-gray-400 text-[11px]">Usage</span>
          <span className={percentage > 90 ? "text-red-600" : "text-gray-900"}>
            {used} / {maxLimit}
          </span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {shop.plan_expires_at && (
          <p className="text-[10px] text-gray-400 mt-2">
            Expires: {new Date(shop.plan_expires_at).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 text-[13px]">რეჟიმი:</span>
          <span className="font-semibold text-gray-900 text-[13px] capitalize">
            {shop.mode.replace("_", " ")}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 text-[13px]">ველები:</span>
          <div className="flex gap-1">
            {shop.required_fields.map((field) => (
              <span
                key={field}
                className="bg-gray-50 border border-gray-100 px-2 py-0.5 rounded text-[10px] font-medium text-gray-600"
              >
                {field}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link
          href={`/dashboard/${shop.id}/sessions`}
          className="flex items-center justify-center py-3 rounded-2xl bg-gray-50 text-gray-900 text-xs font-bold hover:bg-black hover:text-white transition-all"
        >
          სესიები
        </Link>
        <Link
          href={`/dashboard/${shop.id}/billing`}
          className="flex items-center justify-center py-3 rounded-2xl bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all"
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
}
