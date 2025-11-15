using Api.Models.Cargo;
using BarberShop.API.Repository;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/cargos")]
public class CargoController : ControllerBase
{
    private readonly CargoRepository _repo;
    public CargoController(CargoRepository repo) { _repo = repo; }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CargoView>>> List([FromQuery] string? q)
      => Ok(await _repo.GetAllAsync(q));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CargoView>> Get(int id)
      => (await _repo.GetByIdAsync(id)) is { } cargo ? Ok(cargo) : NotFound();

    [HttpPost]
    public async Task<ActionResult<int>> Create([FromBody] CreateCargoDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nome)) return BadRequest("Nome é obrigatório.");
        var id = await _repo.InsertAsync(dto);
        return CreatedAtAction(nameof(Get), new { id }, id);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateCargoDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nome)) return BadRequest("Nome é obrigatório.");
        await _repo.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _repo.DeleteAsync(id);
        return NoContent();
    }
}
