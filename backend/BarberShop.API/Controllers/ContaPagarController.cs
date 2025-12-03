// BarberShop.API/Controllers/ContaPagarController.cs
using Microsoft.AspNetCore.Mvc;
using BarberShop.API.Entities;
using BarberShop.API.Models.ContaPagar;
using BarberShop.API.Repository;

namespace BarberShop.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContaPagarController : ControllerBase
    {
        private readonly ContaPagarRepository _repo;

        public ContaPagarController(ContaPagarRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _repo.GetAllAsync());
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> Get(long id)
        {
            var conta = await _repo.GetByIdAsync(id);
            return conta is null ? NotFound() : Ok(conta);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateContaPagarDto dto)
        {
            var ent = new ContaPagar
            {
                NotaCompraId = dto.NotaCompraId,
                FornecedorId = dto.FornecedorId,
                Modelo = dto.Modelo.ToUpperInvariant(),
                Serie = dto.Serie.ToUpperInvariant(),
                Numero = dto.Numero.ToUpperInvariant(),
                NumParcela = dto.NumParcela,
                ValorParcela = dto.ValorParcela,
                DataEmissao = dto.DataEmissao,
                DataVencimento = dto.DataVencimento,
                DataPagamento = null,
                ValorPago = null,
                Juros = dto.Juros,
                Multa = dto.Multa,
                Desconto = dto.Desconto,
                Status = string.IsNullOrWhiteSpace(dto.Status)
                                   ? "ABERTO"
                                   : dto.Status.ToUpperInvariant(),
                FormaPagamentoId = dto.FormaPagamentoId,
                Observacao = dto.Observacao
            };

            var id = await _repo.InsertAsync(ent);
            return CreatedAtAction(nameof(Get), new { id }, id);
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, UpdateContaPagarDto dto)
        {
            var ent = new ContaPagar
            {
                DataVencimento = dto.DataVencimento,
                DataPagamento = dto.DataPagamento,
                ValorPago = dto.ValorPago,
                Juros = dto.Juros,
                Multa = dto.Multa,
                Desconto = dto.Desconto,
                Status = dto.Status.ToUpperInvariant(),
                FormaPagamentoId = dto.FormaPagamentoId,
                Observacao = dto.Observacao
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
    }
}
