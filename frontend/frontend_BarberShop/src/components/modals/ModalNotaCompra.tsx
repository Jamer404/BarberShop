import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useMemo, useState } from "react";
import {
  criarNotaCompra,
  CreateNotaCompraDto,
} from "@/services/notaCompraService";
import { toast } from "react-toastify";
import { getUnidadeMedidaById } from "@/services/unidadeMedidaService";
import { getTransportadoras } from "@/services/transportadoraService";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (nota: CreateNotaCompraDto & { id?: number }) => Promise<void> | void;
  initial?: (CreateNotaCompraDto & { id?: number }) | null;
  readOnly?: boolean;
  abrirBuscaFornecedor?: () => Promise<number | null>;
  abrirBuscaProduto?: () => Promise<{
    produtoId: number;
    descricao: string;
    unidadeId: number;
    precoVenda: number;
  } | null>;
  abrirBuscaCondicao?: () => Promise<number | { id: number; nome?: string } | null>;
  abrirBuscaTransportadora?: () => Promise<number | null>;
};

type FormItemBase = CreateNotaCompraDto["itens"][number];

type FormItem = FormItemBase & {
  produtoDescricao?: string;
  unidadeNome?: string;
};

type FormState = Omit<CreateNotaCompraDto, "itens"> & {
  itens: FormItem[];
};

type ItemLinha = {
  produtoId?: number;
  produtoDescricao?: string;
  unidadeId?: number;
  unidadeNome?: string;
  quantidade: number;
  precoUnit: number;
  descontoUnit: number;
};

const emptyForm: FormState = {
  modelo: "",
  serie: "",
  numero: 0,
  fornecedorId: 0,
  dataEmissao: new Date().toISOString().slice(0, 10),
  dataChegada: new Date().toISOString().slice(0, 10),
  tipoFrete: null,
  valorFrete: 0,
  valorSeguro: 0,
  outrasDespesas: 0,
  totalProdutos: 0,
  totalPagar: 0,
  condicaoPagamentoId: null,
  transportadoraId: null,
  placaVeiculo: "",
  observacao: "",
  itens: [],
  parcelas: [],
};

