// Controllers/TransportadoraController.cs
using Microsoft.AspNetCore.Mvc;
using BarberShop.API.Entities;
using BarberShop.API.Repository;
using BarberShop.API.Models.Transportadora;

namespace BarberShop.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransportadoraController : ControllerBase
    {
        private readonly TransportadoraRepository _repo;
        public TransportadoraController(TransportadoraRepository repo) => _repo = repo;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _repo.GetAllAsync());

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
            => (await _repo.GetByIdAsync(id)) is { } t ? Ok(t) : NotFound();

        [HttpPost]
        public async Task<IActionResult> Create(CreateTransportadoraDto dto)
        {
            var t = new Transportadora
            {
                TipoPessoa = (dto.TipoPessoa ?? "J").ToUpper().Trim(),
                RazaoSocial = (dto.RazaoSocial ?? "").ToUpper().Trim(),
                NomeFantasia = dto.NomeFantasia?.ToUpper().Trim(),
                Endereco = dto.Endereco?.ToUpper().Trim(),
                Numero = dto.Numero?.ToUpper().Trim(),
                Complemento = dto.Complemento?.ToUpper().Trim(),
                Bairro = dto.Bairro?.ToUpper().Trim(),
                Cep = dto.Cep,
                IdCidade = dto.IdCidade,
                Cnpj = dto.Cnpj,
                InscricaoEstadual = dto.InscricaoEstadual?.ToUpper().Trim(),
                IdCondicaoPagamento = dto.IdCondicaoPagamento,
                Ativo = dto.Ativo,
                Emails = dto.Emails?.Select(e => e.ToUpper().Trim()).ToList() ?? new(),
                Telefones = dto.Telefones ?? new(),
                VeiculoIds = dto.VeiculoIds ?? new()
            };
            var id = await _repo.InsertAsync(t);
            return CreatedAtAction(nameof(Get), new { id }, id);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, UpdateTransportadoraDto dto)
        {
            var t = new Transportadora
            {
                TipoPessoa = (dto.TipoPessoa ?? "J").ToUpper().Trim(),
                RazaoSocial = (dto.RazaoSocial ?? "").ToUpper().Trim(),
                NomeFantasia = dto.NomeFantasia?.ToUpper().Trim(),
                Endereco = dto.Endereco?.ToUpper().Trim(),
                Numero = dto.Numero?.ToUpper().Trim(),
                Complemento = dto.Complemento?.ToUpper().Trim(),
                Bairro = dto.Bairro?.ToUpper().Trim(),
                Cep = dto.Cep,
                IdCidade = dto.IdCidade,
                Cnpj = dto.Cnpj,
                InscricaoEstadual = dto.InscricaoEstadual?.ToUpper().Trim(),
                IdCondicaoPagamento = dto.IdCondicaoPagamento,
                Ativo = dto.Ativo,
                Emails = dto.Emails?.Select(e => e.ToUpper().Trim()).ToList() ?? new(),
                Telefones = dto.Telefones ?? new(),
                VeiculoIds = dto.VeiculoIds ?? new()
            };
            await _repo.UpdateAsync(id, t);
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
