namespace BarberShop.API.Entities
{
    public class Fornecedor
    {
        public int Id { get; set; }

        public DateTime DataCriacao { get; set; }
        public DateTime DataAtualizacao { get; set; }

        public string TipoPessoa { get; set; } = string.Empty;
        public string NomeRazaoSocial { get; set; } = string.Empty;
        public string ApelidoNomeFantasia { get; set; } = string.Empty;
        public DateTime DataNascimentoCriacao { get; set; }

        public string? CpfCnpj { get; set; }
        public string? RgInscricaoEstadual { get; set; }
        public string? Email { get; set; }
        public string? Telefone { get; set; }

        public string? Rua { get; set; }
        public string? Numero { get; set; }
        public string? Bairro { get; set; }
        public string? Cep { get; set; }
        public string? Complemento { get; set; }

        public int CondicaoPagamentoId { get; set; }
        public int IdCidade { get; set; }
    }
}
