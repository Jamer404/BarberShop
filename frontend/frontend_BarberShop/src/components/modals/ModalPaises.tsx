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
import { useEffect, useState } from "react"
import {
  criarPais,
  atualizarPais,
  Pais,
  UpdatePaisDto,
} from "@/services/paisService"
import { toast } from "react-toastify"
import { Paischema } from "@/validations/localizacao"

interface ModalPaisesProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  carregarPaises: () => void
  pais?: Pais
  readOnly?: boolean
}

export function ModalPaises({
  isOpen,
  onOpenChange,
  carregarPaises,
  pais,
  readOnly = false,
}: ModalPaisesProps) {
  const [formData, setFormData] = useState<UpdatePaisDto>({
    nome: "",
    sigla: "",
    ddi: "",
  })

  useEffect(() => {
    if (pais) {
      setFormData({ nome: pais.nome, sigla: pais.sigla, ddi: pais.ddi })
    } else {
      setFormData({ nome: "", sigla: "", ddi: "" })
    }
  }, [pais])

  async function handleSubmit() {
    try {
      const parsed = Paischema.safeParse(formData)
      if (!parsed.success) {
        toast.error('Preencha todos os campos corretamente')
        return
      }
      if (pais?.id) await atualizarPais(pais.id, formData)
      else await criarPais(formData)
      onOpenChange(false)
      await carregarPaises()
    } catch(e) {
      toast.error('Erro ao salvar país')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[60%] sm:max-w-[95%]">
        <DialogHeader>
          <DialogTitle>
            {readOnly
              ? "Visualizar País"
              : pais?.id
              ? "Editar País"
              : "Novo País"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Input
            placeholder="Nome do país*"
            disabled={readOnly}
            className="uppercase"
            value={formData.nome}
            onChange={(e) =>
              setFormData({ ...formData, nome: e.target.value.toUpperCase() })
            }
          />
          <Input
            placeholder="Sigla (2 letras)*"
            maxLength={2}
            disabled={readOnly}
            className="uppercase"
            value={formData.sigla}
            onChange={(e) =>
              setFormData({
                ...formData,
                sigla: e.target.value.toUpperCase(),
              })
            }
          />
          <Input
            placeholder="DDI*"
            disabled={readOnly}
            value={formData.ddi}
            onChange={(e) =>
              setFormData({ ...formData, ddi: e.target.value })
            }
          />
        </div>

        <DialogFooter>
          {!readOnly && (
            <Button onClick={handleSubmit}>
              {pais?.id ? "Atualizar" : "Cadastrar"}
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