using BarberShop.API.Entities;
using BarberShop.API.Models.Cliente;
using BarberShop.API.Repository;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class ClienteController : ControllerBase
{
    private readonly ClienteRepository _repository;

    public ClienteController(ClienteRepository repository) =>
        _repository = repository;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await _repository.GetAllAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var cliente = await _repository.GetByIdAsync(id);
        return cliente is null ? NotFound() : Ok(cliente);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateClienteDto dto)
    {
        var cliente = new Cliente
        {
            TipoPessoa = dto.TipoPessoa,
            NomeRazaoSocial = dto.NomeRazaoSocial,
            ApelidoNomeFantasia = dto.ApelidoNomeFantasia,
            DataNascimentoCriacao = dto.DataNascimentoCriacao,
            CpfCnpj = dto.CpfCnpj,
            RgInscricaoEstadual = dto.RgInscricaoEstadual,
            Email = dto.Email,
            Telefone = dto.Telefone,
            Rua = dto.Rua,
            Numero = dto.Numero,
            Bairro = dto.Bairro,
            Cep = dto.Cep,
            Classificacao = dto.Classificacao,
            Complemento = dto.Complemento,

            Pf = dto.Pf,
            Sexo = dto.Sexo,
            IdCidade = dto.IdCidade,
            IdCondicaoPagamento = dto.IdCondicaoPagamento,
            LimiteCredito = dto.LimiteCredito,
            Ativo = dto.Ativo
        };

        var id = await _repository.InsertAsync(cliente);
        return CreatedAtAction(nameof(Get), new { id }, cliente);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CreateClienteDto dto)
    {
        var cliente = new Cliente
        {
            Id = id,

            TipoPessoa = dto.TipoPessoa,
            NomeRazaoSocial = dto.NomeRazaoSocial,
            ApelidoNomeFantasia = dto.ApelidoNomeFantasia,
            DataNascimentoCriacao = dto.DataNascimentoCriacao,
            CpfCnpj = dto.CpfCnpj,
            RgInscricaoEstadual = dto.RgInscricaoEstadual,
            Email = dto.Email,
            Telefone = dto.Telefone,
            Rua = dto.Rua,
            Numero = dto.Numero,
            Bairro = dto.Bairro,
            Cep = dto.Cep,
            Classificacao = dto.Classificacao,
            Complemento = dto.Complemento,

            Pf = dto.Pf,
            Sexo = dto.Sexo,
            IdCidade = dto.IdCidade,
            IdCondicaoPagamento = dto.IdCondicaoPagamento,
            LimiteCredito = dto.LimiteCredito,
            Ativo = dto.Ativo
        };

        return await _repository.UpdateAsync(cliente) ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id) =>
        await _repository.DeleteAsync(id) ? NoContent() : NotFound();
}
