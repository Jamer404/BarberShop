namespace BarberShop.API.Entities
{
    public class Transportadora
    {
        public int Id { get; set; }
        public string TipoPessoa { get; set; } = "J";
        public string RazaoSocial { get; set; } = string.Empty;
        public string? NomeFantasia { get; set; }
        public string? Endereco { get; set; }
        public string? Numero { get; set; }
        public string? Complemento { get; set; }
        public string? Bairro { get; set; }
        public string? Cep { get; set; }
        public int? IdCidade { get; set; }
        public string? Cnpj { get; set; }
        public string? InscricaoEstadual { get; set; }
        public int? IdCondicaoPagamento { get; set; }
        public bool Ativo { get; set; } = true;
        public DateTime DataCriacao { get; set; }
        public DateTime DataAtualizacao { get; set; }

        public List<string> Emails { get; set; } = new();
        public List<string> Telefones { get; set; } = new();
        public List<int> VeiculoIds { get; set; } = new();
    }
}
