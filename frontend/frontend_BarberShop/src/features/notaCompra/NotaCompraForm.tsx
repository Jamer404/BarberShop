
import { useState } from "react";
import { Produto } from "@/services/produtoService";
import { useRateioProdutos } from "@/hooks/useRateioProdutos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type NotaSave = {
  numero: string;
  fornecedor: string;
  dataEmissao: string;
  total: number;
}

export default function NotaCompraForm({ onSave }: { onSave?: (nota: NotaSave) => void }) {

  const [numero, setNumero] = useState("");
  const [modelo, setModelo] = useState("");
  const [serie, setSerie] = useState("");
  const [codFornecedor, setCodFornecedor] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [dataEmissao, setDataEmissao] = useState("");
  const [dataChegada, setDataChegada] = useState("");

  const [codProduto, setCodProduto] = useState("");
  const [produto, setProduto] = useState("");
  const [unidade, setUnidade] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [preco, setPreco] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedProduto, setSelectedProduto] = useState<number | null>(null);

  const [valorFrete, setValorFrete] = useState(0);
  const [valorSeguro, setValorSeguro] = useState(0);
  const [outrasDespesas, setOutrasDespesas] = useState(0);

  const [codCondPagto, setCodCondPagto] = useState("");
  const [condicaoPagamento, setCondicaoPagamento] = useState("");
  const [parcelas, setParcelas] = useState<any[]>([]);

  const [tipoFrete, setTipoFrete] = useState("CIF");
  const [observacao, setObservacao] = useState("");

  const produtosComRateio = useRateioProdutos(produtos, valorFrete, valorSeguro, outrasDespesas);

  function adicionarProduto() {
    if (!codProduto || !produto || !quantidade || !preco) return;
    const precoTotal = quantidade * preco - desconto;
    setProdutos(prev => [
      ...prev,
      {
        id: prev.length + 1,
        codigo: codProduto,
        nome: produto,
        unidade,
        quantidade,
        precoUN: preco,
        desconto,
        liquidoUN: preco - desconto,
        precoTotal,
        rateio: 0,
        custoFinalUN: 0,
        custoFinal: 0,
        precoVenda: 0,
        ativo: true,
        modeloId: 0,
        modeloNome: "",
        marca: "",
        fornecedorId: 0,
        fornecedorNome: "",
        saldo: 0,
        custoMedio: 0,
        precoUltCompra: 0,
        dataUltCompra: "",
        observacao: "",
        dataCriacao: new Date().toISOString(),
        dataAtualizacao: new Date().toISOString(),
      },
    ]);
    setCodProduto(""); setProduto(""); setUnidade(""); setQuantidade(1); setPreco(0); setDesconto(0);
  }

  function excluirProduto() {
    if (selectedProduto == null) return;
    setProdutos(produtos.filter((_, idx) => idx !== selectedProduto));
    setSelectedProduto(null);
  }

  function adicionarParcela() {
    setParcelas(prev => [
      ...prev,
      {
        parcela: prev.length + 1,
        codFormaPagto: 1,
        formaPagamento: "DINHEIRO",
        dataVencimento: "2025-10-20",
        valorParcela: 100,
      },
    ]);
  }

  const totalProdutos = produtosComRateio.reduce((acc, p) => acc + (p.precoTotal || 0), 0);
  const totalPagar = produtosComRateio.reduce((acc, p) => acc + (p.custoFinal || 0), 0);

  return (
    <div className="p-6 bg-white">
      <h3 className="text-lg font-semibold mb-4">Cadastro Nota de Compra</h3>

      <div className="grid grid-cols-12 gap-3 mb-3">
        <div className="col-span-12 sm:col-span-2 md:col-span-1">
          <label className="block text-sm font-medium mb-1">Modelo</label>
          <Input placeholder="Modelo" value={modelo} onChange={e => setModelo(e.target.value)} />
        </div>
        <div className="col-span-12 sm:col-span-2 md:col-span-1">
          <label className="block text-sm font-medium mb-1">Série</label>
          <Input placeholder="Série" value={serie} onChange={e => setSerie(e.target.value)} />
        </div>
        <div className="col-span-12 sm:col-span-12 md:col-span-4">
          <label className="block text-sm font-medium mb-1">Número *</label>
          <Input placeholder="Número" value={numero} onChange={e => setNumero(e.target.value)} />
        </div>
        <div className="col-span-12 sm:col-span-3 md:col-span-1">
          <label className="block text-sm font-medium mb-1">Cód</label>
          <Input placeholder="Cód" value={codFornecedor} onChange={e => setCodFornecedor(e.target.value)} />
        </div>
        <div className="col-span-12 sm:col-span-6 md:col-span-3">
          <label className="block text-sm font-medium mb-1">Fornecedor</label>
          <Input placeholder="Fornecedor" value={fornecedor} onChange={e => setFornecedor(e.target.value)} />
        </div>
        <div className="col-span-6 sm:col-span-6 md:col-span-1">
          <label className="block text-sm font-medium mb-1">Emissão *</label>
          <Input type="date" placeholder="Data Emissão" value={dataEmissao} onChange={e => setDataEmissao(e.target.value)} />
        </div>
        <div className="col-span-6 sm:col-span-6 md:col-span-1">
          <label className="block text-sm font-medium mb-1">Chegada</label>
          <Input type="date" placeholder="Data Chegada" value={dataChegada} onChange={e => setDataChegada(e.target.value)} />
        </div>
      </div>

      {/* Linha produto: código, produto, unidade, quantidade, preço, desconto, total, adicionar */}
      <div className="grid grid-cols-12 gap-3 items-end mb-3">
        <div className="col-span-12 sm:col-span-2 md:col-span-1">
          <label className="block text-sm font-medium mb-1">Código</label>
          <Input placeholder="Código" value={codProduto} onChange={e => setCodProduto(e.target.value)} />
        </div>
        <div className="col-span-12 sm:col-span-8 md:col-span-6">
          <label className="block text-sm font-medium mb-1">Produto</label>
          <Input placeholder="Produto (busque pelo nome)" value={produto} onChange={e => setProduto(e.target.value)} />
        </div>
        <div className="col-span-6 sm:col-span-4 md:col-span-1">
          <label className="block text-sm font-medium mb-1">Unidade</label>
          <Input placeholder="Unidade" value={unidade} onChange={e => setUnidade(e.target.value)} />
        </div>
        <div className="col-span-6 sm:col-span-3 md:col-span-1">
          <label className="text-sm mb-1">Quantidade</label>
          <Input placeholder="Quantidade" type="number" value={quantidade} onChange={e => setQuantidade(Number(e.target.value))} />
        </div>
        <div className="col-span-6 sm:col-span-3 md:col-span-1">
          <label className="text-sm mb-1">Preço *</label>
          <Input placeholder="Preço" type="number" value={preco} onChange={e => setPreco(Number(e.target.value))} />
        </div>
        <div className="col-span-6 sm:col-span-3 md:col-span-1">
          <label className="text-sm mb-1">R$ Desconto</label>
          <Input placeholder="Desconto" type="number" value={desconto} onChange={e => setDesconto(Number(e.target.value))} />
        </div>
        <div className="col-span-6 sm:col-span-3 md:col-span-1 flex flex-col">
          <label className="text-sm mb-1">Total</label>
          <Input placeholder="Total" value={(quantidade * preco - desconto).toString()} disabled />
        </div>
        <div className="col-span-12 sm:col-span-12 md:col-span-1">
          <Button onClick={adicionarProduto} variant="default" className="w-full sm:w-auto">+ Adicionar</Button>
        </div>
      </div>


      <div className="mb-4 overflow-x-auto">
        <div className="min-w-[800px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead>Preço UN</TableHead>
              <TableHead>Desc UN</TableHead>
              <TableHead>Líquido UN</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Rateio</TableHead>
              <TableHead>Custo Final UN</TableHead>
              <TableHead>Custo Final</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtosComRateio.map((p, idx) => (
              <TableRow key={idx} onClick={() => setSelectedProduto(idx)} className={selectedProduto === idx ? "bg-red-100" : ""}>
                <TableCell>{p.codigo}</TableCell>
                <TableCell>{p.nome}</TableCell>
                <TableCell>{p.unidade}</TableCell>
                <TableCell>{p.quantidade}</TableCell>
                <TableCell>{p.precoUN?.toFixed(2)}</TableCell>
                <TableCell>{p.desconto?.toFixed(2)}</TableCell>
                <TableCell>{p.liquidoUN?.toFixed(2)}</TableCell>
                <TableCell>{p.precoTotal?.toFixed(2)}</TableCell>
                <TableCell>{p.rateio?.toFixed(2)}</TableCell>
                <TableCell>{p.custoFinalUN?.toFixed(2)}</TableCell>
                <TableCell>{p.custoFinal?.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </div>

      <div className="mb-4">
        <Button onClick={excluirProduto} variant="outline">Excluir Produto</Button>
      </div>

      {/* Despesas e totais */}
      <div className="grid grid-cols-12 gap-3 items-end mb-3">
        <div className="col-span-2">
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2"><input type="radio" checked={tipoFrete === 'CIF'} onChange={() => setTipoFrete('CIF')} /> CIF</label>
            <label className="flex items-center gap-2"><input type="radio" checked={tipoFrete === 'FOB'} onChange={() => setTipoFrete('FOB')} /> FOB</label>
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Valor Frete</label>
          <Input placeholder="0.00" type="number" value={valorFrete} onChange={e => setValorFrete(Number(e.target.value))} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Valor Seguro</label>
          <Input placeholder="0.00" type="number" value={valorSeguro} onChange={e => setValorSeguro(Number(e.target.value))} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Outras Despesas</label>
          <Input placeholder="0.00" type="number" value={outrasDespesas} onChange={e => setOutrasDespesas(Number(e.target.value))} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Total Produtos</label>
          <Input placeholder="0.00" value={totalProdutos.toFixed(2)} disabled />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">Total a Pagar</label>
          <Input placeholder="0.00" value={totalPagar.toFixed(2)} disabled />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3 mb-3 items-end">
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Código</label>
          <Input placeholder="Código" value={codCondPagto} onChange={e => setCodCondPagto(e.target.value)} />
        </div>
        <div className="col-span-5">
          <label className="block text-sm font-medium mb-1">Condição de Pagamento</label>
          <Input placeholder="Condição de Pagamento" value={condicaoPagamento} onChange={e => setCondicaoPagamento(e.target.value)} />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Código</label>
          <Input placeholder="Código" />
        </div>
        <div className="col-span-3">
          <label className="block text-sm font-medium mb-1">Transportadora</label>
          <Input placeholder="Transportadora" />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Placa Veículo</label>
          <Input placeholder="Placa Veículo" />
        </div>
        <div className="col-span-1"><Button onClick={adicionarParcela} variant="default">+ Adicionar</Button></div>
      </div>

      <div className="mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Parcela</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Forma de Pagamento</TableHead>
              <TableHead>Data Vencimento</TableHead>
              <TableHead>Valor Parcela</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parcelas.map((p, idx) => (
              <TableRow key={idx}>
                <TableCell>{p.parcela}</TableCell>
                <TableCell>{p.codFormaPagto}</TableCell>
                <TableCell>{p.formaPagamento}</TableCell>
                <TableCell>{p.dataVencimento}</TableCell>
                <TableCell>{p.valorParcela}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">Observação</label>
        <Input placeholder="Observação / Instruções" value={observacao} onChange={e => setObservacao(e.target.value)} className="w-full" />
      </div>

      <div className="mt-6">
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" className="w-full sm:w-auto">Sair</Button>
          <Button
            variant="default"
            className="w-full sm:w-auto"
            onClick={() => {
              if (onSave) {
                onSave({ numero, fornecedor, dataEmissao, total: Number(totalPagar || 0) });
              }
            }}
          >
            Salvar
          </Button>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mt-4">
        Data de Criação: 17/10/2025, 13:04<br />
        Data de Modificação: N/A<br />
        Usuário Últ. Alt: N/A
      </div>
    </div>
  );
}
