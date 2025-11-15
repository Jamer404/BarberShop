import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash, Eye } from "lucide-react"

import { getFuncionarios, deletarFuncionario, Funcionario } from "@/services/funcionarioService"
import { getCidades, Cidade } from "@/services/cidadeService"
import { getCargos, Cargo } from "@/services/cargoService"
import { ModalFuncionario } from "@/components/modals/ModalFuncionario"
import { ModalConfirm } from "@/components/modals/ModalConfirm"

export default function Funcionarios() {
  const [itens, setItens] = useState<Funcionario[]>([])
  const [loading, setLoading] = useState(true)
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [cargos, setCargos] = useState<Cargo[]>([])

  const [isModalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Funcionario | null>(null)
  const [viewOnly, setViewOnly] = useState(false)

  const [isConfirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected] = useState<Funcionario | null>(null)

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [funcs, cids, cgs] = await Promise.all([
        getFuncionarios(),
        getCidades(),
        getCargos()
      ])
      setItens(funcs)
      setCidades(cids)
      setCargos(cgs)
    } finally { setLoading(false) }
  }

  function openCreate() { setEditing(null); setViewOnly(false); setModalOpen(true) }
  function openEdit(f: Funcionario) { setEditing(f); setViewOnly(false); setModalOpen(true) }
  function openView(f: Funcionario) { setEditing(f); setViewOnly(true); setModalOpen(true) }
  function openDelete(f: Funcionario) { setSelected(f); setConfirmOpen(true) }

  async function handleDelete() {
    if (!selected) return
    await deletarFuncionario(selected.id)
    setItens(prev => prev.filter(x => x.id !== selected.id))
  }

  function getNomeCidade(id: number|null|undefined) {
    return cidades.find(c => c.id === id)?.nome || "-"
  }
  function getNomeCargo(id: number|null|undefined) {
    return cargos.find(c => c.id === id)?.nome || "-"
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalFuncionario
        isOpen={isModalOpen}
        onOpenChange={(o) => { setModalOpen(o); if (!o) setViewOnly(false) }}
        funcionario={editing ?? undefined}
        carregarFuncionarios={fetchAll}
        readOnly={viewOnly}
      />

      <ModalConfirm
        isOpen={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        description={
          <>Deseja realmente excluir o funcionário <span className="uppercase">{selected?.nome}</span>?</>
        }
      />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Funcionários</h2>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Funcionário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Funcionários</CardTitle>
          <CardDescription>Lista de funcionários cadastrados.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Salário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{f.id}</TableCell>
                    <TableCell className="uppercase">{f.nome}</TableCell>
                    <TableCell>{f.sexo}</TableCell>
                    <TableCell>{getNomeCidade(f.idCidade)}</TableCell>
                    <TableCell>{getNomeCargo(f.idCargo)}</TableCell>
                    <TableCell>
                      {f.salario != null
                        ? f.salario.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : "-"}
                    </TableCell>
                    <TableCell>{f.ativo ? "Habilitado" : "Desabilitado"}</TableCell>
                    <TableCell className="flex justify-center items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => openView(f)} title="Visualizar">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openEdit(f)} title="Editar">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openDelete(f)} title="Excluir">
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
