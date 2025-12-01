import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ChevronDown } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Label } from "@/components/ui/label"

import {
  Produto,
  CreateProdutoDto,
  UpdateProdutoDto,
  criarProduto,
  atualizarProduto,
} from "@/services/produtoService"

import { UnidadeMedida, getUnidadesMedida } from "@/services/unidadeMedidaService"
import { Marca, getMarcas } from "@/services/marcaService"
import { Categoria, getCategorias } from "@/services/categoriaService"

import { ModalUnidadeMedida } from "@/components/modals/ModalUnidadeMedida"
import { ModalMarca } from "@/components/modals/ModalMarca"
import { ModalCategoria } from "@/components/modals/ModalCategoria"
import { toast } from "react-toastify"

type Props = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  carregarProdutos: () => void
  produto?: Produto
  readOnly?: boolean
  onSaved?: (produto: Produto) => void
}

export function ModalProduto({
  isOpen,
  onOpenChange,
  carregarProdutos,
  produto,
  readOnly = false,
  onSaved,
}: Props) {
  // listas auxiliares
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])

  // Selectores e modais auxiliares
  const [unSelOpen, setUnSelOpen] = useState(false)
  const [mcSelOpen, setMcSelOpen] = useState(false)
  const [ctSelOpen, setCtSelOpen] = useState(false)
  const [modalUnOpen, setModalUnOpen] = useState(false)
  const [modalMcOpen, setModalMcOpen] = useState(false)
  const [modalCtOpen, setModalCtOpen] = useState(false)
  const [reopenUn, setReopenUn] = useState(false)
  const [reopenMc, setReopenMc] = useState(false)
  const [reopenCt, setReopenCt] = useState(false)

  const [searchUn, setSearchUn] = useState("")
  const [searchMc, setSearchMc] = useState("")
  const [searchCt, setSearchCt] = useState("")

  // form
  const [form, setForm] = useState<CreateProdutoDto>({
    descricao: "",
    unidadeId: null,
    marcaId: null,
    categoriaId: null,
    codigoBarras: "",
    referencia: "",
    custoCompra: 0,
    precoVenda: 0,
    lucroPercentual: 0,
    estoque: 0,
    estoqueMinimo: 0,
    ativo: true,
  })

  const [errors, setErrors] = useState<{ 
    descricao?: string
    unidadeId?: string
    marcaId?: string
    categoriaId?: string
    custoCompra?: string
    precoVenda?: string
  }>({})

  const formatDate = (s?: string) => {
    if (!s) return ""
    const d = new Date(s)
    d.setHours(d.getHours() - 3)
    return d.toLocaleString("pt-BR")
  }

  // carregar listas quando o modal principal abre
  useEffect(() => {
    if (!isOpen) return
    Promise.allSettled([getUnidadesMedida(), getMarcas(), getCategorias()]).then(
      (r) => {
        if (r[0].status === "fulfilled") setUnidades(r[0].value || [])
        if (r[1].status === "fulfilled") setMarcas(r[1].value || [])
        if (r[2].status === "fulfilled") setCategorias(r[2].value || [])
      }
    )
  }, [isOpen])

  // preencher/limpar form
  useEffect(() => {
    if (produto) {
      setForm({
        descricao: produto.descricao,
        unidadeId: produto.unidadeId ?? null,
        marcaId: produto.marcaId ?? null,
        categoriaId: produto.categoriaId ?? null,
        codigoBarras: produto.codigoBarras ?? "",
        referencia: produto.referencia ?? "",
        custoCompra: produto.custoCompra,
        precoVenda: produto.precoVenda,
        lucroPercentual: produto.lucroPercentual,
        estoque: produto.estoque,
        estoqueMinimo: produto.estoqueMinimo,
        ativo: produto.ativo,
      })
    } else {
      setForm({
        descricao: "",
        unidadeId: null,
        marcaId: null,
        categoriaId: null,
        codigoBarras: "",
        referencia: "",
        custoCompra: 0,
        precoVenda: 0,
        lucroPercentual: 0,
        estoque: 0,
        estoqueMinimo: 0,
        ativo: true,
      })
    }
    setErrors({})
  }, [produto, isOpen])

  // reabrir selectores após fechar os modais auxiliares
  useEffect(() => {
    if (!modalUnOpen && reopenUn) {
      setReopenUn(false)
      setUnSelOpen(true)
    }
  }, [modalUnOpen, reopenUn])
  useEffect(() => {
    if (!modalMcOpen && reopenMc) {
      setReopenMc(false)
      setMcSelOpen(true)
    }
  }, [modalMcOpen, reopenMc])
  useEffect(() => {
    if (!modalCtOpen && reopenCt) {
      setReopenCt(false)
      setCtSelOpen(true)
    }
  }, [modalCtOpen, reopenCt])

  // helpers
  const unidadesFiltradas = useMemo(() => {
    const t = searchUn.toUpperCase()
    return unidades
      .filter((u) => (u.nome || "").toUpperCase().includes(t))
      .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""))
  }, [unidades, searchUn])

  const marcasFiltradas = useMemo(() => {
    const t = searchMc.toUpperCase()
    return marcas
      .filter((m) => (m.nome || "").toUpperCase().includes(t))
      .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""))
  }, [marcas, searchMc])

  const categoriasFiltradas = useMemo(() => {
    const t = searchCt.toUpperCase()
    return categorias
      .filter((c) => (c.nome || "").toUpperCase().includes(t))
      .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""))
  }, [categorias, searchCt])

  const getNome = (
    id: number | null | undefined,
    col: Array<{ id: number; nome: string }>
  ) => col.find((x) => x.id === id)?.nome.toUpperCase() || "SELECIONE..."

  async function handleSubmit() {
    const newErrors: { 
      descricao?: string
      unidadeId?: string
      marcaId?: string
      categoriaId?: string
      custoCompra?: string
      precoVenda?: string
    } = {}

    if (!form.descricao.trim()) {
      newErrors.descricao = "Descrição do produto é obrigatória"
    }
    if (!form.unidadeId) {
      newErrors.unidadeId = "Unidade de medida é obrigatória"
    }
    if (!form.marcaId) {
      newErrors.marcaId = "Marca é obrigatória"
    }
    if (!form.categoriaId) {
      newErrors.categoriaId = "Categoria é obrigatória"
    }
    if (form.custoCompra <= 0) {
      newErrors.custoCompra = "Custo de compra deve ser maior que zero"
    }
    if (form.precoVenda <= 0) {
      newErrors.precoVenda = "Preço de venda deve ser maior que zero"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    setErrors({})

    const payload: CreateProdutoDto | UpdateProdutoDto = {
      ...form,
      descricao: form.descricao.toUpperCase(),
      referencia: form.referencia?.toUpperCase(),
    }
    if (produto?.id) {
      await atualizarProduto(produto.id, payload)
      onOpenChange(false)
      await carregarProdutos()
    } else {
      const novoId = await criarProduto(payload)
      onOpenChange(false)
      await carregarProdutos()
      if (onSaved && novoId) {
        const novoProduto = await import("@/services/produtoService").then(m => m.getProdutoById(novoId));
        onSaved(novoProduto);
      }
    }
  }

  // recarregar listas ao FECHAR os modais auxiliares (sem onSave)
  const handleCloseUnModal = async (open: boolean) => {
    setModalUnOpen(open)
    if (!open) {
      setUnidades(await getUnidadesMedida())
      setReopenUn(true)
    }
  }
  const handleCloseMcModal = async (open: boolean) => {
    setModalMcOpen(open)
    if (!open) {
      setMarcas(await getMarcas())
      setReopenMc(true)
    }
  }
  const handleCloseCtModal = async (open: boolean) => {
    setModalCtOpen(open)
    if (!open) {
      setCategorias(await getCategorias())
      setReopenCt(true)
    }
  }

  return (
    <>
      <ModalUnidadeMedida
        isOpen={modalUnOpen}
        onOpenChange={handleCloseUnModal}
        carregarUnidades={async () => {
          setUnidades(await getUnidadesMedida())
        }}
      />

      <ModalMarca
        isOpen={modalMcOpen}
        onOpenChange={handleCloseMcModal}
        carregarMarcas={async () => {
          setMarcas(await getMarcas())
        }}
      />

      <ModalCategoria
        isOpen={modalCtOpen}
        onOpenChange={handleCloseCtModal}
        carregarCategorias={async () => {
          setCategorias(await getCategorias())
        }}
      />

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="w-[92%] max-w-5xl">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <DialogTitle>
                {readOnly
                  ? "Visualizar Produto"
                  : produto?.id
                  ? "Editar Produto"
                  : "Cadastrar Novo Produto"}
              </DialogTitle>

              <div className="flex items-center gap-2 mr-8">
                <span className="text-sm text-muted-foreground">Habilitado</span>
                <Switch
                  checked={form.ativo}
                  onCheckedChange={(v) => setForm({ ...form, ativo: v })}
                  disabled={readOnly}
                />
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="col-span-4 space-y-1.5">
              <Label className="uppercase font-medium">Descrição do Produto <span className="text-red-500">*</span></Label>
              <Input
                className="uppercase"
                placeholder="Ex.: TECLADO MECÂNICO RGB"
                disabled={readOnly}
                value={form.descricao}
                onChange={(e) => {
                  setForm({ ...form, descricao: e.target.value })
                  setErrors((err) => ({ ...err, descricao: undefined }))
                }}
              />
              {errors.descricao && <span className="text-xs text-red-500">{errors.descricao}</span>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="uppercase font-medium">Unidade de Medida <span className="text-red-500">*</span></Label>
                {!readOnly && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setUnSelOpen(false)
                      setModalUnOpen(true)
                      setReopenUn(true)
                    }}
                  >
                    Nova Unidade
                  </Button>
                )}
              </div>

              <Dialog open={unSelOpen} onOpenChange={setUnSelOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={readOnly}
                    className="w-full justify-between uppercase font-normal"
                  >
                    {getNome(form.unidadeId ?? null, unidades as any)}
                    {!readOnly && <ChevronDown className="h-4 w-4" />}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Buscar unidade..."
                      className="w-full"
                      value={searchUn}
                      onChange={(e) => setSearchUn(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        setUnSelOpen(false)
                        setModalUnOpen(true)
                        setReopenUn(true)
                      }}
                    >
                      Nova Unidade
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                    {unidadesFiltradas.map((u) => (
                      <Button
                        type="button"
                        key={u.id}
                        variant={form.unidadeId === u.id ? "default" : "outline"}
                        className="w-full justify-start uppercase font-normal"
                        onClick={() => {
                          setForm({ ...form, unidadeId: u.id })
                          setUnSelOpen(false)
                          setErrors((err) => ({ ...err, unidadeId: undefined }))
                        }}
                      >
                        {u.nome.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              {errors.unidadeId && <span className="text-xs text-red-500">{errors.unidadeId}</span>}
            </div>

            {/* Marca */}
            <div className="col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="uppercase font-medium">Marca <span className="text-red-500">*</span></Label>
                {!readOnly && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setMcSelOpen(false)
                      setModalMcOpen(true)
                      setReopenMc(true)
                    }}
                  >
                    Nova Marca
                  </Button>
                )}
              </div>

              <Dialog open={mcSelOpen} onOpenChange={setMcSelOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={readOnly}
                    className="w-full justify-between uppercase font-normal"
                  >
                    {getNome(form.marcaId ?? null, marcas as any)}
                    {!readOnly && <ChevronDown className="h-4 w-4" />}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Buscar marca..."
                      className="w-full"
                      value={searchMc}
                      onChange={(e) => setSearchMc(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        setMcSelOpen(false)
                        setModalMcOpen(true)
                        setReopenMc(true)
                      }}
                    >
                      Nova Marca
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                    {marcasFiltradas.map((m) => (
                      <Button
                        type="button"
                        key={m.id}
                        variant={form.marcaId === m.id ? "default" : "outline"}
                        className="w-full justify-start uppercase font-normal"
                        onClick={() => {
                          setForm({ ...form, marcaId: m.id })
                          setMcSelOpen(false)
                          setErrors((err) => ({ ...err, marcaId: undefined }))
                        }}
                      >
                        {m.nome.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              {errors.marcaId && <span className="text-xs text-red-500">{errors.marcaId}</span>}
            </div>

            <div className="col-span-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="uppercase font-medium">Categoria <span className="text-red-500">*</span></Label>
                {!readOnly && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setCtSelOpen(false)
                      setModalCtOpen(true)
                      setReopenCt(true)
                    }}
                  >
                    Nova Categoria
                  </Button>
                )}
              </div>

              <Dialog open={ctSelOpen} onOpenChange={setCtSelOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={readOnly}
                    className="w-full justify-between uppercase font-normal"
                  >
                    {getNome(form.categoriaId ?? null, categorias as any)}
                    {!readOnly && <ChevronDown className="h-4 w-4" />}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Buscar categoria..."
                      className="w-full"
                      value={searchCt}
                      onChange={(e) => setSearchCt(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        setCtSelOpen(false)
                        setModalCtOpen(true)
                        setReopenCt(true)
                      }}
                    >
                      Nova Categoria
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                    {categoriasFiltradas.map((c) => (
                      <Button
                        type="button"
                        key={c.id}
                        variant={
                          form.categoriaId === c.id ? "default" : "outline"
                        }
                        className="w-full justify-start uppercase font-normal"
                        onClick={() => {
                          setForm({ ...form, categoriaId: c.id })
                          setCtSelOpen(false)
                          setErrors((err) => ({ ...err, categoriaId: undefined }))
                        }}
                      >
                        {c.nome.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              {errors.categoriaId && <span className="text-xs text-red-500">{errors.categoriaId}</span>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="uppercase">Código de Barras</Label>
              <Input
                className="text-right"
                disabled={readOnly}
                value={form.codigoBarras ?? ""}
                onChange={(e) =>
                  setForm({ ...form, codigoBarras: e.target.value })
                }
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="uppercase">Referência</Label>
              <Input
                className="uppercase"
                disabled={readOnly}
                value={form.referencia ?? ""}
                onChange={(e) =>
                  setForm({ ...form, referencia: e.target.value })
                }
              />
            </div>

            {/* Custo de Compra (R$) */}
            <div className="col-span-2 space-y-1.5">
              <Label className="uppercase">Custo de Compra <span className="text-red-500">*</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  className="pl-8 text-right"
                  disabled={readOnly}
                  value={form.custoCompra}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      custoCompra: Number(e.target.value) || 0,
                    })
                    setErrors((err) => ({ ...err, custoCompra: undefined }))
                  }}
                />
              </div>
              {errors.custoCompra && <span className="text-xs text-red-500">{errors.custoCompra}</span>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="uppercase">Preço de Venda <span className="text-red-500">*</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  R$
                </span>
                <Input
                  type="number"
                  step="0.01"
                  className="pl-8 text-right"
                  disabled={readOnly}
                  value={form.precoVenda}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      precoVenda: Number(e.target.value) || 0,
                    })
                    setErrors((err) => ({ ...err, precoVenda: undefined }))
                  }}
                />
              </div>
              {errors.precoVenda && <span className="text-xs text-red-500">{errors.precoVenda}</span>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="uppercase">Lucro (%)</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  className="text-right pr-8"
                  disabled
                  value={
                    form.custoCompra > 0
                      ? (((form.precoVenda - form.custoCompra) / form.custoCompra) * 100).toFixed(2)
                      : "0.00"
                  }
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  %
                </span>
              </div>
            </div>

            <div className="col-span-1 space-y-1.5">
              <Label className="uppercase">Estoque</Label>
              <Input
                type="number"
                step="0.0001"
                className="text-right"
                disabled
                value={form.estoque}
                onChange={(e) =>
                  setForm({ ...form, estoque: Number(e.target.value) || 0 })
                }
              />
            </div>

            <div className="col-span-1 space-y-1.5">
              <Label className="uppercase">Estoque Mínimo</Label>
              <Input
                type="number"
                step="0.0001"
                className="text-right"
                disabled={readOnly}
                value={form.estoqueMinimo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    estoqueMinimo: Number(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <div className="text-xs text-muted-foreground mr-auto pl-1 space-y-0.5">
              {produto && (
                <>
                  <div>Data Criação: {formatDate(produto.dataCriacao)}</div>
                  <div>Data Atualização: {formatDate(produto.dataAtualizacao)}</div>
                </>
              )}
            </div>

            {!readOnly && (
              <Button onClick={handleSubmit}>
                {produto?.id ? "Atualizar" : "Cadastrar"}
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
