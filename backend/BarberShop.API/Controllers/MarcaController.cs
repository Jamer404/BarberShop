using BarberShop.API.Entities;
using BarberShop.API.Models.Marca;
using BarberShop.API.Repository;
using Microsoft.AspNetCore.Mvc;

namespace BarberShop.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MarcaController : ControllerBase
    {
        private readonly MarcaRepository _repository;

        public MarcaController(MarcaRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var marcas = await _repository.GetAllAsync();
            return Ok(marcas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var marca = await _repository.GetByIdAsync(id);
            if (marca == null) return NotFound();
            return Ok(marca);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateMarcaDto dto)
        {
            var marca = new Marca
            {
                Codigo = dto.Codigo,
                Nome = dto.Nome.ToUpper(),
                Descricao = dto.Descricao?.ToUpper(),
                Ativo = dto.Ativo
            };

            var id = await _repository.InsertAsync(marca);
            marca.Id = id;

            return CreatedAtAction(nameof(GetById), new { id = marca.Id }, marca);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateMarcaDto dto)
        {
            var marca = await _repository.GetByIdAsync(id);
            if (marca == null) return NotFound();

            marca.Nome = dto.Nome.ToUpper();
            marca.Descricao = dto.Descricao?.ToUpper();
            marca.Ativo = dto.Ativo;

            var updated = await _repository.UpdateAsync(marca);
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
