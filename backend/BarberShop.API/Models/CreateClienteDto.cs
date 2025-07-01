namespace BarberShop.API.Models.Cliente
{
    public class CreateClienteDto
    {
        public string TipoPessoa { get; set; } = string.Empty;          
        public string NomeRazaoSocial { get; set; } = string.Empty;
        public string ApelidoNomeFantasia { get; set; } = string.Empty;
        public DateTime DataNascimentoCriacao { get; set; }             
        public string CpfCnpj { get; set; } = string.Empty;
        public string RgInscricaoEstadual { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;
        public string Telefone { get; set; } = string.Empty;

        public string Rua { get; set; } = string.Empty;
        public string Numero { get; set; } = string.Empty;
        public string Bairro { get; set; } = string.Empty;
        public string Cep { get; set; } = string.Empty;
        public string Complemento { get; set; } = string.Empty;
        public string Classificacao { get; set; } = string.Empty;

        public bool Pf { get; set; }                                   
        public string Sexo { get; set; } = "M";                       

        public int IdCidade { get; set; }
        public int IdCondicaoPagamento { get; set; }
        public decimal LimiteCredito { get; set; }

        public bool Ativo { get; set; } = true;
    }
}
