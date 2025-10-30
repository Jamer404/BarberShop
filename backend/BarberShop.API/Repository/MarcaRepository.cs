using System.Data;
using Dapper;
using BarberShop.API.Entities;

namespace BarberShop.API.Repository
{
    public class MarcaRepository
    {
        private readonly IDbConnection _connection;

        public MarcaRepository(IDbConnection connection)
        {
            _connection = connection;
        }

        public async Task<IEnumerable<Marca>> GetAllAsync()
        {
            var sql = "SELECT * FROM Marcas ORDER BY Nome";
            return await _connection.QueryAsync<Marca>(sql);
        }

        public async Task<Marca?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM Marcas WHERE Id = @Id";
            return await _connection.QueryFirstOrDefaultAsync<Marca>(sql, new { Id = id });
        }

        public async Task<int> InsertAsync(Marca marca)
        {
            var sql = @"
                INSERT INTO Marcas (Codigo, Nome, Descricao, Ativo, DataCriacao, DataAtualizacao)
                VALUES (@Codigo, @Nome, @Descricao, @Ativo, @DataCriacao, @DataAtualizacao);
                SELECT SCOPE_IDENTITY();";

            // normalização e datas
            marca.Nome = marca.Nome.ToUpper();
            marca.Descricao = marca.Descricao?.ToUpper();
            marca.DataCriacao = marca.DataAtualizacao = DateTime.UtcNow;

            return await _connection.ExecuteScalarAsync<int>(sql, marca);
        }

        public async Task<bool> UpdateAsync(Marca marca)
        {
            var sql = @"
                UPDATE Marcas
                SET Nome = @Nome,
                    Descricao = @Descricao,
                    Ativo = @Ativo,
                    DataAtualizacao = @DataAtualizacao
                WHERE Id = @Id";

            marca.Nome = marca.Nome.ToUpper();
            marca.Descricao = marca.Descricao?.ToUpper();
            marca.DataAtualizacao = DateTime.UtcNow;

            var affected = await _connection.ExecuteAsync(sql, marca);
            return affected > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM Marcas WHERE Id = @Id";
            var affected = await _connection.ExecuteAsync(sql, new { Id = id });
            return affected > 0;
        }
    }
}
