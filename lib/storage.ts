/**
 * LocalStorage Service
 * Handles all data persistence using localStorage
 * Syncs in-memory data with localStorage after every operation
 */

import type { StorageData, Empresa, LogAuditoria, Equipamento, OrdemServico, Cliente } from "./types"

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

  private createSeedData(): StorageData {
    const now = new Date().toISOString()

    const empresa: Empresa = {
      id: "empresa-1",
      nome: "TechService Assistência Técnica",
      cnpj: "12.345.678/0001-90",
      endereco: "Rua das Flores, 123 - Centro - São Paulo - SP - 01234-567",
      telefone: "(11) 3456-7890",
      logo: "",
      email: "contato@techservice.com.br",
      site: "www.techservice.com.br",
      politicas_garantia:
        "Garantia de 90 dias para serviços executados e peças substituídas. A garantia não cobre danos causados por mau uso, quedas ou instalação inadequada.",
      assinatura_tecnico_padrao: "",
    }

    // Seed clients
    const clientes: Cliente[] = [
      {
        id: "cliente-1",
        tipo_cliente: "Pessoa Jurídica",
        nome_fantasia: "Padaria Pão Quente",
        razao_social: "Padaria Pão Quente Ltda",
        endereco: "Av. Principal",
        num_endereco: "456",
        bairro: "Centro",
        cidade: "São Paulo",
        estado: "SP",
        cep: "01234-567",
        telefone: "(11) 98765-4321",
        telefone2: "",
        telefone3: "",
        email: "contato@paoquente.com.br",
        contato: "João Silva",
        rg: "",
        cpf: "",
        cnpj: "98.765.432/0001-10",
        insc_estadual: "123.456.789.012",
        insc_municipal: "987654",
      },
      {
        id: "cliente-2",
        tipo_cliente: "Pessoa Física",
        nome_fantasia: "Maria Santos",
        razao_social: "",
        endereco: "Rua das Acácias",
        num_endereco: "789",
        bairro: "Jardim América",
        cidade: "São Paulo",
        estado: "SP",
        cep: "05432-100",
        telefone: "(11) 91234-5678",
        telefone2: "",
        telefone3: "",
        email: "maria.santos@email.com",
        contato: "Maria Santos",
        rg: "12.345.678-9",
        cpf: "123.456.789-00",
        cnpj: "",
        insc_estadual: "",
        insc_municipal: "",
      },
    ]

    // Seed equipment
    const equipamentos: Equipamento[] = [
      {
        id: "equip-1",
        nome: "Forno Industrial",
        modelo: "FI-2000",
        marca: "Braesi",
        sn: "FI2000-2023-001",
      },
      {
        id: "equip-2",
        nome: "Ar Condicionado Split",
        modelo: "Split 12000 BTUs",
        marca: "LG",
        sn: "LG-AC-2024-456",
      },
      {
        id: "equip-3",
        nome: "Geladeira Comercial",
        modelo: "GC-500L",
        marca: "Metalfrio",
        sn: "MF-GC500-2023-789",
      },
    ]

    // Seed service orders
    const ordens: OrdemServico[] = [
      {
        id: "os-1",
        tipo_ordem: "Manutenção",
        data_os: now,
        data_chamado: now,
        motivo_chamado: "Forno não está aquecendo adequadamente",
        constatado: "Resistência queimada e termostato descalibrado",
        serv_executado: "Substituição da resistência e calibração do termostato",
        status_servico: "Concluído",
        observacao: "Cliente orientado sobre uso correto do equipamento",
        tipo_material: "Resistência elétrica 220V 5000W",
        material: "Resistência + Termostato",
        valor_visita: 100,
        mao_de_obra: 250,
        valor_material: 380,
        unit_km: 2.5,
        km_inicial: 15420,
        km_final: 15450,
        cliente_id: "cliente-1",
        equipamento_id: "equip-1",
        attachments: [],
        audit_log: [],
      },
      {
        id: "os-2",
        tipo_ordem: "Instalação",
        data_os: now,
        data_chamado: now,
        motivo_chamado: "Instalação de novo ar condicionado",
        constatado: "Local adequado para instalação",
        serv_executado: "Instalação completa do ar condicionado split",
        status_servico: "Em Andamento",
        observacao: "Aguardando entrega de suporte de parede",
        tipo_material: "Suporte, tubulação, cabos",
        material: "Kit instalação completo",
        valor_visita: 0,
        mao_de_obra: 450,
        valor_material: 280,
        unit_km: 2.5,
        km_inicial: 15450,
        km_final: 15475,
        cliente_id: "cliente-2",
        equipamento_id: "equip-2",
        attachments: [],
        audit_log: [],
      },
      {
        id: "os-3",
        tipo_ordem: "Reparo",
        data_os: now,
        data_chamado: now,
        motivo_chamado: "Geladeira não está resfriando",
        constatado: "Vazamento no sistema de refrigeração",
        serv_executado: "",
        status_servico: "Aberto",
        observacao: "Orçamento enviado ao cliente",
        tipo_material: "Gás refrigerante R134a",
        material: "",
        valor_visita: 100,
        mao_de_obra: 0,
        valor_material: 0,
        unit_km: 2.5,
        km_inicial: 15475,
        km_final: 15475,
        cliente_id: "cliente-1",
        equipamento_id: "equip-3",
        attachments: [],
        audit_log: [],
      },
    ]

    return {
      ordens_servico: ordens,
      clientes,
      equipamentos,
      empresa,
      anexos: [],
      logs_auditoria: [],
      settings: DEFAULT_STORAGE.settings,
    }
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
