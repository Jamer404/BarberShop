import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  }, [funcionario, isOpen])

  const getCidadeUf = (id?: number | null) => {
    const cid = cidades.find((c) => c.id === id)
    const est = estados.find((e) => e.id === cid?.idEstado)
    return cid && est ? `${cid.nome.toUpperCase()} - ${est.uf}` : "SELECIONE..."
  }

  const cidadesFiltradas = useMemo(() => {
    const t = searchCidade.toUpperCase()
    return cidades
      .filter((c) => getCidadeUf(c.id).toUpperCase().includes(t))
      .sort((a, b) => getCidadeUf(a.id).localeCompare(getCidadeUf(b.id)))
  }, [cidades, estados, searchCidade])

  const cargosFiltrados = useMemo(() => {
    const t = searchCargo.toUpperCase()
    return cargos
      .filter((c) => (c.nome || "").toUpperCase().includes(t))
      .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""))
  }, [cargos, searchCargo])

  async function handleSubmit() {
    if (!form.nome.trim()) { toast.warn("Informe o nome do funcionário."); return }
    if (!form.dataAdmissao) { toast.warn("Informe a data de admissão."); return }
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
            <Input
              placeholder="Funcionário*"
              className="col-span-3 uppercase"
              disabled={readOnly}
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />

            <select
              className="col-span-1 border rounded px-2 py-2 bg-background"
              disabled={readOnly}
              value={form.sexo}
              onChange={(e) => setForm({ ...form, sexo: e.target.value as "M" | "F" })}
            >
              <option value="M">MASCULINO</option>
              <option value="F">FEMININO</option>
            </select>

            <Input className="col-span-2 uppercase" placeholder="Endereço" disabled={readOnly}
              value={form.endereco ?? ""} onChange={(e)=>setForm({...form, endereco:e.target.value})}/>
            <Input className="col-span-1 uppercase" placeholder="Número" disabled={readOnly}
              value={form.numero ?? ""} onChange={(e)=>setForm({...form, numero:e.target.value})}/>
            <Input className="col-span-1 uppercase" placeholder="Complemento" disabled={readOnly}
              value={form.complemento ?? ""} onChange={(e)=>setForm({...form, complemento:e.target.value})}/>
            <Input className="col-span-1 uppercase" placeholder="Bairro" disabled={readOnly}
              value={form.bairro ?? ""} onChange={(e)=>setForm({...form, bairro:e.target.value})}/>
            <Input className="col-span-1" placeholder="CEP" disabled={readOnly}
              value={form.cep ?? ""} onChange={(e)=>setForm({...form, cep:e.target.value})}/>

            <div className="col-span-2 flex flex-col gap-1.5">
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
                <DialogContent className="max-w-4xl">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Buscar cidade..."
                      className="w-full"
                      value={searchCidade}
                      onChange={(e) => setSearchCidade(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        setCitySelectorOpen(false)
                        setModalCidadeOpen(true)
                        setReopenCitySelector(true)
                      }}
                    >
                      Nova Cidade
                    </Button>
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
                        {getCidadeUf(cid.id)}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Input className="col-span-1" placeholder="CPF" disabled={readOnly}
              value={form.cpf ?? ""} onChange={(e)=>setForm({...form, cpf:e.target.value})}/>
            <Input className="col-span-1 uppercase" placeholder="RG" disabled={readOnly}
              value={form.rg ?? ""} onChange={(e)=>setForm({...form, rg:e.target.value})}/>

            <Input className="col-span-1" type="date" placeholder="Nascimento" disabled={readOnly}
              value={form.dataNascimento ?? ""} onChange={(e)=>setForm({...form, dataNascimento:e.target.value || null})}/>
            <Input className="col-span-1" type="date" placeholder="Admissão*" disabled={readOnly}
              value={form.dataAdmissao} onChange={(e)=>setForm({...form, dataAdmissao:e.target.value})}/>
            <Input className="col-span-1" type="date" placeholder="Demissão" disabled={readOnly}
              value={form.dataDemissao ?? ""} onChange={(e)=>setForm({...form, dataDemissao:e.target.value || null})}/>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Dialog open={cargoSelectorOpen} onOpenChange={setCargoSelectorOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={readOnly}
                    className="w-full justify-between uppercase font-normal"
                  >
                    {form.idCargo ? (cargos.find(c => c.id === form.idCargo)?.nome ?? "SELECIONE...") : "SELECIONE..."}
                    {!readOnly && <ChevronDown className="h-4 w-4" />}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Buscar cargo..."
                      className="w-full"
                      value={searchCargo}
                      onChange={(e) => setSearchCargo(e.target.value)}
                    />
                    <Button
                      onClick={() => {
                        setCargoSelectorOpen(false)
                        setModalCargoOpen(true)
                        setReopenCargoSelector(true)
                      }}
                    >
                      Novo Cargo
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                    {cargosFiltrados.map((cargo) => (
                      <Button
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
                        }}
                      >
                        {cargo.nome}
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Input className="col-span-1 uppercase" placeholder="Carga Horária" disabled={readOnly}
              value={form.cargaHoraria ?? ""} onChange={(e)=>setForm({...form, cargaHoraria:e.target.value})}/>
            <Input className="col-span-1" type="number" step="0.01" placeholder="Salário (R$)" disabled={readOnly}
              value={form.salario ?? ""} onChange={(e)=>setForm({...form, salario: e.target.value ? Number(e.target.value) : null})}/>

            <Input className="col-span-2" placeholder="E-mail" disabled={readOnly}
              value={form.email ?? ""} onChange={(e)=>setForm({...form, email:e.target.value || null})}/>
            <Input className="col-span-2" placeholder="Telefone" disabled={readOnly}
              value={form.telefone ?? ""} onChange={(e)=>setForm({...form, telefone:e.target.value || null})}/>
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
