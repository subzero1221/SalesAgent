"use client";
import { colors } from "@/lib/helpers/contexts";
import { uploadProduct } from "@/lib/services/productService";
import { supabaseClient } from "@/lib/supabaseClient";
import { useState } from "react";

export default function AddProductBox({ shopId }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleParse = async () => {
    if (text.length < 10) return;

    setLoading(true);
    try {
      const res = await fetch("/api/products/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // აუცილებელია!
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      console.log("Response data:", data); // ახლა ნამდვილად უნდა გამოჩნდეს

      if (!res.ok) {
        throw new Error(data.error || "სერვერის შეცდომა");
      }

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
    let formattedColor = preview.color
      ? preview.color.trim().replace(/\s+/g, ", ")
      : "";

    // თუ მაინც ძალიან "მიჭყლეტილია" (მაგ: შავითეთრი)
    if (preview.color && !colors.includes(preview.color.trim())) {
      alert("გთხოვთ ფერები მძიმით გამოყოთ (მაგ: შავი, თეთრი)");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const finalProduct = {
      ...preview,
      color: formattedColor.replace(/, ,/g, ","),
    };

    const { data, error } = await uploadProduct(
      finalProduct, // AI-ს მიერ ამოღებული JSON
      shopId,
      user.id,
    );

    if (!error) {
      alert("პროდუქტი ბაზაშია! 🚀");
      setPreview(null);
      setText("");
    } else {
      alert("შეცდომა: " + error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold mb-4">✨ პროდუქტის სწრაფი დამატება</h3>
      <textarea
        className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-black mb-4"
        placeholder="ჩააკოპირე ფეისბუქ პოსტის ტექსტი..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
      />
      <button
        onClick={handleParse}
        disabled={loading || !text||!!preview}
        className="w-full bg-black text-white py-3 rounded-2xl font-bold hover:opacity-80 transition disabled:bg-gray-300"
      >
        {loading ? "მუშავდება..." : "მონაცემების ამოღება"}
      </button>

      {preview && (
        <div className="mt-6 p-5 border-2 border-dashed border-green-200 rounded-3xl bg-green-50/50">
          <button
            onClick={() => setPreview(null)}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
          >
            ✕
          </button>
          <h4 className="text-sm font-bold text-green-800 mb-4 flex items-center gap-2">
            ✅ მონაცემები ამოღებულია. გთხოვთ გადაამოწმოთ:
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* სახელი (Brand + Model) */}
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">
                პროდუქტის დასახელება
              </label>
              <input
                className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition"
                value={preview.name || ""}
                placeholder="მაგ: Adidas Terrex X40"
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
                className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                value={preview.price || ""}
                placeholder="0.00"
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
                className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                value={preview.brand || ""}
                placeholder="მაგ: Nike, Apple..."
                onChange={(e) =>
                  setPreview({ ...preview, brand: e.target.value })
                }
              />
            </div>

            {/* ვარიაციები: ფერი და მოცულობა/ზომა */}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">
                ფერები (მძიმით)
              </label>
              <input
                className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
                value={preview.color || ""}
                placeholder="შავი, თეთრი..."
                onChange={(e) =>
                  setPreview({ ...preview, color: e.target.value })
                }
              />
            </div>

            {preview.stock?.sizes && (
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  ზომები
                </label>
                <input
                  className="w-full p-3 bg-white rounded-xl border border-gray-100"
                  value={preview.stock.sizes}
                  onChange={(e) =>
                    setPreview({
                      ...preview,
                      stock: { ...preview.stock, sizes: e.target.value },
                    })
                  }
                />
              </div>
            )}

            {/* მოცულობის ველი - გამოჩნდება მხოლოდ თუ AI-მ იპოვა რამე */}
            {preview.stock?.volumes && (
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">
                  მოცულობა / ლიტრაჟი
                </label>
                <input
                  className="w-full p-3 bg-white rounded-xl border border-gray-100"
                  value={preview.stock.volumes}
                  onChange={(e) =>
                    setPreview({
                      ...preview,
                      stock: { ...preview.stock, volumes: e.target.value },
                    })
                  }
                />
              </div>
            )}

            {/* აღწერა */}
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold ml-1">
                მოკლე აღწერა
              </label>
              <textarea
                className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
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
            className="mt-6 w-full bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-200 disabled:bg-gray-300 disabled:shadow-none"
          >
            {loading ? "ინახება..." : "ბაზაში დამატება 🚀"}
          </button>

          {(!preview.name || !preview.price) && (
            <p className="text-[10px] text-red-500 mt-2 text-center font-medium">
              * პროდუქტის სახელი და ფასი აუცილებელია
            </p>
          )}
        </div>
      )}
    </div>
  );
}
