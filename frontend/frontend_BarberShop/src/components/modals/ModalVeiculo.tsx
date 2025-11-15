import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"
import {
  criarVeiculo, atualizarVeiculo, Veiculo, CreateVeiculoDto, UpdateVeiculoDto,
} from "@/services/veiculoService"
import { toast } from "react-toastify"

interface ModalVeiculoProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  carregarVeiculos: () => void
  veiculo?: Veiculo
  readOnly?: boolean
}

export function ModalVeiculo({
  isOpen,
  onOpenChange,
  carregarVeiculos,
  veiculo,
  readOnly = false,
}: ModalVeiculoProps) {
  // placa só na criação
  const [placa, setPlaca] = useState<string>("")
  const [form, setForm] = useState<UpdateVeiculoDto>({
    modelo: "",
    descricao: "",
    ativo: true,
  })

  useEffect(() => {
    if (veiculo) {
      setPlaca(veiculo.placa)
      setForm({
        modelo: veiculo.modelo ?? "",
        descricao: veiculo.descricao ?? "",
        ativo: veiculo.ativo,
      })
    } else {
      setPlaca("")
      setForm({ modelo: "", descricao: "", ativo: true })
    }
  }, [veiculo])

  async function handleSubmit() {
    // validação simples
    if ((!veiculo?.id && !placa.trim()) || !form.modelo.trim()) {
      toast.error("Preencha os campos obrigatórios")
      return
    }

    try {
      if (veiculo?.id) {
        const payload: UpdateVeiculoDto = {
          modelo: form.modelo,
          descricao: form.descricao,
          ativo: form.ativo,
        }
        await atualizarVeiculo(veiculo.id, payload)
      } else {
        const payload: CreateVeiculoDto = {
          placa,
          modelo: form.modelo,
          descricao: form.descricao,
          ativo: true,
        }
        await criarVeiculo(payload)
      }
      onOpenChange(false)
      await carregarVeiculos()
    } catch {
      toast.error("Erro ao salvar veículo")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[60%] sm:max-w-[95%]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {readOnly ? "Visualizar Veículo" : veiculo?.id ? "Editar Veículo" : "Novo Veículo"}
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
              placeholder="Placa*"
              maxLength={10}
              className="uppercase"
              value={placa}
              disabled={readOnly || Boolean(veiculo?.id)} // só na criação
              onChange={(e) => setPlaca(e.target.value.toUpperCase())}
            />
            <Input
              placeholder="Modelo*"
              className="uppercase"
              disabled={readOnly}
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value.toUpperCase() })}
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
              {veiculo?.id ? "Atualizar" : "Cadastrar"}
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
