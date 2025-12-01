import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash, Eye } from "lucide-react"

import {
  getUnidadesMedida,
  deletarUnidadeMedida,
  UnidadeMedida,
} from "@/services/unidadeMedidaService"
import { ModalUnidadeMedida } from "@/components/modals/ModalUnidadeMedida"
import { ModalConfirm } from "@/components/modals/ModalConfirm"

export default function UnidadesMedidas() {
  const [unidades, setUnidades] = useState<UnidadeMedida[]>([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<UnidadeMedida | null>(null)
  const [viewOnly, setViewOnly] = useState(false)

  const [isConfirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected] = useState<UnidadeMedida | null>(null)

  useEffect(() => {
    fetchUnidades()
  }, [])

  async function fetchUnidades() {
    setLoading(true)
    try {
      const data = await getUnidadesMedida()
      setUnidades(data)
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditing(null)
    setViewOnly(false)
    setModalOpen(true)
  }

  function openEditModal(item: UnidadeMedida) {
    setEditing(item)
    setViewOnly(false)
    setModalOpen(true)
  }

  function openViewModal(item: UnidadeMedida) {
    setEditing(item)
    setViewOnly(true)
    setModalOpen(true)
  }

  function openDeleteConfirm(item: UnidadeMedida) {
    setSelected(item)
    setConfirmOpen(true)
  }

  async function handleDelete() {
    if (!selected) return
    await deletarUnidadeMedida(selected.id)
    setUnidades((prev) => prev.filter((u) => u.id !== selected.id))
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalUnidadeMedida
        isOpen={isModalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setViewOnly(false)
        }}
        unidade={editing ?? undefined}
        carregarUnidades={fetchUnidades}
        readOnly={viewOnly}
      />

      <ModalConfirm
        isOpen={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        description={
          <>
            Deseja realmente excluir a unidade{" "}
            <span className="uppercase">{selected?.nome}</span>? Esta ação não
            poderá ser desfeita.
          </>
        }
      />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Unidades de Medida</h2>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Unidade
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Unidades de Medida</CardTitle>
          <CardDescription>
            Lista de todas as unidades cadastradas no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unidades.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell className="uppercase">{u.nome}</TableCell>
                    <TableCell className="uppercase">
                      {u.descricao || "-"}
                    </TableCell>
                    <TableCell>{u.ativo ? "Habilitado" : "Desabilitado"}</TableCell>
                    <TableCell className="flex justify-center items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openViewModal(u)}
                        title="Visualizar"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditModal(u)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDeleteConfirm(u)}
                        title="Excluir"
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
