using System.Collections.Generic;

namespace BarberShop.API.Models
{
    public class CreateVendaDto
    {
        public string NumeroNota { get; set; } = string.Empty;
        public string Modelo { get; set; } = string.Empty;
        public string Serie { get; set; } = string.Empty;
        public int ClienteId { get; set; }

        public DateTime DataEmissao { get; set; }

        public int? TransportadoraId { get; set; }
        public string? PlacaVeiculo { get; set; }

        public string TipoFrete { get; set; } = string.Empty;
        public decimal ValorFrete { get; set; }
        public decimal TotalProdutos { get; set; }
        public decimal TotalPagar { get; set; }

        public int? CondicaoPagamentoId { get; set; }

        public string? Observacao { get; set; }

        public List<CreateVendaProdutoDto> Itens { get; set; } = new();
    }
}
