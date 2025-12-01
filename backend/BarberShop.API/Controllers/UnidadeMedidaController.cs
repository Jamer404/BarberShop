using BarberShop.API.Entities;
using BarberShop.API.Models.UnidadeMedida;
using BarberShop.API.Repository;
using Microsoft.AspNetCore.Mvc;

namespace BarberShop.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UnidadeMedidaController : ControllerBase
    {
        private readonly UnidadeMedidaRepository _repository;

        public UnidadeMedidaController(UnidadeMedidaRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var unidades = await _repository.GetAllAsync();
            return Ok(unidades);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var unidade = await _repository.GetByIdAsync(id);
            if (unidade == null) return NotFound();
            return Ok(unidade);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateUnidadeMedidaDto dto)
        {
            var unidade = new UnidadeMedida
            {
                Nome = dto.Nome.ToUpper(),
                Descricao = dto.Descricao?.ToUpper(),
                Ativo = dto.Ativo
            };

            var id = await _repository.InsertAsync(unidade);
            unidade.Id = id;

            return CreatedAtAction(nameof(GetById), new { id = unidade.Id }, unidade);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateUnidadeMedidaDto dto)
        {
            var unidade = await _repository.GetByIdAsync(id);
            if (unidade == null) return NotFound();

            unidade.Nome = dto.Nome.ToUpper();
            unidade.Descricao = dto.Descricao?.ToUpper();
            unidade.Ativo = dto.Ativo;

            var updated = await _repository.UpdateAsync(unidade);
            if (!updated) return NotFound();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _repository.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
