/**
 * GitHub Gist Service
 * Handles syncing data with GitHub Gist for cloud backup
 */

import { storage } from "./storage"

export interface GistConfig {
  gist_id: string
  token: string
  filename: string
}

export class GistService {
  /**
   * Push current data to GitHub Gist
   */
  async pushToGist(config: GistConfig): Promise<{ success: boolean; message: string }> {
    try {
      const { gist_id, token, filename } = config

      if (!gist_id || !token || !filename) {
        return {
          success: false,
          message: "Configuração incompleta. Preencha todos os campos.",
        }
      }

      // Get current data
      const data = storage.exportData()

      // Prepare the request to update the Gist
      const response = await fetch(`https://api.github.com/gists/${gist_id}`, {
        method: "PATCH",
        headers: {
          Authorization: `token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          files: {
            [filename]: {
              content: data,
            },
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          message: `Erro ao enviar dados: ${error.message || response.statusText}`,
        }
      }

      return {
        success: true,
        message: "Dados enviados para o Gist com sucesso!",
      }
    } catch (error) {
      console.error("[GistService] Error pushing to Gist:", error)
      return {
        success: false,
        message: `Erro ao enviar dados: ${(error as Error).message}`,
      }
    }
  }

  /**
   * Pull data from GitHub Gist
   */
  async pullFromGist(config: GistConfig): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      const { gist_id, token, filename } = config

      if (!gist_id || !token || !filename) {
        return {
          success: false,
          message: "Configuração incompleta. Preencha todos os campos.",
        }
      }

      // Fetch the Gist
      const response = await fetch(`https://api.github.com/gists/${gist_id}`, {
        headers: {
          Authorization: `token ${token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          message: `Erro ao buscar dados: ${error.message || response.statusText}`,
        }
      }

      const gist = await response.json()

      // Check if the file exists in the Gist
      if (!gist.files || !gist.files[filename]) {
        return {
          success: false,
          message: `Arquivo "${filename}" não encontrado no Gist.`,
        }
      }

      // Get the file content
      const fileContent = gist.files[filename].content

      // Import the data
      const result = storage.importData(fileContent)

      if (result.success) {
        return {
          success: true,
          message: "Dados importados do Gist com sucesso!",
          stats: result.stats,
        }
      } else {
        return {
          success: false,
          message: result.message,
        }
      }
    } catch (error) {
      console.error("[GistService] Error pulling from Gist:", error)
      return {
        success: false,
        message: `Erro ao buscar dados: ${(error as Error).message}`,
      }
    }
  }

  /**
   * Test Gist connection
   */
  async testConnection(config: GistConfig): Promise<{ success: boolean; message: string }> {
    try {
      const { gist_id, token } = config

      if (!gist_id || !token) {
        return {
          success: false,
          message: "ID do Gist e Token são obrigatórios.",
        }
      }

      const response = await fetch(`https://api.github.com/gists/${gist_id}`, {
        headers: {
          Authorization: `token ${token}`,
        },
      })

      if (!response.ok) {
        return {
          success: false,
          message: "Não foi possível conectar ao Gist. Verifique o ID e o Token.",
        }
      }

      return {
        success: true,
        message: "Conexão com o Gist estabelecida com sucesso!",
      }
    } catch (error) {
      return {
        success: false,
        message: `Erro ao testar conexão: ${(error as Error).message}`,
      }
    }
  }
}

export const gistService = new GistService()
