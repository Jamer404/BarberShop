namespace BarberShop.API.Models.Categoria
{
    public class CreateCategoriaDto
    {
        public int Codigo { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public bool Ativo { get; set; } = true;
    }
}
