/**
 * String resources for internationalization
 * All UI strings in Portuguese
 */

export const strings = {
  // Common
  common: {
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    view: "Visualizar",
    create: "Criar",
    search: "Pesquisar",
    filter: "Filtrar",
    export: "Exportar",
    import: "Importar",
    print: "Imprimir",
    back: "Voltar",
    loading: "Carregando...",
    noData: "Nenhum dado encontrado",
    confirm: "Confirmar",
    yes: "Sim",
    no: "Não",
  },

  // Navigation
  nav: {
    dashboard: "Dashboard",
    orders: "Ordens de Serviço",
    clients: "Clientes",
    equipment: "Equipamentos",
    settings: "Configurações",
  },

  // Dashboard
  dashboard: {
    title: "Dashboard",
    welcome: "Bem-vindo ao Sistema de Ordens de Serviço",
    stats: {
      totalOrders: "Total de Ordens",
      openOrders: "Ordens Abertas",
      inProgress: "Em Andamento",
      completed: "Concluídas",
      totalClients: "Total de Clientes",
      totalEquipment: "Total de Equipamentos",
    },
    recentOrders: "Ordens Recentes",
    quickActions: "Ações Rápidas",
    createOrder: "Criar Ordem",
    createClient: "Criar Cliente",
    createEquipment: "Criar Equipamento",
  },

  // Service Orders
  orders: {
    title: "Ordens de Serviço",
    create: "Nova Ordem de Serviço",
    edit: "Editar Ordem de Serviço",
    view: "Visualizar Ordem de Serviço",
    delete: "Excluir Ordem de Serviço",
    deleteConfirm: "Tem certeza que deseja excluir esta ordem de serviço?",
    printDocument: "Visualizar Documento",
    downloadJson: "Baixar JSON",
  },

  // Clients
  clients: {
    title: "Clientes",
    create: "Novo Cliente",
    edit: "Editar Cliente",
    view: "Visualizar Cliente",
    delete: "Excluir Cliente",
    deleteConfirm: "Tem certeza que deseja excluir este cliente?",
  },

  // Equipment
  equipment: {
    title: "Equipamentos",
    create: "Novo Equipamento",
    edit: "Editar Equipamento",
    view: "Visualizar Equipamento",
    delete: "Excluir Equipamento",
    deleteConfirm: "Tem certeza que deseja excluir este equipamento?",
  },

  // Settings
  settings: {
    title: "Configurações",
    company: "Dados da Empresa",
    preferences: "Preferências",
    dataManagement: "Gerenciamento de Dados",
    exportData: "Exportar Dados",
    importData: "Importar Dados",
    resetData: "Restaurar Dados de Exemplo",
    resetConfirm: "Tem certeza que deseja restaurar os dados de exemplo? Todos os dados atuais serão perdidos.",
  },

  // Validation messages
  validation: {
    required: "Campo obrigatório",
    invalidEmail: "E-mail inválido",
    invalidCPF: "CPF inválido",
    invalidCNPJ: "CNPJ inválido",
    invalidPhone: "Telefone inválido",
    invalidCEP: "CEP inválido",
    minLength: "Mínimo de {min} caracteres",
    maxLength: "Máximo de {max} caracteres",
    numeric: "Deve ser um número",
    positive: "Deve ser um número positivo",
  },

  // Success messages
  success: {
    created: "{entity} criado com sucesso",
    updated: "{entity} atualizado com sucesso",
    deleted: "{entity} excluído com sucesso",
    exported: "Dados exportados com sucesso",
    imported: "Dados importados com sucesso",
  },

  // Error messages
  error: {
    generic: "Ocorreu um erro. Tente novamente.",
    notFound: "{entity} não encontrado",
    deleteWithRelations: "Não é possível excluir {entity} com registros associados",
  },
}
