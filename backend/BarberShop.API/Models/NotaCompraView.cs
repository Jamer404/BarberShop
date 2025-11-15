// Models/NotaCompra/NotaCompraView.cs (para retornos)
namespace Api.Models.NotaCompra;
public class NotaCompraView
{
    public long Id { get; set; }
    public string? Modelo { get; set; }
    public string? Serie { get; set; }
    public int Numero { get; set; }
    public long FornecedorId { get; set; }
    public DateTime DataEmissao { get; set; }
    public DateTime DataChegada { get; set; }
    public string? TipoFrete { get; set; }
    public decimal ValorFrete { get; set; }
    public decimal ValorSeguro { get; set; }
    public decimal OutrasDespesas { get; set; }
    public decimal TotalProdutos { get; set; }
    public decimal TotalPagar { get; set; }
    public long? CondicaoPagamentoId { get; set; }
    public long? TransportadoraId { get; set; }
    public string? PlacaVeiculo { get; set; }
    public string? Observacao { get; set; }
    public DateTime CriadoEm { get; set; }
    public DateTime? AtualizadoEm { get; set; }

    public List<NotaCompraItemView> Itens { get; set; } = new();
    public List<NotaCompraParcelaView> Parcelas { get; set; } = new();
}

public class NotaCompraItemView
{
    public long Id { get; set; }
    public long ProdutoId { get; set; }
    public long UnidadeId { get; set; }
    public decimal Quantidade { get; set; }
    public decimal PrecoUnit { get; set; }
    public decimal DescontoUnit { get; set; }
    public decimal LiquidoUnit { get; set; }
    public decimal Total { get; set; }
    public decimal Rateio { get; set; }
    public decimal CustoFinalUnit { get; set; }
    public decimal CustoFinal { get; set; }
}

public class NotaCompraParcelaView
{
    public long Id { get; set; }
    public int Numero { get; set; }
    public long? FormaPagamentoId { get; set; }
    public DateTime DataVencimento { get; set; }
    public decimal ValorParcela { get; set; }
}
