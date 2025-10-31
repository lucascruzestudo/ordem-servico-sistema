"use client"

import { useState, useEffect } from "react"
import { storage } from "@/lib/storage"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useStorage } from "@/lib/hooks/use-storage"
import { Settings, Download, Upload, RotateCcw, Cloud, CloudUpload, CloudDownload } from "lucide-react"
import { useRouter } from "next/navigation"
import { gistService, type GistConfig } from "@/lib/gist-service"
import { useToast } from "@/lib/toast-provider"

export default function ConfiguracoesPage() {
  const initialized = useStorage()
  const router = useRouter()
  const { showToast } = useToast()
  const [importing, setImporting] = useState(false)

  const [gistConfig, setGistConfig] = useState<GistConfig>({
    gist_id: "",
    token: "",
    filename: "data.json",
  })
  const [gistLoading, setGistLoading] = useState(false)

  useEffect(() => {
    if (initialized) {
      const data = storage.getData()
      if (data.settings.gist) {
        setGistConfig(data.settings.gist)
      }
    }
  }, [initialized])

  const handleExport = () => {
    const data = storage.exportData()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `backup-ordens-servico-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast("Dados exportados com sucesso!", "success")
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setImporting(true)
      const text = await file.text()
      const result = storage.importData(text)

      if (result.success) {
        showToast(
          `Dados importados com sucesso! Ordens: ${result.stats?.ordens}, Clientes: ${result.stats?.clientes}, Equipamentos: ${result.stats?.equipamentos}`,
          "success",
        )
        router.refresh()
      } else {
        showToast(result.message, "error")
      }
      setImporting(false)
    }
    input.click()
  }

  const handleReset = () => {
    if (
      confirm(
        "Tem certeza que deseja resetar todos os dados? Esta ação não pode ser desfeita.\n\nTodos os dados serão substituídos pelos dados de exemplo.",
      )
    ) {
      storage.resetToSeedData()
      showToast("Dados resetados com sucesso!", "success")
      router.refresh()
    }
  }

  const handleSaveGistConfig = () => {
    const data = storage.getData()
    data.settings.gist = gistConfig

    // Save to localStorage
    if (typeof window !== "undefined") {
      const STORAGE_KEY = "service_order_system_data"
      const STORAGE_VERSION = "1.0.0"
      const toStore = {
        version: STORAGE_VERSION,
        data: data,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
    }

    showToast("Configuração do Gist salva com sucesso!", "success")
  }

  const handlePushToGist = async () => {
    setGistLoading(true)
    const result = await gistService.pushToGist(gistConfig)
    setGistLoading(false)

    if (result.success) {
      showToast(result.message, "success")
    } else {
      showToast(result.message, "error")
    }
  }

  const handlePullFromGist = async () => {
    if (!confirm("Tem certeza que deseja importar dados do Gist? Os dados atuais serão substituídos.")) {
      return
    }

    setGistLoading(true)
    const result = await gistService.pullFromGist(gistConfig)
    setGistLoading(false)

    if (result.success) {
      showToast(
        `${result.message} Ordens: ${result.stats?.ordens}, Clientes: ${result.stats?.clientes}, Equipamentos: ${result.stats?.equipamentos}`,
        "success",
      )
      router.refresh()
    } else {
      showToast(result.message, "error")
    }
  }

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Settings className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Sincronização com GitHub Gist
          </CardTitle>
          <CardDescription>Configure o backup automático dos seus dados em um GitHub Gist</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="gist_id">ID do Gist</Label>
              <Input
                id="gist_id"
                placeholder="Ex: abc123def456..."
                value={gistConfig.gist_id}
                onChange={(e) => setGistConfig({ ...gistConfig, gist_id: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Encontre o ID na URL do seu Gist: gist.github.com/username/<strong>ID</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Token de Acesso</Label>
              <Input
                id="token"
                type="password"
                placeholder="ghp_..."
                value={gistConfig.token}
                onChange={(e) => setGistConfig({ ...gistConfig, token: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Crie um token em: Settings → Developer settings → Personal access tokens → Tokens (classic)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filename">Nome do Arquivo</Label>
              <Input
                id="filename"
                placeholder="data.json"
                value={gistConfig.filename}
                onChange={(e) => setGistConfig({ ...gistConfig, filename: e.target.value })}
              />
            </div>

            <Button onClick={handleSaveGistConfig} variant="outline" className="w-full bg-transparent">
              Salvar Configuração
            </Button>
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Enviar para Gist</h3>
                <p className="text-sm text-muted-foreground">Fazer backup dos dados atuais no GitHub Gist</p>
              </div>
              <Button
                onClick={handlePushToGist}
                variant="outline"
                disabled={gistLoading || !gistConfig.gist_id || !gistConfig.token}
              >
                <CloudUpload className="h-4 w-4 mr-2" />
                {gistLoading ? "Enviando..." : "Enviar"}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Buscar do Gist</h3>
                <p className="text-sm text-muted-foreground">Restaurar dados do backup no GitHub Gist</p>
              </div>
              <Button
                onClick={handlePullFromGist}
                variant="outline"
                disabled={gistLoading || !gistConfig.gist_id || !gistConfig.token}
              >
                <CloudDownload className="h-4 w-4 mr-2" />
                {gistLoading ? "Buscando..." : "Buscar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Dados</CardTitle>
          <CardDescription>Exporte, importe ou resete os dados do sistema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Exportar Dados</h3>
              <p className="text-sm text-muted-foreground">Faça backup de todos os dados em formato JSON</p>
            </div>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">Importar Dados</h3>
              <p className="text-sm text-muted-foreground">Restaure dados de um arquivo de backup</p>
            </div>
            <Button onClick={handleImport} variant="outline" disabled={importing}>
              <Upload className="h-4 w-4 mr-2" />
              {importing ? "Importando..." : "Importar"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/50">
            <div>
              <h3 className="font-semibold text-destructive">Resetar Dados</h3>
              <p className="text-sm text-muted-foreground">Apaga todos os dados e restaura os dados de exemplo</p>
            </div>
            <Button onClick={handleReset} variant="destructive">
              <RotateCcw className="h-4 w-4 mr-2" />
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Versão</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Armazenamento</span>
            <span className="font-medium">LocalStorage</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Modo</span>
            <span className="font-medium">Usuário Único</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
