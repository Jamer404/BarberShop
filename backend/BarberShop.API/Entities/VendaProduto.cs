namespace BarberShop.API.Entities
{
    public class VendaProduto
    {
        public string NumeroNota { get; set; } = string.Empty;
        public string Modelo { get; set; } = string.Empty;
        public string Serie { get; set; } = string.Empty;
        public int ClienteId { get; set; }

        public int ProdutoId { get; set; }

        public decimal Quantidade { get; set; }
        public decimal PrecoUnit { get; set; }
        public decimal Desconto { get; set; }

        public DateTime CriadoEm { get; set; }
        public DateTime? AtualizadoEm { get; set; }
    }
}
