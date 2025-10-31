"use client"

import type React from "react"
import { Navigation } from "@/components/navigation"
import { Menu } from "lucide-react"
import { useState } from "react"
import { usePathname } from "next/navigation"

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const isPrintPage = pathname?.includes("/imprimir")

  if (isPrintPage) {
    return <main className="min-h-screen">{children}</main>
  }

  return (
    <div className="flex min-h-screen">
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 rounded-lg bg-card border shadow-lg hover:bg-accent"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 border-r bg-card transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">Sistema OS</h1>
          <p className="text-sm text-muted-foreground">Ordens de Serviço</p>
        </div>
        <Navigation onClose={() => setSidebarOpen(false)} />
      </aside>

      <main className="flex-1 overflow-auto pt-16 lg:pt-0">{children}</main>
    </div>
  )
}
