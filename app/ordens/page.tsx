"use client"

import { useEffect, useState } from "react"
import { listOrdens } from "@/lib/api/ordens-servico"
import { listClientes } from "@/lib/api/clientes"
import { listEquipamentos } from "@/lib/api/equipamentos"
import type { OrdemServico, Cliente, Equipamento, StatusServico } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Search, Plus, Eye } from "lucide-react"
import { useStorage } from "@/lib/hooks/use-storage"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const statusColors: Record<StatusServico, string> = {
  Aberto: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  "Em Andamento": "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  Concluído: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  Cancelado: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
}

export default function OrdensPage() {
  const initialized = useStorage()
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (!initialized) return
    loadData()
  }, [initialized])

  const loadData = () => {
    const ordensRes = listOrdens()
    const clientesRes = listClientes()
    const equipamentosRes = listEquipamentos()

    if (ordensRes.data) setOrdens(ordensRes.data)
    if (clientesRes.data) setClientes(clientesRes.data)
    if (equipamentosRes.data) setEquipamentos(equipamentosRes.data)
  }

  const getClienteName = (id: string) => clientes.find((c) => c.id === id)?.nome_fantasia || "N/A"
  const getEquipamentoNome = (id: string) => equipamentos.find((e) => e.id === id)?.nome || "N/A"

  const filteredOrdens = ordens.filter((ordem) => {
    const matchesSearch =
      ordem.id.toLowerCase().includes(search.toLowerCase()) ||
      ordem.motivo_chamado.toLowerCase().includes(search.toLowerCase()) ||
      getClienteName(ordem.cliente_id).toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === "all" || ordem.status_servico === statusFilter

    return matchesSearch && matchesStatus
  })

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ordens de Serviço</h1>
          <p className="text-muted-foreground">Gerencie todas as ordens de serviço</p>
        </div>
        <Link href="/ordens/nova">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Ordem
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, cliente ou motivo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Aberto">Aberto</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrdens.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhuma ordem encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrdens.map((ordem) => (
            <Card key={ordem.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{ordem.id}</h3>
                      <Badge className={statusColors[ordem.status_servico]}>{ordem.status_servico}</Badge>
                      <Badge variant="outline">{ordem.tipo_ordem}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Cliente</p>
                        <p className="font-medium">{getClienteName(ordem.cliente_id)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Equipamento</p>
                        <p className="font-medium">{getEquipamentoNome(ordem.equipamento_id)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Data da OS</p>
                        <p className="font-medium">{format(new Date(ordem.data_os), "dd/MM/yyyy", { locale: ptBR })}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor Total</p>
                        <p className="font-medium">
                          R${" "}
                          {(ordem.valor_visita + ordem.mao_de_obra + ordem.valor_material).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{ordem.motivo_chamado}</p>
                  </div>
                  <Link href={`/ordens/${ordem.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
