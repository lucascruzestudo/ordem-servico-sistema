/**
 * Equipment API
 * Simulates RESTful API for equipment (equipamentos)
 */

import type { Equipamento, ApiResponse } from "../types"
import { storage } from "../storage"

/**
 * Generate unique ID for new equipment
 */
function generateEquipamentoId(): string {
  const count = storage.getData().equipamentos.length + 1
  return `equip-${count}`
}

/**
 * GET /equipamentos - List all equipment
 */
export function listEquipamentos(search?: string): ApiResponse<Equipamento[]> {
  try {
    let equipamentos = storage.getData().equipamentos

    if (search) {
      const searchLower = search.toLowerCase()
      equipamentos = equipamentos.filter(
        (e) =>
          e.nome.toLowerCase().includes(searchLower) ||
          e.modelo.toLowerCase().includes(searchLower) ||
          e.marca.toLowerCase().includes(searchLower) ||
          e.sn.toLowerCase().includes(searchLower),
      )
    }

    // Sort alphabetically
    equipamentos.sort((a, b) => a.nome.localeCompare(b.nome))

    return { data: equipamentos, codigo: 200 }
  } catch (error) {
    return {
      erro: "Erro ao listar equipamentos",
      codigo: 500,
      detalhes: { error: (error as Error).message },
    }
  }
}

/**
 * GET /equipamentos/:id - Get single equipment
 */
export function getEquipamento(id: string): ApiResponse<Equipamento> {
  try {
    const equipamento = storage.getData().equipamentos.find((e) => e.id === id)

    if (!equipamento) {
      return {
        erro: "Equipamento não encontrado",
        codigo: 404,
      }
    }

    return { data: equipamento, codigo: 200 }
  } catch (error) {
    return {
      erro: "Erro ao buscar equipamento",
      codigo: 500,
      detalhes: { error: (error as Error).message },
    }
  }
}

/**
 * POST /equipamentos - Create new equipment
 */
export function createEquipamento(equipamento: Omit<Equipamento, "id">): ApiResponse<Equipamento> {
  try {
    const data = storage.getData()

    const newEquipamento: Equipamento = {
      ...equipamento,
      id: generateEquipamentoId(),
    }

    data.equipamentos.push(newEquipamento)

    storage.createAuditLog("create", "equipamento", newEquipamento.id, {}, "Equipamento criado")

    return { data: newEquipamento, codigo: 201 }
  } catch (error) {
    return {
      erro: "Erro ao criar equipamento",
      codigo: 500,
      detalhes: { error: (error as Error).message },
    }
  }
}

/**
 * PUT /equipamentos/:id - Update equipment
 */
export function updateEquipamento(id: string, updates: Partial<Equipamento>): ApiResponse<Equipamento> {
  try {
    const data = storage.getData()
    const index = data.equipamentos.findIndex((e) => e.id === id)

    if (index === -1) {
      return {
        erro: "Equipamento não encontrado",
        codigo: 404,
      }
    }

    const oldEquipamento = { ...data.equipamentos[index] }
    const updatedEquipamento = { ...oldEquipamento, ...updates, id }

    data.equipamentos[index] = updatedEquipamento

    // Create diff for audit log
    const diff: Record<string, { old: any; new: any }> = {}
    Object.keys(updates).forEach((key) => {
      if (oldEquipamento[key as keyof Equipamento] !== updates[key as keyof Equipamento]) {
        diff[key] = {
          old: oldEquipamento[key as keyof Equipamento],
          new: updates[key as keyof Equipamento],
        }
      }
    })

    storage.createAuditLog("update", "equipamento", id, diff, "Equipamento atualizado")

    return { data: updatedEquipamento, codigo: 200 }
  } catch (error) {
    return {
      erro: "Erro ao atualizar equipamento",
      codigo: 500,
      detalhes: { error: (error as Error).message },
    }
  }
}

/**
 * DELETE /equipamentos/:id - Delete equipment
 */
export function deleteEquipamento(id: string): ApiResponse<{ success: boolean }> {
  try {
    const data = storage.getData()
    const index = data.equipamentos.findIndex((e) => e.id === id)

    if (index === -1) {
      return {
        erro: "Equipamento não encontrado",
        codigo: 404,
      }
    }

    // Check if equipment has associated orders
    const hasOrders = data.ordens_servico.some((o) => o.equipamento_id === id)
    if (hasOrders) {
      return {
        erro: "Não é possível excluir equipamento com ordens de serviço associadas",
        codigo: 400,
      }
    }

    const deleted = data.equipamentos[index]
    data.equipamentos.splice(index, 1)

    storage.createAuditLog("delete", "equipamento", id, {}, `Equipamento ${deleted.nome} excluído`)

    return { data: { success: true }, codigo: 200 }
  } catch (error) {
    return {
      erro: "Erro ao excluir equipamento",
      codigo: 500,
      detalhes: { error: (error as Error).message },
    }
  }
}
