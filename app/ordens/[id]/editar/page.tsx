"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getOrdem, updateOrdem } from "@/lib/api/ordens-servico"
import { listClientes } from "@/lib/api/clientes"
import { listEquipamentos } from "@/lib/api/equipamentos"
import type { Cliente, Equipamento, TipoOrdem, StatusServico } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useStorage } from "@/lib/hooks/use-storage"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/lib/toast-provider"

export default function EditarOrdemPage() {
  const params = useParams()
  const router = useRouter()
  const initialized = useStorage()
  const { showToast } = useToast()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tipo_ordem: "Manutenção" as TipoOrdem,
    data_os: "",
    data_chamado: "",
    motivo_chamado: "",
    constatado: "",
    serv_executado: "",
    status_servico: "Aberto" as StatusServico,
    observacao: "",
    tipo_material: "",
    material: "",
    valor_visita: 0,
    mao_de_obra: 0,
    valor_material: 0,
    unit_km: 2.5,
    km_inicial: 0,
    km_final: 0,
    cliente_id: "",
    equipamento_id: "",
  })

  useEffect(() => {
    if (!initialized) return

    const clientesRes = listClientes()
    const equipamentosRes = listEquipamentos()

    if (clientesRes.data) setClientes(clientesRes.data)
    if (equipamentosRes.data) setEquipamentos(equipamentosRes.data)

    // Load ordem data
    const ordemRes = getOrdem(params.id as string)
    if (ordemRes.data) {
      const ordem = ordemRes.data
      setFormData({
        tipo_ordem: ordem.tipo_ordem,
        data_os: ordem.data_os.split("T")[0],
        data_chamado: ordem.data_chamado.split("T")[0],
        motivo_chamado: ordem.motivo_chamado,
        constatado: ordem.constatado,
        serv_executado: ordem.serv_executado,
        status_servico: ordem.status_servico,
        observacao: ordem.observacao,
        tipo_material: ordem.tipo_material,
        material: ordem.material,
        valor_visita: ordem.valor_visita,
        mao_de_obra: ordem.mao_de_obra,
        valor_material: ordem.valor_material,
        unit_km: ordem.unit_km,
        km_inicial: ordem.km_inicial,
        km_final: ordem.km_final,
        cliente_id: ordem.cliente_id,
        equipamento_id: ordem.equipamento_id,
      })
    }
  }, [initialized, params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = updateOrdem(params.id as string, formData)

    if (result.data) {
      showToast("Ordem de serviço atualizada com sucesso", "success")
      router.push(`/ordens/${params.id}`)
    } else {
      showToast(result.erro || "Erro ao atualizar ordem", "error")
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
        <Link href={`/ordens/${params.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Editar Ordem de Serviço</h1>
          <p className="text-muted-foreground">Atualize os dados da ordem</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipo_ordem">Tipo de Ordem *</Label>
                <Select
                  value={formData.tipo_ordem}
                  onValueChange={(value) => setFormData({ ...formData, tipo_ordem: value as TipoOrdem })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Instalação">Instalação</SelectItem>
                    <SelectItem value="Manutenção">Manutenção</SelectItem>
                    <SelectItem value="Reparo">Reparo</SelectItem>
                    <SelectItem value="Revisão">Revisão</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status_servico">Status *</Label>
                <Select
                  value={formData.status_servico}
                  onValueChange={(value) => setFormData({ ...formData, status_servico: value as StatusServico })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aberto">Aberto</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                    <SelectItem value="Cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_os">Data da OS *</Label>
                <Input
                  id="data_os"
                  type="date"
                  value={formData.data_os}
                  onChange={(e) => setFormData({ ...formData, data_os: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_chamado">Data do Chamado *</Label>
                <Input
                  id="data_chamado"
                  type="date"
                  value={formData.data_chamado}
                  onChange={(e) => setFormData({ ...formData, data_chamado: e.target.value })}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cliente e Equipamento */}
        <Card>
          <CardHeader>
            <CardTitle>Cliente e Equipamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cliente_id">Cliente *</Label>
                <Select
                  value={formData.cliente_id}
                  onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome_fantasia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipamento_id">Equipamento *</Label>
                <Select
                  value={formData.equipamento_id}
                  onValueChange={(value) => setFormData({ ...formData, equipamento_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipamentos.map((equip) => (
                      <SelectItem key={equip.id} value={equip.id}>
                        {equip.nome} - {equip.marca}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="motivo_chamado">Motivo do Chamado *</Label>
              <Textarea
                id="motivo_chamado"
                value={formData.motivo_chamado}
                onChange={(e) => setFormData({ ...formData, motivo_chamado: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="constatado">Constatado</Label>
              <Textarea
                id="constatado"
                value={formData.constatado}
                onChange={(e) => setFormData({ ...formData, constatado: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serv_executado">Serviço Executado</Label>
              <Textarea
                id="serv_executado"
                value={formData.serv_executado}
                onChange={(e) => setFormData({ ...formData, serv_executado: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacao">Observações</Label>
              <Textarea
                id="observacao"
                value={formData.observacao}
                onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Materials */}
        <Card>
          <CardHeader>
            <CardTitle>Materiais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_material">Tipo de Material</Label>
              <Input
                id="tipo_material"
                value={formData.tipo_material}
                onChange={(e) => setFormData({ ...formData, tipo_material: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="material">Material Utilizado</Label>
              <Textarea
                id="material"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Valores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="valor_visita">Valor da Visita (R$)</Label>
                <Input
                  id="valor_visita"
                  type="number"
                  step="0.01"
                  value={formData.valor_visita}
                  onChange={(e) => setFormData({ ...formData, valor_visita: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mao_de_obra">Mão de Obra (R$)</Label>
                <Input
                  id="mao_de_obra"
                  type="number"
                  step="0.01"
                  value={formData.mao_de_obra}
                  onChange={(e) => setFormData({ ...formData, mao_de_obra: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor_material">Valor do Material (R$)</Label>
                <Input
                  id="valor_material"
                  type="number"
                  step="0.01"
                  value={formData.valor_material}
                  onChange={(e) => setFormData({ ...formData, valor_material: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kilometers */}
        <Card>
          <CardHeader>
            <CardTitle>Quilometragem</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="km_inicial">KM Inicial</Label>
                <Input
                  id="km_inicial"
                  type="number"
                  value={formData.km_inicial}
                  onChange={(e) => setFormData({ ...formData, km_inicial: Number.parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="km_final">KM Final</Label>
                <Input
                  id="km_final"
                  type="number"
                  value={formData.km_final}
                  onChange={(e) => setFormData({ ...formData, km_final: Number.parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_km">Valor por KM (R$)</Label>
                <Input
                  id="unit_km"
                  type="number"
                  step="0.01"
                  value={formData.unit_km}
                  onChange={(e) => setFormData({ ...formData, unit_km: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href={`/ordens/${params.id}`}>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  )
}
