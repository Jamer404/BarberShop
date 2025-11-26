import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"
import {
  criarCategoria, atualizarCategoria, Categoria,
  UpdateCategoriaDto, CreateCategoriaDto,
} from "@/services/categoriaService"
import { toast } from "react-toastify"

interface ModalCategoriaProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  carregarCategorias: () => void
  categoria?: Categoria
  readOnly?: boolean
}

export function ModalCategoria({
  isOpen,
  onOpenChange,
  carregarCategorias,
  categoria,
  readOnly = false,
}: ModalCategoriaProps) {
  const [codigo, setCodigo] = useState<number | "">("")
  const [form, setForm] = useState<UpdateCategoriaDto>({
    nome: "",
    descricao: "",
    ativo: true,
  })

  const formatDate = (s?: string) => {
    if (!s) return ""
    const d = new Date(s)
    d.setHours(d.getHours() - 3)
    return d.toLocaleString("pt-BR")
  }

  useEffect(() => {
    if (categoria) {
      setCodigo(categoria.codigo)
      setForm({
        nome: categoria.nome ?? "",
        descricao: categoria.descricao ?? "",
        ativo: categoria.ativo,
      })
    } else {
      setCodigo("")
      setForm({ nome: "", descricao: "", ativo: true })
    }
  }, [categoria])

  async function handleSubmit() {
    if (!form.nome.trim() || (!categoria?.id && codigo === "")) {
      toast.error("Preencha os campos obrigatórios")
      return
    }

    try {
      if (categoria?.id) {
        const payload: UpdateCategoriaDto = {
          nome: form.nome,
          descricao: form.descricao,
          ativo: form.ativo,
        }
        await atualizarCategoria(categoria.id, payload)
      } else {
        const payload: CreateCategoriaDto = {
          codigo: Number(codigo),
          nome: form.nome,
          descricao: form.descricao,
          ativo: true,
        }
        await criarCategoria(payload)
      }
      onOpenChange(false)
      await carregarCategorias()
    } catch {
      toast.error("Erro ao salvar categoria")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[60%] sm:max-w-[95%]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {readOnly ? "Visualizar Categoria" : categoria?.id ? "Editar Categoria" : "Nova Categoria"}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Código*"
              value={codigo}
              disabled={readOnly || Boolean(categoria?.id)} // código só na criação
              onChange={(e) => setCodigo(e.target.value === "" ? "" : Number(e.target.value))}
            />
            <Input
              placeholder="Categoria*"
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
          <div className="text-xs text-muted-foreground mr-auto pl-1 space-y-0.5">
            {categoria && (
              <>
                <div>Data Criação: {formatDate(categoria.dataCriacao)}</div>
                <div>Data Atualização: {formatDate(categoria.dataAtualizacao)}</div>
              </>
            )}
          </div>

          {!readOnly && (
            <Button onClick={handleSubmit}>
              {categoria?.id ? "Atualizar" : "Cadastrar"}
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
