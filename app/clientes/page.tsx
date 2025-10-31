"use client"

import { useEffect, useState } from "react"
import { listClientes, deleteCliente } from "@/lib/api/clientes"
import type { Cliente } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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

export default function ClientesPage() {
  const initialized = useStorage()
  const { showToast } = useToast()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!initialized) return
    loadData()
  }, [initialized])

  const loadData = () => {
    const result = listClientes()
    if (result.data) setClientes(result.data)
  }

  const handleDelete = (id: string) => {
    const result = deleteCliente(id)
    if (result.data?.success) {
      showToast("Cliente excluído com sucesso", "success")
      loadData()
    } else {
      showToast(result.erro || "Erro ao excluir cliente", "error")
    }
  }

  const filteredClientes = clientes.filter((cliente) => {
    const searchLower = search.toLowerCase()
    return (
      cliente.nome_fantasia.toLowerCase().includes(searchLower) ||
      cliente.razao_social.toLowerCase().includes(searchLower) ||
      cliente.email.toLowerCase().includes(searchLower) ||
      cliente.cpf.includes(search) ||
      cliente.cnpj.includes(search)
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
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes</p>
        </div>
        <Link href="/clientes/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, CPF ou CNPJ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <div className="space-y-3">
        {filteredClientes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum cliente encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredClientes.map((cliente) => (
            <Card key={cliente.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{cliente.nome_fantasia}</h3>
                      <Badge variant="outline">{cliente.tipo_cliente}</Badge>
                    </div>
                    {cliente.razao_social && <p className="text-sm text-muted-foreground">{cliente.razao_social}</p>}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Contato</p>
                        <p className="font-medium">{cliente.contato}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Telefone</p>
                        <p className="font-medium">{cliente.telefone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{cliente.email || "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          {cliente.tipo_cliente === "Pessoa Física" ? "CPF" : "CNPJ"}
                        </p>
                        <p className="font-medium">
                          {cliente.tipo_cliente === "Pessoa Física" ? cliente.cpf : cliente.cnpj}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/clientes/${cliente.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/clientes/${cliente.id}/editar`}>
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
                            Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(cliente.id)}>Excluir</AlertDialogAction>
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
