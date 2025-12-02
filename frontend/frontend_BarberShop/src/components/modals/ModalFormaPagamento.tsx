import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  FormaPagamento,
  criarFormaPagamento,
  atualizarFormaPagamento,
} from "@/services/formaPagamentoService"

interface ModalFormaPagamentoProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  forma?: FormaPagamento | null
  onSave: () => Promise<void>
  readOnly?: boolean
}

export function ModalFormaPagamento({
  isOpen,
  onOpenChange,
  forma,
  onSave,
  readOnly = false,
}: ModalFormaPagamentoProps) {
  const [form, setForm] = useState({ descricao: "", ativo: true })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (forma) {
      setForm({ descricao: forma.descricao, ativo: forma.ativo })
    } else {
      setForm({ descricao: "", ativo: true })
    }
    setErrors({})
  }, [forma, isOpen])

  function validateForm(): boolean {
    const newErrors: { [key: string]: string } = {}

    if (!form.descricao.trim()) {
      newErrors.descricao = "Descrição é obrigatória"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (readOnly) return
    if (!validateForm()) return

    if (forma) {
      await atualizarFormaPagamento(forma.id, form)
    } else {
      await criarFormaPagamento(form)
    }
    onOpenChange(false)
    await onSave()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {readOnly
                ? "Visualizar Forma de Pagamento"
                : forma
                  ? "Editar Forma de Pagamento"
                  : "Nova Forma de Pagamento"}
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

        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="descricao">
              Descrição <span className="text-red-500">*</span>
            </Label>
            <Input
              id="descricao"
              placeholder="Ex: Cartão de Crédito"
              disabled={readOnly}
              value={form.descricao}
              className="uppercase"
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
        </div>

        <DialogFooter>
          {!readOnly && (
            <Button onClick={handleSubmit}>
              {forma ? "Atualizar" : "Salvar"}
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