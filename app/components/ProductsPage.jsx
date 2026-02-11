"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteProduct,
  getShopProducts,
  updateProductPrice,
  updateProductDetails,
} from "@/lib/services/productService";

import InlineTextEdit from "./InlineTextEdit";
import StockManagerModal from "./StockManagerModal";
import PriceEdit from "./PriceEdit";
import InfoBanner from "./InfoBanner";
import ConfirmModal from "./ConfirmModal";
import {
  Package,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  ArrowLeft,
  Settings2, // Setting Icon for stock
} from "lucide-react";
import { toast } from "sonner"; 
import PageSizeSelector from "./ProductsPageSizeSelector";

export default function ProductsPage({ shopId, userId }) {
  const [banner, setBanner] = useState(true);
  const [productToDelete, setProductToDelete] = useState(null);

  // Stock Modal State
  const [stockModalData, setStockModalData] = useState(null); // { id, stock, name }

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [isPageSizeOpen, setIsPageSizeOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["products", shopId, page, pageSize],
    queryFn: () => getShopProducts(shopId, page, pageSize),
    keepPreviousData: true,
  });

  const products = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // --- MUTATIONS ---

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", shopId] });

      toast.success("ნივთი წარმატებით წაიშალა! 🎉", {
        description: "ინვენტარი განახლებულია.",
      });

      setProductToDelete(null);
    },
    onError: (error) => {
      console.error("Delete Error:", error);
      toast.error("ვერ მოხერხდა წაშლა!", {
        description: "სცადეთ მოგვიანებით ან შეამოწმეთ ინტერნეტი.",
      });
    },
  });

  const updatePriceMutation = useMutation({
    mutationFn: ({ id, price }) => updateProductPrice(id, price),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["products", shopId] }),
  });

  // ახალი მუტაცია სახელის, ვიზუალის და სტოკისთვის
  const updateDetailsMutation = useMutation({
    mutationFn: ({ id, updates }) => updateProductDetails(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", shopId] });
      toast.success("ნივთი განახლდა! 🎉");
    },
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
        {/* HEADER ... (იგივე რჩება რაც შენს კოდში) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* ... Header Code Here ... */}
          <div className="flex items-center gap-5">
            <Link
              href={`/dashboard/user/${userId}/shop/${shopId}`}
              className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-gray-400 hover:text-black group shadow-sm"
            >
              <ArrowLeft
                size={24}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </Link>
            <h1 className="text-3xl font-black tracking-tighter text-gray-950 uppercase sans-serif ">
              ინვენტარი
            </h1>
          </div>
          {/* ... Page Size Dropdown ... */}
          <div className="flex items-center bg-white rounded-[2.2rem] border border-gray-100 shadow-2xl shadow-gray-200/60 p-1.5 transition-all">
            {/* ... existing code ... */}
            <PageSizeSelector
              pageSize={pageSize}
              setPageSize={setPageSize}
              setPage={setPage}
              totalCount={totalCount}
            />
          </div>
        </div>

        {banner && (
          <InfoBanner
            setBanner={setBanner}
            text="აქ არსებულ პროდუქტებს აგენტი ავტომატურად გამოიყენებს მომხარებელთან კომუნიკაციის დროს, დარწმუნდით რომ ნივთები ნამდვილად გაქვთ მარაგში."
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
                  ზომა/მარაგი
                </th>
                <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                  აღწერა/ვიზუალი
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
                  {/* 1. NAME EDIT */}
                  <td className="px-10 py-8 align-top">
                    <div className="flex flex-col gap-1.5">
                      <InlineTextEdit
                        value={product.name}
                        label="სახელი"
                        onSave={(val) =>
                          updateDetailsMutation.mutate({
                            id: product.id,
                            updates: { name: val },
                          })
                        }
                      />
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                          {product.brand || "BRAND"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 2. STOCK EDIT (MODAL TRIGGER) */}
                  <td className="px-10 py-8 align-top">
                    <div className="flex flex-col items-start gap-2">
                      <div className="flex flex-wrap gap-1.5 max-w-[150px]">
                        {product.stock &&
                        Object.keys(product.stock).length > 0 ? (
                          Object.keys(product.stock).map((size) => (
                            <span
                              key={size}
                              className="px-2 py-1 bg-gray-100 text-[10px] font-black rounded-md text-gray-600 border border-gray-200"
                            >
                              {size} ({product.stock[size]})
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] font-black text-gray-300 uppercase">
                            Empty
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setStockModalData(product)}
                        className="flex items-center gap-1 text-[10px] cursor-pointer font-bold text-blue-500 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Settings2 size={12} /> რედაქტირება
                      </button>
                    </div>
                  </td>

                  {/* 3. VISUAL APPEARANCE EDIT */}
                  <td className="px-10 py-8 max-w-[300px] align-top">
                    <div className="flex gap-3 items-start">
                      <Sparkles className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <InlineTextEdit
                          value={product.visual_appearance}
                          isTextarea={true}
                          label="ვიზუალი"
                          onSave={(val) =>
                            updateDetailsMutation.mutate({
                              id: product.id,
                              updates: { visual_appearance: val },
                            })
                          }
                        />
                      </div>
                    </div>
                  </td>

                  {/* 4. PRICE EDIT (EXISTING) */}
                  <td className="px-10 py-8 align-top">
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

                  {/* 5. DELETE */}
                  <td className="px-10 py-8 text-right align-top">
                    <button
                      onClick={() => setProductToDelete(product)}
                      className="p-4 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-[1.5rem] transition-all duration-300 cursor-pointer"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION (იგივე რჩება) */}
          <div className="px-10 py-8 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-300 mb-1">
                ამჟამად იმყოფებით
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-gray-400 uppercase">
                  გვერდი
                </span>
                <span className="text-xl font-black text-black leading-none">
                  {page}
                </span>
                <span className="text-gray-200">/</span>
                <span className="text-sm font-bold text-gray-400">
                  {totalPages}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-3.5 bg-white border border-gray-100 rounded-2xl disabled:opacity-20 hover:border-black transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-3.5 bg-white border border-gray-100 rounded-2xl disabled:opacity-20 hover:border-black transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Stock Manager Modal */}
      {stockModalData && (
        <StockManagerModal
          isOpen={!!stockModalData}
          onClose={() => setStockModalData(null)}
          initialStock={stockModalData.stock}
          productName={stockModalData.name}
          onSave={(newStock) =>
            updateDetailsMutation.mutate({
              id: stockModalData.id,
              updates: { stock: newStock },
            })
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        title="პროდუქტის წაშლა"
      >
        {/* ... Delete Modal Content ... */}
        <div className="p-6 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Trash2 className="w-9 h-9 text-red-500 stroke-[1.5]" />
          </div>
          <div className="space-y-4">
            <p className="text-2xl font-black text-black uppercase tracking-tight">
              ნამდვილად გსურთ წაშლა?
            </p>
            <p className="text-sm font-medium text-gray-500">
              {productToDelete?.name}
            </p>
          </div>
          <div className="flex gap-4 mt-10">
            <button
              onClick={() => setProductToDelete(null)}
              className="flex-1 py-4 bg-gray-100 rounded-2xl font-black uppercase text-[11px] tracking-widest text-gray-600 cursor-pointer"
            >
              გაუქმება
            </button>
            <button
              onClick={() => deleteMutation.mutate(productToDelete.id)}
              className="flex-1 py-4 bg-black text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-red-600 shadow-xl shadow-black/10 cursor-pointer"
            >
              კი, წაშალე
            </button>
          </div>
        </div>
      </ConfirmModal>
    </div>
  );
}
