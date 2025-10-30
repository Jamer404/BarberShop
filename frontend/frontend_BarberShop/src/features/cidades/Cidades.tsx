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
import {
  getCidades,
  deletarCidade,
  Cidade,
} from "@/services/cidadeService"
import { getEstados, Estado } from "@/services/estadoService"
import { getPaises, Pais } from "@/services/paisService"
import { ModalCidades } from "@/components/modals/ModalCidades"
import { ModalConfirm } from "@/components/modals/ModalConfirm"

export default function CidadesPage() {
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [paises, setPaises] = useState<Pais[]>([])
  const [loading, setLoading] = useState(true)
  const [modalCidadeOpen, setModalCidadeOpen] = useState(false)
  const [editingCidade, setEditingCidade] = useState<Cidade | null>(null)
  const [viewOnly, setViewOnly] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cidadeSelecionada, setCidadeSelecionada] = useState<Cidade | null>(
    null,
  )

  async function carregarDados() {
    try {
      const results = await Promise.allSettled([
        getCidades(),
        getEstados(),
        getPaises(),
      ])

      if (results[0].status === "fulfilled") {
        setCidades(results[0].value || [])
      } else {
        console.error("Erro ao carregar cidades:", results[0].reason)
        setCidades([])
      }

      if (results[1].status === "fulfilled") {
        setEstados(results[1].value || [])
      } else {
        console.error("Erro ao carregar estados:", results[1].reason)
        setEstados([])
      }

      if (results[2].status === "fulfilled") {
        setPaises(results[2].value || [])
      } else {
        console.error("Erro ao carregar países:", results[2].reason)
        setPaises([])
      }
    } catch (error) {
      console.error("Falha geral ao carregar dados:", error)
      setCidades([])
      setEstados([])
      setPaises([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados()
  }, [])

  function openCreateModal() {
    setEditingCidade(null)
    setViewOnly(false)
    setModalCidadeOpen(true)
  }

  function openEditModal(cidade: Cidade) {
    setEditingCidade(cidade)
    setViewOnly(false)
    setModalCidadeOpen(true)
  }

  function openViewModal(cidade: Cidade) {
    setEditingCidade(cidade)
    setViewOnly(true)
    setModalCidadeOpen(true)
  }

  function openDeleteConfirm(cidade: Cidade) {
    setCidadeSelecionada(cidade)
    setConfirmOpen(true)
  }

  async function handleDelete() {
    if (!cidadeSelecionada) return
    await deletarCidade(cidadeSelecionada.id)
    setCidades((prev) => prev.filter((c) => c.id !== cidadeSelecionada.id))
  }

  const getEstado = (id: number) => estados.find((e) => e.id === id)
  const getNomeEstado = (id: number) =>
    getEstado(id)?.nome.toUpperCase() || "-"
  const getNomePais = (id: number) =>
    paises.find((p) => p.id === id)?.nome.toUpperCase() || "-"
  const getPaisPorEstado = (idEstado: number) =>
    getNomePais(getEstado(idEstado)?.idPais ?? 0)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalCidades
        isOpen={modalCidadeOpen}
        onOpenChange={(open) => {
          setModalCidadeOpen(open)
          if (!open) setViewOnly(false)
        }}
        cidade={editingCidade ?? undefined}
        onSave={carregarDados}
        readOnly={viewOnly}
        estados={estados}
      />

      <ModalConfirm
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        description={
          <>
            Deseja excluir a cidade{" "}
            <span className="uppercase">{cidadeSelecionada?.nome}</span>?
          </>
        }
      />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Cidades</h2>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Cidade
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Cidades</CardTitle>
          <CardDescription>
            Lista de todas as cidades cadastradas no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
         {/*  <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar cidade..."
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
                  <TableHead>Cidade</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cidades.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.id}</TableCell>
                    <TableCell>{c.nome.toUpperCase()}</TableCell>
                    <TableCell>{getNomeEstado(c.idEstado)}</TableCell>
                    <TableCell>{getPaisPorEstado(c.idEstado)}</TableCell>
                    <TableCell className="flex justify-center items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openViewModal(c)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEditModal(c)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openDeleteConfirm(c)}
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