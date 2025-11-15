using Microsoft.AspNetCore.Mvc;
using BarberShop.API.Entities;
using BarberShop.API.Repository;

[ApiController]
[Route("api/[controller]")]
public class FuncionarioController : ControllerBase
{
    private readonly FuncionarioRepository _repo;

    public FuncionarioController(FuncionarioRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await _repo.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var f = await _repo.GetByIdAsync(id);
        return f is null ? NotFound() : Ok(f);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Funcionario dto)
    {
        // carimbos no back
        dto.DataCriacao = DateTime.UtcNow;
        dto.DataAtualizacao = default; // null no insert

        var id = await _repo.InsertAsync(dto);
        var novo = await _repo.GetByIdAsync(id);
        return CreatedAtAction(nameof(GetById), new { id }, novo);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] Funcionario dto)
    {
        dto.DataAtualizacao = DateTime.UtcNow;
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
