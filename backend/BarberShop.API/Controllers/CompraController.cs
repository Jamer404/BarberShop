using Microsoft.AspNetCore.Mvc;
using BarberShop.API.Entities;
using BarberShop.API.Models;
using BarberShop.API.Repository;

namespace BarberShop.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompraController : ControllerBase
    {
        private readonly CompraRepository _repo;
        private readonly NotaCompraItemRepository _itensRepo;

        public CompraController(CompraRepository repo, NotaCompraItemRepository itensRepo)
        {
            _repo = repo;
            _itensRepo = itensRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _repo.GetAllAsync());
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> Get(long id)
        {
            var compra = await _repo.GetByIdAsync(id);
            return compra is null ? NotFound() : Ok(compra);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateCompraDto dto)
        {
            var ent = new Compra
            {
                FornecedorId = dto.FornecedorId,
                Modelo = dto.Modelo.ToUpperInvariant(),
                Serie = dto.Serie.ToUpperInvariant(),
                Numero = dto.Numero.ToUpperInvariant(),
                DataEmissao = dto.DataEmissao,
                DataChegada = dto.DataChegada,
                TipoFrete = dto.TipoFrete.ToUpperInvariant(),
                ValorFrete = dto.ValorFrete,
                ValorSeguro = dto.ValorSeguro,
                OutrasDespesas = dto.OutrasDespesas,
                TotalProdutos = dto.TotalProdutos,
                TotalPagar = dto.TotalPagar,
                CondicaoPagamentoId = dto.CondicaoPagamentoId,
                TransportadoraId = dto.TransportadoraId,
                PlacaVeiculo = dto.PlacaVeiculo?.ToUpperInvariant(),
                Observacao = dto.Observacao
            };

            var itens = dto.Itens?.Select(i => new NotaCompraItem
            {
                ProdutoId = i.ProdutoId,
                UnidadeId = i.UnidadeId,
                Quantidade = i.Quantidade,
                PrecoUnit = i.PrecoUnit,
                DescontoUnit = i.DescontoUnit,
                LiquidoUnit = i.LiquidoUnit,
                Rateio = i.Rateio,
                CustoFinalUnit = i.CustoFinalUnit,
                Total = i.Total
            }).ToList() ?? new List<NotaCompraItem>();

            var id = await _repo.InsertAsync(ent, itens);
            return CreatedAtAction(nameof(Get), new { id }, id);
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, UpdateCompraDto dto)
        {
            var ent = new Compra
            {
                DataChegada = dto.DataChegada,
                TipoFrete = dto.TipoFrete.ToUpperInvariant(),
                ValorFrete = dto.ValorFrete,
                ValorSeguro = dto.ValorSeguro,
                OutrasDespesas = dto.OutrasDespesas,
                TotalProdutos = dto.TotalProdutos,
                TotalPagar = dto.TotalPagar,
                CondicaoPagamentoId = dto.CondicaoPagamentoId,
                TransportadoraId = dto.TransportadoraId,
                PlacaVeiculo = dto.PlacaVeiculo?.ToUpperInvariant(),
                Observacao = dto.Observacao,
                DataCancelamento = dto.DataCancelamento
            };

            await _repo.UpdateAsync(id, ent);
            return NoContent();
        }

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }

        [HttpGet("{id:long}/itens")]
        public async Task<IActionResult> GetItens(long id)
        {
            var itens = await _itensRepo.GetByNotaAsync(id);
            return Ok(itens);
        }
    }
}
