import axios from "axios"

const BASE_URL = "https://localhost:7145/api/CondicaoPagamento"

export interface ParcelaCondicaoPagamento {
  id: number
  numero: number
  dias: number
  percentual: number
  formaPagamentoId: number
  formaPagamento?: {
    id: number
    descricao: string
    dataCriacao: string
    dataAtualizacao: string
    ativo: boolean
  }
  dataCriacao: string
  dataAtualizacao: string
}

export interface CondicaoPagamento {
  id: number
  descricao: string
  taxaJuros: number
  multa: number
  desconto: number
  parcelas: ParcelaCondicaoPagamento[]
  dataCriacao: string
  dataAtualizacao: string
}

export interface ParcelaDto {
  numero: number
  dias: number
  percentual: number
  formaPagamentoId: number
}

export interface CreateCondicaoPagamentoDto {
  descricao: string
  taxaJuros: number
  multa: number
  desconto: number
  parcelas: ParcelaDto[]
}

export type UpdateCondicaoPagamentoDto = CreateCondicaoPagamentoDto

function toPayload(dto: CreateCondicaoPagamentoDto) {
  return {
    Descricao: dto.descricao,
    TaxaJuros: dto.taxaJuros,
    Multa: dto.multa,
    Desconto: dto.desconto,
    Parcelas: dto.parcelas.map((p) => ({
      Numero: p.numero,
      Dias: p.dias,
      Percentual: p.percentual,
      FormaPagamentoId: p.formaPagamentoId,
    })),
  }
}

export async function getCondicoesPagamento(): Promise<CondicaoPagamento[]> {
  const { data } = await axios.get<CondicaoPagamento[]>(BASE_URL)
  return data
}

export async function getCondicaoPagamento(
  id: number,
): Promise<CondicaoPagamento> {
  const { data } = await axios.get<CondicaoPagamento>(`${BASE_URL}/${id}`)
  return data
}

export async function criarCondicaoPagamento(
  dto: CreateCondicaoPagamentoDto,
) {
  const { data } = await axios.post<number>(BASE_URL, toPayload(dto))
  return data
}

export async function atualizarCondicaoPagamento(
  id: number,
  dto: UpdateCondicaoPagamentoDto,
) {
  await axios.put(`${BASE_URL}/${id}`, toPayload(dto))
}

export async function deletarCondicaoPagamento(id: number) {
  await axios.delete(`${BASE_URL}/${id}`)
}

export async function getParcelasByCondicaoId(
  id: number,
): Promise<ParcelaCondicaoPagamento[]> {
  const { data } = await axios.get<ParcelaCondicaoPagamento[]>(
    `${BASE_URL}/${id}/parcelas`,
  )
  return data
}
