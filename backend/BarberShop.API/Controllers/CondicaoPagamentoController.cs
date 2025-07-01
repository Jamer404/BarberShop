using BarberShop.API.Entities;
using BarberShop.API.Models;
using BarberShop.API.Models.CondicaoPagamento;
using BarberShop.API.Repository;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class CondicaoPagamentoController : ControllerBase
{
    private readonly CondicaoPagamentoRepository _repo;
    public CondicaoPagamentoController(CondicaoPagamentoRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _repo.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id) =>
        (await _repo.GetByIdAsync(id)) is { } c ? Ok(c) : NotFound();

    [HttpPost]
    public async Task<IActionResult> Create(CreateCondicaoPagamentoDto dto)
    {
        var ent = new CondicaoPagamento
        {
            Descricao = dto.Descricao,
            TaxaJuros = dto.TaxaJuros,
            Multa = dto.Multa,
            Desconto = dto.Desconto,
            Parcelas = dto.Parcelas.Select(p => new ParcelaCondicaoPagamento
            {
                Numero = p.Numero,
                Dias = p.Dias,
                Percentual = p.Percentual,
                FormaPagamentoId = p.FormaPagamentoId
            }).ToList()
        };
        var id = await _repo.InsertAsync(ent);
        return CreatedAtAction(nameof(Get), new { id }, id);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateCondicaoPagamentoDto dto)
    {
        var ent = new CondicaoPagamento
        {
            Descricao = dto.Descricao,
            TaxaJuros = dto.TaxaJuros,
            Multa = dto.Multa,
            Desconto = dto.Desconto,
            Parcelas = dto.Parcelas.Select(p => new ParcelaCondicaoPagamento
            {
                Numero = p.Numero,
                Dias = p.Dias,
                Percentual = p.Percentual,
                FormaPagamentoId = p.FormaPagamentoId
            }).ToList()
        };
        await _repo.UpdateAsync(id, ent);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _repo.DeleteAsync(id);
        return NoContent();
    }
}
