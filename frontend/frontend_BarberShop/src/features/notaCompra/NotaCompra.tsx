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
  NotaCompra,
  getNotasCompra,
  getNotaCompraById,
} from "@/services/notaCompraService"
import { getFornecedores, Fornecedor } from "@/services/fornecedorService"
import { ModalNotaCompra } from "@/components/modals/ModalNotaCompra"

export default function NotaCompraPage() {
  const [notas, setNotas] = useState<NotaCompra[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<NotaCompra | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [notasData, fornecedoresData] = await Promise.all([
        getNotasCompra(),
        getFornecedores(),
      ])
      setNotas(notasData)
      setFornecedores(fornecedoresData)
    } catch (error) {
      console.error('Erro ao carregar:', error)
      toast.error("Erro ao carregar notas de compra")
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

  async function openViewModal(nota: NotaCompra) {
    try {
      const full = await getNotaCompraById(nota.id)
      setEditing(full)
      setIsViewMode(true)
      setIsModalOpen(true)
    } catch {
      toast.error("Erro ao carregar nota de compra")
    }
  }

  const getFornecedorNome = (id: number) => {
    const fornecedor = fornecedores.find((f) => f.id === id)
    return fornecedor?.nomeRazaoSocial || "-"
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalNotaCompra
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        nota={editing}
        onSave={fetchData}
        readOnly={isViewMode}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Notas de Compra</h2>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Nota de Compra
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Notas de Compra</CardTitle>
          <CardDescription>
            Lista de todas as notas de compra cadastradas no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modelo</TableHead>
              <TableHead>Série</TableHead>
              <TableHead>Número</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Data Emissão</TableHead>
              <TableHead className="text-right">Total Produtos</TableHead>
              <TableHead className="text-right">Total a Pagar</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  Nenhuma nota de compra encontrada
                </TableCell>
              </TableRow>
            ) : (
              notas.map((nota) => (
                <TableRow key={nota.id}>
                  <TableCell>{nota.modelo}</TableCell>
                  <TableCell>{nota.serie}</TableCell>
                  <TableCell className="font-medium">{nota.numero}</TableCell>
                  <TableCell>{getFornecedorNome(nota.fornecedorId)}</TableCell>
                  <TableCell>{formatDate(nota.dataEmissao)}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(nota.totalProdutos)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(nota.totalPagar)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      nota.dataCancelamento ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {nota.dataCancelamento ? 'Cancelada' : 'Em Andamento'}
                    </span>
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
