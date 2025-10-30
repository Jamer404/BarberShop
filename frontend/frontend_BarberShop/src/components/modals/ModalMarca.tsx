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
  const [codigo, setCodigo] = useState<number | "">("")
  const [form, setForm] = useState<UpdateMarcaDto>({
    nome: "",
    descricao: "",
    ativo: true,
  })

  useEffect(() => {
    if (marca) {
      setCodigo(marca.codigo)
      setForm({
        nome: marca.nome ?? "",
        descricao: marca.descricao ?? "",
        ativo: marca.ativo,
      })
    } else {
      setCodigo("")
      setForm({ nome: "", descricao: "", ativo: true })
    }
  }, [marca])

  async function handleSubmit() {
    if (!form.nome.trim() || (!marca?.id && codigo === "")) {
      toast.error("Preencha os campos obrigatórios")
      return
    }

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
          codigo: Number(codigo),
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

            <div className="flex items-center gap-3">
              <span className={`text-sm ${form.ativo ? "text-green-600" : "text-muted-foreground"}`}>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Código*"
              value={codigo}
              disabled={readOnly || Boolean(marca?.id)}  // código só na criação
              onChange={(e) => setCodigo(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <Input
              placeholder="Marca*"
              className="uppercase"
              disabled={readOnly}
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value.toUpperCase() })}
            />
          </div>

          <Textarea
            placeholder="Descrição"
            className="uppercase min-h-28"
            disabled={readOnly}
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value.toUpperCase() })}
          />
        </div>

        <DialogFooter>
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
