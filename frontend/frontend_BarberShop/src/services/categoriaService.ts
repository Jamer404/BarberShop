import axios from "axios"

const API_URL = "https://localhost:7145/api/Categoria"

export interface CreateCategoriaDto {
  nome: string
  descricao?: string
  ativo: boolean
}

export interface UpdateCategoriaDto {
  nome: string
  descricao?: string
  ativo: boolean
}

export interface Categoria {
  id: number
  nome: string
  descricao?: string
  ativo: boolean
  dataCriacao: string
  dataAtualizacao: string
}

export async function getCategorias(): Promise<Categoria[]> {
  const { data } = await axios.get<Categoria[]>(API_URL)
  return data
}

export async function getCategoriaById(id: number): Promise<Categoria> {
  const { data } = await axios.get<Categoria>(`${API_URL}/${id}`)
  return data
}

export async function criarCategoria(payload: CreateCategoriaDto): Promise<Categoria> {
  const { data } = await axios.post<Categoria>(API_URL, payload)
  return data
}

export async function atualizarCategoria(id: number, payload: UpdateCategoriaDto): Promise<void> {
  await axios.put(`${API_URL}/${id}`, payload)
}

export async function deletarCategoria(id: number): Promise<void> {
  await axios.delete(`${API_URL}/${id}`)
}
