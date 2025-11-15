using System.Data;
using Dapper;
using Api.Models.Cargo;

namespace BarberShop.API.Repository;

public class CargoRepository
{
    private readonly IDbConnection _conn;
    public CargoRepository(IDbConnection conn) { _conn = conn; }

    public Task<IEnumerable<CargoView>> GetAllAsync(string? q) =>
      _conn.QueryAsync<CargoView>(
        """
      SELECT * FROM dbo.Cargos
      WHERE (@q IS NULL OR Nome LIKE '%' + @q + '%' OR Setor LIKE '%' + @q + '%')
      ORDER BY Nome
      """, new { q });

    public Task<CargoView?> GetByIdAsync(int id) =>
      _conn.QueryFirstOrDefaultAsync<CargoView>("SELECT * FROM dbo.Cargos WHERE Id=@id", new { id });

    public async Task<int> InsertAsync(CreateCargoDto dto)
    {
        var now = DateTime.UtcNow;               
        const string sql = """
      INSERT INTO dbo.Cargos
        (Nome, Setor, SalarioBase, ExigeCnh, Ativo, DataCriacao, DataAtualizacao)
      VALUES
        (@Nome, @Setor, @SalarioBase, @ExigeCnh, @Ativo, @DataCriacao, NULL);
      SELECT CAST(SCOPE_IDENTITY() AS INT);
    """;
        return await _conn.ExecuteScalarAsync<int>(sql, new
        {
            dto.Nome,
            dto.Setor,
            dto.SalarioBase,
            dto.ExigeCnh,
            dto.Ativo,
            DataCriacao = now
        });
    }

    public Task<int> UpdateAsync(int id, UpdateCargoDto dto)
    {
        var now = DateTime.UtcNow;              
        const string sql = """
      UPDATE dbo.Cargos SET
        Nome=@Nome, Setor=@Setor, SalarioBase=@SalarioBase,
        ExigeCnh=@ExigeCnh, Ativo=@Ativo, DataAtualizacao=@DataAtualizacao
      WHERE Id=@Id;
    """;
        return _conn.ExecuteAsync(sql, new
        {
            Id = id,
            dto.Nome,
            dto.Setor,
            dto.SalarioBase,
            dto.ExigeCnh,
            dto.Ativo,
            DataAtualizacao = now
        });
    }

    public Task<int> DeleteAsync(int id) =>
      _conn.ExecuteAsync("DELETE FROM dbo.Cargos WHERE Id=@id", new { id });
}
