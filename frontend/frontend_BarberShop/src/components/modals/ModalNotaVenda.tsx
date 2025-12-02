import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronDown } from "lucide-react"
import {
  NotaVenda,
  CreateNotaVendaDto,
  UpdateNotaVendaDto,
  criarNotaVenda,
  atualizarNotaVenda,
  getNotaVendaProdutos,
} from "@/services/notaVendaService"
import { Cliente, getClientes } from "@/services/clienteService"
import {
  CondicaoPagamento,
  getCondicoesPagamento,
  getParcelasByCondicaoId,
  ParcelaCondicaoPagamento,
} from "@/services/condicaoPagamentoService"
import {
  Transportadora,
  getTransportadoras,
} from "@/services/transportadoraService"
import { Produto, getProdutos } from "@/services/produtoService"
import { Veiculo, getVeiculos } from "@/services/veiculoService"
import { UnidadeMedida, getUnidadesMedida } from "@/services/unidadeMedidaService"
import { ModalClientes } from "./ModalClientes"
import { ModalCondicaoPagamento } from "./ModalCondicaoPagamento"
import { ModalTransportadora } from "./ModalTransportadora"
import { ModalProduto } from "./ModalProduto"
import { ModalVeiculo } from "./ModalVeiculo"
import { toast } from "react-toastify"

type Props = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  nota?: NotaVenda | null
  onSave: () => void
  readOnly?: boolean
}

