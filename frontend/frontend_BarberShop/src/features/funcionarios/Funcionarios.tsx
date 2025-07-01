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
import {
  Plus,
  Search,
  Edit,
  Trash,
  ChevronDown,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Funcionario,
  getFuncionarios,
  criarFuncionario,
  atualizarFuncionario,
  deletarFuncionario,
} from "@/services/funcionarioService"

import {
  Cidade,
  getCidades,
  criarCidade,
} from "@/services/cidadeService"
import {
  Estado,
  getEstados,
  criarEstado,
} from "@/services/estadoService"
import {
  Pais,
  getPaises,
  criarPais,
} from "@/services/paisService"
import { toast } from "react-toastify"
import { FuncionarioSchema } from "@/validations/funcionario"

export default function Funcionarios() {
  const [funcs, setFuncs] = useState<Funcionario[]>([])
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [paises, setPaises] = useState<Pais[]>([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Funcionario | null>(null)
  const [cidadeSelectorOpen, setCidadeSelectorOpen] = useState(false)
  const [form, setForm] = useState({
    nomeRazaoSocial: "",
    cargo: "",
    telefone: "",
    email: "",
    matricula: "",
    salario: 0,
    dataAdmissao: "",
    turno: "",
    idCidade: 0,
  })

  /* ---------- modais aninhados (cidade > estado > país) ---------- */
  const [novoCidadeModal, setNovoCidadeModal] = useState(false)
  const [formNovoCidade, setFormNovoCidade] = useState({
    nome: "",
    ddd: "",
    idEstado: 0,
  })
  const [estadoSelectorNovoCidade, setEstadoSelectorNovoCidade] =
    useState(false)

  const [novoEstadoModal, setNovoEstadoModal] = useState(false)
  const [formNovoEstado, setFormNovoEstado] = useState({
    nome: "",
    uf: "",
    idPais: 0,
  })
  const [paisSelectorNovoEstado, setPaisSelectorNovoEstado] =
    useState(false)

  const [novoPaisModal, setNovoPaisModal] = useState(false)
  const [formNovoPais, setFormNovoPais] = useState({
    nome: "",
    sigla: "",
    ddi: "",
  })

  /* ---------- helpers ---------- */
  const getNomeCidade = (id: number) =>
    cidades.find((c) => c.id === id)?.nome || "-"

  const getNomeEstado = (id: number) =>
    estados.find((e) => e.id === id)?.nome || "-"

  const getNomePais = (id: number) =>
    paises.find((p) => p.id === id)?.nome || "-"

  /* ---------- CRUD ---------- */
  async function carregarDados() {
    const [f, c, e, p] = await Promise.all([
      getFuncionarios(),
      getCidades(),
      getEstados(),
      getPaises(),
    ])
    setFuncs(f)
    setCidades(c)
    setEstados(e)
    setPaises(p)
    setLoading(false)
  }

  async function salvarFuncionario() {
    try {
      const parsed = FuncionarioSchema.safeParse(form)
      if (!parsed.success) {
        toast.error('Preencha todos os campos corretamente')
        return
      }
      if (editing) {
        await atualizarFuncionario(editing.id, {
          ...editing,
          ...form,
          dataDemissao: editing.dataDemissao,
          salario: Number(form.salario),
        })
      } else {
        await criarFuncionario({
          ...form,
          tipoPessoa: "F",
          apelidoNomeFantasia: "",
          dataNascimentoCriacao: new Date().toISOString(),
          cpfCnpj: "",
          rgInscricaoEstadual: "",
          rua: "",
          numero: "",
          bairro: "",
          cep: "",
          classificacao: "",
          complemento: "",
          cargaHoraria: "",
          dataDemissao: null,
          salario: Number(form.salario),
        })
      }
      setModalOpen(false)
      await carregarDados()
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error)
      toast.error(
        "Erro ao salvar funcionário.")
    }
  }

  async function removerFuncionario(id: number) {
    await deletarFuncionario(id)
    setFuncs((prev) => prev.filter((f) => f.id !== id))
  }

  /* ---------- salvar cidade / estado / país ---------- */
  async function salvarCidade() {
    const novo = await criarCidade(formNovoCidade)
    const novas = await getCidades()
    setCidades(novas)
    setForm((prev) => ({ ...prev, idCidade: novo.id }))
    setNovoCidadeModal(false)
    setFormNovoCidade({ nome: "", ddd: "", idEstado: estados[0]?.id || 0 })
  }

  async function salvarEstado() {
    const novo = await criarEstado(formNovoEstado)
    const novosE = await getEstados()
    setEstados(novosE)
    setFormNovoCidade((prev) => ({ ...prev, idEstado: novo.id }))
    setNovoEstadoModal(false)
    setFormNovoEstado({ nome: "", uf: "", idPais: paises[0]?.id || 0 })
  }

  async function salvarPais() {
    const novo = await criarPais(formNovoPais)
    const novosP = await getPaises()
    setPaises(novosP)
    setFormNovoEstado((prev) => ({ ...prev, idPais: novo.id }))
    setNovoPaisModal(false)
    setFormNovoPais({ nome: "", sigla: "", ddi: "" })
  }

  /* ---------- open modals ---------- */
  const openCreate = () => {
    setEditing(null)
    setForm({
      nomeRazaoSocial: "",
      cargo: "",
      telefone: "",
      email: "",
      matricula: "",
      salario: 0,
      dataAdmissao: "",
      turno: "",
      idCidade: cidades[0]?.id || 0,
    })
    setModalOpen(true)
  }
  const openEdit = (f: Funcionario) => {
    setEditing(f)
    setForm({
      nomeRazaoSocial: f.nomeRazaoSocial,
      cargo: f.cargo,
      telefone: f.telefone,
      email: f.email,
      matricula: f.matricula,
      salario: Number(f.salario),
      dataAdmissao: f.dataAdmissao.substring(0, 10),
      turno: f.turno,
      idCidade: f.idCidade,
    })
    setModalOpen(true)
  }

  useEffect(() => {
    carregarDados()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Funcionários</h2>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Funcionário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Funcionários</CardTitle>
          <CardDescription>
            Lista de todos os funcionários cadastrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* <div className="flex items-center gap-2 pb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar funcionário..." className="pl-8 w-[300px]" />
            </div>
          </div> */}

          {loading ? (
            <p>Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {funcs.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{f.id}</TableCell>
                    <TableCell>{f.nomeRazaoSocial}</TableCell>
                    <TableCell>{f.cargo}</TableCell>
                    <TableCell>{f.telefone}</TableCell>
                    <TableCell>{f.email}</TableCell>
                    <TableCell className="flex gap-2">
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
                              onClick={() => removerFuncionario(f.id)}
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

      {/* ---------- Modal Funcionário ---------- */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Funcionário" : "Novo Funcionário"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome*</label>
              <Input placeholder="Nome completo"
                     value={form.nomeRazaoSocial}
                     onChange={(e) => setForm({ ...form, nomeRazaoSocial: e.target.value })}/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cargo*</label>
              <Input placeholder="Ex.: Barbeiro"
                     value={form.cargo}
                     onChange={(e) => setForm({ ...form, cargo: e.target.value })}/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <Input placeholder="(xx) 99999-9999"
                     value={form.telefone}
                     onChange={(e) => setForm({ ...form, telefone: e.target.value })}/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input placeholder="email@exemplo.com"
                     value={form.email}
                     onChange={(e) => setForm({ ...form, email: e.target.value })}/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Matrícula</label>
              <Input placeholder="Código interno"
                     value={form.matricula}
                     onChange={(e) => setForm({ ...form, matricula: e.target.value })}/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Salário*</label>
              <Input type="number" placeholder="0,00"
                     value={form.salario}
                     onChange={(e) => setForm({ ...form, salario: Number(e.target.value) })}/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data de admissão*</label>
              <Input type="date"
                     value={form.dataAdmissao}
                     onChange={(e) => setForm({ ...form, dataAdmissao: e.target.value })}/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Turno</label>
              <Input placeholder="Ex.: Manhã"
                     value={form.turno}
                     onChange={(e) => setForm({ ...form, turno: e.target.value })}/>
            </div>

            {/* ---------- seletor / cadastro de cidade ---------- */}
            <div>
              <label className="block text-sm font-medium mb-1">Cidade</label>
              <Dialog open={cidadeSelectorOpen} onOpenChange={setCidadeSelectorOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {getNomeCidade(form.idCidade)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl">
                  <DialogHeader>
                    <DialogTitle>Selecionar Cidade</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-2 max-h-[300px] overflow-auto">
                    {cidades.map((c) => (
                      <Button key={c.id}
                              variant={form.idCidade === c.id ? "default" : "outline"}
                              className="w-full justify-start"
                              onDoubleClick={() => {
                                setForm({ ...form, idCidade: c.id })
                                setCidadeSelectorOpen(false)
                              }}>
                        {c.nome}
                      </Button>
                    ))}
                  </div>

                  <div className="pt-4">
                    <Button variant="secondary" onClick={() => setNovoCidadeModal(true)}>
                      Cadastrar nova cidade
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={salvarFuncionario}>
              {editing ? "Atualizar" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Modal Nova Cidade ---------- */}
      <Dialog open={novoCidadeModal} onOpenChange={setNovoCidadeModal}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Nova Cidade</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <Input placeholder="Nome da cidade"
                     value={formNovoCidade.nome}
                     onChange={(e) =>
                       setFormNovoCidade({ ...formNovoCidade, nome: e.target.value })}/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">DDD</label>
              <Input placeholder="DDD"
                     value={formNovoCidade.ddd}
                     onChange={(e) =>
                       setFormNovoCidade({ ...formNovoCidade, ddd: e.target.value })}/>
            </div>

            {/* ---------- estado seletor ---------- */}
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <Dialog open={estadoSelectorNovoCidade}
                      onOpenChange={setEstadoSelectorNovoCidade}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {getNomeEstado(formNovoCidade.idEstado)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl">
                  <DialogHeader>
                    <DialogTitle>Selecionar Estado</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-[300px] overflow-auto">
                    {estados.map((e) => (
                      <Button key={e.id}
                              variant={formNovoCidade.idEstado === e.id ? "default" : "outline"}
                              className="w-full justify-start"
                              onDoubleClick={() => {
                                setFormNovoCidade({ ...formNovoCidade, idEstado: e.id })
                                setEstadoSelectorNovoCidade(false)
                              }}>
                        {e.nome} ({e.uf}) – {getNomePais(e.idPais)}
                      </Button>
                    ))}
                  </div>
                  <div className="pt-4">
                    <Button variant="secondary" onClick={() => setNovoEstadoModal(true)}>
                      Cadastrar novo estado
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={salvarCidade}>Salvar Cidade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Modal Novo Estado ---------- */}
      <Dialog open={novoEstadoModal} onOpenChange={setNovoEstadoModal}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Novo Estado</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <Input placeholder="Nome do estado"
                     value={formNovoEstado.nome}
                     onChange={(e) =>
                       setFormNovoEstado({ ...formNovoEstado, nome: e.target.value })}/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">UF</label>
              <Input placeholder="UF" maxLength={2}
                     value={formNovoEstado.uf}
                     onChange={(e) =>
                       setFormNovoEstado({ ...formNovoEstado, uf: e.target.value.toUpperCase() })}/>
            </div>

            {/* ---------- país seletor ---------- */}
            <div>
              <label className="block text-sm font-medium mb-1">País</label>
              <Dialog open={paisSelectorNovoEstado}
                      onOpenChange={setPaisSelectorNovoEstado}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {getNomePais(formNovoEstado.idPais)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Selecionar País</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-[300px] overflow-auto">
                    {paises.map((p) => (
                      <Button key={p.id}
                              variant={formNovoEstado.idPais === p.id ? "default" : "outline"}
                              className="w-full justify-start"
                              onDoubleClick={() => {
                                setFormNovoEstado({ ...formNovoEstado, idPais: p.id })
                                setPaisSelectorNovoEstado(false)
                              }}>
                        {p.nome} ({p.sigla})
                      </Button>
                    ))}
                  </div>
                  <div className="pt-4">
                    <Button variant="secondary" onClick={() => setNovoPaisModal(true)}>
                      Cadastrar novo país
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={salvarEstado}>Salvar Estado</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---------- Modal Novo País ---------- */}
      <Dialog open={novoPaisModal} onOpenChange={setNovoPaisModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Novo País</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="Nome*"
                   value={formNovoPais.nome}
                   onChange={(e) =>
                     setFormNovoPais({ ...formNovoPais, nome: e.target.value })}/>
            <Input placeholder="Sigla*" maxLength={2}
                   value={formNovoPais.sigla}
                   onChange={(e) =>
                     setFormNovoPais({ ...formNovoPais, sigla: e.target.value.toUpperCase() })}/>
            <Input placeholder="DDI*"
                   value={formNovoPais.ddi}
                   onChange={(e) =>
                     setFormNovoPais({ ...formNovoPais, ddi: e.target.value })}/>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button onClick={salvarPais}>Salvar País</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}