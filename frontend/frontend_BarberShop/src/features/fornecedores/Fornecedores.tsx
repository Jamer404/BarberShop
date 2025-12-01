// src/pages/fornecedores/Fornecedores.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash, Eye } from "lucide-react";

import { getFornecedores, deletarFornecedor, Fornecedor } from "@/services/fornecedorService";
import { getCidades, Cidade } from "@/services/cidadeService";
import { getFormasPagamento, FormaPagamento } from "@/services/formaPagamentoService";
import { getCondicoesPagamento, CondicaoPagamento } from "@/services/condicaoPagamentoService";

import ModalFornecedores from "@/components/modals/ModalFornecedores";
import { ModalConfirm } from "@/components/modals/ModalConfirm";

export default function Fornecedores() {
  const [itens, setItens] = useState<Fornecedor[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [formas, setFormas] = useState<FormaPagamento[]>([]);
  const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Fornecedor | null>(null);
  const [viewOnly, setViewOnly] = useState(false);

  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<Fornecedor | null>(null);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [fs, cs, fps, cps] = await Promise.all([
        getFornecedores(), getCidades(), getFormasPagamento(), getCondicoesPagamento()
      ]);
      setItens(fs);
      setCidades(cs);
      setFormas(fps);
      setCondicoes(cps);
    } finally { setLoading(false); }
  }

  function openCreate() { setEditing(null); setViewOnly(false); setModalOpen(true); }
  function openEdit(f: Fornecedor) { setEditing(f); setViewOnly(false); setModalOpen(true); }
  function openView(f: Fornecedor) { setEditing(f); setViewOnly(true); setModalOpen(true); }
  function openDelete(f: Fornecedor) { setSelected(f); setConfirmOpen(true); }

  async function handleDelete() {
    if (!selected) return;
    await deletarFornecedor(selected.id);
    setItens(prev => prev.filter(x => x.id !== selected.id));
  }

  const cidadeNome = (id: number) => cidades.find(c => c.id === id)?.nome || "-";
  const formaNome = (id: number) => formas.find(f => f.id === id)?.descricao || "-";
  const condNome = (id: number) => condicoes.find(c => c.id === id)?.descricao || "-";

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ModalFornecedores
        isOpen={isModalOpen}
        onOpenChange={(o) => { setModalOpen(o); if (!o) setViewOnly(false); }}
        fornecedor={editing ?? undefined}
        carregarFornecedores={fetchAll}
        readOnly={viewOnly}
      />

      <ModalConfirm
        isOpen={isConfirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        description={<>Deseja realmente excluir o fornecedor <span className="uppercase">{selected?.nomeRazaoSocial}</span>?</>}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Fornecedores</h2>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Fornecedores</CardTitle>
          <CardDescription>Lista de fornecedores cadastrados no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Fantasia</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Condição</TableHead>
                  <TableHead>Forma</TableHead>
                  <TableHead>Mín. Pedido</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.map(f => (
                  <TableRow key={f.id}>
                    <TableCell className="text-right">{f.id}</TableCell>
                    <TableCell className="uppercase">{f.nomeRazaoSocial}</TableCell>
                    <TableCell className="uppercase">{f.apelidoNomeFantasia}</TableCell>
                    <TableCell>{f.tipoPessoa}</TableCell>
                    <TableCell>{cidadeNome(f.idCidade)}</TableCell>
                    <TableCell>{condNome(f.condicaoPagamentoId)}</TableCell>
                    <TableCell>{formaNome(f.formaPagamentoId)}</TableCell>
                    <TableCell>{f.valorMinimoPedido != null ? f.valorMinimoPedido.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "-"}</TableCell>
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
  );
}
