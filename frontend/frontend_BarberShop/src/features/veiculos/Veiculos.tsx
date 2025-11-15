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
  getVeiculos, deletarVeiculo, Veiculo,
} from "@/services/veiculoService"
import { ModalVeiculo } from "@/components/modals/ModalVeiculo"
import { ModalConfirm } from "@/components/modals/ModalConfirm"

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Veiculo | null>(null)
  const [viewOnly, setViewOnly] = useState(false)

  const [isConfirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected] = useState<Veiculo | null>(null)

  useEffect(() => {
    fetchVeiculos()
  }, [])

  async function fetchVeiculos() {
    setLoading(true)
    try {
      setVeiculos(await getVeiculos())
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditing(null)
    setViewOnly(false)
    setModalOpen(true)
  }

  function openEditModal(v: Veiculo) {
    setEditing(v)
    setViewOnly(false)
    setModalOpen(true)
  }

  function openViewModal(v: Veiculo) {
    setEditing(v)
    setViewOnly(true)
    setModalOpen(true)
  }

  function openDeleteConfirm(v: Veiculo) {
    setSelected(v)
    setConfirmOpen(true)
  }

  async function handleDelete() {
    if (!selected) return
    await deletarVeiculo(selected.id)
    setVeiculos(prev => prev.filter(x => x.id !== selected.id))
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalVeiculo
        isOpen={isModalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setViewOnly(false)
        }}
        veiculo={editing ?? undefined}
        carregarVeiculos={fetchVeiculos}
        readOnly={viewOnly}
      />

      <ModalConfirm
        isOpen={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        description={
          <>
            Deseja realmente excluir o veículo{" "}
            <span className="uppercase">{selected?.placa}</span>? Esta ação
            não poderá ser desfeita.
          </>
        }
      />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Veículos</h2>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Veículo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Veículos</CardTitle>
          <CardDescription>Lista de veículos cadastrados no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {veiculos.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.id}</TableCell>
                    <TableCell className="uppercase">{v.placa}</TableCell>
                    <TableCell className="uppercase">{v.modelo}</TableCell>
                    <TableCell className="uppercase">{v.descricao || "-"}</TableCell>
                    <TableCell>{v.ativo ? "Habilitado" : "Desabilitado"}</TableCell>
                    <TableCell className="flex justify-center items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => openViewModal(v)} title="Visualizar">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openEditModal(v)} title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openDeleteConfirm(v)} title="Excluir">
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
