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
  getFormasPagamento,
} from "@/services/formaPagamentoService"

interface ModalFormaPagamentoProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  forma?: FormaPagamento | null
  carregarFormas: () => Promise<void>
  readOnly?: boolean
}

export function ModalFormaPagamento({
  isOpen,
  onOpenChange,
  forma,
  carregarFormas,
  readOnly = false,
}: ModalFormaPagamentoProps) {
  const [form, setForm] = useState({ descricao: "", ativo: true })

  useEffect(() => {
    if (forma) setForm({ descricao: forma.descricao, ativo: forma.ativo })
    else setForm({ descricao: "", ativo: true })
  }, [forma])

  async function handleSubmit() {
    if (readOnly) return
    if (forma) await atualizarFormaPagamento(forma.id, form)
    else await criarFormaPagamento(form)
    onOpenChange(false)
    await carregarFormas()
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
          <div>
            <label className="block text-sm mb-1">Descrição</label>
            <Input
              placeholder="Ex: Cartão de Crédito"
              disabled={readOnly}
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="ativo"
              disabled={readOnly}
              checked={form.ativo}
              onCheckedChange={(v) => setForm({ ...form, ativo: v })}
            />
            <label htmlFor="ativo" className="text-sm">
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
