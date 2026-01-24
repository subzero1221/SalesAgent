"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct, getShopProducts, updateProductPrice } from "@/lib/services/productService";
import { PriceEdit } from "./PriceEdit";
import InfoBanner from "./InfoBanner";
import { useState } from "react";


export default function ProductsPage({ shopId }) {
  const [banner, setBanner] = useState(true)  
  const queryClient = useQueryClient();
 

const { data: products, isLoading, error } = useQuery({
  queryKey: ["products", shopId],
  queryFn: () => getShopProducts(shopId), // ვიყენებთ შენს სერვისს
});

// 2. წაშლა
const deleteMutation = useMutation({
  mutationFn: (id) => deleteProduct(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["products", shopId] });
  },
});

const updatePriceMutation = useMutation({
  mutationFn: ({ id, price }) => updateProductPrice(id, price),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["products", shopId] });
  },
});

console.log(products)

  if (isLoading) return <div className="p-10 text-center">იტვირთება...</div>;
  if (error)
    return <div className="p-10 text-red-500">შეცდომა: {error.message}</div>;

  return (
    <div className="p-6 lg:p-12 bg-[#fafafa] min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* ... Header და სხვა ინფო ... */}
       {banner && <InfoBanner setBanner = {setBanner} text="დარწმუნდით, რომ პროდუქტები ნამდვილად გაქვთ მარაგში. აგენტი ავტომატურად გამოიყენებს ამ სიას კლიენტებთან საუბრისას და დაადასტურებს მათ არსებობას." />}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* აი აქ არის მთავარი ცვლილება: დაამატე <table> და <tbody> */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  პროდუქტი
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ფასი
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  მოქმედება
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products?.data.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4">
                    {/* ვიყენებთ PriceEdit კომპონენტს */}
                    <PriceEdit
                      id={product.id}
                      initialPrice={product.price}
                      onUpdate={(val) => updatePriceMutation.mutate(val)}
                    />
                    {updatePriceMutation.isPending &&
                      updatePriceMutation.variables?.id === product.id && (
                        <span className="ml-2 text-[10px] text-gray-400 animate-pulse">
                          ახლდება...
                        </span>
                      )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteMutation.mutate(product.id)}
                      className="text-red-500 p-2 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products?.length === 0 && (
            <div className="p-20 text-center text-gray-400">
              პროდუქტები არ არის
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