export function ModalNotaCompra({
  isOpen,
  onOpenChange,
  onSaved,
  initial = null,
  readOnly = false,
  abrirBuscaFornecedor,
  abrirBuscaProduto,
  abrirBuscaCondicao,
  abrirBuscaTransportadora,
}: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fornecedorNome, setFornecedorNome] = useState("");
  const [linha, setLinha] = useState<ItemLinha>({
    quantidade: 1,
    precoUnit: 0,
    descontoUnit: 0,
  });
  const [transportadoraNome, setTransportadoraNome] = useState<string>("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [condicaoPagamentoNome, setCondicaoPagamentoNome] = useState<string>("");

  const totalLinha = useMemo(() => {
    const liquido = Math.max(0, (linha.precoUnit || 0) - (linha.descontoUnit || 0));
    const total = (linha.quantidade || 0) * liquido;
    return { liquidoUnit: liquido, total };
  }, [linha]);

  const totalProdutos = useMemo(() => {
    return form.itens.reduce((acc, it) => acc + it.total, 0);
  }, [form.itens]);

  const totalPagar = useMemo(() => {
    return (
      totalProdutos +
      (form.valorFrete || 0) +
      (form.valorSeguro || 0) +
      (form.outrasDespesas || 0)
    );
  }, [totalProdutos, form.valorFrete, form.valorSeguro, form.outrasDespesas]);

  function adicionarItem() {
    if (!linha.produtoId || !linha.unidadeId) {
      toast.warn("Selecione o produto antes de adicionar.");
      return;
    }

    const item: FormItem = {
      produtoId: linha.produtoId,
      unidadeId: linha.unidadeId,
      quantidade: linha.quantidade || 0,
      precoUnit: linha.precoUnit || 0,
      descontoUnit: linha.descontoUnit || 0,
      liquidoUnit: totalLinha.liquidoUnit,
      total: totalLinha.total,
      rateio: 0,
      custoFinalUnit: totalLinha.liquidoUnit,
      custoFinal: totalLinha.total,
      produtoDescricao: linha.produtoDescricao,
      unidadeNome: linha.unidadeNome,
    };

    if (editIdx !== null) {
      // Editando: substitui o item
      setForm(f => ({
        ...f,
        itens: f.itens.map((it, idx) => (idx === editIdx ? item : it)),
      }));
      setEditIdx(null);
    } else {
      // Novo: adiciona
      setForm(f => ({ ...f, itens: [...f.itens, item] }));
    }

    setLinha({
      quantidade: 1,
      precoUnit: 0,
      descontoUnit: 0,
      produtoId: undefined,
      produtoDescricao: "",
      unidadeId: undefined,
      unidadeNome: "",
    });
  }

  async function handleSalvar() {
    try {
      const payload: CreateNotaCompraDto = {
        ...form,
        totalProdutos,
        totalPagar,
      };
      if (onSaved) {
        await (onSaved as any)({ ...payload, id: initial?.id });
        toast.success("Nota de compra salva!");
        onOpenChange(false);
        return;
      }
      await criarNotaCompra(payload);
      toast.success("Nota de compra salva!");
      onOpenChange(false);
      if (onSaved) await (onSaved as any)(payload);
    } catch {
      toast.error("Erro ao salvar nota de compra.");
    }
  }

  useEffect(() => {
    if (initial) {
      const itens = (initial.itens || []) as FormItem[];
      setForm({
        ...(initial as FormState),
        itens,
      });
      setCondicaoPagamentoNome("");
    } else {
      setForm(emptyForm);
    }
  }, [initial]);

  useEffect(() => {
    async function fetchNomeFornecedor() {
      if (form.fornecedorId) {
        try {
          const resp = await import("@/services/fornecedorService");
          const fornecedor = await resp.getFornecedorById(form.fornecedorId);
          setFornecedorNome(fornecedor.nomeRazaoSocial || "");
        } catch {
          setFornecedorNome("");
        }
      } else {
        setFornecedorNome("");
      }
    }
    fetchNomeFornecedor();
  }, [form.fornecedorId]);

  useEffect(() => {
    async function fetchCondicaoPagamento() {
      if (form.condicaoPagamentoId) {
        try {
          const resp = await import("@/services/condicaoPagamentoService");
          const cond = await resp.getCondicaoPagamento(form.condicaoPagamentoId);
          setCondicaoPagamentoNome(cond.descricao ?? "");
        } catch {
          setCondicaoPagamentoNome("");
        }
      } else {
        setCondicaoPagamentoNome("");
      }
    }
    fetchCondicaoPagamento();
  }, [form.condicaoPagamentoId]);

  useEffect(() => {
    async function fetchTransportadora() {
      if (form.transportadoraId) {
        try {
          const lista = await getTransportadoras();
          console.log("transportadoras:", lista);
          const t = lista.find(t => t.id === form.transportadoraId);
          setTransportadoraNome(t?.razaoSocial || "");
        } catch {
          setTransportadoraNome("");
        }
      } else {
        setTransportadoraNome("");
      }
    }
    fetchTransportadora();
  }, [form.transportadoraId]);

  const handleLookupKey =
    (fn: () => Promise<void> | void) =>
    async (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (readOnly) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        await fn();
      }
    };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
  <DialogContent className="w-[1400px] max-w-full p-0">
        <DialogHeader className="px-6 pt-4">
          <DialogTitle>Cadastro Nota de Compra</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-4 overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Modelo</Label>
              <Input
                value={form.modelo ?? ""}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                disabled={readOnly}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Série</Label>
              <Input
                value={form.serie ?? ""}
                onChange={(e) => setForm({ ...form, serie: e.target.value })}
                disabled={readOnly}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Número</Label>
              <Input
                type="number"
                value={form.numero}
                onChange={(e) =>
                  setForm({ ...form, numero: Number(e.target.value) || 0 })
                }
                disabled={readOnly}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Código</Label>
              <Input
                type="number"
                readOnly
                value={form.fornecedorId || ""}
                placeholder="Clique para selecionar"
                className={!readOnly ? "cursor-pointer" : ""}
                title={!readOnly ? "Selecionar fornecedor" : undefined}
                onClick={async () => {
                  if (readOnly) return;
                  const id = await abrirBuscaFornecedor?.();
                  if (id) setForm({ ...form, fornecedorId: id });
                }}
                onKeyDown={handleLookupKey(async () => {
                  const id = await abrirBuscaFornecedor?.();
                  if (id) setForm({ ...form, fornecedorId: id });
                })}
              />
            </div>
            <div className="col-span-4 space-y-1.5 flex flex-col justify-end">
              <Label>Fornecedor</Label>
              <Input readOnly value={fornecedorNome} placeholder="Fornecedor" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Data Emissão</Label>
              <Input
                type="date"
                value={form.dataEmissao}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm({ ...form, dataEmissao: e.target.value })}
                disabled={readOnly}
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Data Chegada</Label>
              <Input
                type="date"
                value={form.dataChegada}
                onChange={(e) => setForm({ ...form, dataChegada: e.target.value })}
                disabled={readOnly}
              />
            </div>

            <div className="col-span-12 mt-2 p-3 rounded-md border">
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-2 space-y-1.5">
                  <Label>Código</Label>
                  <Input
                    readOnly
                    value={linha.produtoId || ""}
                    placeholder="Clique para selecionar"
                    className={!readOnly ? "cursor-pointer" : ""}
                    title={!readOnly ? "Selecionar produto" : undefined}
                    onClick={async () => {
                      if (readOnly) return;
                      const sel = await abrirBuscaProduto?.();
                      if (sel) {
                        let unidadeNome = "";
                        if (sel.unidadeId) {
                          try {
                            const unidade = await getUnidadeMedidaById(sel.unidadeId);
                            unidadeNome = unidade.nome || "";
                          } catch {}
                        }
                        setLinha((l) => ({
                          ...l,
                          produtoId: sel.produtoId,
                          produtoDescricao: sel.descricao,
                          unidadeId: sel.unidadeId,
                          unidadeNome,
                          precoUnit: sel.precoVenda,
                        }));
                      }
                    }}
                    onKeyDown={handleLookupKey(async () => {
                      const sel = await abrirBuscaProduto?.();
                      if (sel) {
                        let unidadeNome = "";
                        if (sel.unidadeId) {
                          try {
                            const unidade = await getUnidadeMedidaById(sel.unidadeId);
                            unidadeNome = unidade.nome || "";
                          } catch {}
                        }
                        setLinha((l) => ({
                          ...l,
                          produtoId: sel.produtoId,
                          produtoDescricao: sel.descricao,
                          unidadeId: sel.unidadeId,
                          unidadeNome,
                          precoUnit: sel.precoVenda,
                        }));
                      }
                    })}
                  />
                </div>
                <div className="col-span-4 space-y-1.5">
                  <Label>Produto</Label>
                  <Input readOnly value={linha.produtoDescricao || ""} />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Unidade</Label>
                  <Input readOnly value={linha.unidadeNome || ""} />
                </div>
                <div className="col-span-1.5 space-y-1.5">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={linha.quantidade.toFixed(2)}
                    onChange={(e) =>
                      setLinha({
                        ...linha,
                        quantidade: Number(e.target.value) || 0,
                      })
                    }
                    disabled={readOnly}
                    className="text-right"
                  />
                </div>
                <div className="col-span-1.5 space-y-1.5">
                  <Label>Preço</Label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={formatBRL(linha.precoUnit)}
                    onChange={e => {
                      // Remove tudo que não for número ou vírgula/ponto
                      let raw = e.target.value.replace(/[^\d,\.]/g, '').replace(',', '.');
                      let num = parseFloat(raw);
                      setLinha({
                        ...linha,
                        precoUnit: isNaN(num) ? 0 : num,
                      });
                    }}
                    disabled={readOnly}
                    className="text-right"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Total</Label>
                  <Input readOnly value={formatBRL(totalLinha.total)} className="text-right" />
                </div>

                <div className="col-span-12 flex justify-end">
                  {!readOnly && <Button onClick={adicionarItem}>+ Adicionar</Button>}
                </div>
              </div>

              <div className="mt-3 overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Código</th>
                      <th className="text-left p-2">Produto</th>
                      <th className="text-left p-2">Unidade</th>
                      <th className="text-right p-2">Qtd</th>
                      <th className="text-right p-2">Preço UN</th>
                      <th className="text-right p-2">Desc UN</th>
                      <th className="text-right p-2">Líquido UN</th>
                      <th className="text-right p-2">Total</th>
                      <th className="text-center p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.itens.map((it, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{it.produtoId}</td>
                        <td className="p-2">{it.produtoDescricao || "—"}</td>
                        <td className="p-2">{it.unidadeNome || it.unidadeId}</td>
                        <td className="p-2 text-right">{it.quantidade.toFixed(2)}</td>
                        <td className="p-2 text-right">{formatBRL(it.precoUnit)}</td>
                        <td className="p-2 text-right">{formatBRL(it.descontoUnit)}</td>
                        <td className="p-2 text-right">{formatBRL(it.liquidoUnit)}</td>
                        <td className="p-2 text-right">{formatBRL(it.total)}</td>
                        <td className="p-2 text-center">
                          <Button size="icon" variant="ghost" title="Editar" onClick={() => {
                            setLinha({ ...it });
                            setEditIdx(idx);
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" title="Excluir" onClick={() => {
                            setForm(f => ({ ...f, itens: f.itens.filter((_, i) => i !== idx) }));
                          }}>
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-12 grid grid-cols-12 gap-3 mt-1">
              <div className="col-span-2">
                <Label>Tipo Frete</Label>
                <div className="flex gap-4 items-center mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tipoFrete"
                      checked={form.tipoFrete === "CIF"}
                      onChange={() => setForm({ ...form, tipoFrete: "CIF" })}
                      disabled={readOnly}
                    />
                    CIF
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="tipoFrete"
                      checked={form.tipoFrete === "FOB"}
                      onChange={() => setForm({ ...form, tipoFrete: "FOB" })}
                      disabled={readOnly}
                    />
                    FOB
                  </label>
                </div>
              </div>

              <div className="col-span-2">
                <Label>Valor Frete</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  className="text-right"
                  value={formatBRL(form.valorFrete)}
                  onChange={e => {
                    let raw = e.target.value.replace(/[^\d,\.]/g, '').replace(',', '.');
                    let num = parseFloat(raw);
                    setForm({ ...form, valorFrete: isNaN(num) ? 0 : num });
                  }}
                  disabled={readOnly}
                />
              </div>
              <div className="col-span-2">
                <Label>Valor Seguro</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  className="text-right"
                  value={formatBRL(form.valorSeguro)}
                  onChange={e => {
                    let raw = e.target.value.replace(/[^\d,\.]/g, '').replace(',', '.');
                    let num = parseFloat(raw);
                    setForm({ ...form, valorSeguro: isNaN(num) ? 0 : num });
                  }}
                  disabled={readOnly}
                />
              </div>
              <div className="col-span-2">
                <Label>Outras Despesas</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  className="text-right"
                  value={formatBRL(form.outrasDespesas)}
                  onChange={e => {
                    let raw = e.target.value.replace(/[^\d,\.]/g, '').replace(',', '.');
                    let num = parseFloat(raw);
                    setForm({ ...form, outrasDespesas: isNaN(num) ? 0 : num });
                  }}
                  disabled={readOnly}
                />
              </div>
              <div className="col-span-2">
                <Label>Total Produtos</Label>
                <Input readOnly value={formatBRL(totalProdutos)} className="text-right" />
              </div>
              <div className="col-span-2">
                <Label>Total a Pagar</Label>
                <Input readOnly value={formatBRL(totalPagar)} className="text-right" />
              </div>
            </div>

            <div className="col-span-12 grid grid-cols-12 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Código</Label>
                <Input
                  readOnly
                  value={form.condicaoPagamentoId || ""}
                  placeholder="Clique para selecionar"
                  className={!readOnly ? "cursor-pointer" : ""}
                  title={!readOnly ? "Selecionar condição de pagamento" : undefined}
                  onClick={async () => {
                    if (readOnly) return;
                    const res = await abrirBuscaCondicao?.();
                    if (!res) return;
                    if (typeof res === "number") {
                      setForm({ ...form, condicaoPagamentoId: res });
                    } else {
                      setForm({ ...form, condicaoPagamentoId: res.id });
                      setCondicaoPagamentoNome(res.nome ?? "");
                    }
                  }}
                  onKeyDown={handleLookupKey(async () => {
                    const res = await abrirBuscaCondicao?.();
                    if (!res) return;
                    if (typeof res === "number") {
                      setForm({ ...form, condicaoPagamentoId: res });
                    } else {
                      setForm({ ...form, condicaoPagamentoId: res.id });
                      setCondicaoPagamentoNome(res.nome ?? "");
                    }
                  })}
                />
              </div>
              <div className="col-span-10 space-y-1.5">
                <Label>Condição de Pagamento</Label>
                <Input readOnly value={condicaoPagamentoNome} placeholder="—" />
              </div>

              <div className="col-span-12">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Parcela</th>
                      <th className="text-left p-2">Código</th>
                      <th className="text-left p-2">Forma de Pagamento</th>
                      <th className="text-left p-2">Data Vencimento</th>
                      <th className="text-right p-2">Valor Parcela</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.parcelas.map((p, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2">{p.numero}</td>
                        <td className="p-2">{p.formaPagamentoId ?? ""}</td>
                        <td className="p-2">—</td>
                        <td className="p-2">{p.dataVencimento}</td>
                        <td className="p-2 text-right">{p.valorParcela.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label>Código</Label>
              <Input
                readOnly
                value={form.transportadoraId || ""}
                placeholder="Clique para selecionar"
                className={!readOnly ? "cursor-pointer" : ""}
                title={!readOnly ? "Selecionar transportadora" : undefined}
                onClick={async () => {
                  if (readOnly) return;
                  const id = await abrirBuscaTransportadora?.();
                  if (id) setForm({ ...form, transportadoraId: id });
                }}
                onKeyDown={handleLookupKey(async () => {
                  const id = await abrirBuscaTransportadora?.();
                  if (id) setForm({ ...form, transportadoraId: id });
                })}
              />
            </div>
            <div className="col-span-4 space-y-1.5 flex flex-col justify-end">
              <Label>Transportadora</Label>
              <Input readOnly value={transportadoraNome} placeholder="Transportadora" />
            </div>
            <div className="col-span-3 space-y-1.5">
              <Label>Placa Veículo</Label>
              <Input
                value={form.placaVeiculo ?? ""}
                onChange={(e) =>
                  setForm({ ...form, placaVeiculo: e.target.value.toUpperCase() })
                }
                disabled={readOnly}
              />
            </div>
            <div className="col-span-3" />

            <div className="col-span-12 space-y-1.5">
              <Label>Observação</Label>
              <Textarea
                value={form.observacao ?? ""}
                onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                disabled={readOnly}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-4 gap-2">
          {!readOnly && (
            <Button
              onClick={handleSalvar}
              className="bg-black text-white hover:bg-black/90"
            >
              Cadastrar
            </Button>
          )}
          <DialogClose asChild>
            <Button
              variant="outline"
              className="bg-white text-black hover:bg-white/90 border"
              onClick={() => {
                setForm(emptyForm);
                setLinha({ quantidade: 1, precoUnit: 0, descontoUnit: 0 });
              }}
            >
              Voltar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
