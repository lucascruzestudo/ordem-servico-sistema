"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getOrdem } from "@/lib/api/ordens-servico"
import { getCliente } from "@/lib/api/clientes"
import { getEquipamento } from "@/lib/api/equipamentos"
import { getEmpresa } from "@/lib/api/empresa"
import type { OrdemServico, Cliente, Equipamento, Empresa } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Printer } from "lucide-react"
import Link from "next/link"
import { useStorage } from "@/lib/hooks/use-storage"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function ImprimirOrdemPage() {
  const params = useParams()
  const initialized = useStorage()
  const [ordem, setOrdem] = useState<OrdemServico | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [equipamento, setEquipamento] = useState<Equipamento | null>(null)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)

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

  const handlePrint = () => {
    window.print()
  }

  if (!initialized || !ordem || !cliente || !equipamento) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  const valorTotal = ordem.valor_visita + ordem.mao_de_obra + ordem.valor_material
  const kmRodados = ordem.km_final - ordem.km_inicial
  const valorKm = kmRodados * ordem.unit_km
  const totalGeral = valorTotal + valorKm

  return (
    <>
      {/* Print Controls - Hidden when printing */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2">
        <Link href={`/ordens/${ordem.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <Button onClick={handlePrint} size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
      </div>

      {/* Printable Content */}
      <div className="print-page max-w-4xl mx-auto p-8 bg-white text-black">
        {/* Header with Company Info */}
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {empresa?.logo ? (
                <img src={empresa.logo || "/placeholder.svg"} alt={empresa.nome} className="h-16 mb-2 object-contain" />
              ) : (
                <h1 className="text-2xl font-bold mb-2">{empresa?.nome || "Empresa"}</h1>
              )}
              <p className="text-sm">{empresa?.endereco}</p>
              <p className="text-sm">
                Tel: {empresa?.telefone} | Email: {empresa?.email}
              </p>
              <p className="text-sm">CNPJ: {empresa?.cnpj}</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">ORDEM DE SERVIÇO</h2>
              <p className="text-lg font-semibold">{ordem.id}</p>
              <p className="text-sm">Data: {format(new Date(ordem.data_os), "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-2 bg-gray-200 p-2">DADOS DO CLIENTE</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <span className="font-semibold">Nome:</span> {cliente.nome_fantasia}
              </p>
              {cliente.razao_social && (
                <p>
                  <span className="font-semibold">Razão Social:</span> {cliente.razao_social}
                </p>
              )}
              <p>
                <span className="font-semibold">Contato:</span> {cliente.contato}
              </p>
            </div>
            <div>
              <p>
                <span className="font-semibold">Telefone:</span> {cliente.telefone}
              </p>
              <p>
                <span className="font-semibold">{cliente.tipo_cliente === "Pessoa Física" ? "CPF" : "CNPJ"}:</span>{" "}
                {cliente.tipo_cliente === "Pessoa Física" ? cliente.cpf : cliente.cnpj}
              </p>
            </div>
          </div>
          <p className="text-sm mt-2">
            <span className="font-semibold">Endereço:</span> {cliente.endereco}, {cliente.num_endereco} -{" "}
            {cliente.bairro} - {cliente.cidade}/{cliente.estado} - CEP: {cliente.cep}
          </p>
        </div>

        {/* Equipment Info */}
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-2 bg-gray-200 p-2">DADOS DO EQUIPAMENTO</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p>
              <span className="font-semibold">Equipamento:</span> {equipamento.nome}
            </p>
            <p>
              <span className="font-semibold">Marca:</span> {equipamento.marca}
            </p>
            <p>
              <span className="font-semibold">Modelo:</span> {equipamento.modelo}
            </p>
            <p>
              <span className="font-semibold">N° Série:</span> {equipamento.sn}
            </p>
          </div>
        </div>

        {/* Service Info */}
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-2 bg-gray-200 p-2">SERVIÇO EXECUTADO</h3>
          <div className="text-sm space-y-2">
            <p>
              <span className="font-semibold">Tipo de Ordem:</span> {ordem.tipo_ordem}
            </p>
            <p>
              <span className="font-semibold">Data do Chamado:</span>{" "}
              {format(new Date(ordem.data_chamado), "dd/MM/yyyy", { locale: ptBR })}
            </p>
            <div>
              <p className="font-semibold">Motivo do Chamado:</p>
              <p className="border p-2 min-h-[60px]">{ordem.motivo_chamado}</p>
            </div>
            <div>
              <p className="font-semibold">Constatado:</p>
              <p className="border p-2 min-h-[60px]">{ordem.constatado || "—"}</p>
            </div>
            <div>
              <p className="font-semibold">Serviço Executado:</p>
              <p className="border p-2 min-h-[60px]">{ordem.serv_executado || "—"}</p>
            </div>
            {ordem.observacao && (
              <div>
                <p className="font-semibold">Observações:</p>
                <p className="border p-2">{ordem.observacao}</p>
              </div>
            )}
          </div>
        </div>

        {/* Materials */}
        {(ordem.tipo_material || ordem.material) && (
          <div className="mb-6">
            <h3 className="font-bold text-sm mb-2 bg-gray-200 p-2">MATERIAIS UTILIZADOS</h3>
            <div className="text-sm space-y-1">
              {ordem.tipo_material && (
                <p>
                  <span className="font-semibold">Tipo:</span> {ordem.tipo_material}
                </p>
              )}
              {ordem.material && (
                <p>
                  <span className="font-semibold">Descrição:</span> {ordem.material}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Costs */}
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-2 bg-gray-200 p-2">VALORES</h3>
          <table className="w-full text-sm border-collapse">
            <tbody>
              <tr className="border-b">
                <td className="py-2">Valor da Visita</td>
                <td className="text-right py-2">
                  R$ {ordem.valor_visita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Mão de Obra</td>
                <td className="text-right py-2">
                  R$ {ordem.mao_de_obra.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2">Material</td>
                <td className="text-right py-2">
                  R$ {ordem.valor_material.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2">
                  Deslocamento ({kmRodados} km × R$ {ordem.unit_km.toFixed(2)})
                </td>
                <td className="text-right py-2">R$ {valorKm.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
              </tr>
              <tr className="font-bold text-base">
                <td className="py-2">TOTAL</td>
                <td className="text-right py-2">
                  R$ {totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="border-t border-black pt-2 mt-16">
                <p className="text-sm font-semibold">Técnico Responsável</p>
                <p className="text-xs text-gray-600">Assinatura e Carimbo</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-black pt-2 mt-16">
                <p className="text-sm font-semibold">Cliente</p>
                <p className="text-xs text-gray-600">Assinatura e Data</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-600 border-t pt-4">
          {empresa?.politicas_garantia ? (
            <p className="whitespace-pre-line">{empresa.politicas_garantia}</p>
          ) : (
            <p>Este documento é válido como comprovante de serviço prestado</p>
          )}
          <p className="mt-2">Status: {ordem.status_servico}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </>
  )
}
