"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FileText, Users, Wrench, Building2, Settings, X, Search, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/lib/theme-provider"
import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"

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

  const filteredNavItems = useMemo(() => {
    if (!searchQuery.trim()) return navItems

    const query = searchQuery.toLowerCase()
    return navItems.filter((item) => item.label.toLowerCase().includes(query))
  }, [searchQuery])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  useEffect(() => {
    // currently only used for search debounce/logic; no side-effects needed
  }, [])

  // Gist save removed from sidebar per request

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

        {/* 'Salvar Dados' menu entry removed */}
      </nav>
    </div>
  )
}
