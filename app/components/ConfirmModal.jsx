"use client";

export default function ConfirmModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4 transition-all">
      {/* Backdrop-ზე დაჭერით იხურება */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">{children}</div>
      </div>
    </div>
  );
}
