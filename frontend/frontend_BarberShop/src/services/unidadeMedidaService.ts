import axios from "axios"

const API_URL = "https://localhost:7145/api/UnidadeMedida"

export interface CreateUnidadeMedidaDto {
  codigo: number
  nome: string
  descricao?: string
  ativo: boolean
}

export interface UpdateUnidadeMedidaDto {
  nome: string
  descricao?: string
  ativo: boolean
}

export interface UnidadeMedida {
  id: number
  codigo: number
  nome: string
  descricao?: string
  ativo: boolean
  dataCriacao: string
  dataAtualizacao: string
}

// Buscar todas as unidades de medida
export async function getUnidadesMedida(): Promise<UnidadeMedida[]> {
  const response = await axios.get<UnidadeMedida[]>(API_URL)
  return response.data
}

// Buscar unidade de medida por ID
export async function getUnidadeMedidaById(id: number): Promise<UnidadeMedida> {
  const response = await axios.get<UnidadeMedida>(`${API_URL}/${id}`)
  return response.data
}

// Criar nova unidade de medida
export async function criarUnidadeMedida(
  data: CreateUnidadeMedidaDto
): Promise<UnidadeMedida> {
  const response = await axios.post<UnidadeMedida>(API_URL, data)
  return response.data
}

// Atualizar unidade de medida
export async function atualizarUnidadeMedida(
  id: number,
  data: UpdateUnidadeMedidaDto
): Promise<void> {
  await axios.put(`${API_URL}/${id}`, data)
}

// Deletar unidade de medida
export async function deletarUnidadeMedida(id: number): Promise<void> {
  await axios.delete(`${API_URL}/${id}`)
}
