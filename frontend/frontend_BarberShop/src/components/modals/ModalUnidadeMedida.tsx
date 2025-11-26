import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"
import {
  criarUnidadeMedida,
  atualizarUnidadeMedida,
  UnidadeMedida,
  UpdateUnidadeMedidaDto,
  CreateUnidadeMedidaDto,
} from "@/services/unidadeMedidaService"
import { toast } from "react-toastify"

interface ModalUnidadeMedidaProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  carregarUnidades: () => void
  unidade?: UnidadeMedida
  readOnly?: boolean
}

export function ModalUnidadeMedida({
  isOpen,
  onOpenChange,
  carregarUnidades,
  unidade,
  readOnly = false,
}: ModalUnidadeMedidaProps) {
  const [codigo, setCodigo] = useState<number | "">("")
  const [formData, setFormData] = useState<UpdateUnidadeMedidaDto>({
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
    if (unidade) {
      setCodigo(unidade.codigo)
      setFormData({
        nome: unidade.nome,
        descricao: unidade.descricao ?? "",
        ativo: unidade.ativo,
      })
    } else {
      setCodigo("")
      setFormData({ nome: "", descricao: "", ativo: true })
    }
  }, [unidade])

  async function handleSubmit() {
    // validação simples no mesmo espírito do seu ModalPaises
    if (!formData.nome?.trim() || (unidade?.id ? false : codigo === "")) {
      toast.error("Preencha os campos obrigatórios")
      return
    }

    try {
      if (unidade?.id) {
        const payload: UpdateUnidadeMedidaDto = {
          nome: formData.nome,
          descricao: formData.descricao,
          ativo: formData.ativo,
        }
        await atualizarUnidadeMedida(unidade.id, payload)
      } else {
        const payload: CreateUnidadeMedidaDto = {
          codigo: Number(codigo),
          nome: formData.nome,
          descricao: formData.descricao,
          ativo: true, // novo registro inicia habilitado
        }
        await criarUnidadeMedida(payload)
      }
      onOpenChange(false)
      await carregarUnidades()
    } catch (e) {
      toast.error("Erro ao salvar unidade de medida")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[60%] sm:max-w-[95%]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {readOnly
                ? "Visualizar Unidade"
                : unidade?.id
                ? "Editar Unidade"
                : "Nova Unidade"}
            </DialogTitle>

            <div className="flex items-center gap-2 mr-8">
              <span className="text-sm text-muted-foreground">
                Habilitado
              </span>
              <Switch
                checked={formData.ativo}
                onCheckedChange={(v) => setFormData({ ...formData, ativo: v })}
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
              disabled={readOnly || Boolean(unidade?.id)} // não permite alterar código em edição
              value={codigo}
              onChange={(e) =>
                setCodigo(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
            <Input
              placeholder="Unidade de Medida*"
              disabled={readOnly}
              className="uppercase"
              value={formData.nome}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nome: e.target.value.toUpperCase(),
                })
              }
            />
          </div>

          <Textarea
            placeholder="Descrição"
            disabled={readOnly}
            className="uppercase min-h-28"
            value={formData.descricao}
            onChange={(e) =>
              setFormData({
                ...formData,
                descricao: e.target.value.toUpperCase(),
              })
            }
          />
        </div>

        <DialogFooter>
          <div className="text-xs text-muted-foreground mr-auto pl-1 space-y-0.5">
            {unidade && (
              <>
                <div>Data Criação: {formatDate(unidade.dataCriacao)}</div>
                <div>Data Atualização: {formatDate(unidade.dataAtualizacao)}</div>
              </>
            )}
          </div>

          {!readOnly && (
            <Button onClick={handleSubmit}>
              {unidade?.id ? "Atualizar" : "Cadastrar"}
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
