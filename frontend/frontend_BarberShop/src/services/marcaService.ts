import axios from "axios"

const API_URL = "https://localhost:7145/api/Marca"

export interface CreateMarcaDto {
  codigo: number
  nome: string
  descricao?: string
  ativo: boolean
}

export interface UpdateMarcaDto {
  nome: string
  descricao?: string
  ativo: boolean
}

export interface Marca {
  id: number
  codigo: number
  nome: string
  descricao?: string
  ativo: boolean
  dataCriacao: string
  dataAtualizacao: string
}

export async function getMarcas(): Promise<Marca[]> {
  const { data } = await axios.get<Marca[]>(API_URL)
  return data
}

export async function getMarcaById(id: number): Promise<Marca> {
  const { data } = await axios.get<Marca>(`${API_URL}/${id}`)
  return data
}

export async function criarMarca(payload: CreateMarcaDto): Promise<Marca> {
  const { data } = await axios.post<Marca>(API_URL, payload)
  return data
}

export async function atualizarMarca(id: number, payload: UpdateMarcaDto): Promise<void> {
  await axios.put(`${API_URL}/${id}`, payload)
}

export async function deletarMarca(id: number): Promise<void> {
  await axios.delete(`${API_URL}/${id}`)
}
