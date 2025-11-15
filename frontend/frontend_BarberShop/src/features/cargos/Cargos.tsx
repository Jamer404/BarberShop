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
  getCargos, deletarCargo, Cargo,
} from "@/services/cargoService"
import { ModalCargo } from "@/components/modals/ModalCargo"
import { ModalConfirm } from "@/components/modals/ModalConfirm"

function formatBRL(n: number) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n ?? 0)
  } catch { return n?.toFixed ? n.toFixed(2) : String(n) }
}

export default function Cargos() {
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Cargo | null>(null)
  const [viewOnly, setViewOnly] = useState(false)

  const [isConfirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected] = useState<Cargo | null>(null)

  useEffect(() => {
    fetchCargos()
  }, [])

  async function fetchCargos() {
    setLoading(true)
    try {
      setCargos(await getCargos())
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditing(null)
    setViewOnly(false)
    setModalOpen(true)
  }

  function openEditModal(item: Cargo) {
    setEditing(item)
    setViewOnly(false)
    setModalOpen(true)
  }

  function openViewModal(item: Cargo) {
    setEditing(item)
    setViewOnly(true)
    setModalOpen(true)
  }

  function openDeleteConfirm(item: Cargo) {
    setSelected(item)
    setConfirmOpen(true)
  }

  async function handleDelete() {
    if (!selected) return
    await deletarCargo(selected.id)
    setCargos(prev => prev.filter(x => x.id !== selected.id))
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalCargo
        isOpen={isModalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setViewOnly(false)
        }}
        cargo={editing ?? undefined}
        carregarCargos={fetchCargos}
        readOnly={viewOnly}
      />

      <ModalConfirm
        isOpen={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        description={
          <>
            Deseja realmente excluir o cargo{" "}
            <span className="uppercase">{selected?.nome}</span>? Esta ação não
            poderá ser desfeita.
          </>
        }
      />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Cargos</h2>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cargo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Cargos</CardTitle>
          <CardDescription>Lista de cargos cadastrados no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>Salário Base</TableHead>
                  <TableHead>Exige CNH</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cargos.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.id}</TableCell>
                    <TableCell className="uppercase">{c.nome}</TableCell>
                    <TableCell className="uppercase">{c.setor || "-"}</TableCell>
                    <TableCell>{formatBRL(c.salarioBase)}</TableCell>
                    <TableCell>{c.exigeCnh ? "Sim" : "Não"}</TableCell>
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
