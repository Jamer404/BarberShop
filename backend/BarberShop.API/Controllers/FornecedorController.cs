// Controllers/FornecedorController.cs
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
        public FornecedorController(FornecedorRepository repo) => _repo = repo;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _repo.GetAllAsync());

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
            => (await _repo.GetByIdAsync(id)) is { } f ? Ok(f) : NotFound();

        [HttpPost]
        public async Task<IActionResult> Create(CreateFornecedorDto dto)
        {
            var now = DateTime.UtcNow;
            var ent = Map(dto);
            ent.DataCriacao = now;
            ent.DataAtualizacao = now;

            var id = await _repo.InsertAsync(ent);
            return CreatedAtAction(nameof(Get), new { id }, id);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, UpdateFornecedorDto dto)
        {
            var ent = Map(dto);
            ent.DataAtualizacao = DateTime.UtcNow;
            await _repo.UpdateAsync(id, ent);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repo.DeleteAsync(id);
            return NoContent();
        }

        private static Fornecedor Map(CreateFornecedorDto d) => new()
        {
            TipoPessoa = d.TipoPessoa,
            NomeRazaoSocial = (d.NomeRazaoSocial ?? "").ToUpperInvariant(),
            ApelidoNomeFantasia = (d.ApelidoNomeFantasia ?? "").ToUpperInvariant(),
            DataNascimentoCriacao = d.DataNascimentoCriacao,
            CpfCnpj = d.CpfCnpj,
            RgInscricaoEstadual = d.RgInscricaoEstadual,
            Email = d.Email,
            Telefone = d.Telefone,
            Rua = d.Rua,
            Numero = d.Numero,
            Bairro = d.Bairro,
            Cep = d.Cep,
            Classificacao = d.Classificacao,
            Complemento = d.Complemento,
            FormaPagamentoId = d.FormaPagamentoId,
            CondicaoPagamentoId = d.CondicaoPagamentoId,
            IdCidade = d.IdCidade,
            ValorMinimoPedido = d.ValorMinimoPedido
        };

        private static Fornecedor Map(UpdateFornecedorDto d) => new()
        {
            TipoPessoa = d.TipoPessoa,
            NomeRazaoSocial = (d.NomeRazaoSocial ?? "").ToUpperInvariant(),
            ApelidoNomeFantasia = (d.ApelidoNomeFantasia ?? "").ToUpperInvariant(),
            DataNascimentoCriacao = d.DataNascimentoCriacao,
            CpfCnpj = d.CpfCnpj,
            RgInscricaoEstadual = d.RgInscricaoEstadual,
            Email = d.Email,
            Telefone = d.Telefone,
            Rua = d.Rua,
            Numero = d.Numero,
            Bairro = d.Bairro,
            Cep = d.Cep,
            Classificacao = d.Classificacao,
            Complemento = d.Complemento,
            FormaPagamentoId = d.FormaPagamentoId,
            CondicaoPagamentoId = d.CondicaoPagamentoId,
            IdCidade = d.IdCidade,
            ValorMinimoPedido = d.ValorMinimoPedido
        };
    }
}
