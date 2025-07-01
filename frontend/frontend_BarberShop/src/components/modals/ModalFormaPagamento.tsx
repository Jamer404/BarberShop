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

  useEffect(() => {
    if (forma) {
      setForm({ descricao: forma.descricao, ativo: forma.ativo })
    } else {
      setForm({ descricao: "", ativo: true })
    }
  }, [forma, isOpen])

  async function handleSubmit() {
    if (readOnly) return
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
          <DialogTitle>
            {readOnly
              ? "Visualizar Forma de Pagamento"
              : forma
                ? "Editar Forma de Pagamento"
                : "Nova Forma de Pagamento"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="descricao">Descrição</label>
            <Input
              id="descricao"
              placeholder="Ex: Cartão de Crédito"
              disabled={readOnly}
              value={form.descricao}
              className="uppercase"
              onChange={(e) => setForm({ ...form, descricao: e.target.value.toUpperCase() })}
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Switch
              id="ativo"
              disabled={readOnly}
              checked={form.ativo}
              onCheckedChange={(v) => setForm({ ...form, ativo: v })}
            />
            <label htmlFor="ativo" className="text-sm font-medium">
              Ativo
            </label>
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