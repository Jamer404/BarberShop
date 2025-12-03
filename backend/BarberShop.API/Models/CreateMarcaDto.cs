namespace BarberShop.API.Models.Marca
{
    public class CreateMarcaDto
    {
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public bool Ativo { get; set; } = true;
    }
}
