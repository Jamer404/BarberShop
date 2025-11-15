import axios from "axios"

const API_URL = "https://localhost:7145/api/Cargos"

export interface CreateCargoDto {
  nome: string
  setor?: string
  salarioBase: number
  exigeCnh: boolean
  ativo: boolean
}

export interface UpdateCargoDto {
  nome: string
  setor?: string
  salarioBase: number
  exigeCnh: boolean
  ativo: boolean
}

export interface Cargo {
  id: number
  nome: string
  setor?: string
  salarioBase: number
  exigeCnh: boolean
  ativo: boolean
  dataCriacao: string
  dataAtualizacao: string | null
}

export async function getCargos(): Promise<Cargo[]> {
  const { data } = await axios.get<Cargo[]>(API_URL)
  return data
}

export async function getCargoById(id: number): Promise<Cargo> {
  const { data } = await axios.get<Cargo>(`${API_URL}/${id}`)
  return data
}

export async function criarCargo(payload: CreateCargoDto): Promise<Cargo> {
  const { data } = await axios.post<Cargo>(API_URL, payload)
  return data
}

export async function atualizarCargo(id: number, payload: UpdateCargoDto): Promise<void> {
  await axios.put(`${API_URL}/${id}`, payload)
}

export async function deletarCargo(id: number): Promise<void> {
  await axios.delete(`${API_URL}/${id}`)
}
