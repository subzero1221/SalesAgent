"use client";

import { useState } from "react";
import Image from "next/image";
import { Sparkles, Settings2, Trash2 } from "lucide-react";
import InlineTextEdit from "./InlineTextEdit";
import PriceEdit from "./PriceEdit";

export default function ProductTableRow({
  product,
  onUpdateDetails,
  onUpdatePrice,
  onOpenStockModal,
  onDeleteClick,
}) {
  return (
    <tr className="hover:bg-gray-50/30 transition-all group">
      {/* 1. NAME EDIT */}
      <td className="px-10 py-8 align-top">
        <div className="flex flex-col gap-1.5">
          <InlineTextEdit
            value={product.name}
            label="სახელი"
            onSave={(val) =>
              onUpdateDetails({ id: product.id, updates: { name: val } })
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

      {/* 2. STOCK EDIT */}
      <td className="px-10 py-8 align-top">
        <div className="flex flex-col items-start gap-2">
          <div className="flex flex-wrap gap-1.5 max-w-[150px]">
            {product.stock && Object.keys(product.stock).length > 0 ? (
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
            onClick={() => onOpenStockModal(product)}
            className="flex items-center gap-1 text-[10px] cursor-pointer font-bold text-blue-500 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
          >
            <Settings2 size={12} /> რედაქტირება
          </button>
        </div>
      </td>

      {/* 3. VISUAL APPEARANCE & IMAGE */}
      <td className="px-10 py-8 max-w-[300px] align-top">
        <div className="flex gap-4 items-start">
          {/* Image Preview */}
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0 group">
            {product.product_image_url ? (
              <img
                src={product.product_image_url}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Sparkles className="w-5 h-5" />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <InlineTextEdit
              value={product.visual_appearance}
              isTextarea={true}
              label="ვიზუალი"
              onSave={(val) =>
                onUpdateDetails({
                  id: product.id,
                  updates: { visual_appearance: val },
                })
              }
            />
            {product.description && (
              <p className="text-[10px] text-gray-400 line-clamp-1 italic">
                {product.description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* 4. PRICE EDIT */}
      <td className="px-10 py-8 align-top">
        <div className="flex items-center gap-3 font-black text-2xl">
          <PriceEdit
            id={product.id}
            initialPrice={product.price || 0}
            onUpdate={onUpdatePrice}
          />
        </div>
      </td>

      {/* 5. DELETE */}
      <td className="px-10 py-8 text-right align-top">
        <button
          onClick={() => onDeleteClick(product)}
          className="p-4 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-[1.5rem] transition-all duration-300 cursor-pointer"
        >
          <Trash2 className="w-6 h-6" />
        </button>
      </td>
    </tr>
  );
}
