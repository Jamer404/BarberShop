using System.Data;
using Dapper;
using BarberShop.API.Entities;

namespace BarberShop.API.Repository
{
    public class FuncionarioRepository
    {
        private readonly IDbConnection _conn;

        public FuncionarioRepository(IDbConnection conn)
        {
            _conn = conn;
        }

        public async Task<IEnumerable<Funcionario>> GetAllAsync()
        {
            const string sql = @"
SELECT
    Id, Nome, Sexo, Endereco, Numero, Complemento, Bairro, Cep,
    IdCidade, Cpf, Rg, DataNascimento, DataAdmissao, DataDemissao,
    IdCargo, CargaHoraria, Salario, Email, Telefone,
    Ativo, DataCriacao, DataAtualizacao
FROM dbo.Funcionarios
ORDER BY Id DESC;";
            return await _conn.QueryAsync<Funcionario>(sql);
        }

        public async Task<Funcionario?> GetByIdAsync(int id)
        {
            const string sql = @"
SELECT
    Id, Nome, Sexo, Endereco, Numero, Complemento, Bairro, Cep,
    IdCidade, Cpf, Rg, DataNascimento, DataAdmissao, DataDemissao,
    IdCargo, CargaHoraria, Salario, Email, Telefone,
    Ativo, DataCriacao, DataAtualizacao
FROM dbo.Funcionarios
WHERE Id = @Id;";
            return await _conn.QueryFirstOrDefaultAsync<Funcionario>(sql, new { Id = id });
        }

        public async Task<int> InsertAsync(Funcionario f)
        {
            var now = DateTime.UtcNow;

            const string sql = @"
INSERT INTO dbo.Funcionarios
(
    Nome, Sexo, Endereco, Numero, Complemento, Bairro, Cep,
    IdCidade, Cpf, Rg, DataNascimento, DataAdmissao, DataDemissao,
    IdCargo, CargaHoraria, Salario, Email, Telefone,
    Ativo, DataCriacao, DataAtualizacao
)
VALUES
(
    @Nome, @Sexo, @Endereco, @Numero, @Complemento, @Bairro, @Cep,
    @IdCidade, @Cpf, @Rg, @DataNascimento, @DataAdmissao, @DataDemissao,
    @IdCargo, @CargaHoraria, @Salario, @Email, @Telefone,
    @Ativo, @DataCriacao, NULL
);
SELECT CAST(SCOPE_IDENTITY() AS INT);";

            var id = await _conn.ExecuteScalarAsync<int>(sql, new
            {
                f.Nome,
                f.Sexo,
                f.Endereco,
                f.Numero,
                f.Complemento,
                f.Bairro,
                f.Cep,
                f.IdCidade,
                f.Cpf,
                f.Rg,
                f.DataNascimento,
                f.DataAdmissao,
                f.DataDemissao,
                f.IdCargo,
                f.CargaHoraria,
                f.Salario,
                f.Email,
                f.Telefone,
                f.Ativo,
                DataCriacao = now
            });

            return id;
        }

        public async Task UpdateAsync(int id, Funcionario f)
        {
            var now = DateTime.UtcNow;

            const string sql = @"
UPDATE dbo.Funcionarios SET
    Nome            = @Nome,
    Sexo            = @Sexo,
    Endereco        = @Endereco,
    Numero          = @Numero,
    Complemento     = @Complemento,
    Bairro          = @Bairro,
    Cep             = @Cep,
    IdCidade        = @IdCidade,
    Cpf             = @Cpf,
    Rg              = @Rg,
    DataNascimento  = @DataNascimento,
    DataAdmissao    = @DataAdmissao,
    DataDemissao    = @DataDemissao,
    IdCargo         = @IdCargo,
    CargaHoraria    = @CargaHoraria,
    Salario         = @Salario,
    Email           = @Email,
    Telefone        = @Telefone,
    Ativo           = @Ativo,
    DataAtualizacao = @DataAtualizacao
WHERE Id = @Id;";

            await _conn.ExecuteAsync(sql, new
            {
                Id = id,
                f.Nome,
                f.Sexo,
                f.Endereco,
                f.Numero,
                f.Complemento,
                f.Bairro,
                f.Cep,
                f.IdCidade,
                f.Cpf,
                f.Rg,
                f.DataNascimento,
                f.DataAdmissao,
                f.DataDemissao,
                f.IdCargo,
                f.CargaHoraria,
                f.Salario,
                f.Email,
                f.Telefone,
                f.Ativo,
                DataAtualizacao = now
            });
        }

        public async Task DeleteAsync(int id)
        {
            const string sql = @"DELETE FROM dbo.Funcionarios WHERE Id = @Id;";
            await _conn.ExecuteAsync(sql, new { Id = id });
        }
    }
}
