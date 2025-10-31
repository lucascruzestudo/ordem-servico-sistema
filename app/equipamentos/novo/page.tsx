"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createEquipamento } from "@/lib/api/equipamentos"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useStorage } from "@/lib/hooks/use-storage"
import { useToast } from "@/lib/toast-provider"

export default function NovoEquipamentoPage() {
  const router = useRouter()
  const initialized = useStorage()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    modelo: "",
    marca: "",
    sn: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = createEquipamento(formData)

    if (result.data) {
      showToast("Equipamento criado com sucesso", "success")
      router.push(`/equipamentos/${result.data.id}`)
    } else {
      showToast(result.erro || "Erro ao criar equipamento", "error")
    }

    setLoading(false)
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
        <Link href="/equipamentos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Novo Equipamento</h1>
          <p className="text-muted-foreground">Cadastre um novo equipamento</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Equipamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Equipamento *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                placeholder="Ex: Ar Condicionado Split"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                required
                placeholder="Ex: LG"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                required
                placeholder="Ex: Split 12000 BTUs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sn">Número de Série *</Label>
              <Input
                id="sn"
                value={formData.sn}
                onChange={(e) => setFormData({ ...formData, sn: e.target.value })}
                required
                placeholder="Ex: SN123456789"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/equipamentos">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Criando..." : "Criar Equipamento"}
          </Button>
        </div>
      </form>
    </div>
  )
}
