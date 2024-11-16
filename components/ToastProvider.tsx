"use client";

import React, { createContext, useContext, useState } from "react";

const ToastContext = createContext<any>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | null }>({
    message: "",
    type: null,
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: null }), 3000); // Auto-dismiss after 3 seconds
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast.type && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-md shadow-lg transition ${
            toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
