namespace BarberShop.API.Models.Cliente
{
    public class CreateClienteDto
    {
        public string NomeRazaoSocial { get; set; } = string.Empty;
        public string? ApelidoNomeFantasia { get; set; }

        public DateTime? DataNascimento { get; set; }
        public string CpfCnpj { get; set; } = string.Empty;
        public string? RgInscricaoEstadual { get; set; }

        public string? Email { get; set; }
        public string? Telefone { get; set; }

        public string? Rua { get; set; }
        public string? Numero { get; set; }
        public string? Bairro { get; set; }
        public string? Cep { get; set; }
        public string? Complemento { get; set; }

        public bool Pf { get; set; }
        public string Sexo { get; set; } = "M";

        public int IdCidade { get; set; }
        public int? IdCondicaoPagamento { get; set; }

        public decimal LimiteCredito { get; set; }
        public bool Ativo { get; set; } = true;
    }
}
