"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteProduct,
  getShopProducts,
  updateProductPrice,
} from "@/lib/services/productService";
import PriceEdit from "./PriceEdit";
import InfoBanner from "./InfoBanner";
import ConfirmModal from "./ConfirmModal";
import {
  Package,
  Trash2,
  Sparkles,
  Tag,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Layers,
} from "lucide-react";

export default function ProductsPage({ shopId }) {
  const [banner, setBanner] = useState(true);
  const [productToDelete, setProductToDelete] = useState(null);

  console.log("Delete Product State:", productToDelete);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", shopId, page, pageSize],
    queryFn: () => getShopProducts(shopId, page, pageSize),
    keepPreviousData: true,
  });

  const products = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", shopId] });
      setProductToDelete(null);
    },
  });

  const updatePriceMutation = useMutation({
    mutationFn: ({ id, price }) => updateProductPrice(id, price),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["products", shopId] }),
  });

  if (isLoading)
    return (
      <div className="p-20 text-center space-y-4 font-black uppercase text-[10px] tracking-[0.3em] text-gray-400">
        <Package className="w-10 h-10 mx-auto animate-pulse text-gray-200 mb-4" />
        იტვირთება ინვენტარი...
      </div>
    );

  return (
    <div className="p-6 lg:p-12 bg-[#fafafa] min-h-screen text-black selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* --- HEADER & CUSTOM DROPDOWN --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl font-black tracking-tighter text-gray-950 uppercase">
              ინვენტარი
            </h1>
          </div>

          <div className="flex items-center bg-white rounded-[2.2rem] border border-gray-100 shadow-2xl shadow-gray-200/60 p-1.5 transition-all">
            <div className="px-8 py-2 border-r border-gray-100 flex flex-col items-center justify-center min-w-[110px]">
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-300 leading-none mb-1.5">
                სულ
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-black leading-none">
                  {totalCount}
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                  ნივთი
                </span>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsPageSizeOpen(!isPageSizeOpen)}
                className="px-8 py-3.5 flex items-center cursor-pointer gap-4 hover:bg-gray-50 rounded-[1.8rem] transition-all group"
              >
                <span className="text-base font-black text-black uppercase tracking-tight">
                  {pageSize} პროდუქტი
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-300 transition-transform duration-500 ${isPageSizeOpen ? "rotate-180 text-black" : ""}`}
                />
              </button>

              {isPageSizeOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsPageSizeOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-44 bg-white rounded-[1.8rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-50 p-2 z-30 animate-in fade-in slide-in-from-top-2 duration-300">
                    {[20, 50, 100].map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setPageSize(size);
                          setPage(1);
                          setIsPageSizeOpen(false);
                        }}
                        className={`w-full cursor-pointer px-5 py-3.5 text-left text-xs font-black rounded-2xl transition-all flex items-center justify-between ${
                          pageSize === size
                            ? "bg-black text-white"
                            : "hover:bg-gray-50 text-gray-400 hover:text-black"
                        }`}
                      >
                        {size} პროდუქტი
                        {pageSize === size && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {banner && (
          <InfoBanner
            setBanner={setBanner}
            text="აგენტი ამ მონაცემებს იყენებს კლიენტებთან საუბრისას. რაც უფრო ზუსტია აღწერა, მით უფრო კარგად ყიდის აგენტი!"
          />
        )}

        {/* --- TABLE SECTION --- */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/30 border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                  პროდუქტი
                </th>
                <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                  ზომა/მოცულობა
                </th>
                <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                  აღწერა
                </th>
                <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                  ფასი
                </th>
                <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 text-right">
                  მოქმედება
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50/30 transition-all group"
                >
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xl font-black text-black leading-tight uppercase tracking-tighter">
                        {product.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                          {product.brand || "LACOSTE"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* --- STOCK SIZES RENDER --- */}
                  <td className="px-10 py-8">
                    <div className="flex flex-wrap gap-1.5 max-w-[150px]">
                      {product.stock && typeof product.stock === "object" ? (
                        Object.keys(product.stock).map((size) => (
                          <span
                            key={size}
                            className="px-2 py-1 bg-gray-100 text-[10px] font-black rounded-md text-gray-600 border border-gray-200"
                          >
                            {size}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] font-black text-gray-300 uppercase">
                          Empty
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-10 py-8 max-w-[300px]">
                    <div className="flex gap-3 items-start flex-wrap">
                      <Sparkles className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        {product.visual_appearance ||
                          product.description ||
                          "აღწერა არ არის..."}
                      </p>
                      <p className="text-sm text-gray-600 leading-relaxed font-medium">
                        {
                          product.description ||
                          "აღწერა არ არის..."}
                      </p>
                    </div>
                  </td>

                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3 font-black text-2xl">
                      <PriceEdit
                        id={product.id}
                        initialPrice={product.price || 0}
                        onUpdate={(val) => updatePriceMutation.mutate(val)}
                      />
                      {updatePriceMutation.isPending && (
                        <span className="text-[10px] bg-black text-white px-2 py-1 rounded font-black animate-pulse">
                          ...
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-10 py-8 text-right">
                    <button
                      onClick={() =>
                        setProductToDelete({
                          id: product.id,
                          name: product.name,
                          visual_appearance: product?.visual_appearance,
                        })
                      }
                      className="p-4 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-[1.5rem] transition-all duration-300 cursor-pointer"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* --- PAGINATION FOOTER --- */}
          {totalPages > 1 && (
            <div className="px-10 py-8 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
                  გვერდი
                </span>
                <span className="text-lg font-black text-black">{page}</span>
                <span className="text-gray-200 mx-1">/</span>
                <span className="text-sm font-bold text-gray-400">
                  {totalPages}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-3.5 bg-white border border-gray-100 rounded-2xl disabled:opacity-20 hover:border-black transition-all shadow-sm cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-3.5 bg-white border border-gray-100 rounded-2xl disabled:opacity-20 hover:border-black transition-all shadow-sm cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="პროდუქტის წაშლა"
      >
        <div className="p-6 text-center">
          {/* Icon with subtle red background */}
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Trash2 className="w-9 h-9 text-red-500 stroke-[1.5]" />
          </div>

          {/* Text Content - Clear & Readable */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
              პროდუქტის წაშლა
            </h3>

            <div className="space-y-2">
              <p className="text-2xl font-black text-black uppercase tracking-tight">
                ნამდვილად გსურთ წაშლა?
              </p>

              {/* Product Highlight */}
              <p className="text-sm font-medium text-gray-500">
                თქვენ შლით:{" "}
                <span className="font-black text-black italic">
                  {productToDelete?.name}
                </span>
                <span className="font-black text-black italic">
                  {productToDelete?.visual_appearance
                    ? ` - ${productToDelete.visual_appearance}`
                    : ""}
                </span>
              </p>
            </div>
          </div>

          {/* Balanced Buttons */}
          <div className="flex gap-4 mt-10">
            <button
              onClick={() => setProductToDelete(null)}
              className="flex-1 py-4 bg-gray-100 rounded-2xl font-black uppercase text-[11px] tracking-widest text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
            >
              გაუქმება
            </button>

            <button
              onClick={() => deleteMutation.mutate(productToDelete.id)}
              className="flex-1 py-4 bg-black text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-red-600 shadow-xl shadow-black/10 transition-all cursor-pointer"
            >
              კი, წაშალე
            </button>
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
}
