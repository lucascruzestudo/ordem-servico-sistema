"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { OrdemServico, Cliente, Equipamento, StatusServico } from "@/lib/types"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface RecentOrdersProps {
  orders: OrdemServico[]
  clientes: Cliente[]
  equipamentos: Equipamento[]
}

const statusColors: Record<StatusServico, string> = {
  Aberto: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  "Em Andamento": "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  Concluído: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  Cancelado: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
}

export function RecentOrders({ orders, clientes, equipamentos }: RecentOrdersProps) {
  const getClienteName = (id: string) => clientes.find((c) => c.id === id)?.nome_fantasia || "N/A"
  const getEquipamentoNome = (id: string) => equipamentos.find((e) => e.id === id)?.nome || "N/A"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ordens Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.slice(0, 5).map((ordem) => (
            <Link
              key={ordem.id}
              href={`/ordens/${ordem.id}`}
              className="flex items-start justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{ordem.id}</p>
                  <Badge className={statusColors[ordem.status_servico]}>{ordem.status_servico}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{getClienteName(ordem.cliente_id)}</p>
                <p className="text-xs text-muted-foreground">{getEquipamentoNome(ordem.equipamento_id)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(ordem.data_os), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
