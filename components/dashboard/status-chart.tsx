"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { OrdemServico, StatusServico } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface StatusChartProps {
  orders: OrdemServico[]
}

const STATUS_COLORS: Record<StatusServico, string> = {
  "Aguardando Peças": "hsl(var(--chart-1))",
  "Em Andamento": "hsl(var(--chart-2))",
  "Aguardando Aprovação": "hsl(var(--chart-3))",
  Concluído: "hsl(var(--chart-4))",
  Cancelado: "hsl(var(--chart-5))",
}

export function StatusChart({ orders }: StatusChartProps) {
  const statusCounts = orders.reduce(
    (acc, ordem) => {
      acc[ordem.status_servico] = (acc[ordem.status_servico] || 0) + 1
      return acc
    },
    {} as Record<StatusServico, number>,
  )

  const data = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    quantidade: count,
  }))

  const sortedData = [...data].sort((a, b) => a.quantidade - b.quantidade)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ordens por Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sortedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="status" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Bar dataKey="quantidade" radius={[4, 4, 0, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status as StatusServico]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
