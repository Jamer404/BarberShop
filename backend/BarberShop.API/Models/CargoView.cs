namespace Api.Models.Cargo;
public class CargoView
{
    public int Id { get; set; }
    public string Nome { get; set; } = "";
    public string? Setor { get; set; }
    public decimal SalarioBase { get; set; }
    public bool ExigeCnh { get; set; }
    public bool Ativo { get; set; }
    public DateTime DataCriacao { get; set; }
    public DateTime? DataAtualizacao { get; set; }
}