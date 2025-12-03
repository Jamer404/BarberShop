namespace BarberShop.API.Models
{
    public class UpdateCompraDto
    {
        public DateTime? DataChegada { get; set; }

        public string TipoFrete { get; set; } = string.Empty;
        public decimal ValorFrete { get; set; }
        public decimal ValorSeguro { get; set; }
        public decimal OutrasDespesas { get; set; }

        public decimal TotalProdutos { get; set; }
        public decimal TotalPagar { get; set; }

        public int? CondicaoPagamentoId { get; set; }
        public int? TransportadoraId { get; set; }
        public string? PlacaVeiculo { get; set; }

        public string? Observacao { get; set; }
        public DateTime? DataCancelamento { get; set; }
    }
}
