using Microsoft.AspNetCore.Mvc;
using BarberShop.API.Entities;
using BarberShop.API.Models;
using BarberShop.API.Repository;

namespace BarberShop.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VendaController : ControllerBase
    {
        private readonly VendaRepository _vendaRepo;
        private readonly VendaProdutoRepository _produtoRepo;

        public VendaController(VendaRepository vendaRepo, VendaProdutoRepository produtoRepo)
        {
            _vendaRepo = vendaRepo;
            _produtoRepo = produtoRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var vendas = await _vendaRepo.GetAllAsync();
            return Ok(vendas);
        }

        [HttpGet("{numeroNota}/{modelo}/{serie}/{clienteId:int}")]
        public async Task<IActionResult> Get(string numeroNota, string modelo, string serie, int clienteId)
        {
            var venda = await _vendaRepo.GetByIdAsync(numeroNota, modelo, serie, clienteId);
            return venda is null ? NotFound() : Ok(venda);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateVendaDto dto)
        {
            var venda = new Venda
            {
                NumeroNota = dto.NumeroNota.ToUpperInvariant(),
                Modelo = dto.Modelo.ToUpperInvariant(),
                Serie = dto.Serie.ToUpperInvariant(),
                ClienteId = dto.ClienteId,
                DataEmissao = dto.DataEmissao,
                TransportadoraId = dto.TransportadoraId,
                PlacaVeiculo = dto.PlacaVeiculo?.ToUpperInvariant(),
                TipoFrete = dto.TipoFrete.ToUpperInvariant(),
                ValorFrete = dto.ValorFrete,
                TotalProdutos = dto.TotalProdutos,
                TotalPagar = dto.TotalPagar,
                CondicaoPagamentoId = dto.CondicaoPagamentoId,
                Observacao = dto.Observacao
            };

            var itens = dto.Itens.Select(i => new VendaProduto
            {
                NumeroNota = venda.NumeroNota,
                Modelo = venda.Modelo,
                Serie = venda.Serie,
                ClienteId = venda.ClienteId,
                ProdutoId = i.ProdutoId,
                Quantidade = i.Quantidade,
                PrecoUnit = i.PrecoUnit,
                Desconto = i.Desconto
            });

            await _vendaRepo.InsertAsync(venda, itens);

            return CreatedAtAction(
                nameof(Get),
                new
                {
                    numeroNota = venda.NumeroNota,
                    modelo = venda.Modelo,
                    serie = venda.Serie,
                    clienteId = venda.ClienteId
                },
                null);
        }

        [HttpPut("{numeroNota}/{modelo}/{serie}/{clienteId:int}")]
        public async Task<IActionResult> Update(string numeroNota, string modelo, string serie, int clienteId, UpdateVendaDto dto)
        {
            var venda = new Venda
            {
                NumeroNota = numeroNota,
                Modelo = modelo,
                Serie = serie,
                ClienteId = clienteId,
                DataEmissao = dto.DataEmissao,
                TransportadoraId = dto.TransportadoraId,
                PlacaVeiculo = dto.PlacaVeiculo?.ToUpperInvariant(),
                TipoFrete = dto.TipoFrete.ToUpperInvariant(),
                ValorFrete = dto.ValorFrete,
                TotalProdutos = dto.TotalProdutos,
                TotalPagar = dto.TotalPagar,
                CondicaoPagamentoId = dto.CondicaoPagamentoId,
                Observacao = dto.Observacao,
                DataCancelamento = dto.DataCancelamento
            };

            await _vendaRepo.UpdateAsync(venda);
            return NoContent();
        }

        [HttpDelete("{numeroNota}/{modelo}/{serie}/{clienteId:int}")]
        public async Task<IActionResult> Delete(string numeroNota, string modelo, string serie, int clienteId)
        {
            await _vendaRepo.DeleteAsync(numeroNota, modelo, serie, clienteId);
            return NoContent();
        }

        //[HttpGet("{numeroNota}/{modelo}/{serie}/{clienteId:int}/itens")]
        //public async Task<IActionResult> GetItens(string numeroNota, string modelo, string serie, int clienteId)
        //{
        //    var itens = await _produtoRepo.GetByVendaAsync(numeroNota, modelo, serie, clienteId);
        //    return Ok(itens);
        //}

        //[HttpGet("{numeroNota}/{modelo}/{serie}/{clienteId:int}/itens/{produtoId:int}")]
        //public async Task<IActionResult> GetItem(string numeroNota, string modelo, string serie, int clienteId, int produtoId)
        //{
        //    var item = await _produtoRepo.GetByIdAsync(numeroNota, modelo, serie, clienteId, produtoId);
        //    return item is null ? NotFound() : Ok(item);
        //}

        //[HttpPut("{numeroNota}/{modelo}/{serie}/{clienteId:int}/itens/{produtoId:int}")]
        //public async Task<IActionResult> UpdateItem(string numeroNota, string modelo, string serie, int clienteId, int produtoId, UpdateVendaProdutoDto dto)
        //{
        //    var item = new VendaProduto
        //    {
        //        NumeroNota = numeroNota,
        //        Modelo = modelo,
        //        Serie = serie,
        //        ClienteId = clienteId,
        //        ProdutoId = produtoId,
        //        Quantidade = dto.Quantidade,
        //        PrecoUnit = dto.PrecoUnit,
        //        Desconto = dto.Desconto
        //    };

        //    await _produtoRepo.UpdateAsync(item);
        //    return NoContent();
        //}

        //[HttpDelete("{numeroNota}/{modelo}/{serie}/{clienteId:int}/itens/{produtoId:int}")]
        //public async Task<IActionResult> DeleteItem(string numeroNota, string modelo, string serie, int clienteId, int produtoId)
        //{
        //    await _produtoRepo.DeleteAsync(numeroNota, modelo, serie, clienteId, produtoId);
        //    return NoContent();
        //}
    }
}
