namespace BarberShop.API.Entities
{
    [Serializable]
    public class ParcelaCondicaoPagamento : ModeloBase
    {
        public int Numero { get; set; } 
        public int Dias { get; set; }          
        public decimal Percentual { get; set; } 

        public int FormaPagamentoId { get; set; }
        public FormaPagamento FormaPagamento { get; set; } = default!;

        public int CondicaoPagamentoId { get; set; }
        public CondicaoPagamento CondicaoPagamento { get; set; } = default!;
    }

}
