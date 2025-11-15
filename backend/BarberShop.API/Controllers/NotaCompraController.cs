using Microsoft.AspNetCore.Mvc;
using Api.Models.NotaCompra;

[ApiController]
[Route("api/notas-compra")]
public class NotaCompraController : ControllerBase
{
    private readonly NotaCompraRepository _repo;
    public NotaCompraController(NotaCompraRepository repo) { _repo = repo; }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<NotaCompraView>> Get(long id)
    {
        var nota = await _repo.GetByIdAsync(id);
        return nota is null ? NotFound() : Ok(nota);
    }

    [HttpPost]
    public async Task<ActionResult<long>> Create([FromBody] CreateNotaCompraDto dto)
    {
        var id = await _repo.InsertAsync(dto);
        return CreatedAtAction(nameof(Get), new { id }, id);
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdateNotaCompraDto dto)
    {
        await _repo.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        await _repo.DeleteAsync(id);
        return NoContent();
    }
}
