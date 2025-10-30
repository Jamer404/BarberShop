import axios from "axios";

export interface Produto {
  id: number;
  codigo: string;
  nome: string;
  unidade: string;
  quantidade: number;
  precoUN: number;
  desconto: number;
  liquidoUN: number;
  precoTotal: number;
  rateio?: number;
  custoFinalUN?: number;
  custoFinal?: number;
  precoVenda: number;
  ativo: boolean;
  modeloId: number;
  modeloNome: string;
  marca: string;
  fornecedorId: number;
  fornecedorNome: string;
  saldo: number;
  custoMedio: number;
  precoUltCompra: number;
  dataUltCompra: string;
  observacao: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

const API_URL = "/api/produtos";

export const produtoService = {
  async listar(): Promise<Produto[]> {
  const { data } = await axios.get<Produto[]>(API_URL);
  return data;
  },
  async criar(produto: Produto): Promise<Produto> {
  const { data } = await axios.post<Produto>(API_URL, produto);
  return data;
  },
  async atualizar(produto: Produto): Promise<Produto> {
  const { data } = await axios.put<Produto>(`${API_URL}/${produto.id}`, produto);
  return data;
  },
  async remover(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}`);
  },
};
