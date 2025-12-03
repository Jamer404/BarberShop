import axios from "axios"

export interface Cliente {
  id: number
  nomeRazaoSocial: string
  apelidoNomeFantasia: string | null
  cpfCnpj: string
  rgInscricaoEstadual: string | null
  pf: boolean
  sexo: "M" | "F"
  dataNascimento: string | null 
  email: string | null
  telefone: string | null
  rua: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cep: string | null
  idCidade: number
  idCondicaoPagamento: number
  limiteCredito: number
  ativo: boolean
  dataCriacao: string
  dataAtualizacao: string
}

export interface CreateClienteDto {
  nomeRazaoSocial: string
  apelidoNomeFantasia?: string | null
  cpfCnpj: string
  rgInscricaoEstadual?: string | null
  pf: boolean
  sexo: "M" | "F"
  dataNascimento: string | null
  email?: string | null
  telefone?: string | null
  rua?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cep?: string | null
  idCidade: number
  idCondicaoPagamento: number
  limiteCredito: number
  ativo: boolean
}

export interface UpdateClienteDto extends CreateClienteDto {}

const BASE_URL = "https://localhost:7145/api/Cliente"

export async function getClientes(): Promise<Cliente[]> {
  const { data } = await axios.get<Cliente[]>(BASE_URL)
  return data
}

export async function getClienteById(id: number): Promise<Cliente> {
  const { data } = await axios.get<Cliente>(`${BASE_URL}/${id}`)
  return data
}

export async function criarCliente(dto: CreateClienteDto): Promise<Cliente> {
  const { data } = await axios.post<Cliente>(BASE_URL, dto)
  return data
}

export async function atualizarCliente(
  id: number,
  dto: UpdateClienteDto,
): Promise<void> {
  await axios.put(`${BASE_URL}/${id}`, dto)
}

export async function deletarCliente(id: number): Promise<void> {
  await axios.delete(`${BASE_URL}/${id}`)
}