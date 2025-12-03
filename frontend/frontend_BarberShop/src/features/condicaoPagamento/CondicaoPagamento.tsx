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
  CondicaoPagamento,
  getCondicoesPagamento,
  deletarCondicaoPagamento,
} from "@/services/condicaoPagamentoService"
import { ModalCondicaoPagamento } from "@/components/modals/ModalCondicaoPagamento"

export default function CondicoesPagamento() {
  const mockCondicoes: CondicaoPagamento[] = [
    {
      id: 1,
      descricao: "A VISTA",
      taxaJuros: 0,
      multa: 0,
      desconto: 5,
      parcelas: [],
      dataCriacao: "",
      dataAtualizacao: "",
    },
    {
      id: 2,
      descricao: "30/60 DIAS",
      taxaJuros: 1.5,
      multa: 2,
      desconto: 0,
      parcelas: [],
      dataCriacao: "",
      dataAtualizacao: "",
    },
  ]

  const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>(mockCondicoes)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CondicaoPagamento | null>(null)
  const [viewOnly, setViewOnly] = useState(false)

  async function carregar() {
    try {
      const res = await getCondicoesPagamento()
      setCondicoes(res.length ? res : mockCondicoes)
    } catch {
      setCondicoes(mockCondicoes)
    }
    setLoading(false)
  }

  async function remover(id: number) {
    await deletarCondicaoPagamento(id)
    setCondicoes((prev) => prev.filter((c) => c.id !== id))
  }

  const openCreate = () => {
    setEditing(null)
    setViewOnly(false)
    setModalOpen(true)
  }

  const openEdit = (c: CondicaoPagamento) => {
    setEditing(c)
    setViewOnly(false)
    setModalOpen(true)
  }

  const openView = (c: CondicaoPagamento) => {
    setEditing(c)
    setViewOnly(true)
    setModalOpen(true)
  }

  useEffect(() => {
    carregar()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalCondicaoPagamento
        isOpen={modalOpen}
        onOpenChange={(o) => {
          setModalOpen(o)
          if (!o) setViewOnly(false)
        }}
        condicao={editing ?? undefined}
        onSave={carregar}
        readOnly={viewOnly}
      />
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Condições de Pagamento</h2>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Condição
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Condições de Pagamento</CardTitle>
          <CardDescription>Cadastre, visualize ou edite condições.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* <div className="flex items-center gap-2 pb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." className="pl-8 w-[300px]" />
            </div>
          </div> */}
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Juros (%)</TableHead>
                  <TableHead>Multa (%)</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {condicoes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-right">{c.id}</TableCell>
                    <TableCell>{c.descricao}</TableCell>
                    <TableCell>{c.taxaJuros}</TableCell>
                    <TableCell>{c.multa}</TableCell>
                    <TableCell className="flex justify-center items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => openView(c)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openEdit(c)}>
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
                              Excluir <strong>{c.descricao}</strong>?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => remover(c.id)}
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