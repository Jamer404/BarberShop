// src/services/contaPagarService.ts
import axios from "axios"

const API_URL = "https://localhost:7145/api/ContaPagar"

export interface ContaPagar {
  id: number
  notaCompraId?: number | null
  fornecedorId: number
  modelo: string
  serie: string
  numero: string
  numParcela: number
  valorParcela: number
  dataEmissao: string
  dataVencimento: string
  dataPagamento?: string | null
  valorPago?: number | null
  juros: number
  multa: number
  desconto: number
  status: string
  formaPagamentoId?: number | null
  observacao?: string | null
  criadoEm: string
  atualizadoEm?: string | null
}

export interface CreateContaPagarDto {
  notaCompraId?: number | null
  fornecedorId: number
  modelo: string
  serie: string
  numero: string
  numParcela: number
  valorParcela: number
  dataEmissao: string
  dataVencimento: string
  juros: number
  multa: number
  desconto: number
  status?: string | null
  formaPagamentoId?: number | null
  observacao?: string | null
}

export interface UpdateContaPagarDto {
  dataVencimento: string
  dataPagamento?: string | null
  valorPago?: number | null
  juros: number
  multa: number
  desconto: number
  status: string
  formaPagamentoId?: number | null
  observacao?: string | null
}

export async function getContasPagar(): Promise<ContaPagar[]> {
  const { data } = await axios.get<ContaPagar[]>(API_URL)
  return data
}

export async function getContaPagarByNota(
  fornecedorId: number,
  modelo: string,
  serie: string,
  numero: string
): Promise<ContaPagar[]> {
  const { data } = await axios.get<ContaPagar[]>(
    `${API_URL}/nota/${fornecedorId}/${modelo}/${serie}/${numero}`
  )
  return data
}

export async function getContaPagarById(id: number): Promise<ContaPagar> {
  const { data } = await axios.get<ContaPagar>(`${API_URL}/${id}`)
  return data
}

export async function criarContaPagar(payload: CreateContaPagarDto): Promise<number> {
  const { data } = await axios.post<number>(API_URL, payload)
  return data
}

export async function atualizarContaPagar(id: number, payload: UpdateContaPagarDto): Promise<void> {
  await axios.put(`${API_URL}/${id}`, payload)
}

export async function deletarContaPagar(id: number): Promise<void> {
  await axios.delete(`${API_URL}/${id}`)
}
