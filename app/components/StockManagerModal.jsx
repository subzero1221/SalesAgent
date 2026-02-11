"use client";
import { useState } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner"; // ან "react-hot-toast"

export default function StockManagerModal({
  isOpen,
  onClose,
  initialStock,
  onSave,
  productName,
}) {
  const DEFAULT_QTY = 10; // Automatic quantity

  // stock-ს გარდაქმნის მასივად: [{size: "42", qty: 10}, ...]
  const [stockList, setStockList] = useState(
    Object.entries(initialStock || {}).map(([key, val]) => ({
      size: key,
      qty: val,
    })),
  );
  const [newSize, setNewSize] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    const trimmedSize = newSize.trim();
    if (!trimmedSize) return;

    const exists = stockList.some(
      (item) => item.size.toLowerCase() === trimmedSize.toLowerCase(),
    );

    if (exists) {
      toast.error("უკვე სიაშია! 😎");

      return;
    }

    setStockList([...stockList, { size: trimmedSize, qty: DEFAULT_QTY }]);
    setNewSize("");
  };

  const handleRemove = (index) => {
    const newList = [...stockList];
    newList.splice(index, 1);
    setStockList(newList);
  };

  const handleSaveInternal = () => {
    const stockObject = stockList.reduce((acc, item) => {
      acc[item.size] = Number(item.qty);
      return acc;
    }, {});
    onSave(stockObject);
    toast.success("მარაგი განახლდა! 🎉");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-black uppercase tracking-widest text-xs text-gray-400">
            მარაგების მართვა
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-lg font-bold">{productName}</p>
          </div>

          {/* სია */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
            {stockList.length === 0 && (
              <p className="text-center text-sm text-gray-400 italic">
                ზომები დამატებული არ არის
              </p>
            )}
            {stockList.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100"
              >
                <span className="font-black text-black pl-2">{item.size}</span>
                <div className="flex items-center gap-4">
                  {/* Optional: We can hide this if you don't want to see '10 ცალი' at all, but keeping it shows it's active */}
                  <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-100 px-2 py-1 rounded-md">
                    აქტიური
                  </span>
                  <button
                    onClick={() => handleRemove(idx)}
                    className="text-red-400 hover:text-red-600 cursor-pointer transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* დამატება (მხოლოდ ზომა) */}
          <div className="flex gap-2 items-end pt-4 border-t border-gray-100">
            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-bold uppercase text-gray-400 ml-1">
                ახალი პარამეტრი (ზომა, მოცულობა...)
              </label>
              <input
                value={newSize}
                onChange={(e) => setNewSize(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="მაგ: XL, 42, 100ml..."
                className="w-full p-3 bg-gray-50 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>

            <button
              onClick={handleAdd}
              className="p-3 bg-black text-white rounded-xl hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center w-12 h-11"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={handleSaveInternal}
            className="w-full py-3 bg-green-500 cursor-pointer text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
          >
            <Save size={16} /> შენახვა
          </button>
        </div>
      </div>
    </div>
  );
}
