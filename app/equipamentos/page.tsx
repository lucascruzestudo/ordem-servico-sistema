"use client"

import { useEffect, useState } from "react"
import { listEquipamentos, deleteEquipamento } from "@/lib/api/equipamentos"
import type { Equipamento } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Search, Plus, Eye, Edit, Trash2 } from "lucide-react"
import { useStorage } from "@/lib/hooks/use-storage"
import { useToast } from "@/lib/toast-provider"
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

export default function EquipamentosPage() {
  const initialized = useStorage()
  const { showToast } = useToast()
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!initialized) return
    loadData()
  }, [initialized])

  const loadData = () => {
    const result = listEquipamentos()
    if (result.data) setEquipamentos(result.data)
  }

  const handleDelete = (id: string) => {
    const result = deleteEquipamento(id)
    if (result.data?.success) {
      showToast("Equipamento excluído com sucesso", "success")
      loadData()
    } else {
      showToast(result.erro || "Erro ao excluir equipamento", "error")
    }
  }

  const filteredEquipamentos = equipamentos.filter((equip) => {
    const searchLower = search.toLowerCase()
    return (
      equip.nome.toLowerCase().includes(searchLower) ||
      equip.modelo.toLowerCase().includes(searchLower) ||
      equip.marca.toLowerCase().includes(searchLower) ||
      equip.sn.toLowerCase().includes(searchLower)
    )
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
          <h1 className="text-3xl font-bold">Equipamentos</h1>
          <p className="text-muted-foreground">Gerencie seus equipamentos</p>
        </div>
        <Link href="/equipamentos/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Equipamento
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, marca, modelo ou número de série..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Equipment List */}
      <div className="space-y-3">
        {filteredEquipamentos.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum equipamento encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredEquipamentos.map((equip) => (
            <Card key={equip.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold text-lg">{equip.nome}</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Marca</p>
                        <p className="font-medium">{equip.marca}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Modelo</p>
                        <p className="font-medium">{equip.modelo}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Número de Série</p>
                        <p className="font-medium">{equip.sn}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/equipamentos/${equip.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/equipamentos/${equip.id}/editar`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
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
                          <AlertDialogAction onClick={() => handleDelete(equip.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
