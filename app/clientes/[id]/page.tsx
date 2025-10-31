"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getCliente, deleteCliente } from "@/lib/api/clientes"
import { listOrdens } from "@/lib/api/ordens-servico"
import type { Cliente, OrdemServico } from "@/lib/types"
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

export default function ClienteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const initialized = useStorage()
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [ordens, setOrdens] = useState<OrdemServico[]>([])

  useEffect(() => {
    if (!initialized) return
    loadData()
  }, [initialized, params.id])

  const loadData = () => {
    const clienteRes = getCliente(params.id as string)
    if (clienteRes.data) setCliente(clienteRes.data)

    const ordensRes = listOrdens({ cliente_id: params.id as string })
    if (ordensRes.data) setOrdens(ordensRes.data)
  }

  const handleDelete = () => {
    const result = deleteCliente(params.id as string)
    if (result.data?.success) {
      router.push("/clientes")
    } else {
      alert(result.erro || "Erro ao excluir cliente")
    }
  }

  if (!initialized || !cliente) {
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
          <Link href="/clientes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{cliente.nome_fantasia}</h1>
            <p className="text-muted-foreground">Detalhes do cliente</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/clientes/${cliente.id}/editar`}>
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
                  Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
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

      {/* Type Badge */}
      <Badge variant="outline" className="text-base px-4 py-1">
        {cliente.tipo_cliente}
      </Badge>

      {/* Main Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Nome Fantasia</p>
              <p className="font-medium">{cliente.nome_fantasia}</p>
            </div>
            {cliente.razao_social && (
              <div>
                <p className="text-sm text-muted-foreground">Razão Social</p>
                <p className="font-medium">{cliente.razao_social}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Contato</p>
              <p className="font-medium">{cliente.contato}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cliente.tipo_cliente === "Pessoa Física" ? (
              <>
                {cliente.cpf && (
                  <div>
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium">{cliente.cpf}</p>
                  </div>
                )}
                {cliente.rg && (
                  <div>
                    <p className="text-sm text-muted-foreground">RG</p>
                    <p className="font-medium">{cliente.rg}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {cliente.cnpj && (
                  <div>
                    <p className="text-sm text-muted-foreground">CNPJ</p>
                    <p className="font-medium">{cliente.cnpj}</p>
                  </div>
                )}
                {cliente.insc_estadual && (
                  <div>
                    <p className="text-sm text-muted-foreground">Inscrição Estadual</p>
                    <p className="font-medium">{cliente.insc_estadual}</p>
                  </div>
                )}
                {cliente.insc_municipal && (
                  <div>
                    <p className="text-sm text-muted-foreground">Inscrição Municipal</p>
                    <p className="font-medium">{cliente.insc_municipal}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Telefone Principal</p>
              <p className="font-medium">{cliente.telefone}</p>
            </div>
            {cliente.telefone2 && (
              <div>
                <p className="text-sm text-muted-foreground">Telefone 2</p>
                <p className="font-medium">{cliente.telefone2}</p>
              </div>
            )}
            {cliente.telefone3 && (
              <div>
                <p className="text-sm text-muted-foreground">Telefone 3</p>
                <p className="font-medium">{cliente.telefone3}</p>
              </div>
            )}
            {cliente.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{cliente.email}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="font-medium">
              {cliente.endereco}, {cliente.num_endereco}
            </p>
            <p className="text-muted-foreground">
              {cliente.bairro} - {cliente.cidade}/{cliente.estado}
            </p>
            <p className="text-muted-foreground">CEP: {cliente.cep}</p>
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
