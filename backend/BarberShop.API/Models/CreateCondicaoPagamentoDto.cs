namespace BarberShop.API.Models.CondicaoPagamento
{
    public class CreateCondicaoPagamentoDto
    {
        public string Descricao { get; set; } = string.Empty;
        public decimal TaxaJuros { get; set; }
        public decimal Multa { get; set; }
        public decimal Desconto { get; set; }
        public IList<ParcelaDto> Parcelas { get; set; } = new List<ParcelaDto>();
    }
}
