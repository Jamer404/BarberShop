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
import { ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { Estado, criarEstado, atualizarEstado } from "@/services/estadoService"
import { Pais, getPaises } from "@/services/paisService"
import { ModalPaises } from "@/components/modals/ModalPaises"
import { toast } from "react-toastify"
import { EstadoSchema } from "@/validations/localizacao"

interface ModalEstadosProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  estado?: Estado | null
  onSave: () => void
  readOnly?: boolean
}

export function ModalEstados({
  isOpen,
  onOpenChange,
  estado,
  onSave,
  readOnly = false,
}: ModalEstadosProps) {
  const [formData, setFormData] = useState({ nome: "", uf: "", idPais: 0 })
  const [paises, setPaises] = useState<Pais[]>([])
  const [modalPaisOpen, setModalPaisOpen] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)

  useEffect(() => {
    ;(async () => setPaises(await getPaises()))()
  }, [])

  useEffect(() => {
    if (estado) {
      setFormData({ nome: estado.nome, uf: estado.uf, idPais: estado.idPais })
    } else {
      setFormData({ nome: "", uf: "", idPais: 0 })
    }
  }, [estado])

  const getNomePais = (id: number) => {
    if (!id) return "SELECIONE..."
    const p = paises.find((x) => x.id === id)
    return p ? p.nome.toUpperCase() : "SELECIONE..."
  }

  const formatDateUTC3 = (s?: string) => {
    if (!s) return ""
    const d = new Date(s)
    d.setHours(d.getHours() - 3)
    return d.toLocaleString("pt-BR")
  }

  async function handleSubmit() {
    try {
      if (readOnly) return

      const parsed = EstadoSchema.safeParse(formData)
      if (!parsed.success) {
        toast.error('Preencha todos os campos corretamente')
        return
      }
      if (estado) await atualizarEstado(estado.id, formData)
      else await criarEstado(formData)
      onOpenChange(false)
      onSave()
    } catch (e) {
      toast.error('Erro ao salvar Estado')
    }
  }

  return (
    <>
      <ModalPaises
        isOpen={modalPaisOpen}
        onOpenChange={setModalPaisOpen}
        carregarPaises={async () => setPaises(await getPaises())}
      />

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {readOnly
                ? "Visualizar Estado"
                : estado
                ? "Editar Estado"
                : "Novo Estado"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <label className="font-medium">Estado <span className="text-red-500">*</span></label>
              <Input
                placeholder="Estado"
                disabled={readOnly}
                className="uppercase"
                value={formData.nome}
                required
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value.toUpperCase() })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">UF <span className="text-red-500">*</span></label>
              <Input
                placeholder="UF"
                maxLength={2}
                disabled={readOnly}
                className="uppercase"
                value={formData.uf}
                required
                onChange={(e) =>
                  setFormData({ ...formData, uf: e.target.value.toUpperCase() })
                }
              />
            </div>

            <div>
              <label className="block text-sm mb-1 font-medium">País <span className="text-red-500">*</span></label>
              <Dialog open={selectorOpen} onOpenChange={setSelectorOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={readOnly}
                    className="w-full justify-between uppercase font-normal"
                  >
                    {getNomePais(formData.idPais)}
                    {!readOnly && <ChevronDown className="ml-2 h-4 w-4" />}
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-5xl">
                  <DialogHeader>
                    <DialogTitle>Selecionar País</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-2 max-h-[300px] overflow-auto">
                    {paises.map((pais) => (
                      <Button
                        key={pais.id}
                        variant={
                          formData.idPais === pais.id ? "default" : "outline"
                        }
                        className="w-full justify-start font-normal uppercase"
                        onDoubleClick={() => {
                          setFormData({ ...formData, idPais: pais.id })
                          setSelectorOpen(false)
                        }}
                      >
                        {pais.nome} ({pais.sigla})
                      </Button>
                    ))}
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectorOpen(false)
                        setModalPaisOpen(true)
                      }}
                    >
                      Cadastrar novo país
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectorOpen(false)}
                    >
                      Voltar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <DialogFooter>
            <div className="text-xs text-muted-foreground mr-auto pl-1 space-y-0.5">
              {estado && (
                <>
                  <div>Data Criação: {formatDateUTC3(estado.dataCriacao)}</div>
                  <div>Data Atualização: {formatDateUTC3(estado.dataAtualizacao)}</div>
                </>
              )}
            </div>
            {!readOnly && (
              <Button onClick={handleSubmit}>
                {estado ? "Atualizar" : "Cadastrar"}
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
 