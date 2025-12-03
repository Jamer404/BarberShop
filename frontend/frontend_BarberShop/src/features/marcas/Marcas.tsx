import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash, Eye } from "lucide-react"

import {
  getMarcas, deletarMarca, Marca,
} from "@/services/marcaService"
import { ModalMarca } from "@/components/modals/ModalMarca"
import { ModalConfirm } from "@/components/modals/ModalConfirm"

export default function Marcas() {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Marca | null>(null)
  const [viewOnly, setViewOnly] = useState(false)

  const [isConfirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected] = useState<Marca | null>(null)

  useEffect(() => {
    fetchMarcas()
  }, [])

  async function fetchMarcas() {
    setLoading(true)
    try {
      setMarcas(await getMarcas())
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditing(null)
    setViewOnly(false)
    setModalOpen(true)
  }

  function openEditModal(m: Marca) {
    setEditing(m)
    setViewOnly(false)
    setModalOpen(true)
  }

  function openViewModal(m: Marca) {
    setEditing(m)
    setViewOnly(true)
    setModalOpen(true)
  }

  function openDeleteConfirm(m: Marca) {
    setSelected(m)
    setConfirmOpen(true)
  }

  async function handleDelete() {
    if (!selected) return
    await deletarMarca(selected.id)
    setMarcas(prev => prev.filter(x => x.id !== selected.id))
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalMarca
        isOpen={isModalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setViewOnly(false)
        }}
        marca={editing ?? undefined}
        carregarMarcas={fetchMarcas}
        readOnly={viewOnly}
      />

      <ModalConfirm
        isOpen={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        description={
          <>
            Deseja realmente excluir a marca{" "}
            <span className="uppercase">{selected?.nome}</span>? Esta ação não
            poderá ser desfeita.
          </>
        }
      />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Marcas</h2>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Marca
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Marcas</CardTitle>
          <CardDescription>Lista de marcas cadastradas no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marcas.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-right">{m.id}</TableCell>
                    <TableCell className="uppercase">{m.nome}</TableCell>
                    <TableCell className="uppercase">{m.descricao || "-"}</TableCell>
                    <TableCell>{m.ativo ? "Habilitado" : "Desabilitado"}</TableCell>
                    <TableCell className="flex justify-center items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => openViewModal(m)} title="Visualizar">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openEditModal(m)} title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openDeleteConfirm(m)} title="Excluir">
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
