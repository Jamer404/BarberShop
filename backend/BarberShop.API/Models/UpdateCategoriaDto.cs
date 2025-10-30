namespace BarberShop.API.Models.Categoria
{
    public class UpdateCategoriaDto
    {
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public bool Ativo { get; set; } = true;
    }
}
