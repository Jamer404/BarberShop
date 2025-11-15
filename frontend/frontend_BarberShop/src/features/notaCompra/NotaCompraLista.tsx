import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ModalNotaCompra } from "@/components/modals/ModalNotaCompra";
import { ModalProduto } from "@/components/modals/ModalProduto";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useRef } from "react";
import { getProdutos, Produto } from "@/services/produtoService";
import { getFornecedores, Fornecedor } from "@/services/fornecedorService";
import { getCondicoesPagamento, CondicaoPagamento } from "@/services/condicaoPagamentoService";
import { getTransportadoras, Transportadora } from "@/services/transportadoraService";

export interface NotaCompra {
  id: number;
  numero: string;
  fornecedor: string;
  dataEmissao: string;
  total: number;
}

export default function NotaCompraLista() {
  const [notas, setNotas] = useState<NotaCompra[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // selectors state + resolvers
  const [prodSelOpen, setProdSelOpen] = useState(false);
  const [produtosList, setProdutosList] = useState<Produto[]>([]);
  const prodResolve = useRef<((v: { produtoId: number; descricao: string; unidadeId: number; precoVenda: number } | null) => void) | null>(null);
  const [modalProdutoOpen, setModalProdutoOpen] = useState(false);
  const [produtoCriado, setProdutoCriado] = useState<Produto | null>(null);

  const [fornSelOpen, setFornSelOpen] = useState(false);
  const [fornecedoresList, setFornecedoresList] = useState<Fornecedor[]>([]);
  const fornResolve = useRef<((v: number | null) => void) | null>(null);

  const [condSelOpen, setCondSelOpen] = useState(false);
  const [condicoesList, setCondicoesList] = useState<CondicaoPagamento[]>([]);
  const condResolve = useRef<((v: number | null) => void) | null>(null);

  const [transSelOpen, setTransSelOpen] = useState(false);
  const [transportadorasList, setTransportadorasList] = useState<Transportadora[]>([]);
  const transResolve = useRef<((v: number | null) => void) | null>(null);

  function handleNovaNota(nota: NotaCompra) {
    setNotas(prev => [...prev, { ...nota, id: prev.length + 1 }]);
    setModalOpen(false);
  }

  // abrir buscas usadas pelo formulario — retornam a seleção ou null
  async function abrirBuscaProduto(): Promise<{ produtoId: number; descricao: string; unidadeId: number; precoVenda: number } | null> {
    setProdSelOpen(true)
    try {
      const prods = await getProdutos()
      setProdutosList(prods)
    } catch (e) {
      setProdutosList([])
    }
    setProdutoCriado(null);
    return new Promise(resolve => { prodResolve.current = resolve })
  }

  async function abrirBuscaFornecedor(): Promise<number | null> {
    setFornSelOpen(true)
    try {
      const fs = await getFornecedores()
      setFornecedoresList(fs)
    } catch (e) {
      setFornecedoresList([])
    }
    return new Promise(resolve => { fornResolve.current = resolve })
  }

  async function abrirBuscaCondicao(): Promise<number | null> {
    setCondSelOpen(true)
    try {
      const cs = await getCondicoesPagamento()
      setCondicoesList(cs)
    } catch (e) {
      setCondicoesList([])
    }
    return new Promise(resolve => { condResolve.current = resolve })
  }

  async function abrirBuscaTransportadora(): Promise<number | null> {
    setTransSelOpen(true)
    try {
      const ts = await getTransportadoras()
      setTransportadorasList(ts)
    } catch (e) {
      setTransportadorasList([])
    }
    return new Promise(resolve => { transResolve.current = resolve })
  }

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Notas de Compra</h2>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Nota de Compra
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Notas de Compra</CardTitle>
          <CardDescription>Cadastre e gerencie suas notas de compra.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>CARREGANDO...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Data Emissão</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notas.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell>{n.numero}</TableCell>
                    <TableCell>{n.fornecedor}</TableCell>
                    <TableCell>{n.dataEmissao}</TableCell>
                    <TableCell>{n.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <ModalNotaCompra
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        onSaved={async () => { handleNovaNota({ id: notas.length + 1, numero: '', fornecedor: '', dataEmissao: '', total: 0 }) }}
        abrirBuscaProduto={abrirBuscaProduto}
        abrirBuscaFornecedor={abrirBuscaFornecedor}
        abrirBuscaCondicao={abrirBuscaCondicao}
        abrirBuscaTransportadora={abrirBuscaTransportadora}
      />

      {/* Selectors used by the modal */}
      <Dialog open={prodSelOpen} onOpenChange={(o) => { if (!o && prodResolve.current) { prodResolve.current(null); prodResolve.current = null } setProdSelOpen(o) }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Selecionar Produto</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-auto space-y-2 mb-4">
            {produtosList.map((p) => (
              <Button key={p.id} variant="outline" className="w-full justify-start" onClick={() => { prodResolve.current?.({ produtoId: p.id, descricao: p.descricao, unidadeId: p.unidadeId ?? 0, precoVenda: p.precoVenda }); prodResolve.current = null; setProdSelOpen(false) }}>
                {p.id} - {p.descricao}
              </Button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="default" onClick={() => setModalProdutoOpen(true)}>
              Novo Produto
            </Button>
            <Button variant="outline" onClick={() => setProdSelOpen(false)}>
              Voltar
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* ModalProduto for creating a new product from selection dialog */}
      <ModalProduto
        isOpen={modalProdutoOpen}
        onOpenChange={(open) => {
          setModalProdutoOpen(open);
          if (!open && produtoCriado) {
            // After creation, refresh list and select the new product
            (async () => {
              const prods = await getProdutos();
              setProdutosList(prods);
              const novo = prods.find(p => p.id === produtoCriado.id);
              if (novo && prodResolve.current) {
                prodResolve.current({ produtoId: novo.id, descricao: novo.descricao, unidadeId: novo.unidadeId ?? 0, precoVenda: novo.precoVenda });
                prodResolve.current = null;
                setProdSelOpen(false);
              }
              setProdutoCriado(null);
            })();
          }
        }}
        carregarProdutos={async () => {
          const prods = await getProdutos();
          setProdutosList(prods);
        }}
        produto={undefined}
        readOnly={false}
        // When a product is created, store it for selection after modal closes
        onSaved={(produto: Produto) => setProdutoCriado(produto)}
      />

      <Dialog open={fornSelOpen} onOpenChange={(o) => { if (!o && fornResolve.current) { fornResolve.current(null); fornResolve.current = null } setFornSelOpen(o) }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Selecionar Fornecedor</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-auto space-y-2">
            {fornecedoresList.map((f) => (
              <Button key={f.id} variant="outline" className="w-full justify-start" onClick={() => { fornResolve.current?.(f.id); fornResolve.current = null; setFornSelOpen(false) }}>
                {f.id} - {f.nomeRazaoSocial}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={condSelOpen} onOpenChange={(o) => { if (!o && condResolve.current) { condResolve.current(null); condResolve.current = null } setCondSelOpen(o) }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Selecionar Condição de Pagamento</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-auto space-y-2">
            {condicoesList.map((c) => (
              <Button key={c.id} variant="outline" className="w-full justify-start" onClick={() => { condResolve.current?.(c.id); condResolve.current = null; setCondSelOpen(false) }}>
                {c.id} - {c.descricao}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={transSelOpen} onOpenChange={(o) => { if (!o && transResolve.current) { transResolve.current(null); transResolve.current = null } setTransSelOpen(o) }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Selecionar Transportadora</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-auto space-y-2">
            {transportadorasList.map((t) => (
              <Button key={t.id} variant="outline" className="w-full justify-start" onClick={() => { transResolve.current?.(t.id); transResolve.current = null; setTransSelOpen(false) }}>
                {t.id} - {t.razaoSocial}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
