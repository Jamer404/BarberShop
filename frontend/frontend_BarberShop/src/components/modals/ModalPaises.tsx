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
import { PaisSchema } from "@/validations/pais"

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

  const [errors, setErrors] = useState<{ nome?: string; sigla?: string; ddi?: string }>({})

  const formatDate = (s?: string) => {
    if (!s) return ""
    const d = new Date(s)
    d.setHours(d.getHours() - 3)
    return d.toLocaleString("pt-BR")
  }

  useEffect(() => {
    if (pais) {
      setFormData({ nome: pais.nome, sigla: pais.sigla, ddi: pais.ddi })
    } else {
      setFormData({ nome: "", sigla: "", ddi: "" })
    }
  }, [pais])

  async function handleSubmit() {
    const parsed = PaisSchema.safeParse(formData)
    if (!parsed.success) {
      const fieldErrors: { nome?: string; sigla?: string; ddi?: string } = {}
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message
      })
      setErrors(fieldErrors)
      toast.error('Preencha todos os campos corretamente')
      return
    }
    setErrors({})
    try {
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
          <div className="space-y-1">
            <label className="font-medium">Nome do país <span className="text-red-500">*</span></label>
            <Input
              placeholder="Nome do país"
              disabled={readOnly}
              className="uppercase"
              value={formData.nome}
              required
              onChange={(e) => {
                setFormData({ ...formData, nome: e.target.value.toUpperCase() })
                setErrors((err) => ({ ...err, nome: undefined }))
              }}
            />
            {errors.nome && <span className="text-xs text-red-500">{errors.nome}</span>}
          </div>
          <div className="space-y-1">
            <label className="font-medium">Sigla (2 letras) <span className="text-red-500">*</span></label>
            <Input
              placeholder="Sigla (2 letras)"
              maxLength={2}
              disabled={readOnly}
              className="uppercase"
              value={formData.sigla}
              required
              onChange={(e) => {
                setFormData({
                  ...formData,
                  sigla: e.target.value.toUpperCase(),
                })
                setErrors((err) => ({ ...err, sigla: undefined }))
              }}
            />
            {errors.sigla && <span className="text-xs text-red-500">{errors.sigla}</span>}
          </div>
          <div className="space-y-1">
            <label className="font-medium">DDI <span className="text-red-500">*</span></label>
            <Input
              placeholder="DDI"
              disabled={readOnly}
              value={formData.ddi}
              required
              maxLength={4}
              inputMode="text"
              pattern="\+\d{0,3}"
              onChange={(e) => {
                let value = e.target.value;
                // Garante que começa com +
                if (!value.startsWith("+")) value = "+" + value.replace(/[^\d]/g, "");
                // Remove tudo que não for número após o +
                value = value[0] + value.slice(1).replace(/[^\d]/g, "");
                // Limita a 3 dígitos após o +
                value = value.slice(0, 4);
                setFormData({ ...formData, ddi: value });
                setErrors((err) => ({ ...err, ddi: undefined }));
              }}
            />
            {errors.ddi && <span className="text-xs text-red-500">{errors.ddi}</span>}
          </div>
        </div>

        <DialogFooter>
          <div className="text-xs text-muted-foreground mr-auto pl-1 space-y-0.5">
            {pais && (
              <>
                <div>Data Criação: {formatDate(pais.dataCriacao)}</div>
                <div>Data Atualização: {formatDate(pais.dataAtualizacao)}</div>
              </>
            )}
          </div>

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