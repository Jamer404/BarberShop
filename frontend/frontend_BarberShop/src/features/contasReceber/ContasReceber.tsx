import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "react-toastify"
import {
  ContaReceber,
  getContasReceber,
} from "@/services/contaReceberService"
import { Cliente, getClientes } from "@/services/clienteService"

export default function ContasReceberPage() {
  const [contas, setContas] = useState<ContaReceber[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [contasData, clientesData] = await Promise.all([
        getContasReceber(),
        getClientes(),
      ])
      setContas(contasData)
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

  function formatDate(dateString?: string | null) {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "RECEBIDO":
        return "bg-green-100 text-green-800"
      case "ABERTO":
        return "bg-blue-100 text-blue-800"
      case "VENCIDO":
        return "bg-red-100 text-red-800"
      case "CANCELADO":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  function getStatusFromDates(conta: ContaReceber): string {
    if (conta.dataRecebimento && conta.status === "RECEBIDO") {
      return "RECEBIDO"
    }
    if (conta.status === "CANCELADO") {
      return "CANCELADO"
    }
    return "ABERTO"
  }

  const filteredContas = contas.filter((conta) => {
    const searchTerm = search.toLowerCase()
    const clienteNome = getClienteNome(conta.clienteId).toLowerCase()
    return (
      conta.numeroNota.toLowerCase().includes(searchTerm) ||
      clienteNome.includes(searchTerm) ||
      conta.modelo.toLowerCase().includes(searchTerm)
    )
  })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Consulta Contas a Receber</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Contas a Receber</CardTitle>
          <CardDescription>
            Lista de todas as contas a receber cadastradas no sistema.
          </CardDescription>
          <div className="pt-4">
            <Input
              placeholder="Buscar por número da nota ou cliente..."
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
                <TableHead className="text-center">Parcela</TableHead>
                <TableHead className="text-right">Valor Parcela</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Recebimento</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    Nenhuma conta a receber encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredContas.map((conta) => (
                  <TableRow key={conta.id}>
                    <TableCell>{conta.modelo}</TableCell>
                    <TableCell>{conta.serie}</TableCell>
                    <TableCell className="font-medium">{conta.numeroNota}</TableCell>
                    <TableCell>{getClienteNome(conta.clienteId)}</TableCell>
                    <TableCell className="text-center">{conta.numParcela}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(conta.valorParcela)}
                    </TableCell>
                    <TableCell>{formatDate(conta.dataVencimento)}</TableCell>
                    <TableCell>
                      {conta.dataRecebimento ? formatDate(conta.dataRecebimento) : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(getStatusFromDates(conta))}`}>
                        {getStatusFromDates(conta)}
                      </span>
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
