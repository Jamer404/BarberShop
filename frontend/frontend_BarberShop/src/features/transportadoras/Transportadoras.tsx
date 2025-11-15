import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash, Eye } from "lucide-react"

import { getTransportadoras, deletarTransportadora, Transportadora } from "@/services/transportadoraService"
import { ModalTransportadora } from "@/components/modals/ModalTransportadora"
import { ModalConfirm } from "@/components/modals/ModalConfirm"

export default function Transportadoras() {
  const [items, setItems] = useState<Transportadora[]>([])
  const [loading, setLoading] = useState(true)

  const [isModalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transportadora | null>(null)
  const [viewOnly, setViewOnly] = useState(false)

  const [isConfirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected] = useState<Transportadora | null>(null)

  useEffect(()=>{ fetchAll() }, [])
  async function fetchAll(){ setLoading(true); try{ setItems(await getTransportadoras()) } finally{ setLoading(false) } }

  function openCreate(){ setEditing(null); setViewOnly(false); setModalOpen(true) }
  function openEdit(t:Transportadora){ setEditing(t); setViewOnly(false); setModalOpen(true) }
  function openView(t:Transportadora){ setEditing(t); setViewOnly(true); setModalOpen(true) }
  function openDelete(t:Transportadora){ setSelected(t); setConfirmOpen(true) }

  async function handleDelete(){
    if(!selected) return
    await deletarTransportadora(selected.id)
    setItems(prev => prev.filter(x => x.id !== selected.id))
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalTransportadora
        isOpen={isModalOpen}
        onOpenChange={(o)=>{ setModalOpen(o); if(!o) setViewOnly(false) }}
        transportadora={editing ?? undefined}
        carregarTransportadoras={fetchAll}
        readOnly={viewOnly}
      />

      <ModalConfirm
        isOpen={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        description={<>Deseja excluir a transportadora <span className="uppercase">{selected?.razaoSocial}</span>?</>}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Transportadoras</h2>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4"/>Nova Transportadora</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Transportadoras</CardTitle>
          <CardDescription>Lista de transportadoras cadastradas.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p>Carregando...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Cidade (ID)</TableHead>
                  <TableHead>Condição (ID)</TableHead>
                  <TableHead>Veículos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(t=>(
                  <TableRow key={t.id}>
                    <TableCell>{t.id}</TableCell>
                    <TableCell className="uppercase">{t.razaoSocial}</TableCell>
                    <TableCell>{t.cnpj ?? "-"}</TableCell>
                    <TableCell>{t.idCidade ?? "-"}</TableCell>
                    <TableCell>{t.idCondicaoPagamento ?? "-"}</TableCell>
                    <TableCell>{t.veiculoIds?.length ?? 0}</TableCell>
                    <TableCell>{t.ativo ? "Habilitada" : "Desabilitada"}</TableCell>
                    <TableCell className="flex gap-2 justify-center">
                      <Button variant="outline" size="icon" onClick={()=>openView(t)}><Eye className="h-4 w-4"/></Button>
                      <Button variant="outline" size="icon" onClick={()=>openEdit(t)}><Edit className="h-4 w-4"/></Button>
                      <Button variant="outline" size="icon" onClick={()=>openDelete(t)}><Trash className="h-4 w-4"/></Button>
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
