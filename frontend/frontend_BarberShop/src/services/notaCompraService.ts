// src/services/notaCompraService.ts
import axios from "axios"

const API_URL = "https://localhost:7145/api/Compra"

export interface NotaCompraItem {
  id: number
  notaCompraId: number
  produtoId: number
  unidadeId: number
  quantidade: number
  precoUnit: number
  descontoUnit: number
  liquidoUnit: number
  total: number
  rateio: number
  custoFinalUnit: number
  custoFinal: number
  criadoEm: string
}

export interface NotaCompra {
  id: number
  fornecedorId: number
  modelo: string
  serie: string
  numero: string
  dataEmissao: string
  dataChegada?: string | null
  tipoFrete: string
  valorFrete: number
  valorSeguro: number
  outrasDespesas: number
  totalProdutos: number
  totalPagar: number
  condicaoPagamentoId?: number | null
  transportadoraId?: number | null
  placaVeiculo?: string | null
  observacao?: string | null
  dataCancelamento?: string | null
  criadoEm: string
  atualizadoEm?: string | null
}

export interface CreateNotaCompraItemDto {
  produtoId: number
  unidadeId: number
  quantidade: number
  precoUnit: number
  descontoUnit: number
  liquidoUnit: number
  total: number
  rateio: number
  custoFinalUnit: number
}

export interface CreateNotaCompraDto {
  fornecedorId: number
  modelo: string
  serie: string
  numero: string
  dataEmissao: string
  dataChegada?: string | null
  tipoFrete: string
  valorFrete: number
  valorSeguro: number
  outrasDespesas: number
  totalProdutos: number
  totalPagar: number
  condicaoPagamentoId?: number | null
  transportadoraId?: number | null
  placaVeiculo?: string | null
  observacao?: string | null
  itens: CreateNotaCompraItemDto[]
}

export interface UpdateNotaCompraDto {
  dataChegada?: string | null
  tipoFrete: string
  valorFrete: number
  valorSeguro: number
  outrasDespesas: number
  totalProdutos: number
  totalPagar: number
  condicaoPagamentoId?: number | null
  transportadoraId?: number | null
  placaVeiculo?: string | null
  observacao?: string | null
  dataCancelamento?: string | null
}

export async function getNotasCompra(): Promise<NotaCompra[]> {
  const { data } = await axios.get<NotaCompra[]>(API_URL)
  return data
}

export async function getNotaCompraById(id: number): Promise<NotaCompra> {
  const { data } = await axios.get<NotaCompra>(`${API_URL}/${id}`)
  return data
}

export async function criarNotaCompra(payload: CreateNotaCompraDto): Promise<number> {
  const { data } = await axios.post<number>(API_URL, payload)
  return data
}

export async function atualizarNotaCompra(id: number, payload: UpdateNotaCompraDto): Promise<void> {
  await axios.put(`${API_URL}/${id}`, payload)
}

export async function deletarNotaCompra(id: number): Promise<void> {
  await axios.delete(`${API_URL}/${id}`)
}

export async function getNotaCompraItens(notaCompraId: number): Promise<NotaCompraItem[]> {
  const { data } = await axios.get<NotaCompraItem[]>(`${API_URL}/${notaCompraId}/itens`)
  return data
}
