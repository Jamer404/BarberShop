using BarberShop.API.Entities;
using BarberShop.API.Models.Categoria;
using BarberShop.API.Repository;
using Microsoft.AspNetCore.Mvc;

using BarberShop.API.Entities;
using BarberShop.API.Models.Categoria;
using BarberShop.API.Repository;
using Microsoft.AspNetCore.Mvc;

namespace BarberShop.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriaController : ControllerBase
    {
        private readonly CategoriaRepository _repository;

        public CategoriaController(CategoriaRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categorias = await _repository.GetAllAsync();
            return Ok(categorias);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var categoria = await _repository.GetByIdAsync(id);
            if (categoria == null) return NotFound();
            return Ok(categoria);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateCategoriaDto dto)
        {
            var categoria = new Categoria
            {
                Codigo = dto.Codigo,
                Nome = dto.Nome.ToUpper(),
                Descricao = dto.Descricao?.ToUpper(),
                Ativo = dto.Ativo
            };

            var id = await _repository.InsertAsync(categoria);
            categoria.Id = id;

            return CreatedAtAction(nameof(GetById), new { id = categoria.Id }, categoria);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UpdateCategoriaDto dto)
        {
            var categoria = await _repository.GetByIdAsync(id);
            if (categoria == null) return NotFound();

            categoria.Nome = dto.Nome.ToUpper();
            categoria.Descricao = dto.Descricao?.ToUpper();
            categoria.Ativo = dto.Ativo;

            var updated = await _repository.UpdateAsync(categoria);
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
