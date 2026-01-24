import { Info, X } from "lucide-react";

export default function InfoBanner({ text, type = "info", setBanner }) {
  const styles = {
    info: "bg-blue-50 border-blue-100 text-blue-800",
    warning: "bg-amber-50 border-amber-100 text-amber-800",
  };

  const icons = {
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <Info className="w-5 h-5 text-amber-500" />, // შეგიძლია AlertCircle გამოიყენო აქ
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 p-3 px-4 rounded-2xl border ${styles[type]} mb-6 transition-all shadow-sm`}
    >
      {/* მარცხენა მხარე: აიქონი და ტექსტი */}
      <div className="flex items-center gap-3 flex-1">
        {icons[type]}
        <p className="text-sm font-semibold leading-none">{text}</p>
      </div>

      {/* მარჯვენა მხარე: პატარა Close ღილაკი */}
      <button
        onClick={() => setBanner(false)}
        className="p-1 hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
      >
        <X className="w-4 h-4 opacity-50 hover:opacity-100" />
      </button>
    </div>
  );
}
