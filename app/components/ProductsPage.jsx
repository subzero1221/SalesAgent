"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteProduct,
  getShopProducts,
  updateProductPrice,
} from "@/lib/services/productService";
import PriceEdit from "./PriceEdit";
import InfoBanner from "./InfoBanner";
import ConfirmModal from "./ConfirmModal"; // დარწმუნდი რომ ფაილი არსებობს
import { useState } from "react";

export default function ProductsPage({ shopId }) {
  const [banner, setBanner] = useState(true);
  const [productToDelete, setProductToDelete] = useState(null); // ინახავს ობიექტს: {id, name}
  const queryClient = useQueryClient();

  // 1. მონაცემების წამოღება
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products", shopId],
    queryFn: () => getShopProducts(shopId),
  });

  // 2. წაშლის მუტაცია
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", shopId] });
      setProductToDelete(null); // მოდალის დახურვა წარმატებისას
    },
    onError: (err) => {
      alert("წაშლა ვერ მოხერხდა: " + err.message);
    },
  });

  // 3. ფასის განახლების მუტაცია
  const updatePriceMutation = useMutation({
    mutationFn: ({ id, price }) => updateProductPrice(id, price),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", shopId] });
    },
  });

  if (isLoading)
    return (
      <div className="p-10 text-center animate-pulse text-gray-500 font-medium">
        იტვირთება ინვენტარი...
      </div>
    );
  if (error)
    return (
      <div className="p-10 text-red-500 text-center font-bold">
        🚨 შეცდომა: {error.message}
      </div>
    );

  return (
    <div className="p-6 lg:p-12 bg-[#fafafa] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Banner ინფო */}
        {banner && (
          <InfoBanner
            setBanner={setBanner}
            text="დარწმუნდით, რომ პროდუქტები ნამდვილად გაქვთ მარაგში. აგენტი ავტომატურად გამოიყენებს ამ სიას კლიენტებთან საუბრისას."
          />
        )}

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mt-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  პროდუქტი
                </th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  ფასი
                </th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">
                  მოქმედება
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {products?.data?.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50/30 transition-all duration-200 group"
                >
                  <td className="px-8 py-6 font-bold text-gray-800 text-lg">
                    {product.name}
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <PriceEdit
                        id={product.id}
                        initialPrice={product.price || 0}
                        onUpdate={(val) => updatePriceMutation.mutate(val)}
                      />
                      {updatePriceMutation.isPending &&
                        updatePriceMutation.variables?.id === product.id && (
                          <span className="text-[10px] bg-blue-50 text-blue-500 px-2 py-1 rounded-full animate-pulse font-bold">
                            განახლება...
                          </span>
                        )}
                    </div>
                  </td>

                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() =>
                        setProductToDelete({
                          id: product.id,
                          name: product.name,
                        })
                      }
                      className="text-gray-300 hover:text-red-500 p-3 hover:bg-red-50 rounded-2xl transition-all duration-200 cursor-pointer"
                    >
                      <span className="text-xl">🗑️</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products?.data?.length === 0 && (
            <div className="p-24 text-center">
              <div className="text-5xl mb-4">📦</div>
              <p className="text-gray-400 font-medium">ინვენტარი ცარიელია</p>
            </div>
          )}
        </div>
      </div>

      {/* --- REUSABLE CONFIRM MODAL --- */}
      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="პროდუქტის წაშლა"
      >
        <div className="space-y-6">
          <p className="text-gray-500 text-lg leading-relaxed">
            ნამდვილად გსურთ წაშალოთ{" "}
            <span className="font-extrabold text-gray-900">
              {productToDelete?.name}
            </span>
            ? ამ მოქმედების შემდეგ პროდუქტი აგენტისთვის აღარ იქნება
            ხელმისაწვდომი.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => setProductToDelete(null)}
              className="flex-1 py-4 cursor-pointer px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-all"
            >
              გაუქმება
            </button>
            <button
              onClick={() => deleteMutation.mutate(productToDelete.id)}
              disabled={deleteMutation.isPending}
              className="flex-1 py-4 px-6 bg-red-500 cursor-pointer hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {deleteMutation.isPending ? "იშლება..." : "კი, წაშალე"}
            </button>
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
}
