/**
 * LocalStorage Service
 * Handles all data persistence using localStorage
 * Syncs in-memory data with localStorage after every operation
 */

import type { StorageData, Empresa, LogAuditoria } from "./types"

const STORAGE_KEY = "service_order_system_data"
const STORAGE_VERSION = "1.0.0"

// Default empty storage structure
const DEFAULT_STORAGE: StorageData = {
  ordens_servico: [],
  clientes: [],
  equipamentos: [],
  empresa: null,
  anexos: [],
  logs_auditoria: [],
  settings: {
    edit_mode: "modal",
    confirm_navigation: true,
  },
}

/**
 * Storage Service Class
 * Singleton pattern for managing localStorage operations
 */
class StorageService {
  private data: StorageData
  private initialized = false
  private onDataChangeCallbacks: Array<() => void> = []

  constructor() {
    this.data = { ...DEFAULT_STORAGE }
  }

  /**
   * Initialize storage - load from localStorage or create seed data
   */
  init(): void {
    if (this.initialized) return

    const stored = this.loadFromLocalStorage()

    if (stored) {
      this.data = stored
    } else {
      // First time - create seed data
      this.data = this.createSeedData()
      this.saveToLocalStorage()
    }

    this.initialized = true
  }

  /**
   * Load data from localStorage
   */
  private loadFromLocalStorage(): StorageData | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return null

      const parsed = JSON.parse(stored)

      // Validate version and structure
      if (parsed.version === STORAGE_VERSION && parsed.data) {
        return parsed.data
      }

      return null
    } catch (error) {
      console.error("[Storage] Error loading from localStorage:", error)
      return null
    }
  }

  /**
   * Save data to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      const toStore = {
        version: STORAGE_VERSION,
        data: this.data,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
      console.log("[v0] Data saved to localStorage")

      this.notifyDataChange()
    } catch (error) {
      console.error("[Storage] Error saving to localStorage:", error)
    }
  }

  /**
   * Subscribe to data changes
   */
  onDataChange(callback: () => void): () => void {
    this.onDataChangeCallbacks.push(callback)
    // Return unsubscribe function
    return () => {
      this.onDataChangeCallbacks = this.onDataChangeCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Notify all subscribers of data change
   */
  private notifyDataChange(): void {
    this.onDataChangeCallbacks.forEach((callback) => {
      try {
        callback()
      } catch (error) {
        console.error("[Storage] Error in data change callback:", error)
      }
    })
  }

  /**
   * Get all data
   */
  getData(): StorageData {
    return { ...this.data }
  }

  /**
   * Update empresa data
   */
  updateEmpresa(empresa: Empresa): void {
    console.log("[v0] Updating empresa in storage:", empresa)
    this.data.empresa = empresa
    this.saveToLocalStorage()
    console.log("[v0] Empresa updated and saved")
  }

  /**
   * Export all data as JSON
   */
  exportData(): string {
    return JSON.stringify(this.data, null, 2)
  }

  /**
   * Import data from JSON
   */
  importData(jsonData: string): { success: boolean; message: string; stats?: any } {
    try {
      const imported = JSON.parse(jsonData) as StorageData

      // Validate structure
      if (!imported.ordens_servico || !imported.clientes || !imported.equipamentos) {
        return {
          success: false,
          message: "Formato de dados inválido",
        }
      }

      // Merge or replace data
      this.data = imported
      this.saveToLocalStorage()

      return {
        success: true,
        message: "Dados importados com sucesso",
        stats: {
          ordens: imported.ordens_servico.length,
          clientes: imported.clientes.length,
          equipamentos: imported.equipamentos.length,
        },
      }
    } catch (error) {
      return {
        success: false,
        message: "Erro ao importar dados: " + (error as Error).message,
      }
    }
  }

  /**
   * Reset to seed data
   */
  resetToSeedData(): void {
    this.data = this.createSeedData()
    this.saveToLocalStorage()
  }

  /**
   * Create audit log entry
   */
  createAuditLog(
    action: LogAuditoria["action"],
    entity: LogAuditoria["entity"],
    entity_id: string,
    diff: LogAuditoria["diff"],
    comment = "",
  ): void {
    const log: LogAuditoria = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      entity,
      entity_id,
      diff,
      comment,
    }

    this.data.logs_auditoria.push(log)
    this.saveToLocalStorage()
  }

  // CRUD operations for each entity will be added in the next files
}

// Export singleton instance
export const storage = new StorageService()
