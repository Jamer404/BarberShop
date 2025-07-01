    import { useEffect, useMemo, useState } from "react"
    import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
    DialogTrigger,
    } from "@/components/ui/dialog"
    import { Button } from "@/components/ui/button"
    import { Input } from "@/components/ui/input"
    import { ChevronDown } from "lucide-react"
    import {
    Cliente,
    criarCliente,
    atualizarCliente,
    CreateClienteDto,
    UpdateClienteDto,
    } from "@/services/clienteService"
    import { Cidade, getCidades } from "@/services/cidadeService"
    import { Estado, getEstados } from "@/services/estadoService"
    import {
    CondicaoPagamento,
    getCondicoesPagamento,
    } from "@/services/condicaoPagamentoService"
    import { buildClienteSchema } from "@/schemas/clienteSchema"
    import { ModalCidades } from "./ModalCidades"
    import { ModalCondicaoPagamento } from "./ModalCondicaoPagamento"

    type Props = {
    isOpen: boolean
    onOpenChange: (o: boolean) => void
    cliente: Cliente | null
    readOnly: boolean
    onSave: () => Promise<void>
    }

    export function ModalClientes({
    isOpen,
    onOpenChange,
    cliente,
    readOnly,
    onSave,
    }: Props) {
    const [cidades, setCidades] = useState<Cidade[]>([])
    const [estados, setEstados] = useState<Estado[]>([])
    const [condicoes, setCondicoes] = useState<CondicaoPagamento[]>([])
    const [form, setForm] = useState<CreateClienteDto>({
        nome: "",
        cpfCnpj: "",
        pf: true,
        sexo: "M",
        dataNascimento: "",
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

    const getCidadeUf = (id: number) => {
        const cid = cidades.find((c) => c.id === id)
        const est = estados.find((e) => e.id === cid?.idEstado)
        return cid && est ? `${cid.nome.toUpperCase()} - ${est.uf}` : "N/A"
    }

    const getNomeCondicao = (id: number) =>
        condicoes.find((c) => c.id === id)?.descricao.toUpperCase() || "SELECIONE..."

    const cidadesFiltradas = useMemo(() => {
        const t = searchCidade.toLowerCase()
        return cidades
        .filter((c) => getCidadeUf(c.id).toLowerCase().includes(t))
        .sort((a, b) => getCidadeUf(a.id).localeCompare(getCidadeUf(b.id)))
    }, [cidades, estados, searchCidade])

    async function carregarAux() {
        try {
            console.log("Iniciando carregamento de dados auxiliares...");
            
            const results = await Promise.allSettled([
            getCidades(),
            getEstados(),
            getCondicoesPagamento(),
            ]);

            const cidadesResult = results[0];
            if (cidadesResult.status === 'fulfilled') {
            setCidades(cidadesResult.value || []); 
            console.log("Cidades carregadas com sucesso:", cidadesResult.value);
            } else {
            console.error("Erro ao carregar cidades:", cidadesResult.reason);
            setCidades([]); 
            }

            const estadosResult = results[1];
            if (estadosResult.status === 'fulfilled') {
            setEstados(estadosResult.value || []);
            console.log("Estados carregados com sucesso:", estadosResult.value);
            } else {
            console.error("Erro ao carregar estados:", estadosResult.reason);
            setEstados([]); 
            }

            const condicoesResult = results[2];
            if (condicoesResult.status === 'fulfilled') {
            setCondicoes(condicoesResult.value || []); 
            } else {
            console.error("Erro ao carregar condições de pagamento:", condicoesResult.reason);
            setCondicoes([]);
            }

        } catch (error) {
            console.error("Falha geral ao carregar dados auxiliares:", error);
            setCidades([]);
            setEstados([]);
            setCondicoes([]);
        }
        }

    async function salvar() {
        const estadoSel = estados.find(
        (e) => e.id === cidades.find((c) => c.id === form.idCidade)?.idEstado
        )
        const isBrasil = estadoSel?.idPais === 1
        const schema = buildClienteSchema(isBrasil)
        const parse = schema.safeParse(form)
        if (!parse.success) {
        setErrors(parse.error.flatten().fieldErrors)
        return
        }
        if (cliente) {
        await atualizarCliente(cliente.id, form as UpdateClienteDto)
        } else {
        await criarCliente(form as CreateClienteDto)
        }
        onOpenChange(false)
        await onSave()
    }

    useEffect(() => {
        carregarAux()
    }, [])

    useEffect(() => {
        if (cliente) {
        setForm({ ...cliente })
        } else {
        setForm({
            nome: "",
            cpfCnpj: "",
            pf: true,
            sexo: "M",
            dataNascimento: "",
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
    console.log("Cidades no estado:", cidades);
    console.log("Estados no estado:", estados);
    return (
        <>
        <ModalCidades
            isOpen={modalCidadeOpen}
            onOpenChange={setModalCidadeOpen}
            onSave={carregarAux}
            estados={estados}
        />
        <ModalCondicaoPagamento
            isOpen={modalCondOpen}
            onOpenChange={setModalCondOpen}
            condicao={null}
            onSave={async () => setCondicoes(await getCondicoesPagamento())}
        />

        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl w-full max-h-[90vh]">
            <DialogHeader>
                <DialogTitle>
                {cliente
                    ? readOnly
                    ? "VISUALIZAR CLIENTE"
                    : "EDITAR CLIENTE"
                    : "NOVO CLIENTE"}
                </DialogTitle>
            </DialogHeader>

            <div className="overflow-y-auto max-h-[70vh] pr-2 grid grid-cols-3 gap-4 py-4 text-sm">
                <div className="col-span-1 flex flex-col">
                <label>TIPO</label>
                <select
                    disabled={readOnly}
                    className={`w-full border rounded px-2 py-1 ${errors.pf ? "border-destructive" : ""
                    }`}
                    value={form.pf ? "pf" : "pj"}
                    onChange={(e) =>
                    setForm({ ...form, pf: e.target.value === "pf" })
                    }
                >
                    <option value="pf">PESSOA FÍSICA</option>
                    <option value="pj">PESSOA JURÍDICA</option>
                </select>
                </div>
                <div className="col-span-1 flex flex-col">
                <label>SEXO</label>
                <select
                    disabled={readOnly}
                    className={`w-full border rounded px-2 py-1 ${errors.sexo ? "border-destructive" : ""
                    }`}
                    value={form.sexo}
                    onChange={(e) =>
                    setForm({ ...form, sexo: e.target.value as "M" | "F" })
                    }
                >
                    <option value="M">MASCULINO</option>
                    <option value="F">FEMININO</option>
                </select>
                </div>
                <div className="col-span-1 flex flex-col">
                <label>DATA DE NASCIMENTO</label>
                <Input
                    type="date"
                    disabled={readOnly}
                    value={form.dataNascimento}
                    className={errors.dataNascimento ? "border-destructive" : ""}
                    onChange={(e) =>
                    setForm({ ...form, dataNascimento: e.target.value })
                    }
                />
                </div>
                <div className="col-span-3 flex flex-col">
                <label>NOME / RAZÃO SOCIAL</label>
                <Input
                    disabled={readOnly}
                    value={form.nome}
                    className={errors.nome ? "border-destructive" : ""}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
                </div>
                <div className="col-span-1 flex flex-col">
                <label>CPF/CNPJ</label>
                <Input
                    disabled={readOnly}
                    value={form.cpfCnpj}
                    className={errors.cpfCnpj ? "border-destructive" : ""}
                    onChange={(e) =>
                    setForm({ ...form, cpfCnpj: e.target.value })
                    }
                />
                </div>
                <div className="col-span-1 flex flex-col">
                <label>TELEFONE</label>
                <Input
                    disabled={readOnly}
                    value={form.telefone ?? ""}
                    className={errors.telefone ? "border-destructive" : ""}
                    onChange={(e) =>
                    setForm({ ...form, telefone: e.target.value })
                    }
                />
                </div>
                <div className="col-span-1 flex flex-col">
                <label>EMAIL</label>
                <Input
                    disabled={readOnly}
                    value={form.email ?? ""}
                    className={errors.email ? "border-destructive" : ""}
                    onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                    }
                />
                </div>
                <div className="col-span-2 flex flex-col">
                <label>RUA</label>
                <Input
                    disabled={readOnly}
                    value={form.rua ?? ""}
                    className={errors.rua ? "border-destructive" : ""}
                    onChange={(e) => setForm({ ...form, rua: e.target.value })}
                />
                </div>
                <div className="col-span-1 flex flex-col">
                <label>NÚMERO</label>
                <Input
                    disabled={readOnly}
                    value={form.numero ?? ""}
                    className={errors.numero ? "border-destructive" : ""}
                    onChange={(e) =>
                    setForm({ ...form, numero: e.target.value })
                    }
                />
                </div>
                <div className="col-span-1 flex flex-col">
                <label>COMPLEMENTO</label>
                <Input
                    disabled={readOnly}
                    value={form.complemento ?? ""}
                    className={errors.complemento ? "border-destructive" : ""}
                    onChange={(e) =>
                    setForm({ ...form, complemento: e.target.value })
                    }
                />
                </div>
                <div className="col-span-1 flex flex-col">
                <label>BAIRRO</label>
                <Input
                    disabled={readOnly}
                    value={form.bairro ?? ""}
                    className={errors.bairro ? "border-destructive" : ""}
                    onChange={(e) =>
                    setForm({ ...form, bairro: e.target.value })
                    }
                />
                </div>
                <div className="col-span-1 flex flex-col">
                <label>CEP</label>
                <Input
                    disabled={readOnly}
                    value={form.cep ?? ""}
                    className={errors.cep ? "border-destructive" : ""}
                    onChange={(e) => setForm({ ...form, cep: e.target.value })}
                />
                </div>
                <div className="col-span-1 flex flex-col">
                <label>CIDADE</label>
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
                        <DialogTitle>SELECIONAR CIDADE</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center gap-2 pb-2">
                        <Input
                        placeholder="BUSCAR..."
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
                            onDoubleClick={() => {
                            setForm({ ...form, idCidade: cid.id })
                            setCitySelectorOpen(false)
                            }}
                        >
                            {getCidadeUf(cid.id)}
                        </Button>
                        ))}
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => { setCitySelectorOpen(false); setModalCidadeOpen(true) }}>CADASTRAR NOVA CIDADE</Button>
                        <Button variant="outline" onClick={() => setCitySelectorOpen(false)}>VOLTAR</Button>
                    </div>
                    </DialogContent>
                </Dialog>
                </div>
                <div className="col-span-1 flex flex-col">
                <label>CONDIÇÃO DE PAGAMENTO</label>
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
                        <DialogTitle>SELECIONAR CONDIÇÃO</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 max-h-[300px] overflow-auto">
                        {condicoes.map((c) => (
                        <Button
                            key={c.id}
                            variant={form.idCondicaoPagamento === c.id ? "default" : "outline"}
                            className="w-full justify-start font-normal uppercase"
                            onDoubleClick={() => {
                            setForm({ ...form, idCondicaoPagamento: c.id })
                            setCondSelectorOpen(false)
                            }}
                        >
                            {c.descricao.toUpperCase()}
                        </Button>
                        ))}
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => { setCondSelectorOpen(false); setModalCondOpen(true) }}>CADASTRAR NOVA CONDIÇÃO</Button>
                        <Button variant="outline" onClick={() => setCondSelectorOpen(false)}>VOLTAR</Button>
                    </div>
                    </DialogContent>
                </Dialog>
                </div>
                <div className="col-span-1 flex flex-col">
                <label>LIMITE DE CRÉDITO</label>
                <Input
                    type="number"
                    disabled={readOnly}
                    value={form.limiteCredito}
                    className={errors.limiteCredito ? "border-destructive" : ""}
                    onChange={(e) => setForm({ ...form, limiteCredito: Number(e.target.value) })}
                />
                </div>
                <div className="col-span-1 flex flex-col justify-center">
                <label>SITUAÇÃO</label>
                <select
                    disabled={readOnly}
                    className="w-full border rounded px-2 py-1"
                    value={form.ativo ? "habilitado" : "desabilitado"}
                    onChange={(e) => setForm({ ...form, ativo: e.target.value === "habilitado" })}
                >
                    <option value="habilitado">HABILITADO</option>
                    <option value="desabilitado">DESABILITADO</option>
                </select>
                </div>
            </div>

            <DialogFooter>
                {!readOnly && <Button onClick={salvar}>{cliente ? "ATUALIZAR" : "SALVAR"}</Button>}
                <DialogClose asChild>
                <Button variant="outline">FECHAR</Button>
                </DialogClose>
            </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    )
    }