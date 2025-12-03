import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Trash, Plus, ChevronDown } from "lucide-react"
import {
  CondicaoPagamento,
  criarCondicaoPagamento,
  atualizarCondicaoPagamento,
  ParcelaDto,
} from "@/services/condicaoPagamentoService"
import {
  FormaPagamento,
  getFormasPagamento,
} from "@/services/formaPagamentoService"
import { ModalFormaPagamento } from "@/components/modals/ModalFormaPagamento"

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  condicao?: CondicaoPagamento | null
  onSave: () => void
  readOnly?: boolean
}

export function ModalCondicaoPagamento({
  isOpen,
  onOpenChange,
  condicao,
  onSave,
  readOnly = false,
}: Props) {
  const [form, setForm] = useState({
    descricao: "",
    taxaJuros: 0,
    multa: 0,
    desconto: 0,
  })
  const [parcelas, setParcelas] = useState<ParcelaDto[]>([])
  const [formas, setFormas] = useState<FormaPagamento[]>([])
  const [formaSelectorOpen, setFormaSelectorOpen] = useState(false)
  const [modalFormaOpen, setModalFormaOpen] = useState(false)
  const [parcelaIndex, setParcelaIndex] = useState(-1)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    ;(async () => setFormas(await getFormasPagamento()))()
  }, [])

  useEffect(() => {
    if (condicao) {
      setForm({
        descricao: condicao.descricao,
        taxaJuros: condicao.taxaJuros,
        multa: condicao.multa,
        desconto: condicao.desconto,
      })
      setParcelas(
        condicao.parcelas.map((p) => ({
          numero: p.numero,
          dias: p.dias,
          percentual: p.percentual,
          formaPagamentoId: p.formaPagamentoId,
        })),
      )
    } else {
      setForm({ descricao: "", taxaJuros: 0, multa: 0, desconto: 0 })
      setParcelas([])
    }
    setErrors({})
  }, [condicao])

  function addParcela() {
    setParcelas((prev) => [
      ...prev,
      { numero: prev.length + 1, dias: 0, percentual: 0, formaPagamentoId: 0 },
    ])
  }

  function updateParcela(idx: number, field: keyof ParcelaDto, value: number) {
    setParcelas((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)),
    )
  }

  function removeParcela(idx: number) {
    setParcelas((prev) =>
      prev.filter((_, i) => i !== idx).map((p, i) => ({ ...p, numero: i + 1 })),
    )
  }

  function validateForm(): boolean {
    const newErrors: { [key: string]: string } = {}

    if (!form.descricao.trim()) {
      newErrors.descricao = "Descrição é obrigatória"
    }

    if (form.taxaJuros < 0) {
      newErrors.taxaJuros = "Taxa de juros não pode ser negativa"
    }

    if (form.multa < 0) {
      newErrors.multa = "Multa não pode ser negativa"
    }

    if (form.desconto < 0) {
      newErrors.desconto = "Desconto não pode ser negativo"
    }

    if (form.desconto > 100) {
      newErrors.desconto = "Desconto não pode ser maior que 100%"
    }

    if (parcelas.length === 0) {
      newErrors.parcelas = "É obrigatório ter pelo menos uma parcela"
    } else {
      const totalPercentual = parcelas.reduce((sum, p) => sum + p.percentual, 0)
      if (totalPercentual !== 100) {
        newErrors.parcelas = `A soma dos percentuais deve ser exatamente 100% (atual: ${totalPercentual.toFixed(2)}%)`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (readOnly) return
    if (!validateForm()) return

    const dto = { ...form, parcelas }
    if (condicao) await atualizarCondicaoPagamento(condicao.id, dto)
    else await criarCondicaoPagamento(dto)
    onOpenChange(false)
    await onSave()
  }

  const getNomeForma = (id: number, includeId = false) => {
    const forma = formas.find((f) => f.id === id)
    if (!forma) return "SELECIONE..."
    return includeId ? `${forma.id} - ${forma.descricao.toUpperCase()}` : forma.descricao.toUpperCase()
  }

  return (
    <>
      <ModalFormaPagamento
        isOpen={modalFormaOpen}
        onOpenChange={setModalFormaOpen}
        forma={null}
        onSave={async () => setFormas(await getFormasPagamento())}
      />

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {readOnly
                ? "Visualizar Condição"
                : condicao
                ? "Editar Condição"
                : "Nova Condição"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="descricao">
                Descrição <span className="text-red-500">*</span>
              </Label>
              <Input
                id="descricao"
                placeholder="EX: 30/60/90 DIAS"
                disabled={readOnly}
                value={form.descricao}
                onChange={(e) => {
                  setForm({ ...form, descricao: e.target.value.toUpperCase() })
                  if (errors.descricao) {
                    setErrors({ ...errors, descricao: "" })
                  }
                }}
              />
              {errors.descricao && (
                <span className="text-xs text-red-500">{errors.descricao}</span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="taxaJuros">Taxa de Juros (%)</Label>
                <Input
                  id="taxaJuros"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  disabled={readOnly}
                  value={form.taxaJuros}
                  onChange={(e) => {
                    setForm({ ...form, taxaJuros: Number(e.target.value) })
                    if (errors.taxaJuros) {
                      setErrors({ ...errors, taxaJuros: "" })
                    }
                  }}
                />
                {errors.taxaJuros && (
                  <span className="text-xs text-red-500">{errors.taxaJuros}</span>
                )}
              </div>
              <div>
                <Label htmlFor="multa">Multa (%)</Label>
                <Input
                  id="multa"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  disabled={readOnly}
                  value={form.multa}
                  onChange={(e) => {
                    setForm({ ...form, multa: Number(e.target.value) })
                    if (errors.multa) {
                      setErrors({ ...errors, multa: "" })
                    }
                  }}
                />
                {errors.multa && (
                  <span className="text-xs text-red-500">{errors.multa}</span>
                )}
              </div>
              <div>
                <Label htmlFor="desconto">Desconto (%)</Label>
                <Input
                  id="desconto"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  disabled={readOnly}
                  value={form.desconto}
                  onChange={(e) => {
                    setForm({ ...form, desconto: Number(e.target.value) })
                    if (errors.desconto) {
                      setErrors({ ...errors, desconto: "" })
                    }
                  }}
                />
                {errors.desconto && (
                  <span className="text-xs text-red-500">{errors.desconto}</span>
                )}
              </div>
            </div>

            <div className="border rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">
                  Parcelas <span className="text-red-500">*</span>
                </span>
                {!readOnly && (
                  <Button variant="secondary" size="sm" onClick={addParcela}>
                    <Plus className="h-4 w-4 mr-1" /> Adicionar
                  </Button>
                )}
              </div>

              {parcelas.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma parcela adicionada.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Dias</TableHead>
                      <TableHead>%</TableHead>
                      <TableHead>Forma Pgto</TableHead>
                      {!readOnly && <TableHead />}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parcelas.map((p, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{p.numero}</TableCell>
                        <TableCell>
                          {readOnly ? (
                            p.dias
                          ) : (
                            <Input
                              type="number"
                              value={p.dias}
                              onChange={(e) =>
                                updateParcela(idx, "dias", Number(e.target.value))
                              }
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {readOnly ? (
                            p.percentual
                          ) : (
                            <Input
                              type="number"
                              step="0.01"
                              value={p.percentual}
                              onChange={(e) =>
                                updateParcela(idx, "percentual", Number(e.target.value))
                              }
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Dialog
                            open={formaSelectorOpen && parcelaIndex === idx}
                            onOpenChange={(open) => {
                              setFormaSelectorOpen(open)
                              if (!open) setParcelaIndex(-1)
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                disabled={readOnly}
                                className="w-full justify-between uppercase font-normal"
                                onClick={() => setParcelaIndex(idx)}
                              >
                                {getNomeForma(p.formaPagamentoId)}
                                {!readOnly && <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </DialogTrigger>

                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Selecionar Forma de Pagamento</DialogTitle>
                              </DialogHeader>

                              <div className="space-y-2 max-h-[300px] overflow-auto">
                                {formas.map((f) => (
                                  <Button
                                    key={f.id}
                                    variant={
                                      p.formaPagamentoId === f.id ? "default" : "outline"
                                    }
                                    className="w-full justify-start uppercase font-normal"
                                    onDoubleClick={() => {
                                      updateParcela(idx, "formaPagamentoId", f.id)
                                      setFormaSelectorOpen(false)
                                    }}
                                  >
                                    {f.id} - {f.descricao}
                                  </Button>
                                ))}
                              </div>

                              <div className="pt-4 flex justify-end gap-2">
                                <Button
                                  onClick={() => {
                                    setFormaSelectorOpen(false)
                                    setModalFormaOpen(true)
                                  }}
                                >
                                  Cadastrar nova forma
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setFormaSelectorOpen(false)}
                                >
                                  Voltar
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                        {!readOnly && (
                          <TableCell className="p-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeParcela(idx)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {errors.parcelas && (
                <p className="text-xs text-red-500 mt-2">{errors.parcelas}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            {!readOnly && (
              <Button onClick={handleSubmit}>
                {condicao ? "Atualizar" : "Salvar"}
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="outline">Voltar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
