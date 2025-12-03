import { useEffect, useState, useMemo } from "react"
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
  ContaPagar,
  CreateContaPagarDto,
  UpdateContaPagarDto,
  criarContaPagar,
  atualizarContaPagar,
  getContaPagarByNota,
} from "@/services/contaPagarService"
import { Fornecedor, getFornecedores } from "@/services/fornecedorService"
import { FormaPagamento, getFormasPagamento } from "@/services/formaPagamentoService"
import { ModalFornecedores } from "./ModalFornecedores"
import { ModalFormaPagamento } from "./ModalFormaPagamento"
import { toast } from "react-toastify"

type Props = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  conta?: ContaPagar | null
  onSave: () => void
  readOnly?: boolean
}

export function ModalContaPagar({
  isOpen,
  onOpenChange,
  conta,
  onSave,
  readOnly = false,
}: Props) {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [formasPagamento, setFormasPagamento] = useState<FormaPagamento[]>([])

  const [form, setForm] = useState<CreateContaPagarDto>({
    notaCompraId: null,
    fornecedorId: 0,
    modelo: "",
    serie: "",
    numero: "",
    numParcela: 1,
    valorParcela: 0,
    dataEmissao: new Date().toISOString().slice(0, 10),
    dataVencimento: new Date().toISOString().slice(0, 10),
    juros: 0,
    multa: 0,
    desconto: 0,
    status: "ABERTO",
    formaPagamentoId: null,
    observacao: null,
  })

  const [dataPagamento, setDataPagamento] = useState<string>("")
  const [valorPago, setValorPago] = useState<number>(0)

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Seletores
  const [fornecedorSelectorOpen, setFornecedorSelectorOpen] = useState(false)
  const [modalFornecedorOpen, setModalFornecedorOpen] = useState(false)
  const [reopenFornecedor, setReopenFornecedor] = useState(false)
  const [searchFornecedor, setSearchFornecedor] = useState("")

  const [formaPagamentoSelectorOpen, setFormaPagamentoSelectorOpen] = useState(false)
  const [modalFormaPagamentoOpen, setModalFormaPagamentoOpen] = useState(false)
  const [reopenFormaPagamento, setReopenFormaPagamento] = useState(false)
  const [searchFormaPagamento, setSearchFormaPagamento] = useState("")

  const fornecedoresFiltrados = useMemo(() => {
    return fornecedores.filter((f) =>
      f.nomeRazaoSocial.toLowerCase().includes(searchFornecedor.toLowerCase()) ||
      f.id.toString().includes(searchFornecedor)
    )
  }, [fornecedores, searchFornecedor])

  const formasPagamentoFiltradas = useMemo(() => {
    return formasPagamento.filter((f) =>
      f.descricao.toLowerCase().includes(searchFormaPagamento.toLowerCase()) ||
      f.id.toString().includes(searchFormaPagamento)
    )
  }, [formasPagamento, searchFormaPagamento])

  useEffect(() => {
    if (!isOpen) return
    Promise.allSettled([
      getFornecedores(),
      getFormasPagamento(),
    ]).then((r) => {
      if (r[0].status === "fulfilled") setFornecedores(r[0].value)
      if (r[1].status === "fulfilled") setFormasPagamento(r[1].value)
    })
  }, [isOpen])

  useEffect(() => {
    if (conta) {
      setForm({
        notaCompraId: conta.notaCompraId,
        fornecedorId: conta.fornecedorId,
        modelo: conta.modelo,
        serie: conta.serie,
        numero: conta.numero,
        numParcela: conta.numParcela,
        valorParcela: conta.valorParcela,
        dataEmissao: conta.dataEmissao.slice(0, 10),
        dataVencimento: conta.dataVencimento.slice(0, 10),
        juros: conta.juros,
        multa: conta.multa,
        desconto: conta.desconto,
        status: conta.status,
        formaPagamentoId: conta.formaPagamentoId,
        observacao: conta.observacao,
      })
      setDataPagamento(conta.dataPagamento?.slice(0, 10) || "")
      setValorPago(conta.valorPago || 0)
    } else {
      setForm({
        notaCompraId: null,
        fornecedorId: 0,
        modelo: "",
        serie: "",
        numero: "",
        numParcela: 1,
        valorParcela: 0,
        dataEmissao: new Date().toISOString().slice(0, 10),
        dataVencimento: new Date().toISOString().slice(0, 10),
        juros: 0,
        multa: 0,
        desconto: 0,
        status: "ABERTO",
        formaPagamentoId: null,
        observacao: null,
      })
      setDataPagamento("")
      setValorPago(0)
    }
    setErrors({})
  }, [conta, isOpen])

  useEffect(() => {
    if (!modalFornecedorOpen && reopenFornecedor) {
      setReopenFornecedor(false)
      setFornecedorSelectorOpen(true)
    }
  }, [modalFornecedorOpen, reopenFornecedor])

  useEffect(() => {
    if (!modalFormaPagamentoOpen && reopenFormaPagamento) {
      setReopenFormaPagamento(false)
      setFormaPagamentoSelectorOpen(true)
    }
  }, [modalFormaPagamentoOpen, reopenFormaPagamento])

  const getFornecedorNome = (id?: number | null) => {
    const forn = fornecedores.find((f) => f.id === id)
    if (!forn) return "SELECIONE..."
    return `${forn.id} - ${forn.nomeRazaoSocial.toUpperCase()}`
  }

  const getFormaPagamentoNome = (id?: number | null) => {
    const forma = formasPagamento.find((f) => f.id === id)
    if (!forma) return "SELECIONE..."
    return `${forma.id} - ${forma.descricao.toUpperCase()}`
  }

  const totalPagar = form.valorParcela * form.numParcela

  function validateForm(): boolean {
    const newErrors: { [key: string]: string } = {}

    if (!form.fornecedorId || form.fornecedorId === 0) {
      newErrors.fornecedorId = "Fornecedor é obrigatório"
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

    if (!form.dataVencimento) {
      newErrors.dataVencimento = "Data de vencimento é obrigatória"
    }

    if (form.numParcela <= 0) {
      newErrors.numParcela = "Número da parcela deve ser maior que zero"
    }

    if (form.valorParcela <= 0) {
      newErrors.valorParcela = "Valor da parcela deve ser maior que zero"
    }

    if (!form.formaPagamentoId || form.formaPagamentoId === 0) {
      newErrors.formaPagamentoId = "Forma de pagamento é obrigatória"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleMarcarComoPago() {
    if (!conta?.id) return

    try {
      const payload: UpdateContaPagarDto = {
        dataVencimento: form.dataVencimento,
        dataPagamento: new Date().toISOString().slice(0, 10),
        valorPago: form.valorParcela,
        juros: form.juros,
        multa: form.multa,
        desconto: form.desconto,
        status: "PAGO",
        formaPagamentoId: form.formaPagamentoId,
        observacao: form.observacao,
      }
      await atualizarContaPagar(conta.id, payload)
      toast.success("Conta marcada como paga")
      onOpenChange(false)
      await onSave()
    } catch {
      toast.error("Erro ao marcar conta como paga")
    }
  }

  async function handleCancelar() {
    if (!conta?.id) return

    try {
      // Buscar todas as contas da mesma nota
      const contasDaNota = await getContaPagarByNota(
        conta.fornecedorId,
        conta.modelo,
        conta.serie,
        conta.numero
      )

      // Verificar se alguma parcela já foi paga
      const algumaPaga = contasDaNota.some(
        (c) => c.dataPagamento || c.status === "PAGO"
      )

      if (algumaPaga) {
        toast.error(
          "N\u00e3o \u00e9 poss\u00edvel cancelar. Uma ou mais parcelas j\u00e1 foram pagas."
        )
        return
      }

      // Cancelar todas as parcelas
      const payload: UpdateContaPagarDto = {
        dataVencimento: form.dataVencimento,
        dataPagamento: null,
        valorPago: null,
        juros: form.juros,
        multa: form.multa,
        desconto: form.desconto,
        status: "CANCELADO",
        formaPagamentoId: form.formaPagamentoId,
        observacao: form.observacao,
      }

      for (const c of contasDaNota) {
        await atualizarContaPagar(c.id, payload)
      }

      toast.success(
        `${contasDaNota.length} conta(s) cancelada(s) com sucesso`
      )
      onOpenChange(false)
      await onSave()
    } catch {
      toast.error("Erro ao cancelar conta")
    }
  }

  async function handleSubmit() {
    if (!validateForm()) return

    try {
      if (conta?.id) {
        const payload: UpdateContaPagarDto = {
          dataVencimento: form.dataVencimento,
          dataPagamento: dataPagamento || null,
          valorPago: valorPago > 0 ? valorPago : null,
          juros: form.juros,
          multa: form.multa,
          desconto: form.desconto,
          status: form.status || "ABERTO",
          formaPagamentoId: form.formaPagamentoId,
          observacao: form.observacao,
        }
        await atualizarContaPagar(conta.id, payload)
        toast.success("Conta a pagar atualizada com sucesso")
      } else {
        const payload: CreateContaPagarDto = {
          ...form,
          modelo: form.modelo.toUpperCase(),
          serie: form.serie.toUpperCase(),
          numero: form.numero.toUpperCase(),
          status: form.status || "ABERTO",
        }
        await criarContaPagar(payload)
        toast.success("Conta a pagar cadastrada com sucesso")
      }

      onOpenChange(false)
      await onSave()
    } catch {
      toast.error("Erro ao salvar conta a pagar")
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {readOnly ? "Visualizar" : conta?.id ? "Editar" : "Cadastrar"} Conta a Pagar
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-12 gap-4 py-4">
            <div className="col-span-3 space-y-1.5">
              <Label className="uppercase font-medium">Modelo <span className="text-red-500">*</span></Label>
              <Input
                className="uppercase"
                disabled={readOnly || !!conta?.id}
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              />
              {errors.modelo && <span className="text-xs text-red-500">{errors.modelo}</span>}
            </div>

            <div className="col-span-3 space-y-1.5">
              <Label className="uppercase font-medium">Série <span className="text-red-500">*</span></Label>
              <Input
                className="uppercase"
                disabled={readOnly || !!conta?.id}
                value={form.serie}
                onChange={(e) => setForm({ ...form, serie: e.target.value })}
              />
              {errors.serie && <span className="text-xs text-red-500">{errors.serie}</span>}
            </div>

            <div className="col-span-3 space-y-1.5">
              <Label className="uppercase font-medium">Número <span className="text-red-500">*</span></Label>
              <Input
                className="uppercase"
                disabled={readOnly || !!conta?.id}
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
              />
              {errors.numero && <span className="text-xs text-red-500">{errors.numero}</span>}
            </div>

            <div className="col-span-3 space-y-1.5">
              <Label className="uppercase font-medium">Data Emissão <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                disabled={readOnly || !!conta?.id}
                value={form.dataEmissao}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm({ ...form, dataEmissao: e.target.value })}
              />
              {errors.dataEmissao && <span className="text-xs text-red-500">{errors.dataEmissao}</span>}
            </div>

            {/* Linha 2: Fornecedor */}
            <div className="col-span-2 space-y-1.5">
              <Label className="uppercase font-medium">Código<span className="text-red-500">*</span></Label>
              <Input
                type="number"
                className="text-right"
                disabled={true}
                value={form.fornecedorId || ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0
                  setForm({ ...form, fornecedorId: val })
                }}
              />
              {errors.fornecedorId && <span className="text-xs text-red-500">{errors.fornecedorId}</span>}
            </div>

            <div className="col-span-10 space-y-1.5">
              <Label className="uppercase font-medium">Fornecedor <span className="text-red-500">*</span></Label>
              <Dialog open={fornecedorSelectorOpen} onOpenChange={setFornecedorSelectorOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={readOnly || !!conta?.id}
                    className="w-full justify-between uppercase font-normal"
                  >
                    {getFornecedorNome(form.fornecedorId || null)}
                    {!readOnly && !conta?.id && <ChevronDown className="h-4 w-4" />}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Selecionar Fornecedor</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <Input
                      placeholder="Buscar fornecedor..."
                      className="w-full"
                      value={searchFornecedor}
                      onChange={(e) => setSearchFornecedor(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                    {fornecedoresFiltrados.map((f) => (
                      <Button
                        type="button"
                        key={f.id}
                        variant={form.fornecedorId === f.id ? "default" : "outline"}
                        className="w-full justify-start uppercase font-normal"
                        onClick={() => {
                          setForm({ ...form, fornecedorId: f.id })
                          setFornecedorSelectorOpen(false)
                          const { fornecedorId, ...rest } = errors
                          setErrors(rest)
                        }}
                      >
                        {f.id} - {f.nomeRazaoSocial.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setFornecedorSelectorOpen(false)
                        setModalFornecedorOpen(true)
                        setReopenFornecedor(true)
                      }}
                    >
                      Cadastrar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFornecedorSelectorOpen(false)}
                    >
                      Voltar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Linha 3: Nº Parcela e Valor Parcela */}
            <div className="col-span-3 space-y-1.5">
              <Label className="uppercase font-medium">Nº Parcela <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                className="text-right"
                disabled={readOnly || !!conta?.id}
                value={form.numParcela}
                onChange={(e) => setForm({ ...form, numParcela: parseInt(e.target.value) || 0 })}
              />
              {errors.numParcela && <span className="text-xs text-red-500">{errors.numParcela}</span>}
            </div>

            <div className="col-span-3 space-y-1.5">
              <Label className="uppercase font-medium">Valor Parcela <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                step="0.01"
                className="text-right"
                disabled={readOnly || !!conta?.id}
                value={form.valorParcela}
                onChange={(e) => setForm({ ...form, valorParcela: parseFloat(e.target.value) || 0 })}
              />
              {errors.valorParcela && <span className="text-xs text-red-500">{errors.valorParcela}</span>}
            </div>

            <div className="col-span-3 space-y-1.5">
              <Label className="uppercase font-medium">Data Vencimento <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                disabled={readOnly}
                value={form.dataVencimento}
                onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })}
              />
              {errors.dataVencimento && <span className="text-xs text-red-500">{errors.dataVencimento}</span>}
            </div>

            <div className="col-span-3 space-y-1.5">
              <Label className="uppercase font-medium">Data Pagamento</Label>
              <Input
                type="date"
                disabled={readOnly}
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
              />
            </div>

            {/* Linha 4: Juros, Multa, Desconto */}
            <div className="col-span-3 space-y-1.5">
              <Label className="uppercase font-medium">R$ Juros</Label>
              <Input
                type="number"
                step="0.01"
                className="text-right"
                disabled={readOnly}
                value={form.juros}
                onChange={(e) => setForm({ ...form, juros: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="col-span-3 space-y-1.5">
              <Label className="uppercase font-medium">R$ Multa</Label>
              <Input
                type="number"
                step="0.01"
                className="text-right"
                disabled={readOnly}
                value={form.multa}
                onChange={(e) => setForm({ ...form, multa: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="col-span-3 space-y-1.5">
              <Label className="uppercase font-medium">R$ Desconto</Label>
              <Input
                type="number"
                step="0.01"
                className="text-right"
                disabled={readOnly}
                value={form.desconto}
                onChange={(e) => setForm({ ...form, desconto: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="col-span-3 space-y-1.5">
              <Label className="uppercase font-medium">Total a Pagar</Label>
              <Input
                type="text"
                className="text-right font-semibold"
                disabled
                value={totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              />
            </div>

            {/* Linha 5: Forma Pagamento */}
            <div className="col-span-12 space-y-1.5">
              <Label className="uppercase font-medium">Forma de Pagamento <span className="text-red-500">*</span></Label>
              <Dialog open={formaPagamentoSelectorOpen} onOpenChange={setFormaPagamentoSelectorOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={readOnly}
                    className="w-full justify-between uppercase font-normal"
                  >
                    {getFormaPagamentoNome(form.formaPagamentoId || null)}
                    {!readOnly && <ChevronDown className="h-4 w-4" />}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Selecionar Forma de Pagamento</DialogTitle>
                  </DialogHeader>
                  <div className="mt-4">
                    <Input
                      placeholder="Buscar forma de pagamento..."
                      className="w-full"
                      value={searchFormaPagamento}
                      onChange={(e) => setSearchFormaPagamento(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                    {formasPagamentoFiltradas.map((fp) => (
                      <Button
                        type="button"
                        key={fp.id}
                        variant={form.formaPagamentoId === fp.id ? "default" : "outline"}
                        className="w-full justify-start uppercase font-normal"
                        onClick={() => {
                          setForm({ ...form, formaPagamentoId: fp.id })
                          setFormaPagamentoSelectorOpen(false)
                          const { formaPagamentoId, ...rest } = errors
                          setErrors(rest)
                        }}
                      >
                        {fp.id} - {fp.descricao.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                  <DialogFooter className="gap-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setFormaPagamentoSelectorOpen(false)
                        setModalFormaPagamentoOpen(true)
                        setReopenFormaPagamento(true)
                      }}
                    >
                      Cadastrar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormaPagamentoSelectorOpen(false)}
                    >
                      Voltar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {errors.formaPagamentoId && <span className="text-xs text-red-500">{errors.formaPagamentoId}</span>}
            </div>

            {/* Observação */}
            <div className="col-span-12 space-y-1.5">
              <Label className="uppercase font-medium">Observação</Label>
              <Textarea
                disabled={readOnly}
                value={form.observacao || ""}
                onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <div className="text-xs text-muted-foreground mr-auto pl-1 space-y-0.5">
              {conta && (
                <>
                  <div>Data Criação: {new Date(conta.criadoEm).toLocaleString("pt-BR")}</div>
                  {conta.atualizadoEm && (
                    <div>Data Atualização: {new Date(conta.atualizadoEm).toLocaleString("pt-BR")}</div>
                  )}
                </>
              )}
            </div>

            {!readOnly && (
              <Button onClick={handleSubmit}>
                {conta?.id ? "Salvar" : "Cadastrar"}
              </Button>
            )}
            {readOnly && conta?.id && (
              <>
                {!conta.dataPagamento && conta.status !== "CANCELADO" && (
                  <Button onClick={handleMarcarComoPago} className="bg-green-600 hover:bg-green-700">
                    Marcar como Pago
                  </Button>
                )}
                {!conta.dataPagamento && conta.status !== "CANCELADO" && (
                  <Button onClick={handleCancelar} variant="destructive">
                    Cancelar
                  </Button>
                )}
              </>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Voltar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ModalFornecedores
        isOpen={modalFornecedorOpen}
        onOpenChange={setModalFornecedorOpen}
        carregarFornecedores={async () => {
          const data = await getFornecedores()
          setFornecedores(data)
        }}
      />

      <ModalFormaPagamento
        isOpen={modalFormaPagamentoOpen}
        onOpenChange={setModalFormaPagamentoOpen}
        onSave={async () => {
          const data = await getFormasPagamento()
          setFormasPagamento(data)
        }}
      />
    </>
  )
}
