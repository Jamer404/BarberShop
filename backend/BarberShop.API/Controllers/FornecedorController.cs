using Microsoft.AspNetCore.Mvc;
using BarberShop.API.Entities;
using BarberShop.API.Repository;
using BarberShop.API.Models;

namespace BarberShop.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FornecedorController : ControllerBase
    {
        private readonly FornecedorRepository _repo;

        public FornecedorController(FornecedorRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _repo.GetAllAsync());
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var f = await _repo.GetByIdAsync(id);
            return f is null ? NotFound() : Ok(f);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateFornecedorDto dto)
        {
            var now = DateTime.UtcNow;

            var ent = new Fornecedor
            {
                TipoPessoa = dto.TipoPessoa,
                NomeRazaoSocial = dto.NomeRazaoSocial.ToUpperInvariant(),
                ApelidoNomeFantasia = dto.ApelidoNomeFantasia.ToUpperInvariant(),
                DataNascimentoCriacao = dto.DataNascimentoCriacao,
                CpfCnpj = dto.CpfCnpj,
                RgInscricaoEstadual = dto.RgInscricaoEstadual,
                Email = dto.Email,
                Telefone = dto.Telefone,
                Rua = dto.Rua,
                Numero = dto.Numero,
                Bairro = dto.Bairro,
                Cep = dto.Cep,
                Complemento = dto.Complemento,
                CondicaoPagamentoId = dto.CondicaoPagamentoId,
                IdCidade = dto.IdCidade,
                DataCriacao = now,
                DataAtualizacao = now
            };

            var id = await _repo.InsertAsync(ent);
            return CreatedAtAction(nameof(Get), new { id }, id);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, UpdateFornecedorDto dto)
        {
            var ent = new Fornecedor
            {
                TipoPessoa = dto.TipoPessoa,
                NomeRazaoSocial = dto.NomeRazaoSocial.ToUpperInvariant(),
                ApelidoNomeFantasia = dto.ApelidoNomeFantasia.ToUpperInvariant(),
                DataNascimentoCriacao = dto.DataNascimentoCriacao,
                CpfCnpj = dto.CpfCnpj,
                RgInscricaoEstadual = dto.RgInscricaoEstadual,
                Email = dto.Email,
                Telefone = dto.Telefone,
                Rua = dto.Rua,
                Numero = dto.Numero,
                Bairro = dto.Bairro,
                Cep = dto.Cep,
                Complemento = dto.Complemento,
                CondicaoPagamentoId = dto.CondicaoPagamentoId,
                IdCidade = dto.IdCidade,
                DataAtualizacao = DateTime.UtcNow
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
}
