// src/services/notaCompraService.ts
import axios from "axios"

export type CreateNotaCompraItemDto = {
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
}

export type CreateNotaCompraParcelaDto = {
  numero: number
  formaPagamentoId?: number | null
  dataVencimento: string
  valorParcela: number
}

export type CreateNotaCompraDto = {
  modelo?: string | null
  serie?: string | null
  numero: number
  fornecedorId: number
  dataEmissao: string
  dataChegada: string
  tipoFrete?: "CIF" | "FOB" | null
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
  parcelas: CreateNotaCompraParcelaDto[]
}

const api = axios.create({ baseURL: "/api" })

export async function criarNotaCompra(payload: CreateNotaCompraDto) {
  const { data } = await api.post<number>("/notas-compra", payload)
  return data
}

export async function obterNotaCompra(id: number) {
  const { data } = await api.get(`/notas-compra/${id}`)
  return data
}
