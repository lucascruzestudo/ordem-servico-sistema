"use client"

import { useEffect, useState } from "react"
import { listOrdens } from "@/lib/api/ordens-servico"
import { listClientes } from "@/lib/api/clientes"
import { listEquipamentos } from "@/lib/api/equipamentos"
import type { OrdemServico, Cliente, Equipamento } from "@/lib/types"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentOrders } from "@/components/dashboard/recent-orders"
import { FileText, Users, Wrench, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useStorage } from "@/lib/hooks/use-storage"

export default function DashboardPage() {
  const initialized = useStorage()
  const [ordens, setOrdens] = useState<OrdemServico[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])

  useEffect(() => {
    if (!initialized) return

    const ordensRes = listOrdens()
    const clientesRes = listClientes()
    const equipamentosRes = listEquipamentos()

    if (ordensRes.data) setOrdens(ordensRes.data)
    if (clientesRes.data) setClientes(clientesRes.data)
    if (equipamentosRes.data) setEquipamentos(equipamentosRes.data)
  }, [initialized])

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  // Calculate stats
  const ordensAbertas = ordens.filter((o) => o.status_servico === "Aberto").length
  const ordensEmAndamento = ordens.filter((o) => o.status_servico === "Em Andamento").length
  const totalReceita = ordens
    .filter((o) => o.status_servico === "Concluído")
    .reduce((sum, o) => sum + o.valor_visita + o.mao_de_obra + o.valor_material, 0)

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema</p>
        </div>
        <Link href="/ordens/nova">
          <Button>Nova Ordem de Serviço</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Ordens"
          value={ordens.length}
          description="Todas as ordens cadastradas"
          icon={FileText}
        />
        <StatsCard title="Ordens Abertas" value={ordensAbertas} description="Aguardando atendimento" icon={FileText} />
        <StatsCard title="Em Andamento" value={ordensEmAndamento} description="Sendo executadas" icon={FileText} />
        <StatsCard
          title="Receita Total"
          value={`R$ ${totalReceita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          description="Ordens concluídas"
          icon={DollarSign}
        />
      </div>

      {/* Charts and Recent Orders */}
      <RecentOrders orders={ordens} clientes={clientes} equipamentos={equipamentos} />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/clientes">
          <div className="p-6 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
            <Users className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-semibold">Clientes</h3>
            <p className="text-sm text-muted-foreground">{clientes.length} cadastrados</p>
          </div>
        </Link>
        <Link href="/equipamentos">
          <div className="p-6 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
            <Wrench className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-semibold">Equipamentos</h3>
            <p className="text-sm text-muted-foreground">{equipamentos.length} cadastrados</p>
          </div>
        </Link>
        <Link href="/empresa">
          <div className="p-6 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
            <FileText className="h-8 w-8 mb-2 text-primary" />
            <h3 className="font-semibold">Dados da Empresa</h3>
            <p className="text-sm text-muted-foreground">Configurar informações</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
