"use client";
import { uploadProduct } from "@/lib/services/productService";
import { supabaseClient } from "@/lib/supabaseClient";
import { useState } from "react";
import { toast } from "sonner";


export default function AddProductBox({ shopId }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  // 1. AI ექსტრაქტორი
  const handleParse = async () => {
    if (text.length < 10) return;

    setLoading(true);
    try {
      const res = await fetch("/api/products/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "სერვერის შეცდომა");

      setPreview(data);
    } catch (err) {
      console.error("Client error:", err.message);
      alert("შეცდომა: " + err.message);
    } finally {
      setLoading(false);
    }
  };

const saveProduct = async () => {
  setLoading(true);
  try {
    // 1. სთოქის დამუშავება (იგივე რჩება)
    let finalStock = {};
    if (typeof preview.stock === "object" && preview.stock !== null) {
      finalStock = preview.stock;
    } else if (typeof preview.stock === "string") {
      preview.stock.split(",").forEach((item) => {
        const key = item.trim();
        if (key) finalStock[key] = 10;
      });
    }

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    // 2. ვიზუალების მასივის მომზადება
    // თუ თეგები გვაქვს, ვიყენებთ მათ. თუ არა - ერთ ცალ null-ს.
    const visualsToUpload =
      Array.isArray(preview.visual_appearance) && preview.visual_appearance.length > 0
        ? preview.visual_appearance
        : [null];

    // 3. მასიური ატვირთვა (თითო თეგზე ერთი ჩანაწერი ბაზაში)
    const uploadPromises = visualsToUpload.map((visual) => {
      const finalProduct = {
        name: preview.name,
        brand: preview.brand,
        price: parseFloat(preview.price) || 0,
        description: preview.description,
        visual_appearance: visual, // აქ ჩაჯდება "აბი" (Badge)
        stock: finalStock,
      };

      return uploadProduct(finalProduct, shopId, user.id);
    });

    const results = await Promise.all(uploadPromises);

    // შეცდომების შემოწმება
    const errors = results.filter((res) => res.error);

    if (errors.length === 0) {
      setPreview({
        name: "",
        brand: "",
        price: "",
        description: "",
        visual_appearance: [], // მასივის გასუფთავება
        stock: "",
      });
      setText("");
      setPreview(null);
      toast.success(`${visualsToUpload.length} პროდუქტი წარმატებით დაემატა!`);
    } else {
      toast.error("მონაცემების შენახვისას მოხდა შეცდომა.");
      console.error("Upload Errors:", errors);
    }
  } catch (err) {
    console.error("Critical Save Error:", err);
    toast.error("ვერ მოხერხდა პროდუქტების შენახვა.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 relative">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
        <span className="text-xl">✨</span> პროდუქტის სწრაფი დამატება
      </h3>

      <textarea
        className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black mb-4 transition-all text-sm outline-none"
        placeholder="ჩააკოპირე ფეისბუქ პოსტის ტექსტი..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
      />

      <button
        onClick={handleParse}
        disabled={loading || !text || !!preview}
        className="w-full bg-black text-white py-3.5 rounded-2xl font-bold hover:opacity-80 transition disabled:bg-gray-200 disabled:text-gray-400"
      >
        {loading ? "მუშავდება..." : "მონაცემების ამოღება"}
      </button>

      {preview && (
        <div className="mt-6 p-5 border-2 border-dashed border-green-200 rounded-3xl bg-green-50/40 animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-5">
            <h4 className="text-xs font-bold text-green-700 tracking-wide uppercase">
              ✅ გადაამოწმეთ მონაცემები
            </h4>
            <button
              onClick={() => setPreview(null)}
              className="text-gray-400 hover:text-red-500 transition text-xs font-bold"
            >
              გაუქმება
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* სახელი */}
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">
                პროდუქტის დასახელება
              </label>
              <input
                className="w-full p-3 bg-white rounded-xl border border-gray-100 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition"
                value={preview.name || ""}
                onChange={(e) =>
                  setPreview({ ...preview, name: e.target.value })
                }
              />
            </div>

            {/* ფასი */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">
                ფასი (₾)
              </label>
              <input
                type="number"
                className="w-full p-3 bg-white rounded-xl border border-gray-100 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition"
                value={preview.price || ""}
                onChange={(e) =>
                  setPreview({ ...preview, price: e.target.value })
                }
              />
            </div>

            {/* ბრენდი */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">
                ბრენდი
              </label>
              <input
                className="w-full p-3 bg-white rounded-xl border border-gray-100 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition"
                value={preview.brand || ""}
                onChange={(e) =>
                  setPreview({ ...preview, brand: e.target.value })
                }
              />
            </div>

            {/* ფერები */}
            <div>
              <label className="text-[9px] uppercase tracking-wider text-gray-500 font-bold ml-1">
                ვიზუალური მახასიათებლები (Enter ან მძიმე დასამატებლად)
              </label>
              <div className="flex flex-wrap gap-2 p-2 bg-white rounded-xl border border-gray-100 min-h-[50px] focus-within:border-green-400 transition">
                {/* აქ გამოჩნდება უკვე დამატებული თეგები */}
                {(Array.isArray(preview.visual_appearance) ? preview.visual_appearance : []).map(
                  (tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100"
                    >
                      {tag}
                      <button
                        onClick={() => {
                          const newVisuals = preview.visual_appearance.filter(
                            (_, i) => i !== index,
                          );
                          setPreview({ ...preview, visual_appearance: newVisuals });
                        }}
                        className="hover:text-red-500 font-bold ml-1 cursor-pointer text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ),
                )}

                {/* რეალური ინპუტი თეგების ჩასაწერად */}
                <input
                  className="flex-1 outline-none p-1 min-w-[120px] text-sm"
                  placeholder={
                    !preview.visual_appearance || preview.visual_appearance.length === 0
                      ? "მაგ: შავი, თეთრი..."
                      : ""
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const value = e.target.value.trim().replace(",", "");
                      if (value) {
                        const currentVisuals = Array.isArray(preview.visual_appearance)
                          ? preview.visual_appearance
                          : [];
                        setPreview({
                          ...preview,
                          visual_appearance: [...currentVisuals, value],
                        });
                        e.target.value = ""; // ინპუტის გასუფთავება
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* ვარიაციები: ზომა ან მოცულობა */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">
                ზომები / მოცულობა
              </label>
              <input
                className="w-full p-3 bg-white rounded-xl border border-gray-100 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition"
                // თუ stock ობიექტია, ვაქცევთ ტექსტად (L, XL), თუ ტექსტია - ვტოვებთ ტექსტად
                value={
                  typeof preview.stock === "object" && preview.stock !== null
                    ? Object.keys(preview.stock).join(", ")
                    : preview.stock || ""
                }
                placeholder="მაგ: 40, 42 ან 50ml, 100ml"
                onChange={(e) =>
                  setPreview({
                    ...preview,
                    stock: e.target.value, // აქ ვინახავთ ტექსტად, რომ წაშლა/დამატება შეძლო
                  })
                }
              />

              {/* Badge-ების ვიზუალიზაცია ობიექტიდან გამომდინარე */}
              <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                {(typeof preview.stock === "object" && preview.stock !== null
                  ? Object.keys(preview.stock)
                  : (preview.stock || "").split(",")
                )
                  .map((s) => s.toString().trim())
                  .filter((s) => s !== "")
                  .map((item, idx) => (
                    <span
                      key={idx}
                      className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-lg border border-green-200 font-black"
                    >
                      {item}
                    </span>
                  ))}
              </div>
            </div>

            {/* აღწერა */}
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">
                მოკლე აღწერა
              </label>
              <textarea
                className="w-full p-3 bg-white rounded-xl border border-gray-100 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition"
                value={preview.description || ""}
                onChange={(e) =>
                  setPreview({ ...preview, description: e.target.value })
                }
                rows={2}
              />
            </div>
          </div>

          <button
            onClick={saveProduct}
            disabled={loading || !preview.name || !preview.price}
            className="mt-6 w-full cursor-pointer bg-green-600 text-white py-4 rounded-2xl font-black hover:bg-green-700 transition shadow-lg shadow-green-200 disabled:bg-gray-300 disabled:shadow-none"
          >
            {loading ? "ინახება..." : "ბაზაში დამატება 🚀"}
          </button>
        </div>
      )}
    </div>
  );
}
