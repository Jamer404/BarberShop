namespace Api.Models.Cargo;
public class UpdateCargoDto
{
    public string Nome { get; set; } = "";
    public string? Setor { get; set; }
    public decimal SalarioBase { get; set; }
    public bool ExigeCnh { get; set; }
    public bool Ativo { get; set; }
}