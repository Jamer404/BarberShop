namespace BarberShop.API.Models.Funcionario
{
    public class CreateFuncionarioDto
    {
        public string Nome { get; set; } = string.Empty;
        public string Sexo { get; set; } = "M";
        public string? Endereco { get; set; }
        public string? Numero { get; set; }
        public string? Complemento { get; set; }
        public string? Bairro { get; set; }
        public string? Cep { get; set; }
        public int? IdCidade { get; set; }
        public string? Cpf { get; set; }
        public string? Rg { get; set; }
        public DateTime? DataNascimento { get; set; }
        public DateTime DataAdmissao { get; set; }
        public DateTime? DataDemissao { get; set; }
        public int? IdCargo { get; set; }
        public string? CargaHoraria { get; set; }
        public decimal? Salario { get; set; }
        public string? Email { get; set; }
        public string? Telefone { get; set; }
        public bool Ativo { get; set; } = true;
    }
}