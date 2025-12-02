import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ChevronDown } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import {
  Funcionario, CreateFuncionarioDto, UpdateFuncionarioDto,
  criarFuncionario, atualizarFuncionario,
} from "@/services/funcionarioService"
import { Cidade, getCidades } from "@/services/cidadeService"
import { Estado, getEstados } from "@/services/estadoService"
import { ModalCidades } from "@/components/modals/ModalCidades"

import { ModalCargo } from "@/components/modals/ModalCargo"
import { getCargos, Cargo } from "@/services/cargoService"
import { toast } from "react-toastify"

type Props = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  carregarFuncionarios: () => void
  funcionario?: Funcionario
  readOnly?: boolean
}

export function ModalFuncionario({
  isOpen, onOpenChange, carregarFuncionarios, funcionario, readOnly = false,
}: Props) {
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [cargos, setCargos] = useState<Cargo[]>([])

  // seletor Cidade + reabertura
  const [citySelectorOpen, setCitySelectorOpen] = useState(false)
  const [modalCidadeOpen, setModalCidadeOpen] = useState(false)
  const [reopenCitySelector, setReopenCitySelector] = useState(false)
  const [searchCidade, setSearchCidade] = useState("")

  // seletor Cargo + reabertura
  const [cargoSelectorOpen, setCargoSelectorOpen] = useState(false)
  const [modalCargoOpen, setModalCargoOpen] = useState(false)
  const [reopenCargoSelector, setReopenCargoSelector] = useState(false)
  const [searchCargo, setSearchCargo] = useState("")

  const todayISO = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState<CreateFuncionarioDto>({
    nome: "",
    sexo: "M",
    endereco: null,
    numero: null,
    complemento: null,
    bairro: null,
    cep: null,
    idCidade: null,
    cpf: null,
    rg: null,
    dataNascimento: null,
    dataAdmissao: todayISO,
    dataDemissao: null,
    idCargo: null,
    cargaHoraria: null,
    salario: null,
    email: null,
    telefone: null,
    ativo: true,
  })

  const [errors, setErrors] = useState<{
    nome?: string
    cpf?: string
    dataNascimento?: string
    dataAdmissao?: string
    idCargo?: string
    salario?: string
    email?: string
    telefone?: string
  }>({})

  const formatDate = (s?: string | null) => {
    if (!s) return ""
    const d = new Date(s)
    d.setHours(d.getHours() - 3)
    return d.toLocaleString("pt-BR")
  }

  // carregar auxiliares ao abrir
  useEffect(() => {
    if (!isOpen) return
    Promise.allSettled([getCidades(), getEstados(), getCargos()]).then((r) => {
      if (r[0].status === "fulfilled") setCidades(r[0].value || [])
      if (r[1].status === "fulfilled") setEstados(r[1].value || [])
      if (r[2].status === "fulfilled") setCargos(r[2].value || [])
    })
  }, [isOpen])

  // reabrir seletores após fechar modais
  useEffect(() => { if (!modalCidadeOpen && reopenCitySelector) { setReopenCitySelector(false); setCitySelectorOpen(true) } }, [modalCidadeOpen, reopenCitySelector])
  useEffect(() => { if (!modalCargoOpen && reopenCargoSelector) { setReopenCargoSelector(false); setCargoSelectorOpen(true) } }, [modalCargoOpen, reopenCargoSelector])

  // preencher/limpar form conforme edição
  useEffect(() => {
    if (funcionario) {
      setForm({
        nome: funcionario.nome ?? "",
        sexo: (funcionario.sexo as "M" | "F") ?? "M",
        endereco: funcionario.endereco ?? null,
        numero: funcionario.numero ?? null,
        complemento: funcionario.complemento ?? null,
        bairro: funcionario.bairro ?? null,
        cep: funcionario.cep ?? null,
        idCidade: funcionario.idCidade ?? null,
        cpf: funcionario.cpf ?? null,
        rg: funcionario.rg ?? null,
        dataNascimento: funcionario.dataNascimento ?? null,
        dataAdmissao: funcionario.dataAdmissao,       // já vem ISO (yyyy-MM-dd)
        dataDemissao: funcionario.dataDemissao ?? null,
        idCargo: funcionario.idCargo ?? null,
        cargaHoraria: funcionario.cargaHoraria ?? null,
        salario: funcionario.salario ?? null,
        email: funcionario.email ?? null,
        telefone: funcionario.telefone ?? null,
        ativo: funcionario.ativo,
      })
    } else {
      setForm({
        nome: "",
        sexo: "M",
        endereco: null,
        numero: null,
        complemento: null,
        bairro: null,
        cep: null,
        idCidade: null,
        cpf: null,
        rg: null,
        dataNascimento: null,
        dataAdmissao: todayISO,
        dataDemissao: null,
        idCargo: null,
        cargaHoraria: null,
        salario: null,
        email: null,
        telefone: null,
        ativo: true,
      })
    }
    setErrors({})
  }, [funcionario, isOpen])

  const getCidadeUf = (id?: number | null, includeId = false) => {
    const cid = cidades.find((c) => c.id === id)
    const est = estados.find((e) => e.id === cid?.idEstado)
    if (!cid || !est) return "SELECIONE..."
    return includeId ? `${cid.id} - ${cid.nome.toUpperCase()} - ${est.uf}` : `${cid.nome.toUpperCase()} - ${est.uf}`
  }

  const cidadesFiltradas = useMemo(() => {
    const t = searchCidade.toUpperCase()
    return cidades
      .filter((c) => {
        const searchText = `${c.id} ${getCidadeUf(c.id, true)}`.toUpperCase()
        return searchText.includes(t)
      })
      .sort((a, b) => getCidadeUf(a.id).localeCompare(getCidadeUf(b.id)))
  }, [cidades, estados, searchCidade])

  const cargosFiltrados = useMemo(() => {
    const t = searchCargo.toUpperCase()
    return cargos
      .filter((c) => (c.nome || "").toUpperCase().includes(t))
      .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""))
  }, [cargos, searchCargo])

  async function handleSubmit() {
    const newErrors: {
      nome?: string
      cpf?: string
      dataNascimento?: string
      dataAdmissao?: string
      idCargo?: string
      salario?: string
      email?: string
      telefone?: string
    } = {}

    if (!form.nome.trim()) {
      newErrors.nome = "Nome do funcionário é obrigatório"
    }
    if (!form.cpf || form.cpf.trim() === "") {
      newErrors.cpf = "CPF é obrigatório"
    }
    if (!form.dataNascimento) {
      newErrors.dataNascimento = "Data de nascimento é obrigatória"
    }
    if (!form.dataAdmissao) {
      newErrors.dataAdmissao = "Data de admissão é obrigatória"
    }
    if (!form.idCargo) {
      newErrors.idCargo = "Cargo é obrigatório"
    }
    if (!form.salario || form.salario <= 0) {
      newErrors.salario = "Salário deve ser maior que zero"
    }
    if (!form.email || form.email.trim() === "") {
      newErrors.email = "E-mail é obrigatório"
    }
    if (!form.telefone || form.telefone.trim() === "") {
      newErrors.telefone = "Telefone é obrigatório"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    setErrors({})

    if (form.sexo !== "M" && form.sexo !== "F") { toast.warn("Sexo inválido."); return }

    // Normalizações leves
    const payload: CreateFuncionarioDto | UpdateFuncionarioDto = {
      ...form,
      nome: form.nome.toUpperCase(),                 // padrão do seu projeto
      endereco: toUpperOrNull(form.endereco),
      numero: toUpperOrNull(form.numero),
      complemento: toUpperOrNull(form.complemento),
      bairro: toUpperOrNull(form.bairro),
      rg: toUpperOrNull(form.rg),
      cargaHoraria: toUpperOrNull(form.cargaHoraria),
      // email não upper-case
      cpf: normalizeEmptyToNull(form.cpf),
      cep: normalizeEmptyToNull(form.cep),
      telefone: normalizeEmptyToNull(form.telefone),
      idCidade: form.idCidade ?? null,
      idCargo: form.idCargo ?? null,
      salario: form.salario ?? null,
      dataNascimento: normalizeEmptyToNull(form.dataNascimento),
      dataDemissao: normalizeEmptyToNull(form.dataDemissao),
    }

    if (funcionario?.id) await atualizarFuncionario(funcionario.id, payload)
    else await criarFuncionario(payload)

    onOpenChange(false)
    await carregarFuncionarios()
  }

  function toUpperOrNull(v?: string | null) {
    if (v === undefined || v === null || v.trim() === "") return null
    return v.toUpperCase()
  }
  function normalizeEmptyToNull(v?: string | null) {
    if (v === undefined || v === null || v === "") return null
    return v
  }

  return (
    <>
      <ModalCidades
        isOpen={modalCidadeOpen}
        onOpenChange={setModalCidadeOpen}
        estados={estados}
        onSave={async () => {
          setCidades(await getCidades())
          setReopenCitySelector(true)
        }}
      />

      <ModalCargo
        isOpen={modalCargoOpen}
        onOpenChange={setModalCargoOpen}
        carregarCargos={async () => {
          setCargos(await getCargos())
          setReopenCargoSelector(true)
        }}
      />

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="w-[92%] max-w-6xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {readOnly ? "Visualizar Funcionário" : funcionario?.id ? "Editar Funcionário" : "Cadastrar Funcionário"}
              </DialogTitle>

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

          <div className="grid grid-cols-4 gap-3 text-sm">
            <div className="col-span-3 space-y-1.5">
              <Label className="uppercase font-medium">Nome do Funcionário <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Nome do Funcionário"
                className="uppercase"
                disabled={readOnly}
                value={form.nome}
                onChange={(e) => {
                  setForm({ ...form, nome: e.target.value })
                  setErrors((err) => ({ ...err, nome: undefined }))
                }}
              />
              {errors.nome && <span className="text-xs text-red-500">{errors.nome}</span>}
            </div>

            <div className="col-span-1 space-y-1.5">
              <Label className="uppercase font-medium">Sexo <span className="text-red-500">*</span></Label>
              <select
                className="border rounded px-2 py-2 bg-background w-full h-10"
                disabled={readOnly}
                value={form.sexo}
                onChange={(e) => setForm({ ...form, sexo: e.target.value as "M" | "F" })}
              >
                <option value="M">MASCULINO</option>
                <option value="F">FEMININO</option>
              </select>
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="uppercase font-medium">Endereço</Label>
              <Input className="uppercase" placeholder="Endereço" disabled={readOnly}
                value={form.endereco ?? ""} onChange={(e)=>setForm({...form, endereco:e.target.value})}/>
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label className="uppercase font-medium">Número</Label>
              <Input className="uppercase" placeholder="Número" disabled={readOnly}
                value={form.numero ?? ""} onChange={(e)=>setForm({...form, numero:e.target.value})}/>
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label className="uppercase font-medium">Complemento</Label>
              <Input className="uppercase" placeholder="Complemento" disabled={readOnly}
                value={form.complemento ?? ""} onChange={(e)=>setForm({...form, complemento:e.target.value})}/>
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label className="uppercase font-medium">Bairro</Label>
              <Input className="uppercase" placeholder="Bairro" disabled={readOnly}
                value={form.bairro ?? ""} onChange={(e)=>setForm({...form, bairro:e.target.value})}/>
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label className="uppercase font-medium">CEP</Label>
              <Input placeholder="CEP" disabled={readOnly}
                value={form.cep ?? ""} onChange={(e)=>setForm({...form, cep:e.target.value})}/>
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label className="uppercase font-medium">Cidade</Label>
              <Dialog open={citySelectorOpen} onOpenChange={setCitySelectorOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={readOnly}
                    className="w-full justify-between uppercase font-normal"
                  >
                    {getCidadeUf(form.idCidade ?? null)}
                    {!readOnly && <ChevronDown className="h-4 w-4" />}
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[92%] max-w-6xl">
                  <div className="flex gap-2 items-center mt-8">
                    <Input
                      placeholder="Buscar cidade..."
                      className="w-full"
                      value={searchCidade}
                      onChange={(e) => setSearchCidade(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                    {cidadesFiltradas.map((cid) => (
                      <Button
                        key={cid.id}
                        variant={form.idCidade === cid.id ? "default" : "outline"}
                        className="w-full justify-start uppercase font-normal"
                        onClick={() => {
                          setForm({ ...form, idCidade: cid.id })
                          setCitySelectorOpen(false)
                        }}
                      >
                        {getCidadeUf(cid.id, true)}
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setCitySelectorOpen(false)
                        setModalCidadeOpen(true)
                        setReopenCitySelector(true)
                      }}
                    >
                      Nova Cidade
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCitySelectorOpen(false)}
                    >
                      Voltar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="col-span-1 space-y-1.5">
              <Label className="uppercase font-medium">CPF <span className="text-red-500">*</span></Label>
              <Input placeholder="CPF" disabled={readOnly}
                value={form.cpf ?? ""} onChange={(e)=>{
                  setForm({...form, cpf:e.target.value})
                  setErrors((err) => ({ ...err, cpf: undefined }))
                }}/>
              {errors.cpf && <span className="text-xs text-red-500">{errors.cpf}</span>}
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label className="uppercase font-medium">RG</Label>
              <Input className="uppercase" placeholder="RG" disabled={readOnly}
                value={form.rg ?? ""} onChange={(e)=>setForm({...form, rg:e.target.value})}/>
            </div>

            <div className="col-span-1 space-y-1.5">
              <Label className="uppercase font-medium">Data Nascimento <span className="text-red-500">*</span></Label>
              <Input type="date" placeholder="Nascimento" disabled={readOnly}
                value={form.dataNascimento ?? ""} onChange={(e)=>{
                  setForm({...form, dataNascimento:e.target.value || null})
                  setErrors((err) => ({ ...err, dataNascimento: undefined }))
                }}/>
              {errors.dataNascimento && <span className="text-xs text-red-500">{errors.dataNascimento}</span>}
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label className="uppercase font-medium">Data Admissão <span className="text-red-500">*</span></Label>
              <Input type="date" placeholder="Admissão" disabled={readOnly}
                value={form.dataAdmissao} onChange={(e)=>{
                  setForm({...form, dataAdmissao:e.target.value})
                  setErrors((err) => ({ ...err, dataAdmissao: undefined }))
                }}/>
              {errors.dataAdmissao && <span className="text-xs text-red-500">{errors.dataAdmissao}</span>}
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label className="uppercase font-medium">Data Demissão</Label>
              <Input type="date" placeholder="Demissão" disabled={readOnly}
                value={form.dataDemissao ?? ""} onChange={(e)=>setForm({...form, dataDemissao:e.target.value || null})}/>
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label className="uppercase font-medium">Cargo <span className="text-red-500">*</span></Label>
              <Dialog open={cargoSelectorOpen} onOpenChange={setCargoSelectorOpen}>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={readOnly}
                    className="w-full justify-between uppercase font-normal"
                  >
                    {form.idCargo ? (cargos.find(c => c.id === form.idCargo)?.nome ?? "SELECIONE...") : "SELECIONE..."}
                    {!readOnly && <ChevronDown className="h-4 w-4" />}
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[92%] max-w-6xl">
                  <div className="flex gap-2 items-center mt-8">
                    <Input
                      placeholder="Buscar cargo..."
                      className="w-full"
                      value={searchCargo}
                      onChange={(e) => setSearchCargo(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                    {cargosFiltrados.map((cargo) => (
                      <Button
                        type="button"
                        key={cargo.id}
                        variant={form.idCargo === cargo.id ? "default" : "outline"}
                        className="w-full justify-start uppercase font-normal"
                        onClick={() => {
                          setForm({
                            ...form,
                            idCargo: cargo.id,
                            salario: cargo.salarioBase ?? form.salario ?? null,
                          })
                          setCargoSelectorOpen(false)
                          setErrors((err) => ({ ...err, idCargo: undefined }))
                        }}
                      >
                        {cargo.id} - {cargo.nome}
                      </Button>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      type="button"
                      onClick={() => {
                        setCargoSelectorOpen(false)
                        setModalCargoOpen(true)
                        setReopenCargoSelector(true)
                      }}
                    >
                      Novo Cargo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCargoSelectorOpen(false)}
                    >
                      Voltar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              {errors.idCargo && <span className="text-xs text-red-500">{errors.idCargo}</span>}
            </div>

            <div className="col-span-1 space-y-1.5">
              <Label className="uppercase font-medium">Carga Horária</Label>
              <Input className="uppercase" placeholder="Carga Horária" disabled={readOnly}
                value={form.cargaHoraria ?? ""} onChange={(e)=>setForm({...form, cargaHoraria:e.target.value})}/>
            </div>
            <div className="col-span-1 space-y-1.5">
              <Label className="uppercase font-medium">Salário <span className="text-red-500">*</span></Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  R$
                </span>
                <Input className="pl-8 text-right" type="number" step="0.01" placeholder="Salário" disabled={readOnly}
                  value={form.salario ?? ""} onChange={(e)=>{
                    setForm({...form, salario: e.target.value ? Number(e.target.value) : null})
                    setErrors((err) => ({ ...err, salario: undefined }))
                  }}/>
              </div>
              {errors.salario && <span className="text-xs text-red-500">{errors.salario}</span>}
            </div>

            <div className="col-span-2 space-y-1.5">
              <Label className="uppercase font-medium">E-mail <span className="text-red-500">*</span></Label>
              <Input placeholder="E-mail" disabled={readOnly}
                value={form.email ?? ""} onChange={(e)=>{
                  setForm({...form, email:e.target.value || null})
                  setErrors((err) => ({ ...err, email: undefined }))
                }}/>
              {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label className="uppercase font-medium">Telefone <span className="text-red-500">*</span></Label>
              <Input placeholder="Telefone" disabled={readOnly}
                value={form.telefone ?? ""} onChange={(e)=>{
                  setForm({...form, telefone:e.target.value || null})
                  setErrors((err) => ({ ...err, telefone: undefined }))
                }}/>
              {errors.telefone && <span className="text-xs text-red-500">{errors.telefone}</span>}
            </div>
          </div>

          <DialogFooter>
            <div className="text-xs text-muted-foreground mr-auto pl-1 space-y-0.5">
              {funcionario && (
                <>
                  <div>Data Criação: {formatDate(funcionario.dataCriacao)}</div>
                  <div>Data Atualização: {formatDate(funcionario.dataAtualizacao)}</div>
                </>
              )}
            </div>

            {!readOnly && (
              <Button onClick={handleSubmit}>
                {funcionario?.id ? "Atualizar" : "Salvar"}
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
