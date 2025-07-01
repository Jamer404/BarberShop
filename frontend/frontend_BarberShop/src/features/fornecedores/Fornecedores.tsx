import { useEffect, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Plus, Search, Edit, Trash, Eye, ChevronDown } from "lucide-react"
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogClose, DialogTrigger,
} from "@/components/ui/dialog"

import {
  Fornecedor, getFornecedores, criarFornecedor,
  atualizarFornecedor, deletarFornecedor,
} from "@/services/fornecedorService"
import { Cidade, getCidades } from "@/services/cidadeService"
import { Estado, getEstados } from "@/services/estadoService"
import { Pais, getPaises } from "@/services/paisService"
import {
  CondicaoPagamento, getCondicoesPagamento,
} from "@/services/condicaoPagamentoService"

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [paises, setPaises] = useState<Pais[]>([])
  const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Fornecedor | null>(null)
  const [citySelector, setCitySelector] = useState(false)
  const [condSelector, setCondSelector] = useState(false)
  const [searchCidade, setSearchCidade] = useState("")

  const [form, setForm] = useState({
    pessoaFisica: false,
    ativo: true,
    nomeRazaoSocial: "",
    apelido: "",
    sexo: "",
    email: "",
    telefone: "",
    celular: "",
    cep: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    idCidade: 0,
    cpfCnpj: "",
    rg: "",
    dataNascimento: "",
    formaPagamentoId: 0,
    condicaoPagamentoId: 0,
    valorMinimoPedido: 0,
  })

  const getCidade = (id: number) => cidades.find((c) => c.id === id)
  const getEstado = (id: number) => estados.find((e) => e.id === getCidade(id)?.idEstado)
  const getPais   = (id: number) => paises.find((p) => p.id === getEstado(id)?.idPais)
  const getNomeCidadeUf = (id: number) => {
    const cid = getCidade(id)
    const est = cid ? getEstado(id) : undefined
    return cid && est ? `${cid.nome} - ${est.uf}` : "-"
  }
  const getNomeCondicao = (id: number) =>
    condicoes.find((c) => c.id === id)?.descricao.toUpperCase() || "-"

  const cidadesFiltradas = useMemo(() => {
    const txt = searchCidade.toLowerCase()
    return cidades
      .filter((c) => getNomeCidadeUf(c.id).toLowerCase().includes(txt))
      .sort((a, b) => getNomeCidadeUf(a.id).localeCompare(getNomeCidadeUf(b.id)))
  }, [cidades, estados, searchCidade])

  async function carregar() {
    const [
      f, c, e, p, cp,
    ] = await Promise.all([
      getFornecedores(),
      getCidades(),
      getEstados(),
      getPaises(),
      getCondicoesPagamento(),
    ])
    setFornecedores(f)
    setCidades(c)
    setEstados(e)
    setPaises(p)
    setCondicoes(cp)
    setLoading(false)
  }

  async function salvarFornecedor() {
    if (editing) await atualizarFornecedor(editing.id, form)
    else await criarFornecedor(form)
    setModalOpen(false)
    await carregar()
  }

  async function remover(id: number) {
    await deletarFornecedor(id)
    setFornecedores((prev) => prev.filter((f) => f.id !== id))
  }

  function openCreate() {
    setEditing(null)
    setForm({
      pessoaFisica: false,
      ativo: true,
      nomeRazaoSocial: "",
      apelido: "",
      sexo: "",
      email: "",
      telefone: "",
      celular: "",
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      idCidade: 0,
      cpfCnpj: "",
      rg: "",
      dataNascimento: "",
      formaPagamentoId: 0,
      condicaoPagamentoId: 0,
      valorMinimoPedido: 0,
    })
    setModalOpen(true)
  }

  function openEdit(f: Fornecedor) {
    setEditing(f)
    setForm({
      pessoaFisica: f.pessoaFisica ?? false,
      ativo: f.ativo ?? true,
      nomeRazaoSocial: f.nomeRazaoSocial,
      apelido: f.apelido ?? "",
      sexo: f.sexo ?? "",
      email: f.email,
      telefone: f.telefone,
      celular: f.celular ?? "",
      cep: f.cep ?? "",
      endereco: f.endereco ?? "",
      numero: f.numero ?? "",
      complemento: f.complemento ?? "",
      bairro: f.bairro ?? "",
      idCidade: f.idCidade,
      cpfCnpj: f.cpfCnpj,
      rg: f.rg ?? "",
      dataNascimento: f.dataNascimento ?? "",
      formaPagamentoId: f.formaPagamentoId,
      condicaoPagamentoId: f.condicaoPagamentoId,
      valorMinimoPedido: f.valorMinimoPedido ?? 0,
    })
    setModalOpen(true)
  }

  useEffect(() => { carregar() }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Fornecedores</h2>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Fornecedores</CardTitle>
          <CardDescription>Cadastre, edite ou remova fornecedores.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>NOME / RAZÃO SOCIAL</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>TELEFONE</TableHead>
                  <TableHead>EMAIL</TableHead>
                  <TableHead className="text-center">AÇÕES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fornecedores.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{f.id}</TableCell>
                    <TableCell>{f.nomeRazaoSocial}</TableCell>
                    <TableCell>{f.cpfCnpj}</TableCell>
                    <TableCell>{f.telefone}</TableCell>
                    <TableCell>{f.email}</TableCell>
                    <TableCell className="flex gap-2 justify-center">
                      <Button variant="outline" size="icon" onClick={() => openEdit(f)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Excluir <strong>{f.nomeRazaoSocial}</strong>?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => remover(f.id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-7xl w-full">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-4 gap-4 py-4 text-sm">
            <div className="col-span-1 flex flex-col">
              <label>Código</label>
              <Input value={editing ? editing.id : "0"} disabled />
            </div>

            <div className="col-span-1 flex flex-col">
              <label>Pessoa</label>
              <div className="flex gap-4 border rounded px-2 py-1">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={form.pessoaFisica}
                    onChange={() => setForm({ ...form, pessoaFisica: true })}
                  />
                  Física
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={!form.pessoaFisica}
                    onChange={() => setForm({ ...form, pessoaFisica: false })}
                  />
                  Jurídica
                </label>
              </div>
            </div>

            <div className="col-span-1 flex flex-col">
              <label>Status</label>
              <div className="flex gap-4 border rounded px-2 py-1">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={form.ativo}
                    onChange={() => setForm({ ...form, ativo: true })}
                  />
                  Ativo
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={!form.ativo}
                    onChange={() => setForm({ ...form, ativo: false })}
                  />
                  Inativo
                </label>
              </div>
            </div>

            <div className="col-span-1 flex flex-col">
              <label>Sexo</label>
              <select
                className="border rounded px-2 py-1"
                value={form.sexo}
                onChange={(e) => setForm({ ...form, sexo: e.target.value })}
              >
                <option value="">Selecione</option>
                <option value="M">MASCULINO</option>
                <option value="F">FEMININO</option>
              </select>
            </div>

            <div className="col-span-2 flex flex-col">
              <label>Fornecedor</label>
              <Input
                value={form.nomeRazaoSocial}
                onChange={(e) => setForm({ ...form, nomeRazaoSocial: e.target.value })}
              />
            </div>

            <div className="col-span-2 flex flex-col">
              <label>Apelido</label>
              <Input
                value={form.apelido}
                onChange={(e) => setForm({ ...form, apelido: e.target.value })}
              />
            </div>

            <div className="col-span-2 flex flex-col">
              <label>Email</label>
              <Input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="col-span-1 flex flex-col">
              <label>Telefone</label>
              <Input
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              />
            </div>

            <div className="col-span-1 flex flex-col">
              <label>Celular</label>
              <Input
                value={form.celular}
                onChange={(e) => setForm({ ...form, celular: e.target.value })}
              />
            </div>

            <div className="col-span-1 flex flex-col">
              <label>CEP</label>
              <Input
                value={form.cep}
                onChange={(e) => setForm({ ...form, cep: e.target.value })}
              />
            </div>

            <div className="col-span-2 flex flex-col">
              <label>Endereço</label>
              <Input
                value={form.endereco}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              />
            </div>

            <div className="col-span-1 flex flex-col">
              <label>Número</label>
              <Input
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
              />
            </div>

            <div className="col-span-2 flex flex-col">
              <label>Complemento</label>
              <Input
                value={form.complemento}
                onChange={(e) => setForm({ ...form, complemento: e.target.value })}
              />
            </div>

            <div className="col-span-2 flex flex-col">
              <label>Bairro</label>
              <Input
                value={form.bairro}
                onChange={(e) => setForm({ ...form, bairro: e.target.value })}
              />
            </div>

            <div className="col-span-2 flex flex-col">
              <label>Cidade</label>
              <Dialog open={citySelector} onOpenChange={setCitySelector}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {getNomeCidadeUf(form.idCidade)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl">
                  <DialogHeader>
                    <DialogTitle>Selecionar Cidade</DialogTitle>
                  </DialogHeader>
                  <div className="flex gap-2 pb-2">
                    <Input
                      placeholder="Buscar..."
                      value={searchCidade}
                      onChange={(e) => setSearchCidade(e.target.value)}
                    />
                  </div>
                  <div className="max-h-[300px] overflow-auto space-y-1">
                    {cidadesFiltradas.map((c) => (
                      <Button
                        key={c.id}
                        variant={form.idCidade === c.id ? "default" : "outline"}
                        className="w-full justify-start"
                        onDoubleClick={() => {
                          setForm({ ...form, idCidade: c.id })
                          setCitySelector(false)
                        }}
                      >
                        {getNomeCidadeUf(c.id)}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="col-span-1 flex flex-col">
              <label>UF</label>
              <Input value={getEstado(form.idCidade)?.uf || ""} disabled />
            </div>

            <div className="col-span-1 flex flex-col">
              <label>País</label>
              <Input value={getPais(form.idCidade)?.nome || ""} disabled />
            </div>

            <div className="col-span-1 flex flex-col">
              <label>CPF/CNPJ</label>
              <Input
                value={form.cpfCnpj}
                onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })}
              />
            </div>

            <div className="col-span-1 flex flex-col">
              <label>RG</label>
              <Input
                value={form.rg}
                onChange={(e) => setForm({ ...form, rg: e.target.value })}
              />
            </div>

            <div className="col-span-1 flex flex-col">
              <label>Data Nasc.</label>
              <Input
                type="date"
                value={form.dataNascimento}
                onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })}
              />
            </div>

            <div className="col-span-4 border-t pt-4 grid grid-cols-4 gap-4">
              <div className="col-span-1 flex flex-col">
                <label>Código Cond. Pagamento</label>
                <Input value={form.condicaoPagamentoId || ""} disabled />
              </div>
              <div className="col-span-1 flex flex-col justify-end">
                <Button
                  variant="outline"
                  onClick={() => setCondSelector(true)}
                  className="w-full"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
              </div>
              <div className="col-span-2 flex flex-col">
                <label>Condição de Pagamento</label>
                <Input value={getNomeCondicao(form.condicaoPagamentoId)} disabled />
              </div>
            </div>

            <div className="col-span-2 flex flex-col">
              <label>Valor Mínimo de Pedido</label>
              <Input
                type="number"
                value={form.valorMinimoPedido}
                onChange={(e) =>
                  setForm({ ...form, valorMinimoPedido: Number(e.target.value) })
                }
              />
            </div>

            <div className="col-span-1 flex flex-col">
              <label>Data Cadastro</label>
              <Input value={editing?.dataCriacao?.slice(0, 10) || ""} disabled />
            </div>
            <div className="col-span-1 flex flex-col">
              <label>Data Últ. Alt.</label>
              <Input value={editing?.dataAtualizacao?.slice(0, 10) || ""} disabled />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={salvarFornecedor}>{editing ? "Atualizar" : "Salvar"}</Button>
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={condSelector} onOpenChange={setCondSelector}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Selecionar Condição de Pagamento</DialogTitle>
          </DialogHeader>
          <div className="max-h-[300px] overflow-auto space-y-1">
            {condicoes.map((c) => (
              <Button
                key={c.id}
                variant={form.condicaoPagamentoId === c.id ? "default" : "outline"}
                className="w-full justify-start uppercase"
                onDoubleClick={() => {
                  setForm({ ...form, condicaoPagamentoId: c.id })
                  setCondSelector(false)
                }}
              >
                {c.descricao}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
