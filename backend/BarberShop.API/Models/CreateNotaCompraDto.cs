// Models/NotaCompra/CreateNotaCompraDto.cs
namespace Api.Models.NotaCompra;
public class CreateNotaCompraDto
{
    public string? Modelo { get; set; }
    public string? Serie { get; set; }
    public int Numero { get; set; }

    public long FornecedorId { get; set; }
    public DateTime DataEmissao { get; set; }
    public DateTime DataChegada { get; set; }

    public string? TipoFrete { get; set; } // "CIF" | "FOB" | null
    public decimal ValorFrete { get; set; }
    public decimal ValorSeguro { get; set; }
    public decimal OutrasDespesas { get; set; }

    public decimal TotalProdutos { get; set; }
    public decimal TotalPagar { get; set; }

    public long? CondicaoPagamentoId { get; set; }
    public long? TransportadoraId { get; set; }
    public string? PlacaVeiculo { get; set; }
    public string? Observacao { get; set; }

    public List<CreateNotaCompraItemDto> Itens { get; set; } = new();
    public List<CreateNotaCompraParcelaDto> Parcelas { get; set; } = new();
}

public class CreateNotaCompraItemDto
{
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

public class CreateNotaCompraParcelaDto
{
    public int Numero { get; set; }
    public long? FormaPagamentoId { get; set; }
    public DateTime DataVencimento { get; set; }
    public decimal ValorParcela { get; set; }
}
