namespace Api.Models.Cargo;
public class CreateCargoDto
{
    public string Nome { get; set; } = "";
    public string? Setor { get; set; }
    public decimal SalarioBase { get; set; }
    public bool ExigeCnh { get; set; }
    public bool Ativo { get; set; } = true;
}