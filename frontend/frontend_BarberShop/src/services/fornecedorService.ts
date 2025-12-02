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
  complemento?: string;
  condicaoPagamentoId: number;
  idCidade: number;
}

export interface UpdateFornecedorDto extends CreateFornecedorDto {}

interface FornecedorApiDto {
  TipoPessoa: "F" | "J";
  NomeRazaoSocial: string;
  ApelidoNomeFantasia: string;
  DataNascimentoCriacao: string;
  CpfCnpj: string;
  RgInscricaoEstadual: string;
  Email: string;
  Telefone: string;
  Rua: string;
  Numero: string;
  Bairro: string;
  Cep: string;
  Complemento: string;
  CondicaoPagamentoId: number;
  IdCidade: number;
}

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
  complemento?: string | null;

  condicaoPagamentoId: number;
  idCidade: number;
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
  const apiPayload: FornecedorApiDto = {
    TipoPessoa: payload.tipoPessoa,
    NomeRazaoSocial: payload.nomeRazaoSocial,
    ApelidoNomeFantasia: payload.apelidoNomeFantasia,
    DataNascimentoCriacao: payload.dataNascimentoCriacao,
    CpfCnpj: payload.cpfCnpj || "",
    RgInscricaoEstadual: payload.rgInscricaoEstadual || "",
    Email: payload.email || "",
    Telefone: payload.telefone || "",
    Rua: payload.rua || "",
    Numero: payload.numero || "",
    Bairro: payload.bairro || "",
    Cep: payload.cep || "",
    Complemento: payload.complemento || "",
    CondicaoPagamentoId: payload.condicaoPagamentoId,
    IdCidade: payload.idCidade,
  };
  
  console.log("Payload enviado para API:", JSON.stringify(apiPayload, null, 2));
  
  const { data } = await axios.post<number>(API_URL, apiPayload);
  return data;
}
export async function atualizarFornecedor(id: number, payload: UpdateFornecedorDto): Promise<void> {
  const apiPayload: FornecedorApiDto = {
    TipoPessoa: payload.tipoPessoa,
    NomeRazaoSocial: payload.nomeRazaoSocial,
    ApelidoNomeFantasia: payload.apelidoNomeFantasia,
    DataNascimentoCriacao: payload.dataNascimentoCriacao,
    CpfCnpj: payload.cpfCnpj || "",
    RgInscricaoEstadual: payload.rgInscricaoEstadual || "",
    Email: payload.email || "",
    Telefone: payload.telefone || "",
    Rua: payload.rua || "",
    Numero: payload.numero || "",
    Bairro: payload.bairro || "",
    Cep: payload.cep || "",
    Complemento: payload.complemento || "",
    CondicaoPagamentoId: payload.condicaoPagamentoId,
    IdCidade: payload.idCidade,
  };
  await axios.put(`${API_URL}/${id}`, apiPayload);
}
export async function deletarFornecedor(id: number): Promise<void> {
  await axios.delete(`${API_URL}/${id}`);
}
