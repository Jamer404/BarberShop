import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Search, Edit, Trash, Eye } from "lucide-react"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  FormaPagamento,
  getFormasPagamento,
  deletarFormaPagamento,
} from "@/services/formaPagamentoService"
import { ModalFormaPagamento } from "@/components/modals/ModalFormaPagamento"

export default function FormasPagamento() {
  const mockFormas: FormaPagamento[] = [
    {
      id: 1,
      descricao: "DINHEIRO",
      ativo: true,
      dataCriacao: "",
      dataAtualizacao: "",
    },
    {
      id: 2,
      descricao: "CARTÃO DE CRÉDITO",
      ativo: true,
      dataCriacao: "",
      dataAtualizacao: "",
    },
    {
      id: 3,
      descricao: "PIX",
      ativo: true,
      dataCriacao: "",
      dataAtualizacao: "",
    },
  ]

  const [formas, setFormas] = useState<FormaPagamento[]>(mockFormas)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<FormaPagamento | null>(null)
  const [viewOnly, setViewOnly] = useState(false)

  async function carregar() {
    try {
      const res = await getFormasPagamento()
      setFormas(res.length ? res : mockFormas)
    } catch {
      setFormas(mockFormas)
    }
    setLoading(false)
  }

  async function remover(id: number) {
    await deletarFormaPagamento(id)
    setFormas((prev) => prev.filter((f) => f.id !== id))
  }

  const openCreate = () => {
    setEditing(null)
    setViewOnly(false)
    setModalOpen(true)
  }

  const openEdit = (fp: FormaPagamento) => {
    setEditing(fp)
    setViewOnly(false)
    setModalOpen(true)
  }

  const openView = (fp: FormaPagamento) => {
    setEditing(fp)
    setViewOnly(true)
    setModalOpen(true)
  }

  useEffect(() => {
    carregar()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalFormaPagamento
        isOpen={modalOpen}
        onOpenChange={(o) => {
          setModalOpen(o)
          if (!o) setViewOnly(false)
        }}
        forma={editing}
        onSave={carregar}
        readOnly={viewOnly}
      />
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Formas de Pagamento</h2>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Forma
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Formas de Pagamento</CardTitle>
          <CardDescription>Cadastre, edite ou desative formas de pagamento.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 pb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." className="pl-8 w-[300px]" />
            </div>
          </div>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>DESCRIÇÃO</TableHead>
                  <TableHead>ATIVO</TableHead>
                  <TableHead className="text-center">AÇÕES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formas.map((fp) => (
                  <TableRow key={fp.id}>
                    <TableCell>{fp.id}</TableCell>
                    <TableCell>{fp.descricao}</TableCell>
                    <TableCell>{fp.ativo ? "SIM" : "NÃO"}</TableCell>
                    <TableCell className="flex justify-center items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => openView(fp)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openEdit(fp)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Excluir {fp.descricao}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => remover(fp.id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
