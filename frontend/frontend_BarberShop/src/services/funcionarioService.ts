import axios from "axios"

const API_URL = "https://localhost:7145/api/Funcionario"

export interface CreateFuncionarioDto {
  nome: string
  sexo: "M" | "F"
  endereco?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cep?: string | null
  idCidade?: number | null
  cpf?: string | null
  rg?: string | null
  dataNascimento?: string | null        
  dataAdmissao: string                  
  dataDemissao?: string | null         
  idCargo?: number | null
  cargaHoraria?: string | null
  salario?: number | null              
  email?: string | null
  telefone?: string | null
  ativo: boolean
}

export interface UpdateFuncionarioDto extends CreateFuncionarioDto {}

export interface Funcionario {
  id: number
  nome: string
  sexo: "M" | "F"
  endereco: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cep: string | null
  idCidade: number | null
  cpf: string | null
  rg: string | null
  dataNascimento: string | null
  dataAdmissao: string
  dataDemissao: string | null
  idCargo: number | null
  cargaHoraria: string | null
  salario: number | null
  email: string | null
  telefone: string | null
  ativo: boolean
  dataCriacao: string
  dataAtualizacao: string | null
}

export async function getFuncionarios(): Promise<Funcionario[]> {
  const { data } = await axios.get<Funcionario[]>(API_URL)
  return data
}

export async function getFuncionarioById(id: number): Promise<Funcionario> {
  const { data } = await axios.get<Funcionario>(`${API_URL}/${id}`)
  return data
}

export async function criarFuncionario(payload: CreateFuncionarioDto): Promise<Funcionario> {
  // Não envie strings vazias para campos nullable -> converte "" para null
  const sanitized = sanitizeFuncionarioPayload(payload)
  const { data } = await axios.post<Funcionario>(API_URL, sanitized)
  return data
}

export async function atualizarFuncionario(id: number, payload: UpdateFuncionarioDto): Promise<void> {
  const sanitized = sanitizeFuncionarioPayload(payload)
  await axios.put(`${API_URL}/${id}`, sanitized)
}

export async function deletarFuncionario(id: number): Promise<void> {
  await axios.delete(`${API_URL}/${id}`)
}

/** Converte "" -> null nos campos que podem ser nulos e garante tipos */
function sanitizeFuncionarioPayload<T extends CreateFuncionarioDto | UpdateFuncionarioDto>(p: T): T {
  return {
    ...p,
    endereco: emptyToNull(p.endereco),
    numero: emptyToNull(p.numero),
    complemento: emptyToNull(p.complemento),
    bairro: emptyToNull(p.bairro),
    cep: emptyToNull(p.cep),
    cpf: emptyToNull(p.cpf),
    rg: emptyToNull(p.rg),
    dataNascimento: emptyToNull(p.dataNascimento),
    dataDemissao: emptyToNull(p.dataDemissao),
    cargaHoraria: emptyToNull(p.cargaHoraria),
    email: emptyToNull(p.email),
    telefone: emptyToNull(p.telefone),
    idCidade: p.idCidade === null || p.idCidade === undefined || p.idCidade === ("" as any) ? null : Number(p.idCidade),
    idCargo: p.idCargo === null || p.idCargo === undefined || p.idCargo === ("" as any) ? null : Number(p.idCargo),
    salario: p.salario === null || p.salario === undefined || p.salario === ("" as any) ? null : Number(p.salario),
  } as T
}

function emptyToNull<T extends string | null | undefined>(v: T): T {
  return (v === "" ? null : v) as T
}