export function ModalNotaVenda({
  isOpen,
  onOpenChange,
  nota,
  onSave,
  readOnly = false,
}: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>([])
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([])

  const [form, setForm] = useState<CreateNotaVendaDto>({
    clienteId: 0,
    modelo: "",
    serie: "",
    numero: "",
    dataEmissao: new Date().toISOString().slice(0, 10),
    dataChegada: null,
    tipoFrete: "CIF",
    valorFrete: 0,
    valorSeguro: 0,
    outrasDespesas: 0,
    totalProdutos: 0,
    totalPagar: 0,
    condicaoPagamentoId: null,
    transportadoraId: null,
    placaVeiculo: null,
    observacao: null,
    itens: [],
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [veiculoId, setVeiculoId] = useState<number | null>(null)

  // Seletores
  const [clienteSelectorOpen, setClienteSelectorOpen] = useState(false)
  const [modalClienteOpen, setModalClienteOpen] = useState(false)
  const [reopenCliente, setReopenCliente] = useState(false)
  const [searchCliente, setSearchCliente] = useState("")

  const [condSelectorOpen, setCondSelectorOpen] = useState(false)
  const [modalCondOpen, setModalCondOpen] = useState(false)
  const [reopenCond, setReopenCond] = useState(false)
  const [searchCond, setSearchCond] = useState("")

  const [transpSelectorOpen, setTranspSelectorOpen] = useState(false)
  const [modalTranspOpen, setModalTranspOpen] = useState(false)
  const [reopenTransp, setReopenTransp] = useState(false)
  const [searchTransp, setSearchTransp] = useState("")

  const [produtoSelectorOpen, setProdutoSelectorOpen] = useState(false)
  const [modalProdutoOpen, setModalProdutoOpen] = useState(false)
  const [reopenProduto, setReopenProduto] = useState(false)
  const [searchProduto, setSearchProduto] = useState("")
  const [produtoSelecionado, setProdutoSelecionado] = useState<number | null>(null)

  const [veiculoSelectorOpen, setVeiculoSelectorOpen] = useState(false)
  const [modalVeiculoOpen, setModalVeiculoOpen] = useState(false)
  const [reopenVeiculo, setReopenVeiculo] = useState(false)
  const [searchVeiculo, setSearchVeiculo] = useState("")

  // Estados para item sendo adicionado
  const [itemQuantidade, setItemQuantidade] = useState<number>(1)
  const [itemPreco, setItemPreco] = useState<number>(0)
  const [itemDesconto, setItemDesconto] = useState<number>(0)

  // Estado para produtos adicionados
  const [produtosAdicionados, setProdutosAdicionados] = useState<Array<{
    produtoId: number
    unidadeId: number
    quantidade: number
    precoUnitario: number
    desconto: number
  }>>([])

  // Estado para parcelas geradas
  interface ParcelaGerada extends ParcelaCondicaoPagamento {
    dataVencimento: string
    valor: number
  }
  const [parcelasGeradas, setParcelasGeradas] = useState<ParcelaGerada[]>([])

  useEffect(() => {
    if (!isOpen) return
    Promise.allSettled([
      getClientes(),
      getCondicoesPagamento(),
      getTransportadoras(),
      getProdutos(),
      getVeiculos(),
      getUnidadesMedida(),
    ]).then((r) => {
      if (r[0].status === "fulfilled") setClientes(r[0].value)
      if (r[1].status === "fulfilled") setCondicoes(r[1].value)
      if (r[2].status === "fulfilled") setTransportadoras(r[2].value)
      if (r[3].status === "fulfilled") setProdutos(r[3].value)
      if (r[4].status === "fulfilled") setVeiculos(r[4].value)
      if (r[5].status === "fulfilled") setUnidades(r[5].value)
    })
  }, [isOpen])

  useEffect(() => {
    if (nota) {
      setForm({
        clienteId: nota.clienteId,
        modelo: nota.modelo,
        serie: nota.serie,
        numero: nota.numero,
        dataEmissao: nota.dataEmissao.slice(0, 10),
        dataChegada: nota.dataChegada?.slice(0, 10) || null,
        tipoFrete: nota.tipoFrete,
        valorFrete: nota.valorFrete,
        valorSeguro: nota.valorSeguro,
        outrasDespesas: nota.outrasDespesas,
        totalProdutos: nota.totalProdutos,
        totalPagar: nota.totalPagar,
        condicaoPagamentoId: nota.condicaoPagamentoId,
        transportadoraId: nota.transportadoraId,
        placaVeiculo: nota.placaVeiculo,
        observacao: nota.observacao,
        itens: [],
      })
    } else {
      setForm({
        clienteId: 0,
        modelo: "55",
        serie: "1",
        numero: "",
        dataEmissao: new Date().toISOString().slice(0, 10),
        dataChegada: null,
        tipoFrete: "CIF",
        valorFrete: 0,
        valorSeguro: 0,
        outrasDespesas: 0,
        totalProdutos: 0,
        totalPagar: 0,
        condicaoPagamentoId: null,
        transportadoraId: null,
        placaVeiculo: null,
        observacao: null,
        itens: [],
      })
    }
    setErrors({})
    setProdutosAdicionados([])
    setProdutoSelecionado(null)
    setItemQuantidade(1)
    setItemPreco(0)
    setItemDesconto(0)
    setVeiculoId(null)
    setParcelasGeradas([])
  }, [nota, isOpen])

  // Carregar itens da nota quando abrir para visualização
  useEffect(() => {
    if (nota?.id && isOpen) {
      getNotaVendaItens(nota.id)
        .then(itens => {
          const produtosCarregados = itens.map(item => ({
            produtoId: item.produtoId,
            unidadeId: item.unidadeId,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnit,
            desconto: item.descontoUnit
          }))
          setProdutosAdicionados(produtosCarregados)
        })
        .catch(error => {
          console.error('Erro ao carregar itens da nota:', error)
        })
    }
  }, [nota?.id, isOpen])

  useEffect(() => {
    if (!modalClienteOpen && reopenCliente) {
      setReopenCliente(false)
      setClienteSelectorOpen(true)
    }
  }, [modalClienteOpen, reopenCliente])

  useEffect(() => {
    if (!modalCondOpen && reopenCond) {
      setReopenCond(false)
      setCondSelectorOpen(true)
    }
  }, [modalCondOpen, reopenCond])

  useEffect(() => {
    if (!modalTranspOpen && reopenTransp) {
      setReopenTransp(false)
      setTranspSelectorOpen(true)
    }
  }, [modalTranspOpen, reopenTransp])

  useEffect(() => {
    if (!modalProdutoOpen && reopenProduto) {
      setReopenProduto(false)
      setProdutoSelectorOpen(true)
    }
  }, [modalProdutoOpen, reopenProduto])

  useEffect(() => {
    if (!modalVeiculoOpen && reopenVeiculo) {
      setReopenVeiculo(false)
      setVeiculoSelectorOpen(true)
    }
  }, [modalVeiculoOpen, reopenVeiculo])

  useEffect(() => {
    if (produtoSelecionado) {
      const precoVenda = getProdutoPrecoVenda(produtoSelecionado)
      setItemPreco(precoVenda)
    }
  }, [produtoSelecionado, produtos])

  // Calcular totais automaticamente
  useEffect(() => {
    const totalProdutos = produtosAdicionados.reduce((acc, item) => {
      return acc + (item.quantidade * item.precoUnitario - item.desconto)
    }, 0)

    const totalPagar = totalProdutos + form.valorFrete + form.valorSeguro + form.outrasDespesas

    setForm(prev => ({
      ...prev,
      totalProdutos,
      totalPagar
    }))
  }, [produtosAdicionados, form.valorFrete, form.valorSeguro, form.outrasDespesas])

  // Gerar parcelas automaticamente quando condição de pagamento mudar
  useEffect(() => {
    if (!form.condicaoPagamentoId) {
      setParcelasGeradas([])
      return
    }

    const carregarParcelas = async () => {
      try {
        const parcelas = await getParcelasByCondicaoId(form.condicaoPagamentoId!)
        
        if (!parcelas || parcelas.length === 0) {
          setParcelasGeradas([])
          return
        }

        const dataBase = form.dataEmissao ? new Date(form.dataEmissao + 'T00:00:00') : new Date()
        
        const parcelasComCalculo = parcelas.map(p => {
          const dataVencimento = new Date(dataBase)
          dataVencimento.setDate(dataVencimento.getDate() + p.dias)
          
          const valor = (form.totalPagar * p.percentual) / 100

          return {
            ...p,
            dataVencimento: dataVencimento.toISOString().slice(0, 10),
            valor: valor
          }
        })

        setParcelasGeradas(parcelasComCalculo)
      } catch (error) {
        console.error('Erro ao carregar parcelas:', error)
        setParcelasGeradas([])
      }
    }

    carregarParcelas()
  }, [form.condicaoPagamentoId, form.totalPagar, form.dataEmissao])

  const formatDate = (s?: string) => {
    if (!s) return ""
    const d = new Date(s)
    d.setHours(d.getHours() - 3)
    return d.toLocaleString("pt-BR")
  }

  const getClienteNome = (id?: number | null, includeId = false) => {
    const cli = clientes.find((c) => c.id === id)
    if (!cli) return "SELECIONE..."
    return includeId
      ? `${cli.id} - ${cli.nomeRazaoSocial.toUpperCase()}`
      : cli.nomeRazaoSocial.toUpperCase()
  }

  const getCondNome = (id?: number | null, includeId = false) => {
    const cond = condicoes.find((c) => c.id === id)
    if (!cond) return "SELECIONE..."
    return includeId
      ? `${cond.id} - ${cond.descricao.toUpperCase()}`
      : cond.descricao.toUpperCase()
  }

  const getTranspNome = (id?: number | null, includeId = false) => {
    const transp = transportadoras.find((t) => t.id === id)
    if (!transp) return "SELECIONE..."
    return includeId
      ? `${transp.id} - ${transp.razaoSocial.toUpperCase()}`
      : transp.razaoSocial.toUpperCase()
  }

  const getProdutoNome = (id?: number | null, includeId = false) => {
    const prod = produtos.find((p) => p.id === id)
    if (!prod) return "SELECIONE..."
    return includeId
      ? `${prod.id} - ${prod.descricao.toUpperCase()}`
      : prod.descricao.toUpperCase()
  }

  const getProdutoUnidade = (id?: number | null) => {
    const prod = produtos.find((p) => p.id === id)
    if (!prod || !prod.unidadeId) return ""
    const unidade = unidades.find((u) => u.id === prod.unidadeId)
    return unidade?.nome?.toUpperCase() || ""
  }

  const getProdutoPrecoVenda = (id?: number | null) => {
    const prod = produtos.find((p) => p.id === id)
    return prod?.precoVenda || 0
  }

  const getVeiculoPlaca = (id?: number | null, includeId = false) => {
    const veic = veiculos.find((v) => v.id === id)
    if (!veic) return "SELECIONE..."
    return includeId
      ? `${veic.id} - ${veic.placa.toUpperCase()}`
      : veic.placa.toUpperCase()
  }

  const clientesFiltrados = useMemo(() => {
    const t = searchCliente.toUpperCase()
    return clientes
      .filter((c) => getClienteNome(c.id).includes(t))
      .sort((a, b) => getClienteNome(a.id).localeCompare(getClienteNome(b.id)))
  }, [clientes, searchCliente])

  const condFiltradas = useMemo(() => {
    const t = searchCond.toUpperCase()
    return condicoes
      .filter((c) => (c.descricao || "").toUpperCase().includes(t))
      .sort((a, b) => (a.descricao || "").localeCompare(b.descricao || ""))
  }, [condicoes, searchCond])

  const transpFiltradas = useMemo(() => {
    const t = searchTransp.toUpperCase()
    return transportadoras
      .filter((tr) => (tr.razaoSocial || "").toUpperCase().includes(t))
      .sort((a, b) => (a.razaoSocial || "").localeCompare(b.razaoSocial || ""))
  }, [transportadoras, searchTransp])

  const produtosFiltrados = useMemo(() => {
    const t = searchProduto.toUpperCase()
    return produtos
      .filter((p) => (p.descricao || "").toUpperCase().includes(t))
      .sort((a, b) => (a.descricao || "").localeCompare(b.descricao || ""))
  }, [produtos, searchProduto])

  const veiculosFiltrados = useMemo(() => {
    const t = searchVeiculo.toUpperCase()
    return veiculos
      .filter((v) => (v.placa || "").toUpperCase().includes(t))
      .sort((a, b) => (a.placa || "").localeCompare(b.placa || ""))
  }, [veiculos, searchVeiculo])

  const carregarProdutos = async () => {
    try {
      const data = await getProdutos()
      setProdutos(data)
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    }
  }

  const carregarVeiculos = async () => {
    try {
      const data = await getVeiculos()
      setVeiculos(data)
    } catch (error) {
      console.error("Erro ao carregar veículos:", error)
    }
  }

  const adicionarProduto = () => {
    // Validar campos obrigatórios superiores
    if (!form.modelo || !form.serie || !form.numero || !form.clienteId || form.clienteId === 0 || !form.dataEmissao) {
      toast.error('Preencha todos os campos obrigatórios (Modelo, Série, Número, Cliente e Data de Emissão) antes de adicionar produtos')
      return
    }

    if (!produtoSelecionado) return

    if (itemQuantidade <= 0) {
      toast.error('Quantidade deve ser maior que zero')
      return
    }

    const produto = produtos.find(p => p.id === produtoSelecionado)
    if (!produto || !produto.unidadeId) {
      toast.error('Produto não possui unidade definida')
      return
    }

    setProdutosAdicionados([...produtosAdicionados, {
      produtoId: produtoSelecionado,
      unidadeId: produto.unidadeId,
      quantidade: itemQuantidade,
      precoUnitario: itemPreco,
      desconto: itemDesconto
    }])

    // Limpar campos
    setProdutoSelecionado(null)
    setItemQuantidade(1)
    setItemPreco(0)
    setItemDesconto(0)
  }

  const removerProduto = (index: number) => {
    setProdutosAdicionados(produtosAdicionados.filter((_, i) => i !== index))
  }

  function validateForm(): boolean {
    const newErrors: { [key: string]: string } = {}

    if (!form.clienteId || form.clienteId === 0) {
      newErrors.clienteId = "Cliente é obrigatório"
    }

    if (produtosAdicionados.length === 0) {
      newErrors.produtos = "Adicione pelo menos um produto"
      toast.error("Adicione pelo menos um produto")
    }

    if (!form.modelo.trim()) {
      newErrors.modelo = "Modelo é obrigatório"
    }

    if (!form.serie.trim()) {
      newErrors.serie = "Série é obrigatória"
    }

    if (!form.numero.trim()) {
      newErrors.numero = "Número é obrigatório"
    }

    if (!form.dataEmissao) {
      newErrors.dataEmissao = "Data de emissão é obrigatória"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (!validateForm()) return

    try {
      // Calcular despesas totais para rateio
      const despesasTotais = form.valorFrete + form.valorSeguro + form.outrasDespesas
      
      // Construir array de itens com todos os cálculos
      const itens = produtosAdicionados.map(item => {
        const liquidoUnit = item.precoUnitario - item.desconto
        const total = item.quantidade * liquidoUnit
        
        // Calcular rateio proporcional ao total de cada item
        const rateio = form.totalProdutos > 0 
          ? (total / form.totalProdutos) * despesasTotais 
          : 0
        
        const custoFinalUnit = liquidoUnit + (rateio / item.quantidade)
        
        return {
          produtoId: item.produtoId,
          unidadeId: item.unidadeId,
          quantidade: item.quantidade,
          precoUnit: item.precoUnitario,
          descontoUnit: item.desconto,
          liquidoUnit: liquidoUnit,
          total: total,
          rateio: rateio,
          custoFinalUnit: custoFinalUnit
        }
      })

      const payload: CreateNotaVendaDto | UpdateNotaVendaDto = {
        ...form,
        modelo: form.modelo.toUpperCase(),
        serie: form.serie.toUpperCase(),
        numero: form.numero.toUpperCase(),
        placaVeiculo: form.placaVeiculo?.toUpperCase() || null,
        itens: itens,
      }

      if (nota?.id) {
        await atualizarNotaVenda(nota.id, payload as UpdateNotaVendaDto)
        toast.success("Nota de venda atualizada com sucesso")
      } else {
        await criarNotaVenda(payload as CreateNotaVendaDto)
        toast.success("Nota de venda cadastrada com sucesso")
      }

      onOpenChange(false)
      await onSave()
    } catch {
      toast.error("Erro ao salvar nota de venda")
    }
  }

  async function handleCancelar() {
    if (!nota?.id) return

    if (nota.dataCancelamento) {
      toast.warning("Esta nota já está cancelada")
      return
    }

    try {
      const payload: UpdateNotaVendaDto = {
        ...form,
        dataCancelamento: new Date().toISOString().slice(0, 10)
      }

      await atualizarNotaVenda(nota.id, payload)
      toast.success("Nota de venda cancelada com sucesso")
      onOpenChange(false)
      await onSave()
    } catch {
      toast.error("Erro ao cancelar nota de venda")
    }
  }

  return (
    <>
      <ModalClientes
        isOpen={modalClienteOpen}
        onOpenChange={setModalClienteOpen}
        carregarClientes={async () => {
          setClientes(await getClientes())
          setReopenCliente(true)
        }}
      />
      <ModalCondicaoPagamento
        isOpen={modalCondOpen}
        onOpenChange={setModalCondOpen}
        onSave={async () => {
          setCondicoes(await getCondicoesPagamento())
          setReopenCond(true)
        }}
      />
      <ModalTransportadora
        isOpen={modalTranspOpen}
        onOpenChange={setModalTranspOpen}
        carregarTransportadoras={async () => {
          setTransportadoras(await getTransportadoras())
          setReopenTransp(true)
        }}
      />

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="w-[92%] max-w-6xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>
              {readOnly
                ? "Visualizar Nota de Venda"
                : nota?.id
                  ? "Editar Nota de Venda"
                  : "Nova Nota de Venda"}
            </DialogTitle>
          </DialogHeader>

          <div className="text-sm mt-4 space-y-4 overflow-y-auto max-h-[calc(85vh-180px)] pr-2">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-1">
                <Label htmlFor="modelo">Modelo<span className="text-red-500">*</span></Label>
                <Input
                  id="modelo"
                  placeholder="55"
                  className="uppercase"
                  disabled={produtosAdicionados.length > 0}
                  value={form.modelo}
                  onChange={(e) => {
                    setForm({ ...form, modelo: e.target.value })
                    if (errors.modelo) setErrors({ ...errors, modelo: "" })
                  }}
                />
                {errors.modelo && (
                  <span className="text-xs text-red-500">{errors.modelo}</span>
                )}
              </div>

              <div className="col-span-1">
                <Label htmlFor="serie">Série<span className="text-red-500">*</span></Label>
                <Input
                  id="serie"
                  placeholder="1"
                  className="uppercase"
                  disabled={readOnly || produtosAdicionados.length > 0}
                  value={form.serie}
                  onChange={(e) => {
                    setForm({ ...form, serie: e.target.value })
                    if (errors.serie) setErrors({ ...errors, serie: "" })
                  }}
                />
                {errors.serie && (
                  <span className="text-xs text-red-500">{errors.serie}</span>
                )}
              </div>

              <div className="col-span-2">
                <Label htmlFor="numero">
                  Número <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="numero"
                  placeholder="000001"
                  className="uppercase"
                  disabled={readOnly || produtosAdicionados.length > 0}
                  value={form.numero}
                  onChange={(e) => {
                    setForm({ ...form, numero: e.target.value })
                    if (errors.numero) setErrors({ ...errors, numero: "" })
                  }}
                />
                {errors.numero && (
                  <span className="text-xs text-red-500">{errors.numero}</span>
                )}
              </div>

              <div className="col-span-1">
                <Label htmlFor="codCliente">Código<span className="text-red-500">*</span></Label>
                <Input
                  id="codCliente"
                  disabled={readOnly}
                  value={form.clienteId || ""}
                  className="text-center"
                  readOnly
                />
              </div>

              <div className="col-span-3">
                <Label htmlFor="cliente">Cliente<span className="text-red-500">*</span></Label>
                <Dialog
                  open={clienteSelectorOpen}
                  onOpenChange={setClienteSelectorOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={readOnly || produtosAdicionados.length > 0}
                      className="w-full justify-start uppercase font-normal"
                    >
                      {getClienteNome(form.clienteId) || "Selecione..."}
                    </Button>
                  </DialogTrigger>
                    <DialogContent className="max-w-5xl">
                      <DialogHeader>
                        <DialogTitle>Selecionar Cliente</DialogTitle>
                      </DialogHeader>
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Buscar cliente..."
                          className="w-full"
                          value={searchCliente}
                          onChange={(e) => setSearchCliente(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                        {clientesFiltrados.map((c) => (
                          <Button
                            key={c.id}
                            type="button"
                            variant={
                              form.clienteId === c.id ? "default" : "outline"
                            }
                            className="w-full justify-start uppercase font-normal"
                            onClick={() => {
                              setForm({ ...form, clienteId: c.id })
                              setClienteSelectorOpen(false)
                              if (errors.clienteId) {
                                setErrors({ ...errors, clienteId: "" })
                              }
                            }}
                          >
                            {getClienteNome(c.id, true)}
                          </Button>
                        ))}
                      </div>
                      <DialogFooter className="gap-2">
                        <Button
                          onClick={() => {
                            setClienteSelectorOpen(false)
                            setModalClienteOpen(true)
                            setReopenCliente(true)
                          }}
                        >
                          Novo Cliente
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setClienteSelectorOpen(false)}
                        >
                          Voltar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  {errors.clienteId && (
                    <span className="text-xs text-red-500">
                      {errors.clienteId}
                    </span>
                  )}
              </div>

              <div className="col-span-2">
                <Label htmlFor="dataEmissao">
                  Data Emissão <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dataEmissao"
                  type="date"
                  disabled={readOnly || produtosAdicionados.length > 0}
                  max={new Date().toISOString().slice(0, 10)}
                  value={form.dataEmissao}
                  onChange={(e) => {
                    setForm({ ...form, dataEmissao: e.target.value })
                    if (errors.dataEmissao) {
                      setErrors({ ...errors, dataEmissao: "" })
                    }
                  }}
                />
                {errors.dataEmissao && (
                  <span className="text-xs text-red-500">
                    {errors.dataEmissao}
                  </span>
                )}
              </div>

              <div className="col-span-2">
                <Label htmlFor="dataChegada">Data Chegada</Label>
                <Input
                  id="dataChegada"
                  type="date"
                  disabled={readOnly}
                  min={new Date().toISOString().slice(0, 10)}
                  value={form.dataChegada || ""}
                  onChange={(e) =>
                    setForm({ ...form, dataChegada: e.target.value || null })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-1">
                <Label htmlFor="codProduto">
                  Código<span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="codProduto" 
                  disabled={readOnly} 
                  value={produtoSelecionado || ""}
                  className={`text-center ${errors.codProduto ? "border-destructive" : ""}`}
                  readOnly 
                />
                {errors.codProduto && (
                  <span className="text-xs text-red-500">{errors.codProduto}</span>
                )}
              </div>

              <div className="col-span-3">
                <Label htmlFor="produto">Produto</Label>
                <Dialog
                  open={produtoSelectorOpen}
                  onOpenChange={setProdutoSelectorOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={readOnly}
                      className="w-full justify-start uppercase font-normal"
                    >
                      {getProdutoNome(produtoSelecionado) || "Selecione..."}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl">
                    <DialogHeader>
                      <DialogTitle>Selecionar Produto</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Buscar produto..."
                        className="w-full"
                        value={searchProduto}
                        onChange={(e) => setSearchProduto(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                      {produtosFiltrados.map((p) => (
                        <Button
                          key={p.id}
                          type="button"
                          variant={
                            produtoSelecionado === p.id ? "default" : "outline"
                          }
                          className="w-full justify-start uppercase font-normal"
                          onClick={() => {
                            setProdutoSelecionado(p.id)
                            setProdutoSelectorOpen(false)
                            if (errors.codProduto) {
                              setErrors({ ...errors, codProduto: "" })
                            }
                          }}
                        >
                          {getProdutoNome(p.id, true)}
                        </Button>
                      ))}
                    </div>
                    <DialogFooter className="gap-2">
                      <Button
                        onClick={() => {
                          setProdutoSelectorOpen(false)
                          setModalProdutoOpen(true)
                          setReopenProduto(true)
                        }}
                      >
                        Novo Produto
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setProdutoSelectorOpen(false)}
                      >
                        Voltar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="col-span-1">
                <Label htmlFor="unidade">Unidade</Label>
                <Input 
                  id="unidade" 
                  className="uppercase bg-muted text-center" 
                  disabled 
                  value={getProdutoUnidade(produtoSelecionado)}
                />
              </div>

              <div className="col-span-1">
                <Label htmlFor="quantidade">
                  Quantidade <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantidade"
                  type="number"
                  placeholder="1"
                  className="text-right"
                  disabled={readOnly}
                  value={itemQuantidade}
                  onChange={(e) => setItemQuantidade(Number(e.target.value) || 0)}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="preco">
                  Preço <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="text-right bg-muted"
                  disabled
                  value={itemPreco}
                  readOnly
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="desconto">R$ Desconto</Label>
                <Input
                  id="desconto"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="text-right"
                  disabled={readOnly}
                  value={itemDesconto}
                  onChange={(e) => setItemDesconto(Number(e.target.value) || 0)}
                />
              </div>

              <div className="col-span-1">
                <Label htmlFor="total">Total</Label>
                <Input
                  id="total"
                  className="text-right bg-muted"
                  disabled
                  value={(itemQuantidade * itemPreco - itemDesconto).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                />
              </div>

              <div className="col-span-1 flex items-end">
                <Button className="w-full" disabled={readOnly} onClick={adicionarProduto}>
                  + Adicionar
                </Button>
              </div>
            </div>

            {/* Tabela de Produtos */}
            <div className="border rounded-md">
              <div className="grid grid-cols-12 gap-2 p-2 bg-muted font-medium text-xs">
                <div className="col-span-1">Código</div>
                <div className="col-span-3">Produto</div>
                <div className="col-span-1">Unidade</div>
                <div className="col-span-1 text-center">Qtd</div>
                <div className="col-span-2 text-right">Preço UN</div>
                <div className="col-span-1 text-right">Desc UN</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1 text-center">Ações</div>
              </div>
              {produtosAdicionados.length === 0 ? (
                <div className="min-h-[100px] p-2 text-center text-muted-foreground text-sm">
                  Nenhum produto adicionado
                </div>
              ) : (
                <div className="max-h-[200px] overflow-y-auto">
                  {produtosAdicionados.map((item, index) => {
                    const total = item.quantidade * item.precoUnitario - item.desconto
                    return (
                      <div key={index} className="grid grid-cols-12 gap-2 p-2 border-t text-xs items-center">
                        <div className="col-span-1 text-center">{item.produtoId}</div>
                        <div className="col-span-3 uppercase">{getProdutoNome(item.produtoId)}</div>
                        <div className="col-span-1 text-center">{getProdutoUnidade(item.produtoId)}</div>
                        <div className="col-span-1 text-center">{item.quantidade}</div>
                        <div className="col-span-2 text-right">{item.precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="col-span-1 text-right">{item.desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="col-span-2 text-right">{total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div className="col-span-1 flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            disabled={readOnly}
                            onClick={() => removerProduto(index)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18"/>
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            </svg>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Linha de Totais */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-1">
                <Label>Tipo Frete</Label>
                <div className="flex gap-2 mt-2">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="tipoFrete"
                      value="CIF"
                      checked={form.tipoFrete === "CIF"}
                      disabled={readOnly}
                      onChange={(e) =>
                        setForm({ ...form, tipoFrete: e.target.value })
                      }
                    />
                    CIF
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="radio"
                      name="tipoFrete"
                      value="FOB"
                      checked={form.tipoFrete === "FOB"}
                      disabled={readOnly}
                      onChange={(e) =>
                        setForm({ ...form, tipoFrete: e.target.value })
                      }
                    />
                    FOB
                  </label>
                </div>
              </div>

              <div className="col-span-2">
                <Label htmlFor="valorFrete">Valor Frete</Label>
                <Input
                  id="valorFrete"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="text-right"
                  disabled={readOnly}
                  value={form.valorFrete}
                  onChange={(e) =>
                    setForm({ ...form, valorFrete: Number(e.target.value) })
                  }
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="valorSeguro">Valor Seguro</Label>
                <Input
                  id="valorSeguro"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="text-right"
                  disabled={readOnly}
                  value={form.valorSeguro}
                  onChange={(e) =>
                    setForm({ ...form, valorSeguro: Number(e.target.value) })
                  }
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="outrasDespesas">Outras Despesas</Label>
                <Input
                  id="outrasDespesas"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="text-right"
                  disabled={readOnly}
                  value={form.outrasDespesas}
                  onChange={(e) =>
                    setForm({ ...form, outrasDespesas: Number(e.target.value) })
                  }
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="totalProdutos">Total Produtos</Label>
                <Input
                  id="totalProdutos"
                  type="number"
                  step="0.01"
                  className="text-right bg-muted"
                  disabled
                  value={form.totalProdutos}
                  readOnly
                />
              </div>

              <div className="col-span-3">
                <Label htmlFor="totalPagar">Total a Pagar</Label>
                <Input
                  id="totalPagar"
                  type="number"
                  step="0.01"
                  className="text-right bg-muted"
                  disabled
                  value={form.totalPagar}
                  readOnly
                />
              </div>
            </div>

            {/* Linha de Condição de Pagamento e Transportadora */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-1">
                <Label htmlFor="codCondPagto">Código<span className="text-red-500">*</span></Label>
                <Input
                  id="codCondPagto"
                  disabled={readOnly}
                  value={form.condicaoPagamentoId || ""}
                  className="text-center"
                  readOnly
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="condicaoPagamento">Condição de Pagamento<span className="text-red-500">*</span></Label>
                <Dialog open={condSelectorOpen} onOpenChange={setCondSelectorOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={readOnly}
                      className="w-full justify-between uppercase font-normal"
                    >
                      {getCondNome(form.condicaoPagamentoId)}
                      {!readOnly && <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl">
                    <DialogHeader>
                      <DialogTitle>Selecionar Condição de Pagamento</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Buscar condição..."
                        className="w-full"
                        value={searchCond}
                        onChange={(e) => setSearchCond(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                      {condFiltradas.map((c) => (
                        <Button
                          key={c.id}
                          type="button"
                          variant={
                            form.condicaoPagamentoId === c.id
                              ? "default"
                              : "outline"
                          }
                          className="w-full justify-start uppercase font-normal"
                          onClick={() => {
                            setForm({ ...form, condicaoPagamentoId: c.id })
                            setCondSelectorOpen(false)
                          }}
                        >
                          {getCondNome(c.id, true)}
                        </Button>
                      ))}
                    </div>
                    <DialogFooter className="gap-2">
                      <Button
                        onClick={() => {
                          setCondSelectorOpen(false)
                          setModalCondOpen(true)
                          setReopenCond(true)
                        }}
                      >
                        Nova Condição
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCondSelectorOpen(false)}
                      >
                        Voltar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="col-span-1">
                <Label htmlFor="codTransportadora">Código<span className="text-red-500">*</span></Label>
                <Input
                  id="codTransportadora"
                  disabled={readOnly}
                  value={form.transportadoraId || ""}
                  className="text-center"
                  readOnly
                />
              </div>

              <div className="col-span-4">
                <Label htmlFor="transportadora">Transportadora<span className="text-red-500">*</span></Label>
                <Dialog
                  open={transpSelectorOpen}
                  onOpenChange={setTranspSelectorOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={readOnly}
                      className="w-full justify-start uppercase font-normal"
                    >
                      {getTranspNome(form.transportadoraId) || "Selecione..."}
                    </Button>
                  </DialogTrigger>
                    <DialogContent className="max-w-5xl">
                      <DialogHeader>
                        <DialogTitle>Selecionar Transportadora</DialogTitle>
                      </DialogHeader>
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Buscar transportadora..."
                          className="w-full"
                          value={searchTransp}
                          onChange={(e) => setSearchTransp(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                        {transpFiltradas.map((t) => (
                          <Button
                            key={t.id}
                            type="button"
                            variant={
                              form.transportadoraId === t.id
                                ? "default"
                                : "outline"
                            }
                            className="w-full justify-start uppercase font-normal"
                            onClick={() => {
                              setForm({ ...form, transportadoraId: t.id })
                              setTranspSelectorOpen(false)
                            }}
                          >
                            {getTranspNome(t.id, true)}
                          </Button>
                        ))}
                      </div>
                      <DialogFooter className="gap-2">
                        <Button
                          onClick={() => {
                            setTranspSelectorOpen(false)
                            setModalTranspOpen(true)
                            setReopenTransp(true)
                          }}
                        >
                          Nova Transportadora
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setTranspSelectorOpen(false)}
                        >
                          Voltar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
              </div>

              <div className="col-span-2">
                <Label htmlFor="codVeiculo">Código<span className="text-red-500">*</span></Label>
                <Input
                  id="codVeiculo"
                  disabled={readOnly}
                  value={veiculoId || ""}
                  className="text-center"
                  readOnly
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="placaVeiculo">Placa Veículo<span className="text-red-500">*</span></Label>
                <Dialog
                  open={veiculoSelectorOpen}
                  onOpenChange={setVeiculoSelectorOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={readOnly}
                      className="w-full justify-start uppercase font-normal"
                    >
                      {getVeiculoPlaca(veiculoId) || "Selecione..."}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl">
                    <DialogHeader>
                      <DialogTitle>Selecionar Veículo</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-2 items-center">
                      <Input
                        placeholder="Buscar veículo..."
                        className="w-full"
                        value={searchVeiculo}
                        onChange={(e) => setSearchVeiculo(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                      {veiculosFiltrados.map((v) => (
                        <Button
                          key={v.id}
                          type="button"
                          variant={
                            veiculoId === v.id ? "default" : "outline"
                          }
                          className="w-full justify-start uppercase font-normal"
                          onClick={() => {
                            setVeiculoId(v.id)
                            setForm({ ...form, placaVeiculo: v.placa })
                            setVeiculoSelectorOpen(false)
                          }}
                        >
                          {getVeiculoPlaca(v.id, true)}
                        </Button>
                      ))}
                    </div>
                    <DialogFooter className="gap-2">
                      <Button
                        onClick={() => {
                          setVeiculoSelectorOpen(false)
                          setModalVeiculoOpen(true)
                          setReopenVeiculo(true)
                        }}
                      >
                        Novo Veículo
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setVeiculoSelectorOpen(false)}
                      >
                        Voltar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Tabela de Parcelas */}
            <div className="border rounded-md">
              <div className="grid grid-cols-5 gap-2 p-2 bg-muted font-medium text-xs">
                <div className="col-span-1">Parcela</div>
                <div className="col-span-1">Código</div>
                <div className="col-span-1">Forma de Pagamento</div>
                <div className="col-span-1">Data Vencimento</div>
                <div className="col-span-1 text-right">Valor Parcela</div>
              </div>
              {parcelasGeradas.length === 0 ? (
                <div className="min-h-[80px] p-2 text-center text-muted-foreground text-sm">
                  Nenhuma parcela gerada. Selecione uma condição de pagamento.
                </div>
              ) : (
                <div className="max-h-[200px] overflow-auto">
                  {parcelasGeradas.map((parcela, index) => (
                    <div key={index} className="grid grid-cols-5 gap-2 p-2 border-t text-xs items-center">
                      <div className="col-span-1">{parcela.numero}</div>
                      <div className="col-span-1 text-center">{parcela.formaPagamentoId}</div>
                      <div className="col-span-1">{parcela.formaPagamento?.descricao?.toUpperCase() || 'N/A'}</div>
                      <div className="col-span-1 text-center">{new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')}</div>
                      <div className="col-span-1 text-right">R$ {parcela.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="observacao">Observação</Label>
              <Textarea
                id="observacao"
                placeholder="Digite observações sobre a nota de venda..."
                className="uppercase min-h-16"
                disabled={readOnly}
                value={form.observacao || ""}
                onChange={(e) =>
                  setForm({ ...form, observacao: e.target.value || null })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <div className="text-xs text-muted-foreground mr-auto pl-1 space-y-0.5">
              {nota && (
                <>
                  <div>Data Criação: {formatDate(nota.criadoEm)}</div>
                  <div>Data Atualização: {formatDate(nota.atualizadoEm || undefined)}</div>
                </>
              )}
            </div>

            {readOnly && nota && !nota.dataCancelamento && (
              <Button variant="destructive" onClick={handleCancelar}>
                Cancelar Nota
              </Button>
            )}

            {!readOnly && (
              <Button onClick={handleSubmit}>
                {nota?.id ? "Atualizar" : "Cadastrar"}
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Voltar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ModalClientes
        isOpen={modalClienteOpen}
        onOpenChange={setModalClienteOpen}
        carregarClientes={async () => {
          const data = await getClientes()
          setClientes(data)
        }}
      />

      <ModalCondicaoPagamento
        isOpen={modalCondOpen}
        onOpenChange={setModalCondOpen}
        onSave={async () => {
          const data = await getCondicoesPagamento()
          setCondicoes(data)
        }}
      />

      <ModalTransportadora
        isOpen={modalTranspOpen}
        onOpenChange={setModalTranspOpen}
        carregarTransportadoras={async () => {
          const data = await getTransportadoras()
          setTransportadoras(data)
        }}
      />

      <ModalProduto
        isOpen={modalProdutoOpen}
        onOpenChange={setModalProdutoOpen}
        carregarProdutos={carregarProdutos}
      />

      <ModalVeiculo
        isOpen={modalVeiculoOpen}
        onOpenChange={setModalVeiculoOpen}
        carregarVeiculos={carregarVeiculos}
      />
    </>
  )
}
