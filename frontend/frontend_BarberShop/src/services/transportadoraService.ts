import axios from "axios"
const API_URL = "https://localhost:7145/api/Transportadora"

export type TipoPessoa = "F" | "J"

export interface CreateTransportadoraDto {
  tipoPessoa: TipoPessoa
  razaoSocial: string
  nomeFantasia?: string
  endereco?: string
  numero?: string
  complemento?: string
  bairro?: string
  cep?: string
  idCidade?: number | null
  cnpj?: string
  inscricaoEstadual?: string
  idCondicaoPagamento?: number | null
  ativo: boolean
  emails: string[]
  telefones: string[]
  veiculoIds: number[]
}
export interface UpdateTransportadoraDto extends CreateTransportadoraDto {}

export interface Transportadora extends CreateTransportadoraDto {
  id: number
  dataCriacao: string
  dataAtualizacao: string
}

export async function getTransportadoraById(id: number): Promise<Transportadora> {
  const { data } = await axios.get<Transportadora>(`${API_URL}/${id}`)
  return data
}

export async function getTransportadoras(): Promise<Transportadora[]> {
  const { data } = await axios.get<Transportadora[]>(API_URL)
  return data
}
export async function criarTransportadora(payload: CreateTransportadoraDto): Promise<number> {
  const { data } = await axios.post<number>(API_URL, payload)
  return data
}
export async function atualizarTransportadora(id: number, payload: UpdateTransportadoraDto): Promise<void> {
  await axios.put(`${API_URL}/${id}`, payload)
}
export async function deletarTransportadora(id: number): Promise<void> {
  await axios.delete(`${API_URL}/${id}`)
}
