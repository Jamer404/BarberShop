namespace BarberShop.API.Models.Veiculo
{
    public class UpdateVeiculoDto
    {
        public string Modelo { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public bool Ativo { get; set; } = true;
    }
}