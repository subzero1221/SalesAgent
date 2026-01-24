import { useState } from "react";

// კომპონენტი ფასის სწრაფი შეცვლისთვის
export function PriceEdit({ id, initialPrice, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [price, setPrice] = useState(initialPrice);

  const handleSubmit = () => {
    if (price !== initialPrice && price>0) {
      onUpdate({ id, price: Number(price) });
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        autoFocus
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        className="w-20 bg-gray-50 border border-black rounded px-2 py-1 text-sm font-semibold outline-none"
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded transition-colors inline-block font-semibold text-gray-900"
    >
      {initialPrice} ₾
    </div>
  );
}
