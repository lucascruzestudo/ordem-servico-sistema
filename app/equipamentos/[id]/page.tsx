"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getEquipamento, deleteEquipamento } from "@/lib/api/equipamentos"
import { listOrdens } from "@/lib/api/ordens-servico"
import type { Equipamento, OrdemServico } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useStorage } from "@/lib/hooks/use-storage"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function EquipamentoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const initialized = useStorage()
  const [equipamento, setEquipamento] = useState<Equipamento | null>(null)
  const [ordens, setOrdens] = useState<OrdemServico[]>([])

  useEffect(() => {
    if (!initialized) return
    loadData()
  }, [initialized, params.id])

  const loadData = () => {
    const equipRes = getEquipamento(params.id as string)
    if (equipRes.data) setEquipamento(equipRes.data)

    const ordensRes = listOrdens({ equipamento_id: params.id as string })
    if (ordensRes.data) setOrdens(ordensRes.data)
  }

  const handleDelete = () => {
    const result = deleteEquipamento(params.id as string)
    if (result.data?.success) {
      router.push("/equipamentos")
    } else {
      alert(result.erro || "Erro ao excluir equipamento")
    }
  }

  if (!initialized || !equipamento) {
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
        <div className="flex items-center gap-4">
          <Link href="/equipamentos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{equipamento.nome}</h1>
            <p className="text-muted-foreground">Detalhes do equipamento</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/equipamentos/${equipamento.id}/editar`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Equipment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Equipamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{equipamento.nome}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Marca</p>
              <p className="font-medium">{equipamento.marca}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Modelo</p>
              <p className="font-medium">{equipamento.modelo}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Número de Série</p>
              <p className="font-medium">{equipamento.sn}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Ordens de Serviço ({ordens.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {ordens.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Nenhuma ordem de serviço encontrada</p>
          ) : (
            <div className="space-y-2">
              {ordens.map((ordem) => (
                <Link
                  key={ordem.id}
                  href={`/ordens/${ordem.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                >
                  <div>
                    <p className="font-medium">{ordem.id}</p>
                    <p className="text-sm text-muted-foreground">{ordem.motivo_chamado}</p>
                  </div>
                  <Badge variant="outline">{ordem.status_servico}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
