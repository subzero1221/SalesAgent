"use client";
import { useState, useRef } from "react";
import { Upload, X, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function ProductImageMatcher({
  variants = [],
  onMatchConfirmed,
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchedVariant, setMatchedVariant] = useState(null);
  const fileInputRef = useRef(null);

  // 1. Handle File Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result); // For display
      // Remove metadata for AI (optional but cleaner)
      const base64 = reader.result.split(",")[1];
      setImageBase64(base64);

      // Auto-trigger matching if we have variants
      if (variants.length > 0) {
        matchImageToVariant(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // 2. Call Server Action to Match
  const matchImageToVariant = async (base64) => {
    setIsMatching(true);
    setMatchedVariant(null);
    try {
      const res = await fetch("/api/products/match-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, variants }),
      });

      const data = await res.json();
      if (data.match && data.match !== "null") {
        setMatchedVariant(data.match);
        toast.success(`AI-მ ამოიცნო: ${data.match} ✨`);
      } else {
        toast.info("AI ვერ მიხვდა ზუსტ ფერს, აირჩიეთ ხელით.");
      }
    } catch (error) {
      console.error("Matching error:", error);
      toast.error("AI შეცდომა");
    } finally {
      setIsMatching(false);
    }
  };

  // 3. Confirm Selection
  const handleConfirm = () => {
    if (!matchedVariant) {
      toast.error("გთხოვთ აირჩიოთ ფერი/ვიზუალი");
      return;
    }
    // Return the file object (or base64) and the variant it belongs to
    onMatchConfirmed({ image: selectedImage, variant: matchedVariant });
    // Reset
    setSelectedImage(null);
    setImageBase64(null);
    setMatchedVariant(null);
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <h4 className="text-xs font-bold uppercase text-gray-400 mb-3 flex items-center gap-2">
        <Sparkles size={14} className="text-purple-500" />
        ფოტოს მიბმა ვიზუალზე
      </h4>

      {!selectedImage ? (
        // Upload Button
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all bg-white"
        >
          <Upload size={24} className="mb-2" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            ატვირთე ფოტო
          </span>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
      ) : (
        // Preview & Matching UI
        <div className="flex gap-4 items-start">
          {/* Image Preview */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 bg-white flex-shrink-0">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => {
                setSelectedImage(null);
                setMatchedVariant(null);
              }}
              className="absolute top-1 right-1 bg-white/80 p-1 rounded-full hover:bg-red-50 hover:text-red-500 transition"
            >
              <X size={12} />
            </button>
          </div>

          {/* AI Selection Area */}
          <div className="flex-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
              რომელ ვიზუალს ეკუთვნის?
            </p>

            {isMatching ? (
              <div className="flex items-center gap-2 text-xs text-purple-600 font-bold animate-pulse">
                <Loader2 size={14} className="animate-spin" />
                AI აანალიზებს...
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v}
                    onClick={() => setMatchedVariant(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      matchedVariant === v
                        ? "bg-black text-white border-black shadow-md scale-105"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {v}
                    {matchedVariant === v && (
                      <Check size={12} className="ml-1 inline" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Confirm Button */}
            <button
              onClick={handleConfirm}
              disabled={!matchedVariant || isMatching}
              className="mt-3 w-full bg-green-500 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              დადასტურება <Check size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
