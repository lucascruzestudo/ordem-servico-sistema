/**
 * TypeScript interfaces for the Service Order Management System
 * All field names in Portuguese as per specification
 */

// Status types
export type StatusServico = "Aberto" | "Em Andamento" | "Concluído" | "Cancelado"
export type TipoCliente = "Pessoa Física" | "Pessoa Jurídica"
export type TipoOrdem = "Instalação" | "Manutenção" | "Reparo" | "Revisão" | "Outro"

// Main entities
export interface OrdemServico {
  id: string
  tipo_ordem: TipoOrdem
  data_os: string // ISO date string
  data_chamado: string // ISO date string
  motivo_chamado: string
  constatado: string
  serv_executado: string
  status_servico: StatusServico
  observacao: string
  tipo_material: string
  material: string
  valor_visita: number
  mao_de_obra: number
  valor_material: number
  unit_km: number
  km_inicial: number
  km_final: number
  cliente_id: string
  equipamento_id: string
  attachments: string[] // Array of attachment IDs
  audit_log: string[] // Array of audit log IDs
}

export interface Equipamento {
  id: string
  nome: string
  modelo: string
  marca: string
  sn: string // Serial number
}

export interface Cliente {
  id: string
  tipo_cliente: TipoCliente
  nome_fantasia: string
  razao_social: string
  endereco: string
  num_endereco: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  telefone: string
  telefone2: string
  telefone3: string
  email: string
  contato: string
  rg: string
  cpf: string
  cnpj: string
  insc_estadual: string
  insc_municipal: string
}

export interface Empresa {
  id: string
  nome: string
  cnpj: string
  endereco: string
  telefone: string
  logo: string // base64 encoded image
  email: string
  site: string
  politicas_garantia: string
}

export interface Anexo {
  id: string
  filename: string
  mime: string
  base64: string
  size: number
  uploaded_at: string // ISO date string
  linked_to: {
    entity: "ordem_servico" | "cliente" | "equipamento"
    id: string
  }
}

export interface LogAuditoria {
  id: string
  timestamp: string // ISO date string
  action: "create" | "update" | "delete"
  entity: "ordem_servico" | "cliente" | "equipamento" | "empresa"
  entity_id: string
  diff: Record<string, { old: any; new: any }>
  comment: string
}

// Printable service order structure
export interface OrdemServicoImprimivel {
  header: {
    empresa: Empresa
    numero_ordem: string
    data: string
  }
  cliente: Cliente
  equipamento: Equipamento
  servico: {
    tipo_ordem: TipoOrdem
    motivo_chamado: string
    constatado: string
    serv_executado: string
    status: StatusServico
    observacao: string
  }
  custos: {
    valor_visita: number
    mao_de_obra: number
    valor_material: number
    km_rodados: number
    valor_km: number
    total: number
  }
  rodape: {
    termos: string
    assinaturas: {
      tecnico: string
      cliente: string
    }
  }
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  erro?: string
  codigo?: number
  detalhes?: Record<string, any>
}

// Storage data structure
export interface StorageData {
  ordens_servico: OrdemServico[]
  clientes: Cliente[]
  equipamentos: Equipamento[]
  empresa: Empresa | null
  anexos: Anexo[]
  logs_auditoria: LogAuditoria[]
  settings: {
    edit_mode: "modal" | "route"
    confirm_navigation: boolean
    gist?: {
      gist_id: string
      token: string
      filename: string
    }
  }
}
