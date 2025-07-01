namespace BarberShop.API.Entities
{
    public class Cliente : ModeloPessoa
    {
        public bool Pf { get; set; }
        public string Sexo { get; set; } = "M";
        public int IdCidade { get; set; }
        public int IdCondicaoPagamento { get; set; }
        public decimal LimiteCredito { get; set; }
        public bool Ativo { get; set; } = true;
    }
}