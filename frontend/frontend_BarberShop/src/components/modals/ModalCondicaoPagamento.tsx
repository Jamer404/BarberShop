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
import { z } from "zod"

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  condicao?: CondicaoPagamento | null
  onSave: () => void
  readOnly?: boolean
}

const schema = z
  .object({
    descricao: z.string().nonempty(),
    taxaJuros: z.number().min(0),
    multa: z.number().min(0),
    desconto: z.number().min(0),
    parcelas: z
      .array(
        z.object({
          numero: z.number().int().positive(),
          dias: z.number().int().nonnegative(),
          percentual: z.number().positive(),
          formaPagamentoId: z.number().int().positive(),
        }),
      )
      .nonempty(),
  })
  .refine(
    (d) => d.parcelas.reduce((s, p) => s + p.percentual, 0) === 100,
    { message: "A soma dos percentuais deve ser exatamente 100%", path: ["parcelas"] },
  )

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
  const [erro, setErro] = useState("")

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
    setErro("")
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

  async function handleSubmit() {
    if (readOnly) return
    const dto = { ...form, parcelas }
    const parsed = schema.safeParse(dto)
    if (!parsed.success) {
      const msg =
        parsed.error.issues.find((i) => i.path[0] === "parcelas")?.message ||
        "Dados inválidos"
      setErro(msg)
      return
    }
    setErro("")
    if (condicao) await atualizarCondicaoPagamento(condicao.id, dto)
    else await criarCondicaoPagamento(dto)
    onOpenChange(false)
    await onSave()
  }

  const getNomeForma = (id: number) =>
    formas.find((f) => f.id === id)?.descricao.toUpperCase() || "SELECIONE..."

  return (
    <>
      <ModalFormaPagamento
        isOpen={modalFormaOpen}
        onOpenChange={setModalFormaOpen}
        forma={null}
        carregarFormas={async () => setFormas(await getFormasPagamento())}
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
              <label className="block text-sm mb-1">Descrição</label>
              <Input
                placeholder="EX: 30/60/90 DIAS"
                disabled={readOnly}
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value.toUpperCase() })
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1">Taxa de Juros (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  disabled={readOnly}
                  value={form.taxaJuros}
                  onChange={(e) =>
                    setForm({ ...form, taxaJuros: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Multa (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  disabled={readOnly}
                  value={form.multa}
                  onChange={(e) =>
                    setForm({ ...form, multa: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Desconto (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  disabled={readOnly}
                  value={form.desconto}
                  onChange={(e) =>
                    setForm({ ...form, desconto: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="border rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Parcelas</span>
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
                                    {f.descricao}
                                  </Button>
                                ))}
                              </div>

                              <div className="pt-4 flex justify-end gap-2">
                                <Button
                                  variant="secondary"
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
              {erro && <p className="text-sm text-destructive mt-2">{erro}</p>}
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
