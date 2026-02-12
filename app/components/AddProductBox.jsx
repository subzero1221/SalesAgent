"use client";
import { uploadProduct } from "@/lib/services/productService";
import { supabaseClient } from "@/lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import ProductImageMatcher from "./ProductImageMatcher";


export default function AddProductBox({ shopId }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [matchedImages, setMatchedImages] = useState({});

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
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) throw new Error("User not authenticated");
    let finalStock = {};
    if (typeof preview.stock === "object" && preview.stock !== null) {
      finalStock = preview.stock;
    } else if (typeof preview.stock === "string") {
      preview.stock.split(",").forEach((item) => {
        const key = item.trim();
        if (key) finalStock[key] = 10; // Default qty
      });
    }

    const visualsToUpload =
      Array.isArray(preview.visual_appearance) && preview.visual_appearance.length > 0
        ? preview.visual_appearance
        : [null];

    // 4. MAIN LOOP: Upload Image -> Then Upload Product
    const uploadPromises = visualsToUpload.map(async (visual) => {
      let finalImageUrl = null;

      // --- IMAGE UPLOAD LOGIC START ---
      // Check if we have a matched image for this specific visual tag
      if (visual && matchedImages[visual]) {
        try {
          const base64File = matchedImages[visual];
          
          // Clean base64 string
          const base64Data = base64File.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");

          // Create unique path: user_id/timestamp_variant.jpg
          const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

          // Upload to Supabase Storage
          const { error: uploadError } = await supabaseClient.storage
            .from("product-images") // ⚠️ Ensure this bucket exists and is Public
            .upload(fileName, buffer, {
              contentType: "image/jpeg",
              upsert: true,
            });

          if (uploadError) {
            console.error(`Failed to upload image for  ${visual}`, uploadError);
          } else {
            // Get Public URL
            const { data: publicData } = supabaseClient.storage
              .from("product-images")
              .getPublicUrl(fileName);
            
            finalImageUrl = publicData.publicUrl;
          }
        } catch (imgErr) {
          console.error("Image processing error:", imgErr);
        }
      }
     

     
      const finalProduct = {
        name: preview.name,
        brand: preview.brand,
        price: parseFloat(preview.price) || 0,
        description: preview.description,
        visual_appearance: visual, 
        stock: finalStock,
        product_image_url: finalImageUrl, 
      };

      // 6. Save to Database
      return uploadProduct(finalProduct, shopId, user.id);
    });

    // Wait for all products (variants) to be uploaded
    const results = await Promise.all(uploadPromises);

    // 7. Check for Errors
    const errors = results.filter((res) => res.error);

    if (errors.length === 0) {
      // Success: Reset everything
      setPreview({
        name: "",
        brand: "",
        price: "",
        description: "",
        visual_appearance: [],
        stock: "",
      });
      setText("");
      setPreview(null);
      // Reset matched images state if you have one
      if (typeof setMatchedImages === 'function') setMatchedImages({}); 
      
      toast.success(`${visualsToUpload.length} პროდუქტი წარმატებით დაემატა!`);
      router.refresh();
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

const handleImageMatch = ({ image, variant }) => {
  setMatchedImages((prev) => ({ ...prev, [variant]: image }));
  toast.success(`ფოტო მიება ვიზუალს: ${variant}`);
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
                {(Array.isArray(preview.visual_appearance)
                  ? preview.visual_appearance
                  : []
                ).map((tag, index) => (
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
                        setPreview({
                          ...preview,
                          visual_appearance: newVisuals,
                        });
                      }}
                      className="hover:text-red-500 font-bold ml-1 cursor-pointer text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}

                {/* რეალური ინპუტი თეგების ჩასაწერად */}
                <input
                  className="flex-1 outline-none p-1 min-w-[120px] text-sm"
                  placeholder={
                    !preview.visual_appearance ||
                    preview.visual_appearance.length === 0
                      ? "მაგ: შავი, თეთრი..."
                      : ""
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const value = e.target.value.trim().replace(",", "");
                      if (value) {
                        const currentVisuals = Array.isArray(
                          preview.visual_appearance,
                        )
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
          {Array.isArray(preview.visual_appearance) &&
            preview.visual_appearance.length > 0 && (
              <ProductImageMatcher
                variants={preview.visual_appearance}
                onMatchConfirmed={handleImageMatch}
              />
            )}

          {/* Optional: Show attached images */}
          {Object.keys(matchedImages).length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
              {Object.entries(matchedImages).map(([variant, img]) => (
                <div
                  key={variant}
                  className="relative w-12 h-12 rounded-lg border border-green-200 overflow-hidden flex-shrink-0 group"
                >
                  <Image src={img} alt={`${variant}`} className="w-full h-full object-cover" width={100} height={100} />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[8px] text-white font-bold opacity-0 group-hover:opacity-100 transition">
                    {variant}
                  </div>
                </div>
              ))}
            </div>
          )}

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
