"use client";
import { useState } from "react";
import { Check, X, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function InlineTextEdit({
  value,
  onSave,
  isTextarea = false,
  label,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  

  const handleSave = () => {
    if (tempValue !== value) {
      onSave(tempValue);
    }
    toast.success(`${label} განახლდა! 🎉`);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-start gap-2 animate-in fade-in duration-200">
        {isTextarea ? (
          <textarea
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="p-2 border border-gray-200 rounded-xl text-sm w-full min-w-[200px] focus:outline-none focus:border-black"
            rows={2}
          />
        ) : (
          <input
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="p-1 px-2 border border-gray-200 rounded-lg text-sm w-full font-bold uppercase focus:outline-none focus:border-black"
          />
        )}
        <button
          onClick={handleSave}
          className="p-1.5 bg-black text-white rounded-lg cursor-pointer hover:opacity-80"
        >
          <Check size={14} />
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="p-1.5 bg-gray-100 text-gray-500 rounded-lg cursor-pointer hover:bg-gray-200"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="group flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 -ml-1.5 rounded-lg transition-all"
    >
      <span
        className={
          isTextarea
            ? "text-sm text-gray-600 font-medium"
            : "text-xl font-black text-black uppercase"
        }
      >
        {value || (
          <span className="text-gray-300 italic text-xs">
            დაამატე {label}...
          </span>
        )}
      </span>
      <Pencil
        size={12}
        className="opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity"
      />
    </div>
  );
}
