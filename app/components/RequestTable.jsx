"use client"
export default function RequestTable({ requests }) {

  if (requests.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl bg-white">
        <p className="text-gray-400 text-sm font-medium">
          ჯერჯერობით მოთხოვნები არ არის...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                მაღაზია
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                ინფორმაცია
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                თარიღი
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100">
                სტატუსი
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {requests.map((req) => (
              <tr
                key={req.id}
                className="hover:bg-gray-50/30 transition-colors group"
              >
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gray-900 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {req.shops?.name?.[0] || "S"}
                    </div>
                    <span className="font-semibold text-gray-900 text-sm">
                      {req.shops?.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    {/* JSON მონაცემების ამოღება 'request' ველიდან */}
                    <span className="text-sm font-medium text-gray-800">
                      📞 {req.request?.phone || "ნომერი არ არის"}
                    </span>
                    <span className="text-xs text-gray-500 italic">
                      {req.request?.need || "საჭიროება არ არის მითითებული"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span
                    suppressHydrationWarning
                    className="text-xs text-gray-400 font-medium"
                  >
                    {new Date(req.created_at).toLocaleDateString("ka-GE")}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 uppercase tracking-wide">
                    {req.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
