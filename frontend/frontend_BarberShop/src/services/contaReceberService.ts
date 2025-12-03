// src/services/contaReceberService.ts
import axios from "axios"

const API_URL = "https://localhost:7145/api/ContaReceber"

export interface ContaReceber {
  id: number
  numeroNota: string
  modelo: string
  serie: string
  clienteId: number
  numParcela: number
  valorParcela: number
  dataEmissao: string
  dataVencimento: string
  dataRecebimento?: string | null
  valorRecebido?: number | null
  juros: number
  multa: number
  desconto: number
  status: string
  formaPagamentoId?: number | null
  observacao?: string | null
  criadoEm: string
  atualizadoEm?: string | null
}

export async function getContasReceber(): Promise<ContaReceber[]> {
  const { data } = await axios.get<ContaReceber[]>(API_URL)
  return data
}

export async function getContaReceberById(id: number): Promise<ContaReceber> {
  const { data } = await axios.get<ContaReceber>(`${API_URL}/${id}`)
  return data
}

export async function getContaReceberByNota(
  clienteId: number,
  modelo: string,
  serie: string,
  numeroNota: string
): Promise<ContaReceber[]> {
  const { data } = await axios.get<ContaReceber[]>(
    `${API_URL}/nota/${clienteId}/${modelo}/${serie}/${numeroNota}`
  )
  return data
}
