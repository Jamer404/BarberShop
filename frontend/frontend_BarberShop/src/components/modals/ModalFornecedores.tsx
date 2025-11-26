
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import {
  criarFornecedor, atualizarFornecedor,
  Fornecedor, CreateFornecedorDto, UpdateFornecedorDto
} from "@/services/fornecedorService";

import { Cidade, getCidades } from "@/services/cidadeService";
import { CondicaoPagamento, getCondicoesPagamento } from "@/services/condicaoPagamentoService";
import { FormaPagamento, getFormasPagamento } from "@/services/formaPagamentoService";

import { ChevronDown } from "lucide-react";

type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fornecedor?: Fornecedor;
  carregarFornecedores: () => void;
  readOnly?: boolean;
};

export function ModalFornecedores({
  isOpen, onOpenChange, fornecedor, carregarFornecedores, readOnly = false
}: Props) {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>([]);
  const [formas, setFormas] = useState<FormaPagamento[]>([]);

  const [citySelOpen, setCitySelOpen] = useState(false);
  const [condSelOpen, setCondSelOpen] = useState(false);
  const [formaSelOpen, setFormaSelOpen] = useState(false);

  const [searchCidade, setSearchCidade] = useState("");
  const [searchCond, setSearchCond] = useState("");
  const [searchForma, setSearchForma] = useState("");

  const [form, setForm] = useState<CreateFornecedorDto>({
    tipoPessoa: "J",
    nomeRazaoSocial: "",
    apelidoNomeFantasia: "",
    dataNascimentoCriacao: new Date().toISOString().slice(0,10),
    cpfCnpj: "",
    rgInscricaoEstadual: "",
    email: "",
    telefone: "",
    rua: "",
    numero: "",
    bairro: "",
    cep: "",
    classificacao: "",
    complemento: "",
    formaPagamentoId: 0,
    condicaoPagamentoId: 0,
    idCidade: 0,
    valorMinimoPedido: null
  });

  useEffect(() => {
    if (!isOpen) return;
    Promise.allSettled([
      getCidades(),
      getCondicoesPagamento(),
      getFormasPagamento()
    ]).then(r => {
      if (r[0].status === "fulfilled") setCidades(r[0].value);
      if (r[1].status === "fulfilled") setCondicoes(r[1].value);
      if (r[2].status === "fulfilled") setFormas(r[2].value);
    });
  }, [isOpen]);

  useEffect(() => {
    if (fornecedor) {
      setForm({
        tipoPessoa: fornecedor.tipoPessoa,
        nomeRazaoSocial: fornecedor.nomeRazaoSocial,
        apelidoNomeFantasia: fornecedor.apelidoNomeFantasia,
        dataNascimentoCriacao: fornecedor.dataNascimentoCriacao?.slice(0,10),
        cpfCnpj: fornecedor.cpfCnpj ?? "",
        rgInscricaoEstadual: fornecedor.rgInscricaoEstadual ?? "",
        email: fornecedor.email ?? "",
        telefone: fornecedor.telefone ?? "",
        rua: fornecedor.rua ?? "",
        numero: fornecedor.numero ?? "",
        bairro: fornecedor.bairro ?? "",
        cep: fornecedor.cep ?? "",
        classificacao: fornecedor.classificacao ?? "",
        complemento: fornecedor.complemento ?? "",
        formaPagamentoId: fornecedor.formaPagamentoId,
        condicaoPagamentoId: fornecedor.condicaoPagamentoId,
        idCidade: fornecedor.idCidade,
        valorMinimoPedido: fornecedor.valorMinimoPedido ?? null
      });
    } else {
      setForm(prev => ({ ...prev,
        tipoPessoa: "J",
        nomeRazaoSocial: "",
        apelidoNomeFantasia: "",
        dataNascimentoCriacao: new Date().toISOString().slice(0,10),
        cpfCnpj: "", rgInscricaoEstadual: "", email: "", telefone: "",
        rua: "", numero: "", bairro: "", cep: "", classificacao: "", complemento: "",
        formaPagamentoId: 0, condicaoPagamentoId: 0, idCidade: 0, valorMinimoPedido: null
      }));
    }
  }, [fornecedor, isOpen]);

  const cidadesFiltradas = useMemo(() => {
    const t = searchCidade.toUpperCase();
    return cidades
      .filter(c => `${c.nome} ${c.nome ?? ""}`.toUpperCase().includes(t))
      .sort((a,b) => (a.nome||"").localeCompare(b.nome||""));
  }, [cidades, searchCidade]);

  const condicoesFiltradas = useMemo(() => {
    const t = searchCond.toUpperCase();
    return condicoes.filter(c => (c.descricao||"").toUpperCase().includes(t))
                    .sort((a,b)=> (a.descricao||"").localeCompare(b.descricao||""));
  }, [condicoes, searchCond]);

  const formasFiltradas = useMemo(() => {
    const t = searchForma.toUpperCase();
    return formas.filter(f => (f.descricao||"").toUpperCase().includes(t))
                 .sort((a,b)=> (a.descricao||"").localeCompare(b.descricao||""));
  }, [formas, searchForma]);

  function getCidadeLabel(id: number) {
    const c = cidades.find(x => x.id === id);
    return c ? `${c.nome.toUpperCase()} - ${c.nome}` : "Selecione uma cidade";
    }

  async function handleSubmit() {
    const payload: CreateFornecedorDto | UpdateFornecedorDto = {
      ...form,
      nomeRazaoSocial: (form.nomeRazaoSocial||"").toUpperCase(),
      apelidoNomeFantasia: (form.apelidoNomeFantasia||"").toUpperCase(),
      classificacao: form.classificacao?.toUpperCase(),
      complemento: form.complemento?.toUpperCase(),
      rua: form.rua?.toUpperCase(),
      bairro: form.bairro?.toUpperCase(),
      numero: form.numero?.toUpperCase(),
      email: form.email,
      telefone: form.telefone,
    };

    if (fornecedor?.id) await atualizarFornecedor(fornecedor.id, payload);
    else await criarFornecedor(payload);

    onOpenChange(false);
    await carregarFornecedores();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92%] max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {readOnly ? "Visualizar Fornecedor" : fornecedor?.id ? "Editar Fornecedor" : "Cadastrar Fornecedor"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-3 text-sm">
          <div className="col-span-1">
            <select
              className="w-full border rounded px-2 py-2 bg-background"
              disabled={readOnly}
              value={form.tipoPessoa}
              onChange={e => setForm({ ...form, tipoPessoa: e.target.value as "F"|"J" })}
            >
              <option value="J">Pessoa Jurídica</option>
              <option value="F">Pessoa Física</option>
            </select>
          </div>

          <Input className="col-span-3 uppercase" placeholder="Fornecedor (Razão Social / Nome)*"
                 disabled={readOnly}
                 value={form.nomeRazaoSocial}
                 onChange={e=> setForm({ ...form, nomeRazaoSocial: e.target.value })} />

          <Input className="col-span-2 uppercase" placeholder="Nome Fantasia"
                 disabled={readOnly}
                 value={form.apelidoNomeFantasia}
                 onChange={e=> setForm({ ...form, apelidoNomeFantasia: e.target.value })} />

          <Input className="col-span-1" type="date" placeholder="Criação/Nascimento*"
                 disabled={readOnly}
                 value={form.dataNascimentoCriacao}
                 onChange={e=> setForm({ ...form, dataNascimentoCriacao: e.target.value })} />

          <Input className="col-span-1" placeholder="CNPJ / CPF"
                 disabled={readOnly}
                 value={form.cpfCnpj ?? ""}
                 onChange={e=> setForm({ ...form, cpfCnpj: e.target.value })} />

          <Input className="col-span-1 uppercase" placeholder="Inscrição Estadual / RG"
                 disabled={readOnly}
                 value={form.rgInscricaoEstadual ?? ""}
                 onChange={e=> setForm({ ...form, rgInscricaoEstadual: e.target.value })} />

          <Input className="col-span-2 uppercase" placeholder="Endereço"
                 disabled={readOnly}
                 value={form.rua ?? ""}
                 onChange={e=> setForm({ ...form, rua: e.target.value })} />

          <Input className="col-span-1 uppercase" placeholder="Número"
                 disabled={readOnly}
                 value={form.numero ?? ""}
                 onChange={e=> setForm({ ...form, numero: e.target.value })} />

          <Input className="col-span-1 uppercase" placeholder="Complemento"
                 disabled={readOnly}
                 value={form.complemento ?? ""}
                 onChange={e=> setForm({ ...form, complemento: e.target.value })} />

          <Input className="col-span-1 uppercase" placeholder="Bairro"
                 disabled={readOnly}
                 value={form.bairro ?? ""}
                 onChange={e=> setForm({ ...form, bairro: e.target.value })} />

          <Input className="col-span-1" placeholder="CEP"
                 disabled={readOnly}
                 value={form.cep ?? ""}
                 onChange={e=> setForm({ ...form, cep: e.target.value })} />

          <div className="col-span-2">
            <Dialog open={citySelOpen} onOpenChange={setCitySelOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={readOnly} className="w-full justify-between uppercase font-normal">
                  {getCidadeLabel(form.idCidade)}
                  {!readOnly && <ChevronDown className="h-4 w-4" />}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <div className="flex gap-2 items-center">
                  <Input className="w-full" placeholder="Buscar cidade..."
                    value={searchCidade} onChange={e=> setSearchCidade(e.target.value)} />
                </div>
                <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                  {cidadesFiltradas.map(c => (
                    <Button key={c.id}
                            type="button"
                            variant={form.idCidade === c.id ? "default" : "outline"}
                            className="w-full justify-start uppercase font-normal"
                            onClick={() => { setForm({ ...form, idCidade: c.id }); setCitySelOpen(false); }}>
                      {`${c.nome.toUpperCase()} - ${c.nome}`}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="col-span-2">
            <Dialog open={condSelOpen} onOpenChange={setCondSelOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={readOnly} className="w-full justify-between uppercase font-normal">
                  {condicoes.find(c => c.id === form.condicaoPagamentoId)?.descricao || "Condição de Pagamento"}
                  {!readOnly && <ChevronDown className="h-4 w-4" />}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <div className="flex gap-2 items-center">
                  <Input className="w-full" placeholder="Buscar condição..."
                         value={searchCond} onChange={e=> setSearchCond(e.target.value)} />
                </div>
                <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                  {condicoesFiltradas.map(c => (
                    <Button key={c.id}
                            type="button"
                            variant={form.condicaoPagamentoId === c.id ? "default" : "outline"}
                            className="w-full justify-start uppercase font-normal"
                            onClick={() => { setForm({ ...form, condicaoPagamentoId: c.id }); setCondSelOpen(false); }}>
                      {c.descricao.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="col-span-2">
            <Dialog open={formaSelOpen} onOpenChange={setFormaSelOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={readOnly} className="w-full justify-between uppercase font-normal">
                  {formas.find(f => f.id === form.formaPagamentoId)?.descricao || "Forma de Pagamento"}
                  {!readOnly && <ChevronDown className="h-4 w-4" />}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <div className="flex gap-2 items-center">
                  <Input className="w-full" placeholder="Buscar forma..."
                         value={searchForma} onChange={e=> setSearchForma(e.target.value)} />
                </div>
                <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                  {formasFiltradas.map(f => (
                    <Button key={f.id}
                            type="button"
                            variant={form.formaPagamentoId === f.id ? "default" : "outline"}
                            className="w-full justify-start uppercase font-normal"
                            onClick={() => { setForm({ ...form, formaPagamentoId: f.id }); setFormaSelOpen(false); }}>
                      {f.descricao.toUpperCase()}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Input className="col-span-2" type="number" step="0.01" placeholder="Valor mínimo pedido (R$)"
                 disabled={readOnly}
                 value={form.valorMinimoPedido ?? ""}
                 onChange={e=> setForm({ ...form, valorMinimoPedido: e.target.value ? Number(e.target.value) : null })} />

          <Input className="col-span-2" placeholder="E-mail(s)" disabled={readOnly}
                 value={form.email ?? ""} onChange={e=> setForm({ ...form, email: e.target.value })} />
          <Input className="col-span-2" placeholder="Telefone(s)" disabled={readOnly}
                 value={form.telefone ?? ""} onChange={e=> setForm({ ...form, telefone: e.target.value })} />
        </div>

        <DialogFooter>
          {!readOnly && (
            <Button onClick={handleSubmit}>
              {fornecedor?.id ? "Atualizar" : "Cadastrar"}
            </Button>
          )}
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ModalFornecedores;
