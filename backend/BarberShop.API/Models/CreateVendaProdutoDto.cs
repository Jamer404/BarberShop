namespace BarberShop.API.Models
{
    public class CreateVendaProdutoDto
    {
        public int ProdutoId { get; set; }
        public decimal Quantidade { get; set; }
        public decimal PrecoUnit { get; set; }
        public decimal Desconto { get; set; }
    }
}
