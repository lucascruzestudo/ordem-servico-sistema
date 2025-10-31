/**
 * Company API
 * Simulates RESTful API for company (empresa) - singleton
 */

import type { Empresa, ApiResponse } from "../types"
import { storage } from "../storage"

/**
 * GET /empresa - Get company data
 */
export function getEmpresa(): ApiResponse<Empresa> {
  try {
    const empresa = storage.getData().empresa

    if (!empresa) {
      return {
        erro: "Dados da empresa não configurados",
        codigo: 404,
      }
    }

    return { data: empresa, codigo: 200 }
  } catch (error) {
    return {
      erro: "Erro ao buscar dados da empresa",
      codigo: 500,
      detalhes: { error: (error as Error).message },
    }
  }
}

/**
 * PUT /empresa - Update company data (create if doesn't exist)
 */
export function updateEmpresa(empresa: Omit<Empresa, "id">): ApiResponse<Empresa> {
  try {
    console.log("[v0] updateEmpresa called with:", empresa)
    const data = storage.getData()
    const existingId = data.empresa?.id || "empresa-1"

    const updatedEmpresa: Empresa = {
      ...empresa,
      id: existingId,
    }

    const oldEmpresa = data.empresa

    storage.updateEmpresa(updatedEmpresa)
    console.log("[v0] Empresa updated via storage service")

    // Create audit log
    if (oldEmpresa) {
      const diff: Record<string, { old: any; new: any }> = {}
      Object.keys(empresa).forEach((key) => {
        if (oldEmpresa[key as keyof Empresa] !== empresa[key as keyof Empresa]) {
          diff[key] = {
            old: oldEmpresa[key as keyof Empresa],
            new: empresa[key as keyof Empresa],
          }
        }
      })
      storage.createAuditLog("update", "empresa", existingId, diff, "Dados da empresa atualizados")
    } else {
      storage.createAuditLog("create", "empresa", existingId, {}, "Dados da empresa criados")
    }

    return { data: updatedEmpresa, codigo: 200 }
  } catch (error) {
    console.error("[v0] Error updating empresa:", error)
    return {
      erro: "Erro ao atualizar dados da empresa",
      codigo: 500,
      detalhes: { error: (error as Error).message },
    }
  }
}
