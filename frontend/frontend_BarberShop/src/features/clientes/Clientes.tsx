import { useEffect, useState } from "react"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Edit, Trash, Eye } from "lucide-react"
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"

import {
  Cliente, getClientes, deletarCliente,
} from "@/services/clienteService"
import { Cidade, getCidades } from "@/services/cidadeService"
import { Estado, getEstados } from "@/services/estadoService"

import { ModalClientes } from "@/components/modals/ModalClientes"
// import { toast } from "react-toastify"

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [readOnly, setReadOnly] = useState(false)

  const getCidadeUf = (id: number) => {
    const cid = cidades.find((c) => c.id === id)
    const est = estados.find((e) => e.id === cid?.idEstado)
    return cid && est ? `${cid.nome.toUpperCase()} - ${est.uf}` : "N/A"
  }

  async function carregar() {
    try {
      const cli = await getClientes()
      const cid = await getCidades()
      const est = await getEstados()
     
      setClientes(cli)
      setCidades(cid)
      setEstados(est)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      // toast.error('Erro ao carregar dados')
    }
  }

  async function remover(id: number) {
    await deletarCliente(id)
    setClientes((prev) => prev.filter((c) => c.id !== id))
  }

  function openCreate() {
    setEditing(null)
    setReadOnly(false)
    setModalOpen(true)
  }

  function openEdit(c: Cliente) {
    setEditing(c)
    setReadOnly(false)
    setModalOpen(true)
  }

  function openView(c: Cliente) {
    setEditing(c)
    setReadOnly(true)
    setModalOpen(true)
  }

  useEffect(() => { carregar() }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalClientes
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        cliente={editing}
        readOnly={readOnly}
        onSave={carregar}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar clientes</CardTitle>
          <CardDescription>Lista todos os clientes cadastradoss.</CardDescription>
        </CardHeader>
        <CardContent>
         {/*  <div className="flex items-center gap-2 pb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="BUSCAR..." className="pl-8 w-[300px]" />
            </div>
          </div> */}

          {loading ? (
            <p>Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>NOME</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>CIDADE - UF</TableHead>
                  <TableHead>EMAIL</TableHead>
                  <TableHead>SITUAÇÃO</TableHead>
                  <TableHead className="text-center">AÇÕES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.id}</TableCell>
                    <TableCell>{c.nomeRazaoSocial}</TableCell>
                    <TableCell>{c.cpfCnpj}</TableCell>
                    <TableCell>{getCidadeUf(c.idCidade)}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>
                      <span className={c.ativo ? "text-green-600" : "text-red-600"}>
                        {c.ativo ? "HABILITADO" : "DESABILITADO"}
                      </span>
                    </TableCell>
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
                            <AlertDialogTitle>CONFIRMAR EXCLUSÃO</AlertDialogTitle>
                            <AlertDialogDescription>
                              EXCLUIR <span className="uppercase">{c.nomeRazaoSocial}</span>?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>CANCELAR</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => remover(c.id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              CONFIRMAR
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