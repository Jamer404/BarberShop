using System.Data;
using Dapper;
using BarberShop.API.Entities;

namespace BarberShop.API.Repository
{
    public class CategoriaRepository
    {
        private readonly IDbConnection _connection;

        public CategoriaRepository(IDbConnection connection)
        {
            _connection = connection;
        }

        public async Task<IEnumerable<Categoria>> GetAllAsync()
        {
            var sql = "SELECT * FROM Categorias ORDER BY Nome";
            return await _connection.QueryAsync<Categoria>(sql);
        }

        public async Task<Categoria?> GetByIdAsync(int id)
        {
            var sql = "SELECT * FROM Categorias WHERE Id = @Id";
            return await _connection.QueryFirstOrDefaultAsync<Categoria>(sql, new { Id = id });
        }

        public async Task<int> InsertAsync(Categoria categoria)
        {
            var sql = @"
                INSERT INTO Categorias (Codigo, Nome, Descricao, Ativo, DataCriacao, DataAtualizacao)
                VALUES (@Codigo, @Nome, @Descricao, @Ativo, @DataCriacao, @DataAtualizacao);
                SELECT SCOPE_IDENTITY();";

            categoria.Nome = categoria.Nome.ToUpper();
            categoria.Descricao = categoria.Descricao?.ToUpper();
            categoria.DataCriacao = categoria.DataAtualizacao = DateTime.UtcNow;

            return await _connection.ExecuteScalarAsync<int>(sql, categoria);
        }

        public async Task<bool> UpdateAsync(Categoria categoria)
        {
            var sql = @"
                UPDATE Categorias
                   SET Nome = @Nome,
                       Descricao = @Descricao,
                       Ativo = @Ativo,
                       DataAtualizacao = @DataAtualizacao
                 WHERE Id = @Id";

            categoria.Nome = categoria.Nome.ToUpper();
            categoria.Descricao = categoria.Descricao?.ToUpper();
            categoria.DataAtualizacao = DateTime.UtcNow;

            var affected = await _connection.ExecuteAsync(sql, categoria);
            return affected > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var sql = "DELETE FROM Categorias WHERE Id = @Id";
            var affected = await _connection.ExecuteAsync(sql, new { Id = id });
            return affected > 0;
        }
    }
}
