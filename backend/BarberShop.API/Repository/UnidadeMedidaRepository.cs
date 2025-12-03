using System.Data;
using Dapper;
using BarberShop.API.Entities;

namespace BarberShop.API.Repository
{
    public class UnidadeMedidaRepository
    {
        private readonly IDbConnection _connection;

        public UnidadeMedidaRepository(IDbConnection connection)
        {
            _connection = connection;
        }

        public async Task<IEnumerable<UnidadeMedida>> GetAllAsync()
        {
            var sql = "SELECT * FROM UnidadesMedida ORDER BY Nome";
            return await _connection.QueryAsync<UnidadeMedida>(sql);
        }

        public async Task<UnidadeMedida?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM UnidadesMedida WHERE Id = @Id";
            return await _connection.QueryFirstOrDefaultAsync<UnidadeMedida>(sql, new { Id = id });
        }

        public async Task<int> InsertAsync(UnidadeMedida unidade)
        {
            var sql = @"
                INSERT INTO UnidadesMedida (Codigo, Nome, Descricao, Ativo, DataCriacao, DataAtualizacao)
                VALUES (@Codigo, @Nome, @Descricao, @Ativo, @DataCriacao, @DataAtualizacao);
                SELECT SCOPE_IDENTITY();";

            unidade.Nome = unidade.Nome.ToUpper();
            unidade.Descricao = unidade.Descricao?.ToUpper();
            unidade.DataCriacao = unidade.DataAtualizacao = DateTime.UtcNow;

            return await _connection.ExecuteScalarAsync<int>(sql, unidade);
        }

        public async Task<bool> UpdateAsync(UnidadeMedida unidade)
        {
            var sql = @"
                UPDATE UnidadesMedida
                   SET Nome = @Nome,
                       Descricao = @Descricao,
                       Ativo = @Ativo,
                       DataAtualizacao = @DataAtualizacao
                 WHERE Id = @Id";

            unidade.Nome = unidade.Nome.ToUpper();
            unidade.Descricao = unidade.Descricao?.ToUpper();
            unidade.DataAtualizacao = DateTime.UtcNow;

            var affected = await _connection.ExecuteAsync(sql, unidade);
            return affected > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM UnidadesMedida WHERE Id = @Id";
            var affected = await _connection.ExecuteAsync(sql, new { Id = id });
            return affected > 0;
        }
    }
}
