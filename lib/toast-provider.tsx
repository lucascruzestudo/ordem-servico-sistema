"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const showToast = React.useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, message, type }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg shadow-lg border animate-in slide-in-from-right",
              toast.type === "success" && "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
              toast.type === "error" && "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
              toast.type === "warning" && "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
              toast.type === "info" && "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
            )}
          >
            <p
              className={cn(
                "flex-1 text-sm font-medium",
                toast.type === "success" && "text-green-900 dark:text-green-100",
                toast.type === "error" && "text-red-900 dark:text-red-100",
                toast.type === "warning" && "text-yellow-900 dark:text-yellow-100",
                toast.type === "info" && "text-blue-900 dark:text-blue-100",
              )}
            >
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className={cn(
                "p-1 rounded hover:bg-black/10 dark:hover:bg-white/10",
                toast.type === "success" && "text-green-700 dark:text-green-300",
                toast.type === "error" && "text-red-700 dark:text-red-300",
                toast.type === "warning" && "text-yellow-700 dark:text-yellow-300",
                toast.type === "info" && "text-blue-700 dark:text-blue-300",
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
