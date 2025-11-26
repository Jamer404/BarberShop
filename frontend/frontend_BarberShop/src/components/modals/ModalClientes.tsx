import { useEffect, useMemo, useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import {
  Cliente, criarCliente, atualizarCliente, CreateClienteDto, UpdateClienteDto,
} from "@/services/clienteService"
import { Cidade, getCidades } from "@/services/cidadeService"
import { Estado, getEstados } from "@/services/estadoService"
import {
  CondicaoPagamento, getCondicoesPagamento,
} from "@/services/condicaoPagamentoService"
import { buildClienteSchema } from "@/validations/cliente"
import { ModalCidades } from "./ModalCidades"
import { ModalCondicaoPagamento } from "./ModalCondicaoPagamento"

type Props = {
  isOpen: boolean
  onOpenChange: (o: boolean) => void
  cliente: Cliente | null
  readOnly: boolean
  onSave: () => Promise<void>
}

type ClienteForm = Omit<CreateClienteDto, "dataNascimentoCriacao"> & {
  dataNascimentoCriacao: string | null;
};

export function ModalClientes({
  isOpen, onOpenChange, cliente, readOnly, onSave,
}: Props) {
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>([])

  const [form, setForm] = useState<ClienteForm>({
    nomeRazaoSocial: "",
    apelidoNomeFantasia: "",
    cpfCnpj: "",
    rgInscricaoEstadual: "",
    tipoPessoa: "F",
    classificacao: "CLIENTE",
    pf: true,
    sexo: "M",
    dataNascimentoCriacao: null,
    email: "",
    telefone: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cep: "",
    idCidade: 0,
    idCondicaoPagamento: 0,
    limiteCredito: 0,
    ativo: true,
  })

  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [citySelectorOpen, setCitySelectorOpen] = useState(false)
  const [condSelectorOpen, setCondSelectorOpen] = useState(false)
  const [modalCidadeOpen, setModalCidadeOpen] = useState(false)
  const [modalCondOpen, setModalCondOpen] = useState(false)
  const [searchCidade, setSearchCidade] = useState("")
  const [searchCond, setSearchCond] = useState("")

  const [reopenCitySelector, setReopenCitySelector] = useState(false)
  const [reopenCondSelector, setReopenCondSelector] = useState(false)

  const getCidadeUf = (id: number) => {
    const cid = cidades.find((c) => c.id === id)
    const est = estados.find((e) => e.id === cid?.idEstado)
    return cid && est ? `${cid.nome.toUpperCase()} - ${est.uf}` : "SELECIONE..."
  }

  const getNomeCondicao = (id: number) =>
    condicoes.find((c) => c.id === id)?.descricao.toUpperCase() || "SELECIONE..."

  const cidadesFiltradas = useMemo(() => {
    const t = searchCidade.toUpperCase()
    return cidades
      .filter((c) => getCidadeUf(c.id).toUpperCase().includes(t))
      .sort((a, b) => getCidadeUf(a.id).localeCompare(getCidadeUf(b.id)))
  }, [cidades, estados, searchCidade])

  const condicoesFiltradas = useMemo(() => {
    const t = searchCond.toUpperCase()
    return condicoes
      .filter((c) => (c.descricao || "").toUpperCase().includes(t))
      .sort((a, b) => (a.descricao || "").localeCompare(b.descricao || ""))
  }, [condicoes, searchCond])

  async function carregarAux() {
    try {
      const results = await Promise.allSettled([
        getCidades(), getEstados(), getCondicoesPagamento(),
      ])
      if (results[0].status === "fulfilled") setCidades(results[0].value || [])
      if (results[1].status === "fulfilled") setEstados(results[1].value || [])
      if (results[2].status === "fulfilled") setCondicoes(results[2].value || [])
    } catch (error) {
      console.error("Falha ao carregar dados do modal de clientes:", error)
    }
  }

  function handleCidadePicked(id: number) {
    setForm({ ...form, idCidade: id })
    setCitySelectorOpen(false)
  }

  function handleCondicaoPicked(id: number) {
    setForm({ ...form, idCondicaoPagamento: id })
    setCondSelectorOpen(false)
  }

  async function salvar() {
    const formData = { ...form }
    if (formData.dataNascimentoCriacao === "") {
      formData.dataNascimentoCriacao = null
    }

    const estadoSel = estados.find(
      (e) => e.id === cidades.find((c) => c.id === formData.idCidade)?.idEstado
    )
    const isBrasil = estadoSel?.idPais === 1
    const schema = buildClienteSchema(isBrasil)
    const parse = schema.safeParse(formData)

    if (!parse.success) {
      setErrors(parse.error.flatten().fieldErrors)
      return
    }

    const dataToSend = { ...parse.data }

    if (cliente) {
      await atualizarCliente(cliente.id, dataToSend as UpdateClienteDto)
    } else {
      await criarCliente(dataToSend as CreateClienteDto)
    }

    onOpenChange(false)
    await onSave()
  }

  useEffect(() => {
    if (isOpen) {
      carregarAux()
    }
  }, [isOpen])

  useEffect(() => {
    if (!modalCidadeOpen && reopenCitySelector) {
      setReopenCitySelector(false)
      setCitySelectorOpen(true)
    }
  }, [modalCidadeOpen, reopenCitySelector])

  useEffect(() => {
    if (!modalCondOpen && reopenCondSelector) {
      setReopenCondSelector(false)
      setCondSelectorOpen(true)
    }
  }, [modalCondOpen, reopenCondSelector])

  useEffect(() => {
    if (cliente) {
      setForm({
        ...cliente,
        tipoPessoa: cliente.tipoPessoa ?? "F",
        classificacao: cliente.classificacao ?? "CLIENTE",
      })
    } else {
      setForm({
        nomeRazaoSocial: "",
        apelidoNomeFantasia: "",
        cpfCnpj: "",
        rgInscricaoEstadual: "",
        tipoPessoa: "F",
        classificacao: "CLIENTE",
        pf: true,
        sexo: "M",
        dataNascimentoCriacao: null,
        email: "",
        telefone: "",
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cep: "",
        idCidade: 0,
        idCondicaoPagamento: 0,
        limiteCredito: 0,
        ativo: true,
      })
    }
    setErrors({})
  }, [cliente, isOpen])

  return (
    <>
      <ModalCidades
        isOpen={modalCidadeOpen}
        onOpenChange={(open) => setModalCidadeOpen(open)}
        onSave={async () => {
          await carregarAux()
          setReopenCitySelector(true)
        }}
        estados={estados}
      />

      <ModalCondicaoPagamento
        isOpen={modalCondOpen}
        onOpenChange={setModalCondOpen}
        onSave={async () => {
          setCondicoes(await getCondicoesPagamento())
          setReopenCondSelector(true)
        }}
      />

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl w-full max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{cliente ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>

              <div className="flex items-center gap-2 mr-8">
                <span className="text-sm text-muted-foreground">
                  Habilitado
                </span>
                <Switch
                  checked={form.ativo}
                  onCheckedChange={(v) => setForm({ ...form, ativo: v })}
                  disabled={readOnly}
                />
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[70vh] pr-2 grid grid-cols-4 gap-x-4 gap-y-3 text-sm">

            <div className="col-span-1 flex flex-col gap-1.5">
              <label htmlFor="tipoPessoaSelect">Tipo de Pessoa</label>
              <select
                id="tipoPessoaSelect"
                disabled={readOnly}
                className="w-full border rounded px-2 py-1.5 bg-background"
                value={form.pf ? "pf" : "pj"}
                onChange={(e) => setForm({ ...form, pf: e.target.value === "pf" })}
              >
                <option value="pf">PESSOA FÍSICA</option>
                <option value="pj">PESSOA JURÍDICA</option>
              </select>
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <label htmlFor="nomeRazaoSocial">Nome / Razão Social</label>
              <Input
                id="nomeRazaoSocial"
                placeholder="Digite o nome completo ou a razão social"
                disabled={readOnly}
                value={form.nomeRazaoSocial ?? ""}
                className={`uppercase ${errors.nomeRazaoSocial ? "border-destructive" : ""}`}
                onChange={(e) => setForm({ ...form, nomeRazaoSocial: e.target.value.toUpperCase() })}
              />
              {errors.nomeRazaoSocial && <p className="text-xs text-destructive">{errors.nomeRazaoSocial[0]}</p>}
            </div>

            <div className="col-span-1 flex flex-col gap-1.5">
              <label htmlFor="apelidoNomeFantasia">Apelido / Nome Fantasia</label>
              <Input
                id="apelidoNomeFantasia"
                placeholder="Digite o apelido ou nome fantasia"
                disabled={readOnly}
                value={form.apelidoNomeFantasia ?? ""}
                className={`uppercase ${errors.apelidoNomeFantasia ? "border-destructive" : ""}`}
                onChange={(e) => setForm({ ...form, apelidoNomeFantasia: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="col-span-1 flex flex-col gap-1.5">
              <label htmlFor="cpfCnpj">CPF / CNPJ</label>
              <Input
                id="cpfCnpj"
                placeholder="Digite o CPF ou CNPJ"
                disabled={readOnly}
                value={form.cpfCnpj ?? ""}
                className={errors.cpfCnpj ? "border-destructive" : ""}
                onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })}
              />
              {errors.cpfCnpj && <p className="text-xs text-destructive">{errors.cpfCnpj[0]}</p>}
            </div>

            <div className="col-span-1 flex flex-col gap-1.5">
              <label htmlFor="rgInscricaoEstadual">RG / Inscrição Estadual</label>
              <Input
                id="rgInscricaoEstadual"
                placeholder="Digite o RG ou IE"
                disabled={readOnly}
                value={form.rgInscricaoEstadual ?? ""}
                className={`uppercase ${errors.rgInscricaoEstadual ? "border-destructive" : ""}`}
                onChange={(e) => setForm({ ...form, rgInscricaoEstadual: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="col-span-1 flex flex-col gap-1.5">
              <label htmlFor="sexo">Sexo</label>
              <select
                id="sexo"
                disabled={readOnly || !form.pf}
                className={`w-full border rounded px-2 py-1.5 bg-background ${errors.sexo ? "border-destructive" : ""}`}
                value={form.sexo}
                onChange={(e) => setForm({ ...form, sexo: e.target.value as "M" | "F" })}
              >
                <option value="M">MASCULINO</option>
                <option value="F">FEMININO</option>
              </select>
            </div>

            <div className="col-span-1 flex flex-col gap-1.5">
              <label htmlFor="dataNascimentoCriacao">Data de Nascimento</label>
              <Input
                id="dataNascimentoCriacao"
                type="date"
                disabled={readOnly || !form.pf}
                value={form.dataNascimentoCriacao?.split("T")[0] ?? ""}
                className={errors.dataNascimentoCriacao ? "border-destructive" : ""}
                onChange={(e) => setForm({ ...form, dataNascimentoCriacao: e.target.value })}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                disabled={readOnly}
                value={form.email ?? ""}
                className={`uppercase ${errors.email ? "border-destructive" : ""}`}
                onChange={(e) => setForm({ ...form, email: e.target.value.toUpperCase() })}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email[0]}</p>}
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <label htmlFor="telefone">Telefone</label>
              <Input
                id="telefone"
                placeholder="(XX) XXXXX-XXXX"
                disabled={readOnly}
                value={form.telefone ?? ""}
                className={errors.telefone ? "border-destructive" : ""}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <label htmlFor="rua">Rua / Logradouro</label>
              <Input
                id="rua"
                placeholder="Ex: Rua das Flores"
                disabled={readOnly}
                value={form.rua ?? ""}
                className={`uppercase ${errors.rua ? "border-destructive" : ""}`}
                onChange={(e) => setForm({ ...form, rua: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="col-span-1 flex flex-col gap-1.5">
              <label htmlFor="numero">Número</label>
              <Input
                id="numero"
                placeholder="Ex: 123"
                disabled={readOnly}
                value={form.numero ?? ""}
                className={errors.numero ? "border-destructive" : ""}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
              />
            </div>

            <div className="col-span-1 flex flex-col gap-1.5">
              <label htmlFor="cep">CEP</label>
              <Input
                id="cep"
                placeholder="XXXXX-XXX"
                disabled={readOnly}
                value={form.cep ?? ""}
                className={errors.cep ? "border-destructive" : ""}
                onChange={(e) => setForm({ ...form, cep: e.target.value })}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <label htmlFor="bairro">Bairro</label>
              <Input
                id="bairro"
                placeholder="Ex: Centro"
                disabled={readOnly}
                value={form.bairro ?? ""}
                className={`uppercase ${errors.bairro ? "border-destructive" : ""}`}
                onChange={(e) => setForm({ ...form, bairro: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <label htmlFor="complemento">Complemento</label>
              <Input
                id="complemento"
                placeholder="Ex: Apto 101, Bloco B"
                disabled={readOnly}
                value={form.complemento ?? ""}
                className={`uppercase ${errors.complemento ? "border-destructive" : ""}`}
                onChange={(e) => setForm({ ...form, complemento: e.target.value.toUpperCase() })}
              />
            </div>


            <div className="col-span-2 flex flex-col gap-1.5">
              <label>Cidade</label>
              <Dialog open={citySelectorOpen} onOpenChange={setCitySelectorOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={readOnly}
                    className={`w-full justify-between uppercase font-normal ${errors.idCidade ? "border-destructive" : ""}`}
                  >
                    {getCidadeUf(form.idCidade)}
                    {!readOnly && <ChevronDown className="h-4 w-4" />}
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-6xl">
                  <DialogHeader>
                    <DialogTitle>Selecionar Cidade</DialogTitle>
                  </DialogHeader>

                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Buscar cidade ou estado..."
                      className="w-full"
                      value={searchCidade}
                      onChange={(e) => setSearchCidade(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        setReopenCitySelector(true)
                        setCitySelectorOpen(false)
                        setModalCidadeOpen(true)
                      }}
                    >
                      Nova Cidade
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-auto">
                    {cidadesFiltradas.map((cid) => (
                      <Button
                        key={cid.id}
                        variant={form.idCidade === cid.id ? "default" : "outline"}
                        className="w-full justify-start font-normal uppercase"
                        onClick={() => handleCidadePicked(cid.id)}
                        onDoubleClick={() => handleCidadePicked(cid.id)}
                      >
                        {getCidadeUf(cid.id)}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              {errors.idCidade && <p className="text-xs text-destructive">{errors.idCidade[0]}</p>}
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <label>Condição de Pagamento</label>
              <Dialog open={condSelectorOpen} onOpenChange={setCondSelectorOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={readOnly}
                    className={`w-full justify-between uppercase font-normal ${errors.idCondicaoPagamento ? "border-destructive" : ""}`}
                  >
                    {getNomeCondicao(form.idCondicaoPagamento)}
                    {!readOnly && <ChevronDown className="h-4 w-4" />}
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-5xl">
                  <DialogHeader>
                    <DialogTitle>Selecionar Condição</DialogTitle>
                  </DialogHeader>

                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Buscar condição..."
                      className="w-full"
                      value={searchCond}
                      onChange={(e) => setSearchCond(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        setReopenCondSelector(true)
                        setCondSelectorOpen(false)
                        setModalCondOpen(true)
                      }}
                    >
                      Nova Condição
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-auto">
                    {condicoesFiltradas.map((c) => (
                      <Button
                        key={c.id}
                        variant={form.idCondicaoPagamento === c.id ? "default" : "outline"}
                        className="w-full justify-start font-normal uppercase"
                        onClick={() => handleCondicaoPicked(c.id)}
                        onDoubleClick={() => handleCondicaoPicked(c.id)}
                      >
                        {(c.descricao || "").toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              {errors.idCondicaoPagamento && <p className="text-xs text-destructive">{errors.idCondicaoPagamento[0]}</p>}
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <label htmlFor="limiteCredito">Limite de Crédito</label>
              <Input
                id="limiteCredito"
                type="number"
                placeholder="R$ 0,00"
                disabled={readOnly}
                value={form.limiteCredito}
                className={errors.limiteCredito ? "border-destructive" : ""}
                onChange={(e) => setForm({ ...form, limiteCredito: Number(e.target.value) })}
              />
              {errors.limiteCredito && <p className="text-xs text-destructive">{errors.limiteCredito[0]}</p>}
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <label htmlFor="classificacao">Classificação</label>
              <Input
                id="classificacao"
                placeholder="Ex: CLIENTE, FORNECEDOR"
                disabled={readOnly}
                value={form.classificacao ?? ""}
                className={`uppercase ${errors.classificacao ? "border-destructive" : ""}`}
                onChange={(e) => setForm({ ...form, classificacao: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <DialogFooter>
            <div className="text-xs text-muted-foreground mr-auto pl-1 space-y-0.5">
              {cliente && (
                <>
                  <div>Data Criação: {cliente.dataCriacao ? (() => { const d = new Date(cliente.dataCriacao); d.setHours(d.getHours() - 3); return d.toLocaleString("pt-BR"); })() : 'N/A'}</div>
                  <div>Data Atualização: {cliente.dataAtualizacao ? (() => { const d = new Date(cliente.dataAtualizacao); d.setHours(d.getHours() - 3); return d.toLocaleString("pt-BR"); })() : 'N/A'}</div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              {!readOnly && <Button onClick={salvar}>{cliente ? "Atualizar" : "Salvar"}</Button>}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
