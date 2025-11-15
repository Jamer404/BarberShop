// Repository/ProdutoRepository.cs
using System.Data;
using Dapper;
using BarberShop.API.Entities;

namespace BarberShop.API.Repository
{
    public class ProdutoRepository
    {
        private readonly IDbConnection _connection;
        public ProdutoRepository(IDbConnection connection) => _connection = connection;

        public async Task<IEnumerable<Produto>> GetAllAsync()
        {
            const string sql = "SELECT * FROM dbo.Produtos ORDER BY Id DESC";
            return await _connection.QueryAsync<Produto>(sql);
        }

        public async Task<Produto?> GetByIdAsync(int id)
        {
            const string sql = "SELECT * FROM dbo.Produtos WHERE Id = @Id";
            return await _connection.QueryFirstOrDefaultAsync<Produto>(sql, new { Id = id });
        }

        public async Task<int> InsertAsync(Produto p)
        {
            const string sql = @"
INSERT INTO dbo.Produtos
(Descricao,UnidadeId,MarcaId,CategoriaId,CodigoBarras,Referencia,CustoCompra,PrecoVenda,LucroPercentual,Estoque,EstoqueMinimo,Ativo)
VALUES
(@Descricao,@UnidadeId,@MarcaId,@CategoriaId,@CodigoBarras,@Referencia,@CustoCompra,@PrecoVenda,@LucroPercentual,@Estoque,@EstoqueMinimo,@Ativo);
SELECT CAST(SCOPE_IDENTITY() AS INT);";

            // DataCriacao/DataAtualizacao são preenchidas pelo DEFAULT da tabela
            return await _connection.ExecuteScalarAsync<int>(sql, p);
        }

        public async Task UpdateAsync(int id, Produto p)
        {
            const string sql = @"
UPDATE dbo.Produtos
   SET Descricao=@Descricao,
       UnidadeId=@UnidadeId,
       MarcaId=@MarcaId,
       CategoriaId=@CategoriaId,
       CodigoBarras=@CodigoBarras,
       Referencia=@Referencia,
       CustoCompra=@CustoCompra,
       PrecoVenda=@PrecoVenda,
       LucroPercentual=@LucroPercentual,
       Estoque=@Estoque,
       EstoqueMinimo=@EstoqueMinimo,
       Ativo=@Ativo,
       DataAtualizacao = SYSUTCDATETIME()
 WHERE Id=@Id";

            await _connection.ExecuteAsync(sql, new
            {
                Id = id,
                p.Descricao,
                p.UnidadeId,
                p.MarcaId,
                p.CategoriaId,
                p.CodigoBarras,
                p.Referencia,
                p.CustoCompra,
                p.PrecoVenda,
                p.LucroPercentual,
                p.Estoque,
                p.EstoqueMinimo,
                p.Ativo
            });
        }

        public async Task DeleteAsync(int id)
        {
            const string sql = "DELETE FROM dbo.Produtos WHERE Id = @Id";
            await _connection.ExecuteAsync(sql, new { Id = id });
        }
    }
}
