"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { getEmpresa, updateEmpresa } from "@/lib/api/empresa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useStorage } from "@/lib/hooks/use-storage"
import { useToast } from "@/lib/toast-provider"
import { Building2 } from "lucide-react"

export default function EmpresaPage() {
  const initialized = useStorage()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    endereco: "",
    telefone: "",
    logo: "",
    email: "",
    site: "",
    politicas_garantia: "",
  })

  useEffect(() => {
    if (!initialized) return

    const result = getEmpresa()
    if (result.data) {
      setFormData(result.data)
    }
  }, [initialized])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = updateEmpresa(formData)

    if (result.data) {
      const reloadedData = getEmpresa()

      if (reloadedData.data) {
        setFormData(reloadedData.data)
      }

      showToast("Dados da empresa salvos com sucesso", "success")
    } else {
      showToast(result.erro || "Erro ao salvar dados da empresa", "error")
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
        <Building2 className="h-10 w-10 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Dados da Empresa</h1>
          <p className="text-muted-foreground">Configure as informações da sua empresa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Empresa *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                placeholder="Ex: TechService Assistência Técnica"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                required
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço Completo *</Label>
              <Input
                id="endereco"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                required
                placeholder="Rua, número, bairro, cidade, estado, CEP"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                required
                placeholder="(00) 0000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@empresa.com.br"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site">Website</Label>
              <Input
                id="site"
                value={formData.site}
                onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                placeholder="www.empresa.com.br"
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle>Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo">URL da Logo (opcional)</Label>
              <Input
                id="logo"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://exemplo.com/logo.png"
              />
              <p className="text-xs text-muted-foreground">
                Cole a URL de uma imagem ou deixe em branco para usar apenas o nome da empresa
              </p>
            </div>
            {formData.logo && (
              <div className="border rounded-lg p-4 flex items-center justify-center bg-muted">
                <img src={formData.logo || "/placeholder.svg"} alt="Logo" className="max-h-24 object-contain" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Políticas de Garantia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="politicas_garantia">Termos de Garantia</Label>
              <Textarea
                id="politicas_garantia"
                value={formData.politicas_garantia}
                onChange={(e) => setFormData({ ...formData, politicas_garantia: e.target.value })}
                placeholder="Ex: Garantia de 90 dias para serviços executados e peças substituídas..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Este texto será exibido no rodapé das ordens de serviço impressas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Dados"}
          </Button>
        </div>
      </form>
    </div>
  )
}
