import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Eye, Plus } from "lucide-react"
import { toast } from "react-toastify"
import {
  ContaPagar,
  getContasPagar,
  getContaPagarById,
} from "@/services/contaPagarService"
import { getFornecedores, Fornecedor } from "@/services/fornecedorService"
import { ModalContaPagar } from "@/components/modals/ModalContaPagar"

export default function ContasPagarPage() {
  const [contas, setContas] = useState<ContaPagar[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<ContaPagar | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [contasData, fornecedoresData] = await Promise.all([
        getContasPagar(),
        getFornecedores(),
      ])
      setContas(contasData)
      setFornecedores(fornecedoresData)
    } catch (error) {
      console.error('Erro ao carregar:', error)
      toast.error("Erro ao carregar contas a pagar")
    }
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString("pt-BR")
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  function openCreateModal() {
    setEditing(null)
    setIsViewMode(false)
    setIsModalOpen(true)
  }

  async function openViewModal(conta: ContaPagar) {
    try {
      const full = await getContaPagarById(conta.id)
      setEditing(full)
      setIsViewMode(true)
      setIsModalOpen(true)
    } catch {
      toast.error("Erro ao carregar conta a pagar")
    }
  }

  const getFornecedorNome = (id: number) => {
    const fornecedor = fornecedores.find((f) => f.id === id)
    return fornecedor?.nomeRazaoSocial || "-"
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'ABERTO': 'bg-yellow-100 text-yellow-800',
      'PAGO': 'bg-green-100 text-green-800',
      'VENCIDO': 'bg-red-100 text-red-800',
      'CANCELADO': 'bg-gray-100 text-gray-800',
    }
    return badges[status] || 'bg-gray-100 text-gray-800'
  }

  function getStatusFromDates(conta: ContaPagar): string {
    if (conta.dataPagamento && conta.status === "PAGO") {
      return "PAGO"
    }
    if (conta.status === "CANCELADO") {
      return "CANCELADO"
    }
    return "ABERTO"
  }

  const filteredContas = contas.filter((conta) => {
    const searchTerm = search.toLowerCase()
    const fornecedorNome = getFornecedorNome(conta.fornecedorId).toLowerCase()
    return (
      conta.numero.toLowerCase().includes(searchTerm) ||
      fornecedorNome.includes(searchTerm) ||
      conta.modelo.toLowerCase().includes(searchTerm)
    )
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalContaPagar
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        conta={editing}
        onSave={fetchData}
        readOnly={isViewMode}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Consulta Contas a Pagar</h2>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Contas a Pagar</CardTitle>
          <CardDescription>
            Lista de todas as contas a pagar cadastradas no sistema.
          </CardDescription>
          <div className="pt-4">
            <Input
              placeholder="Buscar por número da nota ou fornecedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Modelo</TableHead>
                <TableHead>Série</TableHead>
                <TableHead>Nº Nota</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead className="text-center">Parcela</TableHead>
                <TableHead className="text-right">Valor Parcela</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    Nenhuma conta a pagar encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredContas.map((conta) => (
                  <TableRow key={conta.id}>
                    <TableCell>{conta.modelo}</TableCell>
                    <TableCell>{conta.serie}</TableCell>
                    <TableCell className="font-medium">{conta.numero}</TableCell>
                    <TableCell>{getFornecedorNome(conta.fornecedorId)}</TableCell>
                    <TableCell className="text-center">{conta.numParcela}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(conta.valorParcela)}
                    </TableCell>
                    <TableCell>{formatDate(conta.dataVencimento)}</TableCell>
                    <TableCell>
                      {conta.dataPagamento ? formatDate(conta.dataPagamento) : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(getStatusFromDates(conta))}`}>
                        {getStatusFromDates(conta)}
                      </span>
                    </TableCell>
                    <TableCell className="flex justify-center items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openViewModal(conta)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
