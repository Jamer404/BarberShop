import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"
import {
  criarMarca, atualizarMarca, Marca, UpdateMarcaDto, CreateMarcaDto,
} from "@/services/marcaService"
import { toast } from "react-toastify"

interface ModalMarcaProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  carregarMarcas: () => void
  marca?: Marca
  readOnly?: boolean
}

export function ModalMarca({
  isOpen,
  onOpenChange,
  carregarMarcas,
  marca,
  readOnly = false,
}: ModalMarcaProps) {
  const [form, setForm] = useState<UpdateMarcaDto>({
    nome: "",
    descricao: "",
    ativo: true,
  })

  const [errors, setErrors] = useState<{ nome?: string }>({})

  const formatDate = (s?: string) => {
    if (!s) return ""
    const d = new Date(s)
    d.setHours(d.getHours() - 3)
    return d.toLocaleString("pt-BR")
  }

  useEffect(() => {
    if (marca) {
      setForm({
        nome: marca.nome ?? "",
        descricao: marca.descricao ?? "",
        ativo: marca.ativo,
      })
    } else {
      setForm({ nome: "", descricao: "", ativo: true })
    }
    setErrors({})
  }, [marca, isOpen])

  async function handleSubmit() {
    const newErrors: { nome?: string } = {}

    if (!form.nome.trim()) {
      newErrors.nome = "Nome da marca é obrigatório"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    setErrors({})

    try {
      if (marca?.id) {
        const payload: UpdateMarcaDto = {
          nome: form.nome,
          descricao: form.descricao,
          ativo: form.ativo,
        }
        await atualizarMarca(marca.id, payload)
      } else {
        const payload: CreateMarcaDto = {
          nome: form.nome,
          descricao: form.descricao,
          ativo: true,
        }
        await criarMarca(payload)
      }
      onOpenChange(false)
      await carregarMarcas()
    } catch {
      toast.error("Erro ao salvar marca")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[60%] sm:max-w-[95%]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {readOnly ? "Visualizar Marca" : marca?.id ? "Editar Marca" : "Nova Marca"}
            </DialogTitle>

            <div className="flex items-center gap-2 mr-8">
              <span className="text-sm text-muted-foreground">
                Habilitado
              </span>
              <Switch
                checked={form.ativo}
                onCheckedChange={(v) => setForm({ ...form, ativo: v })}
                disabled={readOnly}
              />
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-1">
            <label className="font-medium">Marca <span className="text-red-500">*</span></label>
            <Input
              placeholder="Marca"
              className="uppercase"
              disabled={readOnly}
              value={form.nome}
              onChange={(e) => {
                setForm({ ...form, nome: e.target.value.toUpperCase() })
                setErrors((err) => ({ ...err, nome: undefined }))
              }}
            />
            {errors.nome && <span className="text-xs text-red-500">{errors.nome}</span>}
          </div>

          <div className="space-y-1">
            <label className="font-medium">Descrição</label>
            <Textarea
              placeholder="Descrição"
              disabled={readOnly}
              className="uppercase"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value.toUpperCase() })}
            />
          </div>
        </div>

        <DialogFooter>
          <div className="text-xs text-muted-foreground mr-auto pl-1 space-y-0.5">
            {marca && (
              <>
                <div>Data Criação: {formatDate(marca.dataCriacao)}</div>
                <div>Data Atualização: {formatDate(marca.dataAtualizacao)}</div>
              </>
            )}
          </div>

          {!readOnly && (
            <Button onClick={handleSubmit}>
              {marca?.id ? "Atualizar" : "Cadastrar"}
            </Button>
          )}
          <DialogClose asChild>
            <Button variant="outline">Voltar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
