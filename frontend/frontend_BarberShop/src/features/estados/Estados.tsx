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

import { getEstados, deletarEstado, Estado } from "@/services/estadoService"
import { getPaises, Pais } from "@/services/paisService"

import { ModalEstados } from "@/components/modals/ModalEstados"
import { ModalConfirm } from "@/components/modals/ModalConfirm"

export default function EstadosPage() {
  const [estados, setEstados] = useState<Estado[]>([])
  const [paises, setPaises] = useState<Pais[]>([])
  const [loading, setLoading] = useState(true)

  const [modalEstadoOpen, setModalEstadoOpen] = useState(false)
  const [editingEstado, setEditingEstado] = useState<Estado | null>(null)
  const [viewOnly, setViewOnly] = useState(false)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [estadoSelecionado, setEstadoSelecionado] = useState<Estado | null>(null)

  useEffect(() => {
    ;(async () => {
      const [estadosData, paisesData] = await Promise.all([
        getEstados(),
        getPaises(),
      ])
      setEstados(estadosData)
      setPaises(paisesData)
      setLoading(false)
    })()
  }, [])

  function openCreateModal() {
    setEditingEstado(null)
    setViewOnly(false)
    setModalEstadoOpen(true)
  }

  function openEditModal(estado: Estado) {
    setEditingEstado(estado)
    setViewOnly(false)
    setModalEstadoOpen(true)
  }

  function openViewModal(estado: Estado) {
    setEditingEstado(estado)
    setViewOnly(true)
    setModalEstadoOpen(true)
  }

  function openDeleteConfirm(estado: Estado) {
    setEstadoSelecionado(estado)
    setConfirmOpen(true)
  }

  async function handleDelete() {
    if (!estadoSelecionado) return
    await deletarEstado(estadoSelecionado.id)
    setEstados((prev) => prev.filter((e) => e.id !== estadoSelecionado.id))
  }

  const getNomePais = (id: number) =>
    paises.find((p) => p.id === id)?.nome.toUpperCase() || "-"

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalEstados
        isOpen={modalEstadoOpen}
        onOpenChange={(open) => {
          setModalEstadoOpen(open)
          if (!open) setViewOnly(false)
        }}
        estado={editingEstado ?? undefined}
        onSave={async () => {
          const data = await getEstados()
          setEstados(data)
        }}
        readOnly={viewOnly}
      />

      <ModalConfirm
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        description={
          <>
            Deseja excluir o estado{" "}
            <span className="uppercase">{estadoSelecionado?.nome}</span>? Essa
            ação é irreversível.
          </>
        }
      />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Estados</h2>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Estado
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Estados</CardTitle>
          <CardDescription>
            Lista de todos os estados cadastrados no sistema.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar estado..."
                className="pl-8 w-[300px]"
              />
            </div>
          </div> */}

          {loading ? (
            <p>Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>UF</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estados.map((estado) => (
                  <TableRow key={estado.id}>
                    <TableCell>{estado.id}</TableCell>
                    <TableCell>{estado.nome.toUpperCase()}</TableCell>
                    <TableCell>{estado.uf}</TableCell>
                    <TableCell>{getNomePais(estado.idPais)}</TableCell>
                    <TableCell className="flex justify-center items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openViewModal(estado)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditModal(estado)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDeleteConfirm(estado)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
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