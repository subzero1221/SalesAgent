"use client";

export default function PaymentModal({
  isOpen,
  onClose,
  plan,
  loading,
  onSelectProvider,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-200 border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Close Button */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-black text-gray-900">
              გადახდის მეთოდი
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              პაკეტი:{" "}
              <span className="font-bold text-blue-600 capitalize">
                {plan?.name || "Premium"}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Total Price */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex justify-between items-center border border-gray-100">
          <span className="text-sm font-medium text-gray-600">
            გადასახდელი:
          </span>
          <span className="text-2xl font-black text-gray-900">
            {plan?.price} ₾
          </span>
        </div>

        {/* Providers List */}
        <div className="space-y-3">
          {/* TBC Bank */}
          <button
            onClick={() => onSelectProvider("tbc")}
            disabled={loading}
            className="w-full group flex items-center justify-between p-4 border-2 border-transparent bg-blue-50/50 hover:bg-blue-50 hover:border-blue-500 rounded-2xl transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              {/* TBC Icon Placeholder */}
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm">
                TBC
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 group-hover:text-blue-700">
                  TBC Bank
                </p>
                <p className="text-xs text-gray-500">ბარათით გადახდა</p>
              </div>
            </div>

            {loading ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                ➝
              </div>
            )}
          </button>

          {/* Bank of Georgia (Coming Soon) */}
          <button
            disabled={true}
            className="w-full flex items-center justify-between p-4 border border-gray-100 bg-gray-50 rounded-2xl opacity-60 cursor-not-allowed grayscale"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xs">
                BOG
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-500">Bank of Georgia</p>
                <p className="text-xs text-gray-400">მალე დაემატება...</p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400">
          <svg
            className="w-4 h-4 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          დაცული გადახდა SSL შიფრაციით
        </div>
      </div>
    </div>
  );
}
