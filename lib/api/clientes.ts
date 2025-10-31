/**
 * Clients API
 * Simulates RESTful API for clients (clientes)
 */

import type { Cliente, ApiResponse } from "../types"
import { storage } from "../storage"

/**
 * Generate unique ID for new clients
 */
function generateClienteId(): string {
  const count = storage.getData().clientes.length + 1
  return `cliente-${count}`
}

/**
 * GET /clientes - List all clients
 */
export function listClientes(search?: string): ApiResponse<Cliente[]> {
  try {
    let clientes = storage.getData().clientes

    if (search) {
      const searchLower = search.toLowerCase()
      clientes = clientes.filter(
        (c) =>
          c.nome_fantasia.toLowerCase().includes(searchLower) ||
          c.razao_social.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower) ||
          c.cpf.includes(search) ||
          c.cnpj.includes(search),
      )
    }

    // Sort alphabetically
    clientes.sort((a, b) => a.nome_fantasia.localeCompare(b.nome_fantasia))

    return { data: clientes, codigo: 200 }
  } catch (error) {
    return {
      erro: "Erro ao listar clientes",
      codigo: 500,
      detalhes: { error: (error as Error).message },
    }
  }
}

/**
 * GET /clientes/:id - Get single client
 */
export function getCliente(id: string): ApiResponse<Cliente> {
  try {
    const cliente = storage.getData().clientes.find((c) => c.id === id)

    if (!cliente) {
      return {
        erro: "Cliente não encontrado",
        codigo: 404,
      }
    }

    return { data: cliente, codigo: 200 }
  } catch (error) {
    return {
      erro: "Erro ao buscar cliente",
      codigo: 500,
      detalhes: { error: (error as Error).message },
    }
  }
}

/**
 * POST /clientes - Create new client
 */
export function createCliente(cliente: Omit<Cliente, "id">): ApiResponse<Cliente> {
  try {
    const data = storage.getData()

    const newCliente: Cliente = {
      ...cliente,
      id: generateClienteId(),
    }

    data.clientes.push(newCliente)

    storage.createAuditLog("create", "cliente", newCliente.id, {}, "Cliente criado")

    return { data: newCliente, codigo: 201 }
  } catch (error) {
    return {
      erro: "Erro ao criar cliente",
      codigo: 500,
      detalhes: { error: (error as Error).message },
    }
  }
}

/**
 * PUT /clientes/:id - Update client
 */
export function updateCliente(id: string, updates: Partial<Cliente>): ApiResponse<Cliente> {
  try {
    const data = storage.getData()
    const index = data.clientes.findIndex((c) => c.id === id)

    if (index === -1) {
      return {
        erro: "Cliente não encontrado",
        codigo: 404,
      }
    }

    const oldCliente = { ...data.clientes[index] }
    const updatedCliente = { ...oldCliente, ...updates, id }

    data.clientes[index] = updatedCliente

    // Create diff for audit log
    const diff: Record<string, { old: any; new: any }> = {}
    Object.keys(updates).forEach((key) => {
      if (oldCliente[key as keyof Cliente] !== updates[key as keyof Cliente]) {
        diff[key] = {
          old: oldCliente[key as keyof Cliente],
          new: updates[key as keyof Cliente],
        }
      }
    })

    storage.createAuditLog("update", "cliente", id, diff, "Cliente atualizado")

    return { data: updatedCliente, codigo: 200 }
  } catch (error) {
    return {
      erro: "Erro ao atualizar cliente",
      codigo: 500,
      detalhes: { error: (error as Error).message },
    }
  }
}

/**
 * DELETE /clientes/:id - Delete client
 */
export function deleteCliente(id: string): ApiResponse<{ success: boolean }> {
  try {
    const data = storage.getData()
    const index = data.clientes.findIndex((c) => c.id === id)

    if (index === -1) {
      return {
        erro: "Cliente não encontrado",
        codigo: 404,
      }
    }

    // Check if client has associated orders
    const hasOrders = data.ordens_servico.some((o) => o.cliente_id === id)
    if (hasOrders) {
      return {
        erro: "Não é possível excluir cliente com ordens de serviço associadas",
        codigo: 400,
      }
    }

    const deleted = data.clientes[index]
    data.clientes.splice(index, 1)

    storage.createAuditLog("delete", "cliente", id, {}, `Cliente ${deleted.nome_fantasia} excluído`)

    return { data: { success: true }, codigo: 200 }
  } catch (error) {
    return {
      erro: "Erro ao excluir cliente",
      codigo: 500,
      detalhes: { error: (error as Error).message },
    }
  }
}
