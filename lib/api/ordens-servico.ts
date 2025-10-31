/**
 * Service Orders API
 * Simulates RESTful API for service orders (ordens de serviço)
 */

import type { OrdemServico, ApiResponse } from "../types"
import { storage } from "../storage"

/**
 * Generate unique ID for new orders
 */
function generateOrderId(): string {
  const year = new Date().getFullYear()
  const count = storage.getData().ordens_servico.length + 1
  return `OS-${year}-${String(count).padStart(4, "0")}`
}

/**
 * GET /ordens-servico - List all service orders
 */
export function listOrdens(filters?: {
  status?: string
  cliente_id?: string
  equipamento_id?: string
  search?: string
}): ApiResponse<OrdemServico[]> {
  try {
    let ordens = storage.getData().ordens_servico

    // Apply filters
    if (filters?.status) {
      ordens = ordens.filter((o) => o.status_servico === filters.status)
    }
    if (filters?.cliente_id) {
      ordens = ordens.filter((o) => o.cliente_id === filters.cliente_id)
    }
    if (filters?.equipamento_id) {
      ordens = ordens.filter((o) => o.equipamento_id === filters.equipamento_id)
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase()
      ordens = ordens.filter(
        (o) =>
          o.id.toLowerCase().includes(search) ||
          o.motivo_chamado.toLowerCase().includes(search) ||
          o.constatado.toLowerCase().includes(search),
      )
    }

    // Sort by date (newest first)
    ordens.sort((a, b) => new Date(b.data_os).getTime() - new Date(a.data_os).getTime())

    return { data: ordens, codigo: 200 }
  } catch (error) {
    return {
      erro: "Erro ao listar ordens de serviço",
      codigo: 500,
      detalhes: { error: (error as Error).message },
    }
  }
}

/**
 * GET /ordens-servico/:id - Get single service order
 */
export function getOrdem(id: string): ApiResponse<OrdemServico> {
  try {
    const ordem = storage.getData().ordens_servico.find((o) => o.id === id)

    if (!ordem) {
      return {
        erro: "Ordem de serviço não encontrada",
        codigo: 404,
      }
    }

    return { data: ordem, codigo: 200 }
  } catch (error) {
    return {
      erro: "Erro ao buscar ordem de serviço",
      codigo: 500,
      detalhes: { error: (error as Error).message },
    }
  }
}

/**
 * POST /ordens-servico - Create new service order
 */
export function createOrdem(ordem: Omit<OrdemServico, "id" | "attachments" | "audit_log">): ApiResponse<OrdemServico> {
  try {
    const data = storage.getData()

    const newOrdem: OrdemServico = {
      ...ordem,
      id: generateOrderId(),
      attachments: [],
      audit_log: [],
    }

    data.ordens_servico.push(newOrdem)

    // Create audit log
    storage.createAuditLog("create", "ordem_servico", newOrdem.id, {}, "Ordem de serviço criada")

    return { data: newOrdem, codigo: 201 }
  } catch (error) {
    return {
      erro: "Erro ao criar ordem de serviço",
      codigo: 500,
      detalhes: { error: (error as Error).message },
    }
  }
}

/**
 * PUT /ordens-servico/:id - Update service order
 */
export function updateOrdem(id: string, updates: Partial<OrdemServico>): ApiResponse<OrdemServico> {
  try {
    const data = storage.getData()
    const index = data.ordens_servico.findIndex((o) => o.id === id)

    if (index === -1) {
      return {
        erro: "Ordem de serviço não encontrada",
        codigo: 404,
      }
    }

    const oldOrdem = { ...data.ordens_servico[index] }
    const updatedOrdem = { ...oldOrdem, ...updates, id } // Preserve ID

    data.ordens_servico[index] = updatedOrdem

    // Create diff for audit log
    const diff: Record<string, { old: any; new: any }> = {}
    Object.keys(updates).forEach((key) => {
      if (oldOrdem[key as keyof OrdemServico] !== updates[key as keyof OrdemServico]) {
        diff[key] = {
          old: oldOrdem[key as keyof OrdemServico],
          new: updates[key as keyof OrdemServico],
        }
      }
    })

    storage.createAuditLog("update", "ordem_servico", id, diff, "Ordem de serviço atualizada")

    return { data: updatedOrdem, codigo: 200 }
  } catch (error) {
    return {
      erro: "Erro ao atualizar ordem de serviço",
      codigo: 500,
      detalhes: { error: (error as Error).message },
    }
  }
}

/**
 * DELETE /ordens-servico/:id - Delete service order
 */
export function deleteOrdem(id: string): ApiResponse<{ success: boolean }> {
  try {
    const data = storage.getData()
    const index = data.ordens_servico.findIndex((o) => o.id === id)

    if (index === -1) {
      return {
        erro: "Ordem de serviço não encontrada",
        codigo: 404,
      }
    }

    const deleted = data.ordens_servico[index]
    data.ordens_servico.splice(index, 1)

    storage.createAuditLog("delete", "ordem_servico", id, {}, `Ordem de serviço ${deleted.id} excluída`)

    return { data: { success: true }, codigo: 200 }
  } catch (error) {
    return {
      erro: "Erro ao excluir ordem de serviço",
      codigo: 500,
      detalhes: { error: (error as Error).message },
    }
  }
}
