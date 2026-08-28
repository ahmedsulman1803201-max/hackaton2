import { useCallback, useState } from "react";
import { FiCheck, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";
import { ToastContext } from "./toastContextBase";
const ICONS = {
  success: FiCheck,
  error: FiAlertCircle,
  info: FiInfo,
};

const STYLES = {
  success: "bg-emerald-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-brand-600 text-white",
};

const ToastContainer = ({ toasts, remove }) => (
  <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
    {toasts.map((t) => {
      const Icon = ICONS[t.type] || FiInfo;
      return (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg animate-slide-up ${STYLES[t.type]}`}
        >
          <Icon size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm font-medium flex-1">{t.message}</p>
          <button onClick={() => remove(t.id)} className="shrink-0 opacity-80 hover:opacity-100">
            <FiX size={16} />
          </button>
        </div>
      );
    })}
  </div>
);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message, type = "info", duration = 3500) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => remove(id), duration);
  }, [remove]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} remove={remove} />
    </ToastContext.Provider>
  );
};
