namespace BarberShop.API.Models.ContaPagar
{
    public class UpdateContaPagarDto
    {
        public DateTime DataVencimento { get; set; }
        public DateTime? DataPagamento { get; set; }
        public decimal? ValorPago { get; set; }

        public decimal Juros { get; set; }
        public decimal Multa { get; set; }
        public decimal Desconto { get; set; }

        public string Status { get; set; } = string.Empty;

        public int? FormaPagamentoId { get; set; }
        public string? Observacao { get; set; }
    }
}
