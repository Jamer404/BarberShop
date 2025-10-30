namespace BarberShop.API.Models.UnidadeMedida
{
    public class CreateUnidadeMedidaDto
    {
        public int Codigo { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public bool Ativo { get; set; } = true;
    }
}
