using System.Data;
using Dapper;
using BarberShop.API.Entities;

namespace BarberShop.API.Repository
{
    public class VeiculoRepository
    {
        private readonly IDbConnection _connection;

        public VeiculoRepository(IDbConnection connection)
        {
            _connection = connection;
        }

        public async Task<IEnumerable<Veiculo>> GetAllAsync()
        {
            const string sql = "SELECT * FROM dbo.Veiculos ORDER BY Id DESC";
            return await _connection.QueryAsync<Veiculo>(sql);
        }

        public async Task<Veiculo?> GetByIdAsync(int id)
        {
            const string sql = "SELECT * FROM dbo.Veiculos WHERE Id = @Id";
            return await _connection.QueryFirstOrDefaultAsync<Veiculo>(sql, new { Id = id });
        }

        public async Task<int> InsertAsync(Veiculo v)
        {
            const string sql = @"
                INSERT INTO dbo.Veiculos (Placa, Modelo, Descricao, Ativo)
                VALUES (@Placa, @Modelo, @Descricao, @Ativo);
                SELECT CAST(SCOPE_IDENTITY() AS INT);";

            return await _connection.ExecuteScalarAsync<int>(sql, v);
        }

        public async Task<bool> UpdateAsync(Veiculo v)
        {
            const string sql = @"
UPDATE dbo.Veiculos
   SET Modelo          = @Modelo,
       Descricao       = @Descricao,
       Ativo           = @Ativo,
       DataAtualizacao = SYSUTCDATETIME()
 WHERE Id = @Id";

            var affected = await _connection.ExecuteAsync(sql, v);
            return affected > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            const string sql = "DELETE FROM dbo.Veiculos WHERE Id = @Id";
            var affected = await _connection.ExecuteAsync(sql, new { Id = id });
            return affected > 0;
        }
    }
}
