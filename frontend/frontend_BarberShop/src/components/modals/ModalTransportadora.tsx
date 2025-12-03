import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ChevronDown, Plus, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
  Transportadora, CreateTransportadoraDto, UpdateTransportadoraDto,
  criarTransportadora, atualizarTransportadora,
} from "@/services/transportadoraService"
import { Cidade, getCidades } from "@/services/cidadeService"
import { Estado, getEstados } from "@/services/estadoService"
import { CondicaoPagamento, getCondicoesPagamento } from "@/services/condicaoPagamentoService"
import { ModalCidades } from "@/components/modals/ModalCidades"
import { ModalCondicaoPagamento } from "@/components/modals/ModalCondicaoPagamento"
import { ModalVeiculo } from "@/components/modals/ModalVeiculo"
import { getVeiculos, Veiculo } from "@/services/veiculoService"

type Props = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  carregarTransportadoras: () => void
  transportadora?: Transportadora
  readOnly?: boolean
}

export function ModalTransportadora({
  isOpen, onOpenChange, carregarTransportadoras, transportadora, readOnly=false
}: Props) {
  const [cidades, setCidades] = useState<Cidade[]>([])
  const [estados, setEstados] = useState<Estado[]>([])
  const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>([])

  const formatDate = (s?: string) => {
    if (!s) return ""
    const d = new Date(s)
    d.setHours(d.getHours() - 3)
    return d.toLocaleString("pt-BR")
  }

  // seletores auxiliares
  const [citySelectorOpen, setCitySelectorOpen] = useState(false)
  const [modalCidadeOpen, setModalCidadeOpen] = useState(false)
  const [reopenCity, setReopenCity] = useState(false)
  const [searchCidade, setSearchCidade] = useState("")

  const [condSelectorOpen, setCondSelectorOpen] = useState(false)
  const [modalCondOpen, setModalCondOpen] = useState(false)
  const [reopenCond, setReopenCond] = useState(false)
  const [searchCond, setSearchCond] = useState("")

  // Veículo selector
  const [veiculos, setVeiculos] = useState<Veiculo[]>([])
  const [veiculoSelectorOpen, setVeiculoSelectorOpen] = useState(false)
  const [modalVeiculoOpen, setModalVeiculoOpen] = useState(false)
  const [reopenVeiculo, setReopenVeiculo] = useState(false)

  const [form, setForm] = useState<CreateTransportadoraDto>({
    tipoPessoa: "J",
    razaoSocial: "",
    nomeFantasia: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cep: "",
    idCidade: null,
    cnpj: "",
    inscricaoEstadual: "",
    idCondicaoPagamento: null,
    ativo: true,
    emails: [],
    telefones: [],
    veiculoIds: [],
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (!isOpen) return
    Promise.allSettled([getCidades(), getEstados(), getCondicoesPagamento(), getVeiculos()]).then(r => {
      if (r[0].status === "fulfilled") setCidades(r[0].value)
      if (r[1].status === "fulfilled") setEstados(r[1].value)
      if (r[2].status === "fulfilled") setCondicoes(r[2].value)
      if (r[3]?.status === "fulfilled") setVeiculos(r[3].value)
    })
  }, [isOpen])

  useEffect(() => {
    if (transportadora) {
      setForm({
        tipoPessoa: transportadora.tipoPessoa,
        razaoSocial: transportadora.razaoSocial,
        nomeFantasia: transportadora.nomeFantasia ?? "",
        endereco: transportadora.endereco ?? "",
        numero: transportadora.numero ?? "",
        complemento: transportadora.complemento ?? "",
        bairro: transportadora.bairro ?? "",
        cep: transportadora.cep ?? "",
        idCidade: transportadora.idCidade ?? null,
        cnpj: transportadora.cnpj ?? "",
        inscricaoEstadual: transportadora.inscricaoEstadual ?? "",
        idCondicaoPagamento: transportadora.idCondicaoPagamento ?? null,
        ativo: transportadora.ativo,
        emails: transportadora.emails ?? [],
        telefones: transportadora.telefones ?? [],
        veiculoIds: transportadora.veiculoIds ?? [],
      })
    } else {
      setForm({
        tipoPessoa: "J",
        razaoSocial: "",
        nomeFantasia: "",
        endereco: "",
        numero: "",
        complemento: "",
        bairro: "",
        cep: "",
        idCidade: null,
        cnpj: "",
        inscricaoEstadual: "",
        idCondicaoPagamento: null,
        ativo: true,
        emails: [],
        telefones: [],
        veiculoIds: [],
      })
    }
    setErrors({})
  }, [transportadora, isOpen])

  useEffect(() => { if (!modalCidadeOpen && reopenCity) { setReopenCity(false); setCitySelectorOpen(true) } }, [modalCidadeOpen, reopenCity])
  useEffect(() => { if (!modalCondOpen && reopenCond) { setReopenCond(false); setCondSelectorOpen(true) } }, [modalCondOpen, reopenCond])
  useEffect(() => { if (!modalVeiculoOpen && reopenVeiculo) { setReopenVeiculo(false); setVeiculoSelectorOpen(true) } }, [modalVeiculoOpen, reopenVeiculo])

  const getCidadeUf = (id?: number|null, includeId = false) => {
    const cid = cidades.find(c=>c.id===id)
    const est = estados.find(e=>e.id===cid?.idEstado)
    if (!cid || !est) return "SELECIONE..."
    return includeId ? `${cid.id} - ${cid.nome.toUpperCase()} - ${est.uf}` : `${cid.nome.toUpperCase()} - ${est.uf}`
  }
  const getCondNome = (id?: number|null, includeId = false) => {
    const cond = condicoes.find(c=>c.id===id)
    if (!cond) return "SELECIONE..."
    return includeId ? `${cond.id} - ${cond.descricao.toUpperCase()}` : cond.descricao.toUpperCase()
  }

  const cidadesFiltradas = useMemo(() => {
    const t = searchCidade.toUpperCase()
    return cidades
      .filter(c=>getCidadeUf(c.id).toUpperCase().includes(t))
      .sort((a,b)=>getCidadeUf(a.id).localeCompare(getCidadeUf(b.id)))
  }, [cidades, estados, searchCidade])

  const condFiltradas = useMemo(() => {
    const t = searchCond.toUpperCase()
    return condicoes
      .filter(c=>(c.descricao||"").toUpperCase().includes(t))
      .sort((a,b)=>(a.descricao||"").localeCompare(b.descricao||""))
  }, [condicoes, searchCond])

  
  function removeAt<T>(arr:T[], i:number){ return arr.filter((_,idx)=>idx!==i) }
  function addVeiculo(id: number) {
    if (id && !form.veiculoIds.includes(id)) {
      setForm(f=>({...f, veiculoIds:[...f.veiculoIds, id]}))
    }
  }

  function validateForm(): boolean {
    const newErrors: { [key: string]: string } = {}

    if (!form.razaoSocial.trim()) {
      newErrors.razaoSocial = "Razão Social é obrigatória"
    }

    if (!form.idCidade) {
      newErrors.idCidade = "Cidade é obrigatória"
    }

    if (!form.idCondicaoPagamento) {
      newErrors.idCondicaoPagamento = "Condição de Pagamento é obrigatória"
    }

    if (!form.cnpj?.trim()) {
      newErrors.cnpj = "CPF/CNPJ é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (!validateForm()) return

    const payload: CreateTransportadoraDto | UpdateTransportadoraDto = {
      ...form,
      razaoSocial: form.razaoSocial.toUpperCase(),
      nomeFantasia: form.nomeFantasia?.toUpperCase(),
      endereco: form.endereco?.toUpperCase(),
      numero: form.numero?.toUpperCase(),
      complemento: form.complemento?.toUpperCase(),
      bairro: form.bairro?.toUpperCase(),
      inscricaoEstadual: form.inscricaoEstadual?.toUpperCase(),
      emails: (form.emails||[]).map(e=>e.toUpperCase()),
      telefones: (form.telefones||[]),
      veiculoIds: form.veiculoIds||[],
    }
    if (transportadora?.id) await atualizarTransportadora(transportadora.id, payload)
    else await criarTransportadora(payload)

    onOpenChange(false)
    await carregarTransportadoras()
  }

  return (
    <>
      <ModalCidades
        isOpen={modalCidadeOpen}
        onOpenChange={setModalCidadeOpen}
        estados={estados}
        onSave={async ()=>{ setCidades(await getCidades()); setReopenCity(true) }}
      />
      <ModalCondicaoPagamento
        isOpen={modalCondOpen}
        onOpenChange={setModalCondOpen}
        onSave={async ()=>{ setCondicoes(await getCondicoesPagamento()); setReopenCond(true) }}
      />
      <ModalVeiculo
        isOpen={modalVeiculoOpen}
        onOpenChange={setModalVeiculoOpen}
        carregarVeiculos={async ()=>{ setVeiculos(await getVeiculos()); setReopenVeiculo(true) }}
      />

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="w-[92%] max-w-6xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{transportadora?.id ? "Editar Transportadora" : "Cadastrar Transportadora"}</DialogTitle>

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

          <div className="grid grid-cols-4 gap-3 text-sm mt-8">
            <div className="col-span-1">
              <Label htmlFor="tipoPessoa">
                Tipo de Pessoa <span className="text-red-500">*</span>
              </Label>
              <select
                id="tipoPessoa"
                className="w-full border rounded px-2 py-2 bg-background"
                disabled={readOnly}
                value={form.tipoPessoa}
                onChange={e=>setForm({...form, tipoPessoa: e.target.value as "F"|"J"})}>
                <option value="J">PESSOA JURÍDICA</option>
                <option value="F">PESSOA FÍSICA</option>
              </select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="razaoSocial">
                Razão Social <span className="text-red-500">*</span>
              </Label>
              <Input
                id="razaoSocial"
                className="uppercase"
                placeholder="RAZÃO SOCIAL"
                disabled={readOnly}
                value={form.razaoSocial}
                onChange={e=>{
                  setForm({...form, razaoSocial:e.target.value})
                  if (errors.razaoSocial) {
                    setErrors({...errors, razaoSocial: ""})
                  }
                }}
              />
              {errors.razaoSocial && (
                <span className="text-xs text-red-500">{errors.razaoSocial}</span>
              )}
            </div>
            <div className="col-span-1">
              <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
              <Input
                id="nomeFantasia"
                className="uppercase"
                placeholder="NOME FANTASIA"
                disabled={readOnly}
                value={form.nomeFantasia ?? ""}
                onChange={e=>setForm({...form, nomeFantasia:e.target.value})}
              />
            </div>

            <div className="col-span-4">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                className="uppercase"
                placeholder="ENDEREÇO"
                disabled={readOnly}
                value={form.endereco ?? ""}
                onChange={e=>setForm({...form, endereco:e.target.value})}
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                className="uppercase"
                placeholder="NÚMERO"
                disabled={readOnly}
                value={form.numero ?? ""}
                onChange={e=>setForm({...form, numero:e.target.value})}
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                className="uppercase"
                placeholder="COMPLEMENTO"
                disabled={readOnly}
                value={form.complemento ?? ""}
                onChange={e=>setForm({...form, complemento:e.target.value})}
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                className="uppercase"
                placeholder="BAIRRO"
                disabled={readOnly}
                value={form.bairro ?? ""}
                onChange={e=>setForm({...form, bairro:e.target.value})}
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                placeholder="CEP"
                disabled={readOnly}
                value={form.cep ?? ""}
                onChange={e=>setForm({...form, cep:e.target.value})}
              />
            </div>

            {/* Cidade */}
            <div className="col-span-2">
              <Label htmlFor="cidade">
                Cidade <span className="text-red-500">*</span>
              </Label>
              <Dialog open={citySelectorOpen} onOpenChange={setCitySelectorOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={readOnly}
                    className="w-full justify-between uppercase font-normal">
                    {getCidadeUf(form.idCidade)}
                    {!readOnly && <ChevronDown className="h-4 w-4"/>}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl">
                  <DialogHeader>
                    <DialogTitle>Selecionar Cidade</DialogTitle>
                  </DialogHeader>
                  <div className="flex gap-2 items-center">
                    <Input placeholder="Buscar cidade..." className="w-full"
                      value={searchCidade} onChange={e=>setSearchCidade(e.target.value)}/>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                    {cidadesFiltradas.map(cid=>(
                      <Button key={cid.id}
                        type="button"
                        variant={form.idCidade===cid.id?"default":"outline"}
                        className="w-full justify-start uppercase font-normal"
                        onClick={()=>{ 
                          setForm({...form, idCidade: cid.id})
                          setCitySelectorOpen(false)
                          if (errors.idCidade) {
                            setErrors({...errors, idCidade: ""})
                          }
                        }}>
                        {getCidadeUf(cid.id, true)}
                      </Button>
                    ))}
                  </div>
                  <DialogFooter className="gap-2">
                    <Button onClick={()=>{ setCitySelectorOpen(false); setModalCidadeOpen(true); setReopenCity(true); }}>
                      Nova Cidade
                    </Button>
                    <Button variant="outline" onClick={()=>setCitySelectorOpen(false)}>
                      Voltar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {errors.idCidade && (
                <span className="text-xs text-red-500">{errors.idCidade}</span>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="condicaoPagamento">
                Condição de Pagamento <span className="text-red-500">*</span>
              </Label>
              <Dialog open={condSelectorOpen} onOpenChange={setCondSelectorOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={readOnly}
                    className="w-full justify-between uppercase font-normal">
                    {getCondNome(form.idCondicaoPagamento)}
                    {!readOnly && <ChevronDown className="h-4 w-4" />}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-5xl">
                  <DialogHeader>
                    <DialogTitle>Selecionar Condição de Pagamento</DialogTitle>
                  </DialogHeader>
                  <div className="flex gap-2 items-center">
                    <Input placeholder="Buscar condição..." className="w-full"
                      value={searchCond} onChange={e=>setSearchCond(e.target.value)}/>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-auto mt-2">
                    {condFiltradas.map(c=>(
                      <Button key={c.id}
                        type="button"
                        variant={form.idCondicaoPagamento===c.id?"default":"outline"}
                        className="w-full justify-start uppercase font-normal"
                        onClick={()=>{ 
                          setForm({...form, idCondicaoPagamento: c.id })
                          setCondSelectorOpen(false)
                          if (errors.idCondicaoPagamento) {
                            setErrors({...errors, idCondicaoPagamento: ""})
                          }
                        }}>
                        {getCondNome(c.id, true)}
                      </Button>
                    ))}
                  </div>
                  <DialogFooter className="gap-2">
                    <Button onClick={()=>{ setCondSelectorOpen(false); setModalCondOpen(true); setReopenCond(true); }}>
                      Nova Condição
                    </Button>
                    <Button variant="outline" onClick={()=>setCondSelectorOpen(false)}>
                      Voltar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {errors.idCondicaoPagamento && (
                <span className="text-xs text-red-500">{errors.idCondicaoPagamento}</span>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="veiculos">Veículos</Label>
              <Button type="button" variant="outline" className="mb-2 w-full justify-between uppercase font-normal" onClick={()=>setVeiculoSelectorOpen(true)} disabled={readOnly}>
                SELECIONE...
                {!readOnly && <ChevronDown className="h-4 w-4" />}
              </Button>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.veiculoIds.map(id=>{
                  const v = veiculos.find(v=>v.id===id)
                  return (
                    <span key={id} className="px-2 py-1 border rounded text-xs flex items-center gap-1">
                      {v ? `${v.placa} - ${v.modelo}` : `#${id}`}
                      {!readOnly && (
                        <button type="button" onClick={()=>setForm({...form, veiculoIds: form.veiculoIds.filter(x=>x!==id)})}>
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  )
                })}
              </div>
              <Dialog open={veiculoSelectorOpen} onOpenChange={setVeiculoSelectorOpen}>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Selecionar Veículo</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-[300px] overflow-auto space-y-2 mt-2">
                    {veiculos.length === 0 && <div className="text-center text-muted-foreground">Nenhum veículo cadastrado.</div>}
                    {veiculos.map(v=>(
                      <Button type="button" key={v.id} variant="outline" className="w-full justify-start uppercase font-normal" onClick={()=>{ addVeiculo(v.id); setVeiculoSelectorOpen(false) }}>
                        {v.id} - {v.placa} - {v.modelo} {v.ativo ? "" : <span className="text-red-500 ml-2">(Inativo)</span>}
                      </Button>
                    ))}
                  </div>
                  <DialogFooter className="gap-2">
                    <Button onClick={()=>{ setVeiculoSelectorOpen(false); setModalVeiculoOpen(true); setReopenVeiculo(true); }}>
                      Novo Veículo
                    </Button>
                    <Button variant="outline" onClick={()=>setVeiculoSelectorOpen(false)}>
                      Voltar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="col-span-2">
              <Label htmlFor="cnpj">
                CPF/CNPJ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cnpj"
                placeholder="CPF/CNPJ"
                disabled={readOnly}
                value={form.cnpj ?? ""}
                onChange={e=>{
                  setForm({...form, cnpj:e.target.value})
                  if (errors.cnpj) {
                    setErrors({...errors, cnpj: ""})
                  }
                }}
              />
              {errors.cnpj && (
                <span className="text-xs text-red-500">{errors.cnpj}</span>
              )}
            </div>
            <div className="col-span-2">
              <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
              <Input
                id="inscricaoEstadual"
                className="uppercase"
                placeholder="INSCRIÇÃO ESTADUAL"
                disabled={readOnly}
                value={form.inscricaoEstadual ?? ""}
                onChange={e=>setForm({...form, inscricaoEstadual:e.target.value})}
              />
            </div>

            {/* Emails */}
            <div className="col-span-2">
              <Label htmlFor="emails">E-mail(s)</Label>
              <div className="flex items-center justify-between mb-1">
                {!readOnly && <Button type="button" size="icon" variant="outline" onClick={()=>setForm(f=>({...f, emails:[...f.emails,""]}))}><Plus className="h-4 w-4"/></Button>}
              </div>
              <div className="space-y-2">
                {form.emails.map((e,idx)=>(
                  <div key={idx} className="flex gap-2">
                    <Input className="uppercase" value={e} disabled={readOnly}
                      onChange={ev=>{
                        const arr=[...form.emails]; arr[idx]=ev.target.value; setForm({...form, emails:arr})
                      }}/>
                    {!readOnly && (
                      <Button type="button" variant="outline" size="icon" onClick={()=>setForm({...form, emails: removeAt(form.emails, idx)})}><X className="h-4 w-4"/></Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Telefones */}
            <div className="col-span-2">
              <Label htmlFor="telefones">Telefone(s)</Label>
              <div className="flex items-center justify-between mb-1">
                {!readOnly && <Button type="button" size="icon" variant="outline" onClick={()=>setForm(f=>({...f, telefones:[...f.telefones,""]}))}><Plus className="h-4 w-4"/></Button>}
              </div>
              <div className="space-y-2">
                {form.telefones.map((t,idx)=>(
                  <div key={idx} className="flex gap-2">
                    <Input value={t} disabled={readOnly}
                      onChange={ev=>{
                        const arr=[...form.telefones]; arr[idx]=ev.target.value; setForm({...form, telefones:arr})
                      }}/>
                    {!readOnly && (
                      <Button type="button" variant="outline" size="icon" onClick={()=>setForm({...form, telefones: removeAt(form.telefones, idx)})}><X className="h-4 w-4"/></Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="text-xs text-muted-foreground mr-auto pl-1 space-y-0.5">
              {transportadora && (
                <>
                  <div>Data Criação: {formatDate(transportadora.dataCriacao)}</div>
                  <div>Data Atualização: {formatDate(transportadora.dataAtualizacao)}</div>
                </>
              )}
            </div>

            {!readOnly && <Button onClick={handleSubmit}>{transportadora?.id ? "Atualizar" : "Cadastrar"}</Button>}
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
