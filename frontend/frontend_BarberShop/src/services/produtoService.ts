import axios from "axios"

const API_URL = "https://localhost:7145/api/Produto"

export interface CreateProdutoDto {
  descricao: string
  unidadeId?: number | null
  marcaId?: number | null
  categoriaId?: number | null
  codigoBarras?: string | null
  referencia?: string | null
  custoCompra: number
  precoVenda: number
  lucroPercentual: number
  estoque: number
  estoqueMinimo: number
  ativo: boolean
}

export interface UpdateProdutoDto extends CreateProdutoDto {}

export interface Produto {
  id: number
  descricao: string
  unidadeId: number | null
  marcaId: number | null
  categoriaId: number | null
  codigoBarras: string | null
  referencia: string | null
  custoCompra: number
  precoVenda: number
  lucroPercentual: number
  estoque: number
  estoqueMinimo: number
  ativo: boolean
  dataCriacao: string
  dataAtualizacao: string
}

export async function getProdutos(): Promise<Produto[]> {
  const { data } = await axios.get<Produto[]>(API_URL)
  return data
}

export async function getProdutoById(id: number): Promise<Produto> {
  const { data } = await axios.get<Produto>(`${API_URL}/${id}`)
  return data
}

export async function criarProduto(payload: CreateProdutoDto): Promise<number> {
  const { data } = await axios.post<number>(API_URL, payload)
  return data // controller retorna o id no CreatedAtAction
}

export async function atualizarProduto(id: number, payload: UpdateProdutoDto): Promise<void> {
  await axios.put(`${API_URL}/${id}`, payload)
}

export async function deletarProduto(id: number): Promise<void> {
  await axios.delete(`${API_URL}/${id}`)
}
