"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getOrdem, deleteOrdem, updateOrdem } from "@/lib/api/ordens-servico"
import { getEmpresa } from "@/lib/api/empresa"
import { getCliente } from "@/lib/api/clientes"
import { getEquipamento } from "@/lib/api/equipamentos"
import type { OrdemServico, Cliente, Equipamento, StatusServico } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Trash2, Printer } from "lucide-react"
import Link from "next/link"
import { useStorage } from "@/lib/hooks/use-storage"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
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
import { useToast } from "@/lib/toast-provider"
import SignaturePad from "@/components/signature-pad"

const statusColors: Record<StatusServico, string> = {
  Aberto: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  "Em Andamento": "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  Concluído: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
  Cancelado: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
}

export default function OrdemDetailPage() {
  const params = useParams()
  const router = useRouter()
  const initialized = useStorage()
  const { showToast } = useToast()
  const [ordem, setOrdem] = useState<OrdemServico | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [equipamento, setEquipamento] = useState<Equipamento | null>(null)
  const [empresa, setEmpresa] = useState<any | null>(null)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [editingSignature, setEditingSignature] = useState<"tecnico" | "cliente" | null>(null)
  
  const handleRemoveSignature = (which: "tecnico" | "cliente") => {
    if (!ordem) return
    const updates: any = {}
    if (which === "tecnico") updates.assinatura_tecnico = undefined
    if (which === "cliente") updates.assinatura_cliente = undefined

    const result = updateOrdem(ordem.id, updates)
    if (result.data) {
      setOrdem(result.data)
      showToast("Assinatura removida", "success")
    } else {
      showToast(result.erro || "Erro ao remover assinatura", "error")
    }
  }

  useEffect(() => {
    if (!initialized) return
    loadData()
  }, [initialized, params.id])

  const loadData = () => {
    const ordemRes = getOrdem(params.id as string)
    if (ordemRes.data) {
      setOrdem(ordemRes.data)

      const clienteRes = getCliente(ordemRes.data.cliente_id)
      if (clienteRes.data) setCliente(clienteRes.data)

      const equipRes = getEquipamento(ordemRes.data.equipamento_id)
      if (equipRes.data) setEquipamento(equipRes.data)
    }

    const empresaRes = getEmpresa()
    if (empresaRes.data) setEmpresa(empresaRes.data)
  }

  const handleDelete = () => {
    const result = deleteOrdem(params.id as string)
    if (result.data?.success) {
      showToast("Ordem de serviço excluída com sucesso", "success")
      router.push("/ordens")
    } else {
      showToast(result.erro || "Erro ao excluir ordem", "error")
    }
  }

  if (!initialized || !ordem) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  const valorTotal = ordem.valor_visita + ordem.mao_de_obra + ordem.valor_material
  const kmRodados = ordem.km_final - ordem.km_inicial
  const valorKm = kmRodados * ordem.unit_km

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/ordens">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{ordem.id}</h1>
            <p className="text-muted-foreground">Detalhes da ordem de serviço</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/ordens/${ordem.id}/imprimir`}>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </Link>
          <Link href={`/ordens/${ordem.id}/editar`}>
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
                  Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.
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

      {/* Status and Type */}
      <div className="flex gap-2">
        <Badge className={statusColors[ordem.status_servico]} className="text-base px-4 py-1">
          {ordem.status_servico}
        </Badge>
        <Badge variant="outline" className="text-base px-4 py-1">
          {ordem.tipo_ordem}
        </Badge>
      </div>

      {/* Main Info Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cliente ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <Link href={`/clientes/${cliente.id}`} className="font-medium hover:underline">
                    {cliente.nome_fantasia}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{cliente.telefone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium">
                    {cliente.endereco}, {cliente.num_endereco} - {cliente.bairro}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Cliente não encontrado</p>
            )}
          </CardContent>
        </Card>

        {/* Equipamento */}
        <Card>
          <CardHeader>
            <CardTitle>Equipamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {equipamento ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <Link href={`/equipamentos/${equipamento.id}`} className="font-medium hover:underline">
                    {equipamento.nome}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Marca/Modelo</p>
                  <p className="font-medium">
                    {equipamento.marca} - {equipamento.modelo}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Número de Série</p>
                  <p className="font-medium">{equipamento.sn}</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Equipamento não encontrado</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Serviço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Data da OS</p>
              <p className="font-medium">{format(new Date(ordem.data_os), "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data do Chamado</p>
              <p className="font-medium">{format(new Date(ordem.data_chamado), "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Motivo do Chamado</p>
            <p className="font-medium">{ordem.motivo_chamado}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Constatado</p>
            <p className="font-medium">{ordem.constatado || "—"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Serviço Executado</p>
            <p className="font-medium">{ordem.serv_executado || "—"}</p>
          </div>
          {ordem.observacao && (
            <div>
              <p className="text-sm text-muted-foreground">Observações</p>
              <p className="font-medium">{ordem.observacao}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Materials and Costs */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Materiais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Tipo de Material</p>
              <p className="font-medium">{ordem.tipo_material || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Material Utilizado</p>
              <p className="font-medium">{ordem.material || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Valor da Visita</p>
              <p className="font-medium">
                R$ {ordem.valor_visita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Mão de Obra</p>
              <p className="font-medium">
                R$ {ordem.mao_de_obra.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">Valor do Material</p>
              <p className="font-medium">
                R$ {ordem.valor_material.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                KM Rodados ({kmRodados} km × R$ {ordem.unit_km})
              </p>
              <p className="font-medium">R$ {valorKm.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <p className="font-semibold">Total</p>
              <p className="font-semibold text-lg">
                R$ {(valorTotal + valorKm).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kilometers */}
      <Card>
        <CardHeader>
          <CardTitle>Quilometragem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">KM Inicial</p>
              <p className="font-medium">{ordem.km_inicial.toLocaleString("pt-BR")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">KM Final</p>
              <p className="font-medium">{ordem.km_final.toLocaleString("pt-BR")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">KM Rodados</p>
              <p className="font-medium">{kmRodados.toLocaleString("pt-BR")} km</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signatures - clickable on detail page */}
      <Card>
        <CardHeader>
          <CardTitle>Assinaturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div>
                <div className="border border-dashed rounded p-4 min-h-[120px] flex items-center justify-center">
                  {ordem.assinatura_tecnico ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ordem.assinatura_tecnico} alt="Assinatura do técnico" className="max-h-28 object-contain" />
                  ) : empresa?.assinatura_tecnico_padrao ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={empresa.assinatura_tecnico_padrao} alt="Assinatura padrão do técnico" className="max-h-28 object-contain" />
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground">Sem assinatura padrão</p>
                      <p className="text-xs text-gray-500">Configure em Dados da Empresa</p>
                    </div>
                  )}
                </div>

                {ordem.assinatura_tecnico && (
                  <div className="mt-2 flex justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveSignature("tecnico")
                      }}
                    >
                      Remover assinatura
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setEditingSignature("cliente")
                    setShowSignaturePad(true)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setEditingSignature("cliente")
                      setShowSignaturePad(true)
                    }
                  }}
                  className="border border-dashed rounded p-4 min-h-[120px] flex items-center justify-center cursor-pointer"
                >
                  {ordem.assinatura_cliente ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ordem.assinatura_cliente} alt="Assinatura do cliente" className="max-h-28 object-contain" />
                  ) : (
                    <div>
                      <p className="text-sm font-semibold">Clique para assinar</p>
                      <p className="text-xs text-gray-500">Cliente</p>
                    </div>
                  )}
                </div>

                {ordem.assinatura_cliente && (
                  <div className="mt-2 flex justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveSignature("cliente")
                      }}
                    >
                      Remover assinatura
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showSignaturePad && editingSignature === "cliente" && (
        <SignaturePad
          title="Assinatura do Cliente"
          initialData={ordem.assinatura_cliente || null}
          onCancel={() => {
            setShowSignaturePad(false)
            setEditingSignature(null)
          }}
          onSave={(dataUrl) => {
            const result = updateOrdem(ordem.id, { assinatura_cliente: dataUrl })
            if (result.data) {
              setOrdem(result.data)
              showToast("Assinatura salva com sucesso", "success")
            } else {
              showToast(result.erro || "Erro ao salvar assinatura", "error")
            }

            setShowSignaturePad(false)
            setEditingSignature(null)
          }}
        />
      )}
    </div>
  )
}
