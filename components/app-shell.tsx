"use client"

import type React from "react"
import { Navigation } from "@/components/navigation"
import { Menu, Save } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { storage } from "@/lib/storage"
import { gistService } from "@/lib/gist-service"
import { Button } from "@/components/ui/button"

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

  // Estado para saber se há alterações não salvas
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSave, setShowSave] = useState(false)
  const lastSavedRef = useRef<string | null>(null)

  // Verifica se há configuração de gist salva
  function hasGistConfig() {
    const data = storage.getData()
    return !!(data.settings && data.settings.gist && data.settings.gist.gist_id && data.settings.gist.token && data.settings.gist.filename)
  }

  // Atualiza estado dirty ao mudar storage
  useEffect(() => {
    // Salva o snapshot inicial
    lastSavedRef.current = JSON.stringify(storage.getData())
    setDirty(false)
    setShowSave(hasGistConfig())
    // Subscreve mudanças
    const unsub = storage.onDataChange(() => {
      setShowSave(hasGistConfig())
      // Se não há gist config, não marca dirty
      if (!hasGistConfig()) {
        setDirty(false)
        return
      }
      // Compara snapshot salvo com atual
      const current = JSON.stringify(storage.getData())
      setDirty(current !== lastSavedRef.current)
    })
    return () => unsub()
  }, [])

  // Função para salvar no gist
  async function handleSaveGist() {
    setSaving(true)
    const data = storage.getData()
    const config = data.settings.gist
    if (!config) return
    const result = await gistService.pushToGist(config)
    if (result.success) {
      lastSavedRef.current = JSON.stringify(storage.getData())
      setDirty(false)
    } else {
      alert(result.message)
    }
    setSaving(false)
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
        <div className="p-6 border-b flex items-center gap-2">
          <h1 className="text-xl font-bold">Sistema OS</h1>
          <p className="text-sm text-muted-foreground ml-2">Ordens de Serviço</p>
          {showSave && dirty && (
            <Button size="sm" variant="outline" onClick={handleSaveGist} disabled={saving} title="Salvar no Gist">
              <Save className="w-4 h-4" />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          )}
        </div>
        <Navigation onClose={() => setSidebarOpen(false)} />
      </aside>

      <main className="flex-1 overflow-auto pt-16 lg:pt-0">{children}</main>
    </div>
  )
}
