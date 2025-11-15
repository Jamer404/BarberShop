using BarberShop.API.Entities;
using BarberShop.API.Models.Veiculo;
using BarberShop.API.Repository;
using Microsoft.AspNetCore.Mvc;

namespace BarberShop.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VeiculoController : ControllerBase
    {
        private readonly VeiculoRepository _repository;

        public VeiculoController(VeiculoRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var itens = await _repository.GetAllAsync();
            return Ok(itens);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _repository.GetByIdAsync(id);
            if (item is null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateVeiculoDto dto)
        {
            // Normalização para o padrão do projeto
            var entity = new Veiculo
            {
                Placa = (dto.Placa ?? string.Empty).ToUpper().Trim(),
                Modelo = (dto.Modelo ?? string.Empty).ToUpper().Trim(),
                Descricao = dto.Descricao?.ToUpper().Trim(),
                Ativo = dto.Ativo
            };

            var id = await _repository.InsertAsync(entity);
            entity.Id = id;

            var created = await _repository.GetByIdAsync(id);
            return CreatedAtAction(nameof(GetById), new { id }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateVeiculoDto dto)
        {
            var exists = await _repository.GetByIdAsync(id);
            if (exists is null) return NotFound();

            var entity = new Veiculo
            {
                Id = id,
                Modelo = (dto.Modelo ?? string.Empty).ToUpper().Trim(),
                Descricao = dto.Descricao?.ToUpper().Trim(),
                Ativo = dto.Ativo
            };

            var updated = await _repository.UpdateAsync(entity);
            if (!updated) return NotFound();

            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted = await _repository.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
