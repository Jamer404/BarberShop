// Controllers/ProdutoController.cs
using Microsoft.AspNetCore.Mvc;
using BarberShop.API.Entities;
using BarberShop.API.Repository;
using BarberShop.API.Models.Produto;

namespace BarberShop.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProdutoController : ControllerBase
    {
        private readonly ProdutoRepository _repo;
        public ProdutoController(ProdutoRepository repo) => _repo = repo;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _repo.GetAllAsync());

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
            => (await _repo.GetByIdAsync(id)) is { } p ? Ok(p) : NotFound();

        [HttpPost]
        public async Task<IActionResult> Create(CreateProdutoDto dto)
        {
            var entidade = new Produto
            {
                Descricao = (dto.Descricao ?? "").ToUpper().Trim(),
                UnidadeId = dto.UnidadeId,
                MarcaId = dto.MarcaId,
                CategoriaId = dto.CategoriaId,
                CodigoBarras = dto.CodigoBarras,
                Referencia = dto.Referencia?.ToUpper().Trim(),
                CustoCompra = dto.CustoCompra,
                PrecoVenda = dto.PrecoVenda,
                LucroPercentual = dto.LucroPercentual,
                Estoque = dto.Estoque,
                EstoqueMinimo = dto.EstoqueMinimo,
                Ativo = dto.Ativo
            };

            var id = await _repo.InsertAsync(entidade);
            return CreatedAtAction(nameof(Get), new { id }, id);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, UpdateProdutoDto dto)
        {
            var entidade = new Produto
            {
                Descricao = (dto.Descricao ?? "").ToUpper().Trim(),
                UnidadeId = dto.UnidadeId,
                MarcaId = dto.MarcaId,
                CategoriaId = dto.CategoriaId,
                CodigoBarras = dto.CodigoBarras,
                Referencia = dto.Referencia?.ToUpper().Trim(),
                CustoCompra = dto.CustoCompra,
                PrecoVenda = dto.PrecoVenda,
                LucroPercentual = dto.LucroPercentual,
                Estoque = dto.Estoque,
                EstoqueMinimo = dto.EstoqueMinimo,
                Ativo = dto.Ativo
            };

            await _repo.UpdateAsync(id, entidade);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }
    }
}
