namespace BarberShop.API.Entities;

public class Cargo
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;  
    public string? Setor { get; set; }                   
    public decimal SalarioBase { get; set; }             
    public bool ExigeCnh { get; set; }                  
    public bool Ativo { get; set; }                      
    public DateTime DataCriacao { get; set; }            
    public DateTime? DataAtualizacao { get; set; }       
}