namespace BarberShop.API.Models.ContaPagar
{
    public class CreateContaPagarDto
    {
        public long? NotaCompraId { get; set; }

        public int FornecedorId { get; set; }
        public string Modelo { get; set; } = string.Empty;
        public string Serie { get; set; } = string.Empty;
        public string Numero { get; set; } = string.Empty;

        public int NumParcela { get; set; }
        public decimal ValorParcela { get; set; }

        public DateTime DataEmissao { get; set; }
        public DateTime DataVencimento { get; set; }

        public decimal Juros { get; set; } = 0;
        public decimal Multa { get; set; } = 0;
        public decimal Desconto { get; set; } = 0;

        public string? Status { get; set; }

        public int? FormaPagamentoId { get; set; }
        public string? Observacao { get; set; }
    }
}
