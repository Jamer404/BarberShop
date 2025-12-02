// src/services/notaVendaService.ts
import axios from "axios"

const API_URL = "https://localhost:7145/api/Venda"

export interface NotaVendaProduto {
  numeroNota: string
  modelo: string
  serie: string
  clienteId: number
  produtoId: number
  quantidade: number
  precoUnit: number
  desconto: number
  criadoEm: string
  atualizadoEm?: string | null
}

export interface NotaVenda {
  numeroNota: string
  modelo: string
  serie: string
  clienteId: number
  dataEmissao: string
  transportadoraId?: number | null
  placaVeiculo?: string | null
  tipoFrete: string
  valorFrete: number
  totalProdutos: number
  totalPagar: number
  condicaoPagamentoId?: number | null
  observacao?: string | null
  dataCancelamento?: string | null
  criadoEm: string
  atualizadoEm?: string | null
}

export interface CreateNotaVendaProdutoDto {
  produtoId: number
  quantidade: number
  precoUnit: number
  desconto: number
}

export interface CreateNotaVendaDto {
  numeroNota: string
  modelo: string
  serie: string
  clienteId: number
  dataEmissao: string
  transportadoraId?: number | null
  placaVeiculo?: string | null
  tipoFrete: string
  valorFrete: number
  totalProdutos: number
  totalPagar: number
  condicaoPagamentoId?: number | null
  observacao?: string | null
  itens: CreateNotaVendaProdutoDto[]
}

export interface UpdateNotaVendaDto {
  dataEmissao: string
  transportadoraId?: number | null
  placaVeiculo?: string | null
  tipoFrete: string
  valorFrete: number
  totalProdutos: number
  totalPagar: number
  condicaoPagamentoId?: number | null
  observacao?: string | null
  dataCancelamento?: string | null
  itens: CreateNotaVendaProdutoDto[]
}

export async function getNotasVenda(): Promise<NotaVenda[]> {
  const { data } = await axios.get<NotaVenda[]>(API_URL)
  return data
}

export async function getNotaVendaById(
  numeroNota: string,
  modelo: string,
  serie: string,
  clienteId: number
): Promise<NotaVenda> {
  const { data } = await axios.get<NotaVenda>(
    `${API_URL}/${numeroNota}/${modelo}/${serie}/${clienteId}`
  )
  return data
}

export async function criarNotaVenda(payload: CreateNotaVendaDto): Promise<void> {
  await axios.post(API_URL, payload)
}

export async function atualizarNotaVenda(
  numeroNota: string,
  modelo: string,
  serie: string,
  clienteId: number,
  payload: UpdateNotaVendaDto
): Promise<void> {
  await axios.put(`${API_URL}/${numeroNota}/${modelo}/${serie}/${clienteId}`, payload)
}

export async function deletarNotaVenda(
  numeroNota: string,
  modelo: string,
  serie: string,
  clienteId: number
): Promise<void> {
  await axios.delete(`${API_URL}/${numeroNota}/${modelo}/${serie}/${clienteId}`)
}

export async function getNotaVendaProdutos(
  numeroNota: string,
  modelo: string,
  serie: string,
  clienteId: number
): Promise<NotaVendaProduto[]> {
  const { data } = await axios.get<NotaVendaProduto[]>(
    `${API_URL}/${numeroNota}/${modelo}/${serie}/${clienteId}/itens`
  )
  return data
}
