import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, Search } from "lucide-react"
import { Cidade, criarCidade, atualizarCidade } from "@/services/cidadeService"
import { Estado } from "@/services/estadoService"
import { ModalEstados } from "@/components/modals/ModalEstados"
import { toast } from "react-toastify"
import { CidadeSchema } from "@/validations/localizacao"

type Props = {
  isOpen: boolean
  onOpenChange: (o: boolean) => void
  cidade?: Cidade | null
  onSave: () => Promise<void>
  readOnly?: boolean
  estados: Estado[]
}

export function ModalCidades({
  isOpen,
  onOpenChange,
  cidade,
  onSave,
  readOnly = false,
  estados,
}: Props) {
  const [form, setForm] = useState({ nome: "", ddd: "", estadoId: 0 })
  const [modalEstadoOpen, setModalEstadoOpen] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [searchEstado, setSearchEstado] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (cidade) {
      setForm({
        nome: cidade.nome,
        ddd: cidade.ddd,
        estadoId: cidade.idEstado,
      })
    } else {
      setForm({ nome: "", ddd: "", estadoId: 0 })
    }
  }, [cidade, isOpen])

  function updateFormField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const estadosFiltrados = useMemo(() => {
    const t = searchEstado.toLowerCase()
    return estados
      .filter((e) => `${e.nome} ${e.uf}`.toLowerCase().includes(t))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  }, [estados, searchEstado])

  const nomeEstadoSelecionado = useMemo(() => {
    const e = estados.find((x) => x.id === form.estadoId)
    return e ? `${e.nome.toUpperCase()} - ${e.uf}` : "SELECIONE..."
  }, [form.estadoId, estados])

  const formatDate = (s?: string) => {
    if (!s) return ""
    const d = new Date(s)
    d.setHours(d.getHours() - 3)
    return d.toLocaleString("pt-BR")
  }

  async function handleSubmit() {
    if (readOnly || isSubmitting) return

    const parsed = CidadeSchema.safeParse({
      nome: form.nome,
      ddd: form.ddd,
      idEstado: form.estadoId,
    })

    if (!parsed.success) {
      toast.error("Preencha todos os campos corretamente")
      return
    }

    setIsSubmitting(true)
    try {
      if (cidade) {
        await atualizarCidade(cidade.id, {
          nome: form.nome,
          ddd: form.ddd,
          idEstado: form.estadoId,
        })
      } else {
        await criarCidade({
          nome: form.nome,
          ddd: form.ddd,
          idEstado: form.estadoId,
        })
      }

      await onSave()
      onOpenChange(false)
    } catch (error) {
      toast.error("Erro ao salvar cidade")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <ModalEstados
        isOpen={modalEstadoOpen}
        onOpenChange={setModalEstadoOpen}
        onSave={onSave}
      />

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {readOnly ? "VISUALIZAR CIDADE" : cidade ? "EDITAR CIDADE" : "NOVA CIDADE"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <label className="font-medium">Cidade <span className="text-red-500">*</span></label>
              <Input
                placeholder="Cidade"
                disabled={readOnly}
                className="uppercase"
                value={form.nome}
                required
                onChange={(e) => updateFormField("nome", e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">DDD <span className="text-red-500">*</span></label>
              <Input
                placeholder="DDD"
                disabled={readOnly}
                maxLength={3}
                inputMode="numeric"
                value={form.ddd}
                required
                onChange={(e) => updateFormField("ddd", e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Estado <span className="text-red-500">*</span></label>
              <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={readOnly}
                    className="w-full justify-between uppercase font-normal"
                  >
                    {nomeEstadoSelecionado}
                    {!readOnly && <ChevronDown className="ml-2 h-4 w-4" />}
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-5xl">
                  <DialogHeader>
                    <DialogTitle>SELECIONAR ESTADO</DialogTitle>
                  </DialogHeader>

                  <div className="flex items-center gap-2 pb-2">
                    <Input
                      placeholder="BUSCAR..."
                      value={searchEstado}
                      onChange={(e) => setSearchEstado(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-auto">
                    {estadosFiltrados.map((e) => (
                      <Button
                        key={e.id}
                        variant={form.estadoId === e.id ? "default" : "outline"}
                        className="w-full justify-start font-normal uppercase"
                        onDoubleClick={() => {
                          updateFormField("estadoId", e.id)
                          setSelectorOpen(false)
                        }}
                      >
                        {e.nome.toUpperCase()} ({e.uf})
                      </Button>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectorOpen(false)
                        setModalEstadoOpen(true)
                      }}
                    >
                      CADASTRAR NOVO ESTADO
                    </Button>
                    <Button variant="outline" onClick={() => setSelectorOpen(false)}>
                      VOLTAR
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <DialogFooter>
            <div className="text-xs text-muted-foreground mr-auto pl-1 space-y-0.5">
              {cidade && (
                <>
                  <div>Data Criação: {formatDate(cidade.dataCriacao)}</div>
                  <div>Data Atualização: {formatDate(cidade.dataAtualizacao)}</div>
                </>
              )}
            </div>

            {!readOnly && (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting
                  ? "SALVANDO..."
                  : cidade
                  ? "Atualizar"
                  : "Cadastrar"}
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
