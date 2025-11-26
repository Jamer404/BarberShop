import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useEffect, useState } from "react"
import {
  criarCargo, atualizarCargo, Cargo,
  CreateCargoDto, UpdateCargoDto,
} from "@/services/cargoService"
import { toast } from "react-toastify"

interface ModalCargoProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  carregarCargos: () => void
  cargo?: Cargo
  readOnly?: boolean
}

export function ModalCargo({
  isOpen,
  onOpenChange,
  carregarCargos,
  cargo,
  readOnly = false,
}: ModalCargoProps) {
  const [form, setForm] = useState<UpdateCargoDto>({
    nome: "",
    setor: "",
    salarioBase: 0,
    exigeCnh: false,
    ativo: true,
  })

  const formatDate = (s?: string) => {
    if (!s) return ""
    const d = new Date(s)
    d.setHours(d.getHours() - 3)
    return d.toLocaleString("pt-BR")
  }

  useEffect(() => {
    if (cargo) {
      setForm({
        nome: cargo.nome ?? "",
        setor: cargo.setor ?? "",
        salarioBase: cargo.salarioBase,
        exigeCnh: cargo.exigeCnh,
        ativo: cargo.ativo,
      })
    } else {
      setForm({ nome: "", setor: "", salarioBase: 0, exigeCnh: false, ativo: true })
    }
  }, [cargo])

  async function handleSubmit() {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do cargo")
      return
    }

    try {
      if (cargo?.id) {
        const payload: UpdateCargoDto = {
          nome: form.nome,
          setor: form.setor,
          salarioBase: Number(form.salarioBase) || 0,
          exigeCnh: form.exigeCnh,
          ativo: form.ativo,
        }
        await atualizarCargo(cargo.id, payload)
      } else {
        const payload: CreateCargoDto = {
          nome: form.nome,
          setor: form.setor,
          salarioBase: Number(form.salarioBase) || 0,
          exigeCnh: form.exigeCnh,
          ativo: true,
        }
        await criarCargo(payload)
      }
      onOpenChange(false)
      await carregarCargos()
    } catch {
      toast.error("Erro ao salvar cargo")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[60%] sm:max-w-[95%]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {readOnly ? "Visualizar Cargo" : cargo?.id ? "Editar Cargo" : "Novo Cargo"}
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
            <div className="space-y-1.5">
              <Label>Cargo*</Label>
              <Input
                placeholder="Nome do Cargo*"
                disabled={readOnly}
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Setor</Label>
              <Input
                placeholder="Setor"
                disabled={readOnly}
                value={form.setor ?? ""}
                onChange={(e) => setForm({ ...form, setor: e.target.value })}
                className="uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Salário Base</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0,00"
                disabled={readOnly}
                value={form.salarioBase}
                onChange={(e) =>
                  setForm({ ...form, salarioBase: Number(e.target.value) || 0 })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Exigir CNH?</Label>
              <RadioGroup
                value={form.exigeCnh ? "S" : "N"}
                onValueChange={(v: string) => setForm({ ...form, exigeCnh: v === "S" })}
                className="grid grid-cols-2 gap-4 mt-1"
                disabled={readOnly}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="S" id="cnh-sim" />
                  <Label htmlFor="cnh-sim">Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="N" id="cnh-nao" />
                  <Label htmlFor="cnh-nao">Não</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="text-xs text-muted-foreground mr-auto pl-1 space-y-0.5">
            {cargo && (
              <>
                <div>Data Criação: {formatDate(cargo.dataCriacao)}</div>
                <div>Data Atualização: {formatDate(cargo.dataAtualizacao || "")}</div>
              </>
            )}
          </div>

          {!readOnly && (
            <Button onClick={handleSubmit}>
              {cargo?.id ? "Salvar" : "Cadastrar"}
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
