import axios from "axios"

const BASE_URL = "https://localhost:7145/api/Fornecedor"

export interface Fornecedor {
  id: number
  nomeRazaoSocial: string
  cpfCnpj: string
  telefone: string
  email: string
  formaPagamentoId: number
  condicaoPagamentoId: number
  idCidade: number
  valorMinimoPedido: number | null
  dataCriacao: string
  dataAtualizacao: string
  pessoaFisica?: boolean
  ativo?: boolean
  apelido?: string | null
  sexo?: string | null
  celular?: string | null
  cep?: string | null
  endereco?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  rg?: string | null
  dataNascimento?: string | null
}

export interface CreateFornecedorDto {
  nomeRazaoSocial: string
  cpfCnpj: string
  telefone: string
  email: string
  formaPagamentoId: number
  condicaoPagamentoId: number
  idCidade: number
  valorMinimoPedido: number | null
}

export type UpdateFornecedorDto = CreateFornecedorDto

export async function getFornecedores(): Promise<Fornecedor[]> {
  const { data } = await axios.get<Fornecedor[]>(BASE_URL)
  return data
}

export async function criarFornecedor(dto: CreateFornecedorDto) {
  const { data } = await axios.post<number>(BASE_URL, dto)
  return data
}

export async function atualizarFornecedor(id: number, dto: UpdateFornecedorDto) {
  await axios.put(`${BASE_URL}/${id}`, dto)
}

export async function deletarFornecedor(id: number) {
  await axios.delete(`${BASE_URL}/${id}`)
}
