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

import { getPaises, deletarPais, Pais } from "@/services/paisService"
import { ModalPaises } from "@/components/modals/ModalPaises"
import { ModalConfirm } from "@/components/modals/ModalConfirm"

export default function PaisesPage() {
  const [paises, setPaises] = useState<Pais[]>([])
  const [loading, setLoading] = useState(true)

  const [isPaisModalOpen, setPaisModalOpen] = useState(false)
  const [editingPais, setEditingPais] = useState<Pais | null>(null)
  const [viewOnly, setViewOnly] = useState(false)

  const [isConfirmOpen, setConfirmOpen] = useState(false)
  const [selectedPais, setSelectedPais] = useState<Pais | null>(null)

  useEffect(() => {
    fetchPaises()
  }, [])

  async function fetchPaises() {
    setLoading(true)
    try {
      setPaises(await getPaises())
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditingPais(null)
    setViewOnly(false)
    setPaisModalOpen(true)
  }

  function openEditModal(pais: Pais) {
    setEditingPais(pais)
    setViewOnly(false)
    setPaisModalOpen(true)
  }

  function openViewModal(pais: Pais) {
    setEditingPais(pais)
    setViewOnly(true)
    setPaisModalOpen(true)
  }

  function openDeleteConfirm(pais: Pais) {
    setSelectedPais(pais)
    setConfirmOpen(true)
  }

  async function handleDelete() {
    if (!selectedPais) return
    await deletarPais(selectedPais.id)
    setPaises((prev) => prev.filter((p) => p.id !== selectedPais.id))
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalPaises
        isOpen={isPaisModalOpen}
        onOpenChange={(open) => {
          setPaisModalOpen(open)
          if (!open) setViewOnly(false)
        }}
        pais={editingPais ?? undefined}
        carregarPaises={fetchPaises}
        readOnly={viewOnly}
      />

      <ModalConfirm
        isOpen={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        description={
          <>
            Deseja realmente excluir o país{" "}
            <span className="uppercase">{selectedPais?.nome}</span>? Esta ação
            não poderá ser desfeita.
          </>
        }
      />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Países</h2>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Novo País
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Países</CardTitle>
          <CardDescription>
            Lista de todos os países cadastrados no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
         {/*  <div className="flex items-center mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar país..."
                className="pl-10 w-72"
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
                  <TableHead>País</TableHead>
                  <TableHead>Sigla</TableHead>
                  <TableHead>DDI</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paises.map((pais) => (
                  <TableRow key={pais.id}>
                    <TableCell>{pais.id}</TableCell>
                    <TableCell>{pais.nome.toUpperCase()}</TableCell>
                    <TableCell>{pais.sigla.toUpperCase()}</TableCell>
                    <TableCell>{pais.ddi}</TableCell>
                    <TableCell className="flex justify-center items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openViewModal(pais)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditModal(pais)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDeleteConfirm(pais)}
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