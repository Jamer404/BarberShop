// Entities/Produto.cs
namespace BarberShop.API.Entities
{
    public class Produto
    {
        public int Id { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public int? UnidadeId { get; set; }
        public int? MarcaId { get; set; }
        public int? CategoriaId { get; set; }
        public string? CodigoBarras { get; set; }
        public string? Referencia { get; set; }
        public decimal CustoCompra { get; set; }
        public decimal PrecoVenda { get; set; }
        public decimal LucroPercentual { get; set; }  // %
        public decimal Estoque { get; set; }
        public decimal EstoqueMinimo { get; set; }
        public bool Ativo { get; set; } = true;
        public DateTime DataCriacao { get; set; }
        public DateTime DataAtualizacao { get; set; }
    }
}
