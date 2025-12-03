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
  NotaVenda,
  getNotasVenda,
  getNotaVendaById,
} from "@/services/notaVendaService"
import { Cliente, getClientes } from "@/services/clienteService"
import { ModalNotaVenda } from "@/components/modals/ModalNotaVenda"

export default function NotasVendaPage() {
  const [notas, setNotas] = useState<NotaVenda[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<NotaVenda | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [notasData, clientesData] = await Promise.all([
        getNotasVenda(),
        getClientes(),
      ])
      setNotas(notasData)
      setClientes(clientesData)
    } catch (error) {
      console.error("Erro ao carregar:", error)
      toast.error("Erro ao carregar dados")
    }
  }

  function getClienteNome(id: number) {
    const cliente = clientes.find((c) => c.id === id)
    return cliente?.nomeRazaoSocial || "Desconhecido"
  }

  function formatCurrency(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function formatDate(dateString?: string) {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  function openCreateModal() {
    setEditing(null)
    setIsViewMode(false)
    setIsModalOpen(true)
  }

  async function openViewModal(nota: NotaVenda) {
    try {
      const notaCompleta = await getNotaVendaById(
        nota.numeroNota,
        nota.modelo,
        nota.serie,
        nota.clienteId
      )
      setEditing(notaCompleta)
      setIsViewMode(true)
      setIsModalOpen(true)
    } catch (error) {
      console.error("Erro ao carregar nota:", error)
      toast.error("Erro ao carregar nota")
    }
  }

  const filteredNotas = notas.filter((nota) => {
    const searchTerm = search.toLowerCase()
    const clienteNome = getClienteNome(nota.clienteId).toLowerCase()
    return (
      nota.numeroNota.toLowerCase().includes(searchTerm) ||
      nota.modelo.toLowerCase().includes(searchTerm) ||
      clienteNome.includes(searchTerm)
    )
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalNotaVenda
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        nota={editing}
        onSave={fetchData}
        readOnly={isViewMode}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Consulta Notas de Venda</h2>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Nota
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Notas de Venda</CardTitle>
          <CardDescription>
            Lista de todas as notas de venda cadastradas no sistema.
          </CardDescription>
          <div className="pt-4">
            <Input
              placeholder="Buscar por número, modelo ou cliente..."
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
                <TableHead>Cliente</TableHead>
                <TableHead>Data Emissão</TableHead>
                <TableHead className="text-right">Total Produtos</TableHead>
                <TableHead className="text-right">Total a Pagar</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    Nenhuma nota de venda encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredNotas.map((nota) => (
                  <TableRow key={`${nota.numeroNota}-${nota.modelo}-${nota.serie}-${nota.clienteId}`}>
                    <TableCell>{nota.modelo}</TableCell>
                    <TableCell>{nota.serie}</TableCell>
                    <TableCell className="font-medium">{nota.numeroNota}</TableCell>
                    <TableCell>{getClienteNome(nota.clienteId)}</TableCell>
                    <TableCell>{formatDate(nota.dataEmissao)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(nota.totalProdutos)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(nota.totalPagar)}
                    </TableCell>
                    <TableCell className="text-center">
                      {nota.dataCancelamento ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Cancelada
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Em Andamento
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="flex justify-center items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openViewModal(nota)}
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
