"use client";
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

    // ამოვიღოთ იუზერი (RLS-ისთვის აუცილებელია)
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const { data, error } = await uploadProduct(
      preview, // AI-ს მიერ ამოღებული JSON
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
        disabled={loading || !text}
        className="w-full bg-black text-white py-3 rounded-2xl font-bold hover:opacity-80 transition disabled:bg-gray-300"
      >
        {loading ? "მუშავდება..." : "მონაცემების ამოღება"}
      </button>

      {preview && (
        <div className="mt-6 p-4 border border-dashed border-gray-200 rounded-2xl bg-green-50">
          <p className="text-sm font-bold">აღმოჩენილია:</p>
          <div className="mt-2 text-sm">
            <p>
              📦 <b>სახელი:</b> {preview.name}
            </p>
            <p>
              ®️<b>ბრენდი:</b> {preview.brand}
            </p>
            <p>
              💰 <b>ფასი:</b> {preview.price} ლარი
            </p>
            <p>
              📝 <b>აღწერა:</b> {preview.description}
            </p>
          </div>
          <button
            onClick={saveProduct}
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-xl font-bold"
          >
            ბაზაში შენახვა
          </button>
        </div>
      )}
    </div>
  );
}
