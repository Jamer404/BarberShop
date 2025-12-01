import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash, Eye } from "lucide-react"

import { getProdutos, deletarProduto, Produto } from "@/services/produtoService"
import { getUnidadesMedida, UnidadeMedida } from "@/services/unidadeMedidaService"
import { getMarcas, Marca } from "@/services/marcaService"
import { getCategorias, Categoria } from "@/services/categoriaService"
import { ModalProduto } from "@/components/modals/ModalProduto"
import { ModalConfirm } from "@/components/modals/ModalConfirm"


export default function Produtos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])

  const [isModalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Produto | null>(null)
  const [viewOnly, setViewOnly] = useState(false)

  const [isConfirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected] = useState<Produto | null>(null)

  useEffect(()=>{ fetchAll() }, [])
  async function fetchAll(){
    setLoading(true);
    try {
      const [prods, uns, ms, cs] = await Promise.all([
        getProdutos(),
        getUnidadesMedida(),
        getMarcas(),
        getCategorias()
      ])
      setProdutos(prods)
      setUnidades(uns)
      setMarcas(ms)
      setCategorias(cs)
    } finally { setLoading(false) }
  }

  function openCreate(){ setEditing(null); setViewOnly(false); setModalOpen(true) }
  function openEdit(p: Produto){ setEditing(p); setViewOnly(false); setModalOpen(true) }
  function openView(p: Produto){ setEditing(p); setViewOnly(true); setModalOpen(true) }
  function openDelete(p: Produto){ setSelected(p); setConfirmOpen(true) }

  async function handleDelete(){
    if(!selected) return
    await deletarProduto(selected.id)
    setProdutos(prev => prev.filter(x => x.id !== selected.id))
  }

  function getNomeUnidade(id: number|null) {
    return unidades.find(u => u.id === id)?.nome || "-"
  }
  function getNomeMarca(id: number|null) {
    return marcas.find(m => m.id === id)?.nome || "-"
  }
  function getNomeCategoria(id: number|null) {
    return categorias.find(c => c.id === id)?.nome || "-"
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalProduto
        isOpen={isModalOpen}
        onOpenChange={(o)=>{ setModalOpen(o); if(!o) setViewOnly(false) }}
        produto={editing ?? undefined}
        carregarProdutos={fetchAll}
        readOnly={viewOnly}
      />

      <ModalConfirm
        isOpen={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        description={<>Deseja excluir o produto <span className="uppercase">{selected?.descricao}</span>?</>}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Produtos</h2>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Novo Produto</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Produtos</CardTitle>
          <CardDescription>Lista de produtos cadastrados.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p>Carregando...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço Venda</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="text-right">{p.id}</TableCell>
                    <TableCell className="uppercase">{p.descricao}</TableCell>
                    <TableCell>{getNomeUnidade(p.unidadeId)}</TableCell>
                    <TableCell>{getNomeMarca(p.marcaId)}</TableCell>
                    <TableCell>{getNomeCategoria(p.categoriaId)}</TableCell>
                    <TableCell>R$ {p.precoVenda.toFixed(2).replace('.', ',')}</TableCell>
                    <TableCell>{p.estoque}</TableCell>
                    <TableCell>{p.ativo ? "Habilitado" : "Desabilitado"}</TableCell>
                    <TableCell className="flex justify-center items-center gap-2">
                      <Button variant="outline" size="icon" onClick={()=>openView(p)}><Eye className="h-4 w-4"/></Button>
                      <Button variant="outline" size="icon" onClick={()=>openEdit(p)}><Edit className="h-4 w-4"/></Button>
                      <Button variant="outline" size="icon" onClick={()=>openDelete(p)}><Trash className="h-4 w-4"/></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
