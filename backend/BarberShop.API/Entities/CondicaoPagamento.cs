namespace BarberShop.API.Entities
{
    [Serializable]
    public class CondicaoPagamento : ModeloBase
    {
        public string Descricao { get; set; } = string.Empty;
        public decimal TaxaJuros { get; set; }
        public decimal Multa { get; set; }
        public decimal Desconto { get; set; }

        public ICollection<ParcelaCondicaoPagamento> Parcelas { get; set; }
            = new List<ParcelaCondicaoPagamento>();
    }

}
