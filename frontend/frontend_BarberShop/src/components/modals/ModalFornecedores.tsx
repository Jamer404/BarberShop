import { useEffect, useMemo, useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown } from "lucide-react"
import {
  criarFornecedor, atualizarFornecedor,
  Fornecedor, CreateFornecedorDto, UpdateFornecedorDto
} from "@/services/fornecedorService"
import { Cidade, getCidades } from "@/services/cidadeService"
import { Estado, getEstados } from "@/services/estadoService"
import { CondicaoPagamento, getCondicoesPagamento } from "@/services/condicaoPagamentoService"
import { FormaPagamento, getFormasPagamento } from "@/services/formaPagamentoService"
import { ModalCidades } from "./ModalCidades"
import { ModalCondicaoPagamento } from "./ModalCondicaoPagamento"
import { ModalFormaPagamento } from "./ModalFormaPagamento"

type Props = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  fornecedor?: Fornecedor
  carregarFornecedores: () => void
  readOnly?: boolean
}

export function ModalFornecedores({
  isOpen, onOpenChange, fornecedor, carregarFornecedores, readOnly = false
}: Props) {
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>([])
  const [formas, setFormas] = useState<FormaPagamento[]>([])

  const [form, setForm] = useState<CreateFornecedorDto>({
    tipoPessoa: "J",
    nomeRazaoSocial: "",
    apelidoNomeFantasia: "",
    dataNascimentoCriacao: new Date().toISOString().slice(0, 10),
    cpfCnpj: "",
    rgInscricaoEstadual: "",
    email: "",
    telefone: "",
    rua: "",
    numero: "",
    bairro: "",
    cep: "",
    complemento: "",
    formaPagamentoId: 0,
    condicaoPagamentoId: 0,
    idCidade: 0,
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const [citySelOpen, setCitySelOpen] = useState(false)
  const [condSelOpen, setCondSelOpen] = useState(false)
  const [formaSelOpen, setFormaSelOpen] = useState(false)

  const [modalCidadeOpen, setModalCidadeOpen] = useState(false)
  const [modalCondOpen, setModalCondOpen] = useState(false)
  const [modalFormaOpen, setModalFormaOpen] = useState(false)

  const [reopenCitySelector, setReopenCitySelector] = useState(false)
  const [reopenCondSelector, setReopenCondSelector] = useState(false)
  const [reopenFormaSelector, setReopenFormaSelector] = useState(false)

  const [searchCidade, setSearchCidade] = useState("")
  const [searchCond, setSearchCond] = useState("")
  const [searchForma, setSearchForma] = useState("")

  const getCidadeUf = (id: number, includeId = false) => {
    const cid = cidades.find((c) => c.id === id)
    const est = estados.find((e) => e.id === cid?.idEstado)
    if (includeId && cid && est) {
      return `${cid.id} - ${cid.nome.toUpperCase()} - ${est.uf}`
    }
    return cid && est ? `${cid.nome.toUpperCase()} - ${est.uf}` : "SELECIONE..."
  }

  const getNomeCondicao = (id: number, includeId = false) => {
    if (!id || id === 0) return "SELECIONE..."
    const cond = condicoes.find((c) => c.id === id)
    if (!cond) return "SELECIONE..."
    if (includeId) {
      return `${cond.id} - ${cond.descricao.toUpperCase()}`
    }
    return cond.descricao.toUpperCase()
  }

  const getNomeForma = (id: number, includeId = false) => {
    if (!id || id === 0) return "SELECIONE..."
    const forma = formas.find((f) => f.id === id)
    if (!forma) return "SELECIONE..."
    if (includeId) {
      return `${forma.id} - ${forma.descricao.toUpperCase()}`
    }
    return forma.descricao.toUpperCase()
  }

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

  const formasFiltradas = useMemo(() => {
    const t = searchForma.toUpperCase()
    return formas
      .filter((f) => (f.descricao || "").toUpperCase().includes(t))
      .sort((a, b) => (a.descricao || "").localeCompare(b.descricao || ""))
  }, [formas, searchForma])

  useEffect(() => {
    if (!isOpen) return
    Promise.allSettled([
      getCidades(),
      getEstados(),
      getCondicoesPagamento(),
      getFormasPagamento()
    ]).then((r) => {
      if (r[0].status === "fulfilled") setCidades(r[0].value)
      if (r[1].status === "fulfilled") setEstados(r[1].value)
      if (r[2].status === "fulfilled") setCondicoes(r[2].value)
      if (r[3].status === "fulfilled") setFormas(r[3].value)
    })
  }, [isOpen])

  useEffect(() => {
    if (fornecedor) {
      setForm({
        tipoPessoa: fornecedor.tipoPessoa,
        nomeRazaoSocial: fornecedor.nomeRazaoSocial,
        apelidoNomeFantasia: fornecedor.apelidoNomeFantasia,
        dataNascimentoCriacao: fornecedor.dataNascimentoCriacao?.slice(0, 10),
        cpfCnpj: fornecedor.cpfCnpj ?? "",
        rgInscricaoEstadual: fornecedor.rgInscricaoEstadual ?? "",
        email: fornecedor.email ?? "",
        telefone: fornecedor.telefone ?? "",
        rua: fornecedor.rua ?? "",
        numero: fornecedor.numero ?? "",
        bairro: fornecedor.bairro ?? "",
        cep: fornecedor.cep ?? "",
        complemento: fornecedor.complemento ?? "",
        formaPagamentoId: fornecedor.formaPagamentoId,
        condicaoPagamentoId: fornecedor.condicaoPagamentoId,
        idCidade: fornecedor.idCidade,
      })
    } else {
      setForm({
        tipoPessoa: "J",
        nomeRazaoSocial: "",
        apelidoNomeFantasia: "",
        dataNascimentoCriacao: new Date().toISOString().slice(0, 10),
        cpfCnpj: "",
        rgInscricaoEstadual: "",
        email: "",
        telefone: "",
        rua: "",
        numero: "",
        bairro: "",
        cep: "",
        complemento: "",
        formaPagamentoId: 0,
        condicaoPagamentoId: 0,
        idCidade: 0,
      })
    }
    setErrors({})
  }, [fornecedor, isOpen])

  useEffect(() => {
    if (!modalCidadeOpen && reopenCitySelector) {
      setReopenCitySelector(false)
      setCitySelOpen(true)
    }
  }, [modalCidadeOpen, reopenCitySelector])

  useEffect(() => {
    if (!modalCondOpen && reopenCondSelector) {
      setReopenCondSelector(false)
      setCondSelOpen(true)
    }
  }, [modalCondOpen, reopenCondSelector])

  useEffect(() => {
    if (!modalFormaOpen && reopenFormaSelector) {
      setReopenFormaSelector(false)
      setFormaSelOpen(true)
    }
  }, [modalFormaOpen, reopenFormaSelector])

  async function handleSubmit() {
    const newErrors: { [key: string]: string } = {}

    if (!form.nomeRazaoSocial.trim()) {
      newErrors.nomeRazaoSocial = "Razão Social / Nome é obrigatório"
    }

    if (!form.apelidoNomeFantasia.trim()) {
      newErrors.apelidoNomeFantasia = "Nome Fantasia / Apelido é obrigatório"
    }

    if (!form.dataNascimentoCriacao) {
      newErrors.dataNascimentoCriacao = "Data de Nascimento/Criação é obrigatória"
    }

    if (form.idCidade === 0) {
      newErrors.idCidade = "Cidade é obrigatória"
    }

    if (form.formaPagamentoId === 0) {
      newErrors.formaPagamentoId = "Forma de Pagamento é obrigatória"
    }

    if (form.condicaoPagamentoId === 0) {
      newErrors.condicaoPagamentoId = "Condição de Pagamento é obrigatória"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const payload: CreateFornecedorDto | UpdateFornecedorDto = {
      ...form,
      nomeRazaoSocial: form.nomeRazaoSocial.toUpperCase(),
      apelidoNomeFantasia: form.apelidoNomeFantasia.toUpperCase(),
      complemento: form.complemento?.toUpperCase(),
      rua: form.rua?.toUpperCase(),
      bairro: form.bairro?.toUpperCase(),
      numero: form.numero?.toUpperCase(),
    }

    if (fornecedor?.id) {
      await atualizarFornecedor(fornecedor.id, payload)
    } else {
      await criarFornecedor(payload)
    }

    onOpenChange(false)
    await carregarFornecedores()
  }

  const formatDate = (s?: string) => {
    if (!s) return ""
    const d = new Date(s)
    d.setHours(d.getHours() - 3)
    return d.toLocaleString("pt-BR")
  }

  return (
    <>
      <ModalCidades
        isOpen={modalCidadeOpen}
        onOpenChange={(open) => setModalCidadeOpen(open)}
        onSave={async () => {
          const [cid, est] = await Promise.all([getCidades(), getEstados()])
          setCidades(cid)
          setEstados(est)
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

      <ModalFormaPagamento
        isOpen={modalFormaOpen}
        onOpenChange={setModalFormaOpen}
        onSave={async () => {
          setFormas(await getFormasPagamento())
          setReopenFormaSelector(true)
        }}
      />

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92%] max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {readOnly ? "Visualizar Fornecedor" : fornecedor?.id ? "Editar Fornecedor" : "Novo Fornecedor"}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] pr-2 grid grid-cols-4 gap-x-4 gap-y-3 text-sm">
          <div className="col-span-1 flex flex-col gap-1.5">
            <Label htmlFor="tipoPessoa">
              Tipo de Pessoa <span className="text-red-500">*</span>
            </Label>
            <select
              id="tipoPessoa"
              className="w-full border rounded px-2 py-1.5 bg-background"
              disabled={readOnly}
              value={form.tipoPessoa}
              onChange={(e) => setForm({ ...form, tipoPessoa: e.target.value as "F" | "J" })}
            >
              <option value="J">PESSOA JURÍDICA</option>
              <option value="F">PESSOA FÍSICA</option>
            </select>
          </div>

          <div className="col-span-3 flex flex-col gap-1.5">
            <Label htmlFor="nomeRazaoSocial">
              Razão Social / Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nomeRazaoSocial"
              placeholder="Digite a razão social ou nome completo"
              disabled={readOnly}
              value={form.nomeRazaoSocial}
              className={`uppercase ${errors.nomeRazaoSocial ? "border-destructive" : ""}`}
              onChange={(e) => {
                setForm({ ...form, nomeRazaoSocial: e.target.value })
                if (errors.nomeRazaoSocial) setErrors({ ...errors, nomeRazaoSocial: "" })
              }}
            />
            {errors.nomeRazaoSocial && <span className="text-xs text-red-500">{errors.nomeRazaoSocial}</span>}
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="apelidoNomeFantasia">
              Nome Fantasia / Apelido <span className="text-red-500">*</span>
            </Label>
            <Input
              id="apelidoNomeFantasia"
              placeholder="Digite o nome fantasia ou apelido"
              disabled={readOnly}
              value={form.apelidoNomeFantasia}
              className={`uppercase ${errors.apelidoNomeFantasia ? "border-destructive" : ""}`}
              onChange={(e) => {
                setForm({ ...form, apelidoNomeFantasia: e.target.value })
                if (errors.apelidoNomeFantasia) setErrors({ ...errors, apelidoNomeFantasia: "" })
              }}
            />
            {errors.apelidoNomeFantasia && <span className="text-xs text-red-500">{errors.apelidoNomeFantasia}</span>}
          </div>

          <div className="col-span-1 flex flex-col gap-1.5">
            <Label htmlFor="dataNascimentoCriacao">
              Data Nascimento/Criação <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dataNascimentoCriacao"
              type="date"
              disabled={readOnly}
              value={form.dataNascimentoCriacao}
              className={errors.dataNascimentoCriacao ? "border-destructive" : ""}
              onChange={(e) => {
                setForm({ ...form, dataNascimentoCriacao: e.target.value })
                if (errors.dataNascimentoCriacao) setErrors({ ...errors, dataNascimentoCriacao: "" })
              }}
            />
            {errors.dataNascimentoCriacao && <span className="text-xs text-red-500">{errors.dataNascimentoCriacao}</span>}
          </div>

          <div className="col-span-1 flex flex-col gap-1.5">
            <Label htmlFor="cpfCnpj">CPF / CNPJ</Label>
            <Input
              id="cpfCnpj"
              placeholder="Digite o CPF ou CNPJ"
              disabled={readOnly}
              value={form.cpfCnpj ?? ""}
              onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })}
            />
          </div>

          <div className="col-span-1 flex flex-col gap-1.5">
            <Label htmlFor="rgInscricaoEstadual">RG / Inscrição Estadual</Label>
            <Input
              id="rgInscricaoEstadual"
              placeholder="Digite o RG ou IE"
              disabled={readOnly}
              value={form.rgInscricaoEstadual ?? ""}
              className="uppercase"
              onChange={(e) => setForm({ ...form, rgInscricaoEstadual: e.target.value })}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemplo@email.com"
              disabled={readOnly}
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              placeholder="(XX) XXXXX-XXXX"
              disabled={readOnly}
              value={form.telefone ?? ""}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="rua">Rua / Logradouro</Label>
            <Input
              id="rua"
              placeholder="Ex: Rua das Flores"
              disabled={readOnly}
              value={form.rua ?? ""}
              className="uppercase"
              onChange={(e) => setForm({ ...form, rua: e.target.value })}
            />
          </div>

          <div className="col-span-1 flex flex-col gap-1.5">
            <Label htmlFor="numero">Número</Label>
            <Input
              id="numero"
              placeholder="Ex: 123"
              disabled={readOnly}
              value={form.numero ?? ""}
              onChange={(e) => setForm({ ...form, numero: e.target.value })}
            />
          </div>

          <div className="col-span-1 flex flex-col gap-1.5">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              placeholder="XXXXX-XXX"
              disabled={readOnly}
              value={form.cep ?? ""}
              onChange={(e) => setForm({ ...form, cep: e.target.value })}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="bairro">Bairro</Label>
            <Input
              id="bairro"
              placeholder="Ex: Centro"
              disabled={readOnly}
              value={form.bairro ?? ""}
              className="uppercase"
              onChange={(e) => setForm({ ...form, bairro: e.target.value })}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              placeholder="Ex: Sala 101"
              disabled={readOnly}
              value={form.complemento ?? ""}
              className="uppercase"
              onChange={(e) => setForm({ ...form, complemento: e.target.value })}
            />
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label>
              Cidade <span className="text-red-500">*</span>
            </Label>
            <Dialog open={citySelOpen} onOpenChange={setCitySelOpen}>
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

              <DialogContent className="w-[92%] max-w-6xl">
                <DialogHeader>
                  <DialogTitle>Selecionar Cidade</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2 items-center mt-8">
                  <Input
                    placeholder="Buscar cidade ou estado..."
                    className="w-full"
                    value={searchCidade}
                    onChange={(e) => setSearchCidade(e.target.value)}
                  />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-auto">
                  {cidadesFiltradas.map((cid) => (
                    <Button
                      key={cid.id}
                      variant={form.idCidade === cid.id ? "default" : "outline"}
                      className="w-full justify-start font-normal uppercase"
                      onClick={() => {
                        setForm({ ...form, idCidade: cid.id })
                        setCitySelOpen(false)
                        if (errors.idCidade) setErrors({ ...errors, idCidade: "" })
                      }}
                    >
                      {getCidadeUf(cid.id, true)}
                    </Button>
                  ))}
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    onClick={() => {
                      setReopenCitySelector(true)
                      setCitySelOpen(false)
                      setModalCidadeOpen(true)
                    }}
                  >
                    Nova Cidade
                  </Button>
                  <Button variant="outline" onClick={() => setCitySelOpen(false)}>
                    Voltar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {errors.idCidade && <span className="text-xs text-red-500">{errors.idCidade}</span>}
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label>
              Condição de Pagamento <span className="text-red-500">*</span>
            </Label>
            <Dialog open={condSelOpen} onOpenChange={setCondSelOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={readOnly}
                  className={`w-full justify-between uppercase font-normal ${errors.condicaoPagamentoId ? "border-destructive" : ""}`}
                >
                  {getNomeCondicao(form.condicaoPagamentoId)}
                  {!readOnly && <ChevronDown className="h-4 w-4" />}
                </Button>
              </DialogTrigger>

              <DialogContent className="w-[92%] max-w-6xl">
                <DialogHeader>
                  <DialogTitle>Selecionar Condição</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2 items-center mt-8">
                  <Input
                    placeholder="Buscar condição..."
                    className="w-full"
                    value={searchCond}
                    onChange={(e) => setSearchCond(e.target.value)}
                  />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-auto">
                  {condicoesFiltradas.map((c) => (
                    <Button
                      key={c.id}
                      variant={form.condicaoPagamentoId === c.id ? "default" : "outline"}
                      className="w-full justify-start font-normal uppercase"
                      onClick={() => {
                        setForm({ ...form, condicaoPagamentoId: c.id })
                        setCondSelOpen(false)
                        if (errors.condicaoPagamentoId) setErrors({ ...errors, condicaoPagamentoId: "" })
                      }}
                    >
                      {getNomeCondicao(c.id, true)}
                    </Button>
                  ))}
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    onClick={() => {
                      setReopenCondSelector(true)
                      setCondSelOpen(false)
                      setModalCondOpen(true)
                    }}
                  >
                    Nova Condição
                  </Button>
                  <Button variant="outline" onClick={() => setCondSelOpen(false)}>
                    Voltar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {errors.condicaoPagamentoId && <span className="text-xs text-red-500">{errors.condicaoPagamentoId}</span>}
          </div>

          <div className="col-span-2 flex flex-col gap-1.5">
            <Label>
              Forma de Pagamento <span className="text-red-500">*</span>
            </Label>
            <Dialog open={formaSelOpen} onOpenChange={setFormaSelOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={readOnly}
                  className={`w-full justify-between uppercase font-normal ${errors.formaPagamentoId ? "border-destructive" : ""}`}
                >
                  {getNomeForma(form.formaPagamentoId)}
                  {!readOnly && <ChevronDown className="h-4 w-4" />}
                </Button>
              </DialogTrigger>

              <DialogContent className="w-[92%] max-w-6xl">
                <DialogHeader>
                  <DialogTitle>Selecionar Forma</DialogTitle>
                </DialogHeader>

                <div className="flex gap-2 items-center mt-8">
                  <Input
                    placeholder="Buscar forma..."
                    className="w-full"
                    value={searchForma}
                    onChange={(e) => setSearchForma(e.target.value)}
                  />
                </div>

                <div className="space-y-2 max-h-[300px] overflow-auto">
                  {formasFiltradas.map((f) => (
                    <Button
                      key={f.id}
                      variant={form.formaPagamentoId === f.id ? "default" : "outline"}
                      className="w-full justify-start font-normal uppercase"
                      onClick={() => {
                        setForm({ ...form, formaPagamentoId: f.id })
                        setFormaSelOpen(false)
                        if (errors.formaPagamentoId) setErrors({ ...errors, formaPagamentoId: "" })
                      }}
                    >
                      {getNomeForma(f.id, true)}
                    </Button>
                  ))}
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    onClick={() => {
                      setReopenFormaSelector(true)
                      setFormaSelOpen(false)
                      setModalFormaOpen(true)
                    }}
                  >
                    Nova Forma
                  </Button>
                  <Button variant="outline" onClick={() => setFormaSelOpen(false)}>
                    Voltar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {errors.formaPagamentoId && <span className="text-xs text-red-500">{errors.formaPagamentoId}</span>}
          </div>
        </div>

        <DialogFooter>
          <div className="text-xs text-muted-foreground mr-auto pl-1 space-y-0.5">
            {fornecedor && (
              <>
                <div>Data Criação: {formatDate(fornecedor.dataCriacao)}</div>
                <div>Data Atualização: {formatDate(fornecedor.dataAtualizacao)}</div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            {!readOnly && (
              <Button onClick={handleSubmit}>
                {fornecedor?.id ? "Atualizar" : "Cadastrar"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}

export default ModalFornecedores
