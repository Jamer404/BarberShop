// src/services/fornecedorService.ts
import axios from "axios";

const API_URL = "https://localhost:7145/api/Fornecedor";

export interface CreateFornecedorDto {
  tipoPessoa: "F" | "J";
  nomeRazaoSocial: string;
  apelidoNomeFantasia: string;
  dataNascimentoCriacao: string; // yyyy-MM-dd
  cpfCnpj?: string;
  rgInscricaoEstadual?: string;
  email?: string;
  telefone?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  classificacao?: string;
  complemento?: string;
  formaPagamentoId: number;
  condicaoPagamentoId: number;
  idCidade: number;
  valorMinimoPedido?: number | null;
}

export interface UpdateFornecedorDto extends CreateFornecedorDto {}

export interface Fornecedor {
  id: number;
  dataCriacao: string;
  dataAtualizacao: string;

  tipoPessoa: "F" | "J";
  nomeRazaoSocial: string;
  apelidoNomeFantasia: string;
  dataNascimentoCriacao: string;

  cpfCnpj?: string | null;
  rgInscricaoEstadual?: string | null;
  email?: string | null;
  telefone?: string | null;

  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cep?: string | null;
  classificacao?: string | null;
  complemento?: string | null;

  formaPagamentoId: number;
  condicaoPagamentoId: number;
  idCidade: number;

  valorMinimoPedido?: number | null;
}

export async function getFornecedores(): Promise<Fornecedor[]> {
  const { data } = await axios.get<Fornecedor[]>(API_URL);
  return data;
}
export async function getFornecedorById(id: number): Promise<Fornecedor> {
  const { data } = await axios.get<Fornecedor>(`${API_URL}/${id}`);
  return data;
}
export async function criarFornecedor(payload: CreateFornecedorDto): Promise<number> {
  const { data } = await axios.post<number>(API_URL, payload);
  return data;
}
export async function atualizarFornecedor(id: number, payload: UpdateFornecedorDto): Promise<void> {
  await axios.put(`${API_URL}/${id}`, payload);
}
export async function deletarFornecedor(id: number): Promise<void> {
  await axios.delete(`${API_URL}/${id}`);
}
