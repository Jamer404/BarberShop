import axios from "axios"

const API_URL = "https://localhost:7145/api/Veiculo"

export interface CreateVeiculoDto {
  placa: string
  modelo: string
  descricao?: string
  ativo: boolean
}

export interface UpdateVeiculoDto {
  modelo: string
  descricao?: string
  ativo: boolean
}

export interface Veiculo {
  id: number
  placa: string
  modelo: string
  descricao?: string
  ativo: boolean
  dataCriacao: string
  dataAtualizacao: string
}

export async function getVeiculos(): Promise<Veiculo[]> {
  const { data } = await axios.get<Veiculo[]>(API_URL)
  return data
}

export async function getVeiculoById(id: number): Promise<Veiculo> {
  const { data } = await axios.get<Veiculo>(`${API_URL}/${id}`)
  return data
}

export async function criarVeiculo(payload: CreateVeiculoDto): Promise<Veiculo> {
  const { data } = await axios.post<Veiculo>(API_URL, payload)
  return data
}

export async function atualizarVeiculo(id: number, payload: UpdateVeiculoDto): Promise<void> {
  await axios.put(`${API_URL}/${id}`, payload)
}

export async function deletarVeiculo(id: number): Promise<void> {
  await axios.delete(`${API_URL}/${id}`)
}
