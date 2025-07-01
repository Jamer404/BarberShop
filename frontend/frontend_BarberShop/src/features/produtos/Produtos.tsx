import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Plus, Search, Edit, Trash } from "lucide-react"
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from "react-toastify"
import { ProdutoSchema } from "@/validations/produto"

type Produto = {
  id: number
  nome: string
  unidade: string
  precoVenda: number
  ativo: boolean
  modeloId: number
  modeloNome: string
  marca: string
  fornecedorId: number
  fornecedorNome: string
  saldo: number
  custoMedio: number
  precoUltCompra: number
  dataUltCompra: string
  observacao: string
  dataCriacao: string
  dataAtualizacao: string
}

export default function Produtos() {
  const mockProdutos: Produto[] = [
    {
      id: 1,
      nome: "GARRAFA TÉRMICA P",
      unidade: "UN",
      precoVenda: 0,
      ativo: true,
      modeloId: 1,
      modeloNome: "TÉRMICA P",
      marca: "TERMOPLAST",
      fornecedorId: 1,
      fornecedorNome: "EMPRESA ALPHA LTDA",
      saldo: 10,
      custoMedio: 15,
      precoUltCompra: 15,
      dataUltCompra: "2024-05-10",
      observacao: "",
      dataCriacao: "2024-05-10",
      dataAtualizacao: "2024-05-10",
    },
    {
      id: 2,
      nome: "CUIA CHIMARRÃO",
      unidade: "PC",
      precoVenda: 70,
      ativo: true,
      modeloId: 2,
      modeloNome: "CUIA PREMIUM",
      marca: "GAÚCHA",
      fornecedorId: 2,
      fornecedorNome: "BETA COMERCIAL EIRELI",
      saldo: 5,
      custoMedio: 40,
      precoUltCompra: 40,
      dataUltCompra: "2024-06-20",
      observacao: "",
      dataCriacao: "2024-06-20",
      dataAtualizacao: "2024-06-20",
    },
  ]

  const [produtos, setProdutos] = useState<Produto[]>(mockProdutos)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Produto | null>(null)
  const [form, setForm] = useState<Omit<Produto, "id" | "dataCriacao" | "dataAtualizacao">>({
    nome: "",
    unidade: "",
    precoVenda: 0,
    ativo: true,
    modeloId: 0,
    modeloNome: "",
    marca: "",
    fornecedorId: 0,
    fornecedorNome: "",
    saldo: 0,
    custoMedio: 0,
    precoUltCompra: 0,
    dataUltCompra: "",
    observacao: "",
  })

  function carregar() { setLoading(false) }

  function salvar() {
    const parsed = ProdutoSchema.safeParse(form);
    console.log(parsed.error, form)
      if (!parsed.success) {
        toast.error("Preencha todos os campos corretamente");
        return;
      }
    try {
      if (editing) {
        setProdutos((prev) =>
          prev.map((p) =>
            p.id === editing.id ? { ...p, ...form, dataAtualizacao: new Date().toISOString() } : p,
          ),
        )
      } else {
        const novo: Produto = {
          ...form,
          id: produtos.length ? Math.max(...produtos.map((p) => p.id)) + 1 : 1,
          dataCriacao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString(),
        }
        setProdutos((prev) => [...prev, novo])
      }
      setModalOpen(false)
    } catch (error) {
      toast.error("Erro ao salvar o produto. Verifique os dados e tente novamente.")
    }
  }

  function remover(id: number) {
    setProdutos((prev) => prev.filter((p) => p.id !== id))
  }

  function openCreate() {
    setEditing(null)
    setForm({
      nome: "",
      unidade: "",
      precoVenda: 0,
      ativo: true,
      modeloId: 0,
      modeloNome: "",
      marca: "",
      fornecedorId: 0,
      fornecedorNome: "",
      saldo: 0,
      custoMedio: 0,
      precoUltCompra: 0,
      dataUltCompra: "",
      observacao: "",
    })
    setModalOpen(true)
  }

  function openEdit(p: Produto) {
    setEditing(p)
    setForm({ ...p })
    setModalOpen(true)
  }

  useEffect(() => { carregar() }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Consulta de Produtos</CardTitle>
          <CardDescription>Buscar, incluir, alterar ou excluir produtos.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* <div className="flex items-center gap-2 pb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." className="pl-8 w-[300px]" />
            </div>
          </div> */}
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Preço Venda</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.nome}</TableCell>
                    <TableCell>{p.unidade}</TableCell>
                    <TableCell>{p.precoVenda.toFixed(2)}</TableCell>
                    <TableCell className="flex justify-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEdit(p)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Excluir <strong>{p.nome}</strong>?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => remover(p.id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-5xl w-full max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[70vh] pr-2 grid grid-cols-4 gap-4 py-2 text-sm">
            <div className="col-span-1 flex flex-col">
              <label>Código</label>
              <Input value={editing ? editing.id : "0"} disabled />
            </div>
            <div className="col-span-1 flex flex-col">
              <label>Status</label>
              <div className="flex gap-4 border rounded px-2 py-1">
                <label className="flex items-center gap-1">
                  <input type="radio" checked={form.ativo} onChange={() => setForm({ ...form, ativo: true })} />
                  Ativo
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" checked={!form.ativo} onChange={() => setForm({ ...form, ativo: false })} />
                  Inativo
                </label>
              </div>
            </div>
            <div className="col-span-2 flex flex-col">
              <label>Produto*</label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="col-span-1 flex flex-col">
              <label>Un. de medida*</label>
              <Input value={form.unidade} onChange={(e) => setForm({ ...form, unidade: e.target.value.toUpperCase() })} />
            </div>
            <div className="col-span-1 flex flex-col">
              <label>Cód. Modelo*</label>
              <Input type="number" value={form.modeloId} onChange={(e) => setForm({ ...form, modeloId: Number(e.target.value) })} />
            </div>
            <div className="col-span-1 flex flex-col">
              <label>Modelo*</label>
              <Input value={form.modeloNome} onChange={(e) => setForm({ ...form, modeloNome: e.target.value })} />
            </div>
            <div className="col-span-1 flex flex-col">
              <label>Marca*</label>
              <Input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
            </div>
            <div className="col-span-1 flex flex-col">
              <label>Cód. Fornecedor*</label>
              <Input type="number" value={form.fornecedorId} onChange={(e) => setForm({ ...form, fornecedorId: Number(e.target.value) })} />
            </div>
            <div className="col-span-3 flex flex-col">
              <label>Fornecedor*</label>
              <Input value={form.fornecedorNome} onChange={(e) => setForm({ ...form, fornecedorNome: e.target.value })} />
            </div>
            <div className="col-span-1 flex flex-col">
              <label>Saldo*</label>
              <Input type="number" value={form.saldo} onChange={(e) => setForm({ ...form, saldo: Number(e.target.value) })} />
            </div>
            <div className="col-span-1 flex flex-col">
              <label>Custo Médio*</label>
              <Input type="number" value={form.custoMedio} onChange={(e) => setForm({ ...form, custoMedio: Number(e.target.value) })} />
            </div>
            <div className="col-span-1 flex flex-col">
              <label>Preço Venda*</label>
              <Input type="number" value={form.precoVenda} onChange={(e) => setForm({ ...form, precoVenda: Number(e.target.value) })} />
            </div>
            <div className="col-span-1 flex flex-col">
              <label>Preço Ult. Compra</label>
              <Input type="number" value={form.precoUltCompra} onChange={(e) => setForm({ ...form, precoUltCompra: Number(e.target.value) })} />
            </div>
            <div className="col-span-1 flex flex-col">
              <label>Data Ult. Compra</label>
              <Input type="date" value={form.dataUltCompra} onChange={(e) => setForm({ ...form, dataUltCompra: e.target.value })} />
            </div>
            <div className="col-span-4 flex flex-col">
              <label>Observação</label>
              <Input value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} />
            </div>
            <div className="col-span-1 flex flex-col">
              <label>Data Cadastro</label>
              <Input value={editing?.dataCriacao?.slice(0, 10) || ""} disabled />
            </div>
            <div className="col-span-1 flex flex-col">
              <label>Data Últ. Alt.</label>
              <Input value={editing?.dataAtualizacao?.slice(0, 10) || ""} disabled />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={salvar}>{editing ? "Atualizar" : "Salvar"}</Button>
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}