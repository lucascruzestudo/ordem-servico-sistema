"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FileText, Users, Wrench, Building2, Settings, X, Search, Sun, Moon, CloudUpload } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/lib/theme-provider"
import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { storage } from "@/lib/storage"
import { gistService } from "@/lib/gist-service"
import { useToast } from "@/lib/toast-provider"

const navItems = [
  { href: "/", label: "Dashboard", icon: FileText },
  { href: "/ordens", label: "Ordens de Serviço", icon: FileText },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/equipamentos", label: "Equipamentos", icon: Wrench },
  { href: "/empresa", label: "Empresa", icon: Building2 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

interface NavigationProps {
  onClose?: () => void
}

export function Navigation({ onClose }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isGistConfigured, setIsGistConfigured] = useState(false)
  const { showToast } = useToast()

  const filteredNavItems = useMemo(() => {
    if (!searchQuery.trim()) return navItems

    const query = searchQuery.toLowerCase()
    return navItems.filter((item) => item.label.toLowerCase().includes(query))
  }, [searchQuery])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  useEffect(() => {
    const checkGistConfig = () => {
      const data = storage.getData()
      const gistConfig = data.settings?.gist
      setIsGistConfigured(!!(gistConfig?.gist_id && gistConfig?.token))
    }

    checkGistConfig()

    // Listen to storage events to update when Gist is configured
    const handleStorageChange = () => {
      checkGistConfig()
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const handleSaveToGist = async () => {
    try {
      setIsSaving(true)

      const data = storage.getData()
      const gistConfig = data.settings?.gist

      if (!gistConfig || !gistConfig.gist_id || !gistConfig.token) {
        showToast("Configure o GitHub Gist nas configurações primeiro", "error")
        setIsSaving(false)
        router.push("/configuracoes")
        if (onClose) onClose()
        return
      }

      const result = await gistService.pushToGist(gistConfig)

      if (result.success) {
        showToast(result.message, "success")
      } else {
        showToast(result.message, "error")
      }
    } catch (error) {
      showToast("Erro ao salvar no GitHub Gist", "error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">Menu</h2>
        <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg lg:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Pesquisar menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <nav className="flex flex-col gap-1 p-4 flex-1 overflow-auto">
        {filteredNavItems.length > 0 ? (
          filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })
        ) : (
          <div className="text-center text-sm text-muted-foreground py-8">Nenhum menu encontrado</div>
        )}

        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground mt-2 border-t pt-3"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {theme === "light" ? "Modo Escuro" : "Modo Claro"}
        </button>

        {isGistConfigured && (
          <button
            onClick={handleSaveToGist}
            disabled={isSaving}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isSaving && "opacity-50 cursor-not-allowed",
            )}
          >
            <CloudUpload className={cn("h-4 w-4", isSaving && "animate-pulse")} />
            {isSaving ? "Salvando..." : "Salvar Dados"}
          </button>
        )}
      </nav>
    </div>
  )
}
