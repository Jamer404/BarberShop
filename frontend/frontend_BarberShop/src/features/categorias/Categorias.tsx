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
  getCategorias, deletarCategoria, Categoria,
} from "@/services/categoriaService"
import { ModalCategoria } from "@/components/modals/ModalCategoria"
import { ModalConfirm } from "@/components/modals/ModalConfirm"

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [viewOnly, setViewOnly] = useState(false)

  const [isConfirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected] = useState<Categoria | null>(null)

  useEffect(() => {
    fetchCategorias()
  }, [])

  async function fetchCategorias() {
    setLoading(true)
    try {
      setCategorias(await getCategorias())
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditing(null)
    setViewOnly(false)
    setModalOpen(true)
  }

  function openEditModal(item: Categoria) {
    setEditing(item)
    setViewOnly(false)
    setModalOpen(true)
  }

  function openViewModal(item: Categoria) {
    setEditing(item)
    setViewOnly(true)
    setModalOpen(true)
  }

  function openDeleteConfirm(item: Categoria) {
    setSelected(item)
    setConfirmOpen(true)
  }

  async function handleDelete() {
    if (!selected) return
    await deletarCategoria(selected.id)
    setCategorias(prev => prev.filter(x => x.id !== selected.id))
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalCategoria
        isOpen={isModalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setViewOnly(false)
        }}
        categoria={editing ?? undefined}
        carregarCategorias={fetchCategorias}
        readOnly={viewOnly}
      />

      <ModalConfirm
        isOpen={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        description={
          <>
            Deseja realmente excluir a categoria{" "}
            <span className="uppercase">{selected?.nome}</span>? Esta ação não
            poderá ser desfeita.
          </>
        }
      />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Categorias</h2>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Categorias</CardTitle>
          <CardDescription>Lista de categorias cadastradas no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.id}</TableCell>
                    <TableCell className="uppercase">{c.nome}</TableCell>
                    <TableCell className="uppercase">{c.descricao || "-"}</TableCell>
                    <TableCell>{c.ativo ? "Habilitado" : "Desabilitado"}</TableCell>
                    <TableCell className="flex justify-center items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => openViewModal(c)} title="Visualizar">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openEditModal(c)} title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openDeleteConfirm(c)} title="Excluir">
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
