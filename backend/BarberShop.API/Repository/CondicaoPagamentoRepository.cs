using System.Data;
using Dapper;
using BarberShop.API.Entities;

namespace BarberShop.API.Repository
{
    public class CondicaoPagamentoRepository
    {
        private readonly IDbConnection _cnx;
        public CondicaoPagamentoRepository(IDbConnection cnx) => _cnx = cnx;

        public async Task<IEnumerable<CondicaoPagamento>> GetAllAsync()
        {
            const string sql = @"
                SELECT c.*, p.*, f.*
                FROM CondicoesPagamento c
                LEFT JOIN ParcelasCondicaoPagamento p ON p.CondicaoPagamentoId = c.Id
                LEFT JOIN FormasPagamento f ON p.FormaPagamentoId = f.Id";

            var cache = new Dictionary<int, CondicaoPagamento>();

            await _cnx.QueryAsync<CondicaoPagamento, ParcelaCondicaoPagamento, FormaPagamento, CondicaoPagamento>(
                sql,
                (condicao, parcela, forma) =>
                {
                    if (!cache.TryGetValue(condicao.Id, out var cond))
                    {
                        cond = condicao;
                        cond.Parcelas = new List<ParcelaCondicaoPagamento>();
                        cache.Add(cond.Id, cond);
                    }
                    if (parcela != null)
                    {
                        parcela.FormaPagamento = forma;
                        cond.Parcelas.Add(parcela);
                    }
                    return cond;
                });

            return cache.Values;
        }

        public async Task<CondicaoPagamento?> GetByIdAsync(int id)
        {
            return (await GetAllAsync()).FirstOrDefault(x => x.Id == id);
        }

        public async Task<int> InsertAsync(CondicaoPagamento c)
        {
            _cnx.Open();
            using var tran = _cnx.BeginTransaction();
            try
            {
                const string sqlHeader = @"
                    INSERT INTO CondicoesPagamento (Descricao, TaxaJuros, Multa, Desconto, DataCriacao, DataAtualizacao)
                    VALUES (@Descricao, @TaxaJuros, @Multa, @Desconto, GETDATE(), GETDATE());
                    SELECT CAST(SCOPE_IDENTITY() AS INT);";

                var id = await _cnx.ExecuteScalarAsync<int>(sqlHeader, c, tran);

                if (c.Parcelas != null && c.Parcelas.Any())
                {
                    const string sqlParcela = @"
                        INSERT INTO ParcelasCondicaoPagamento
                        (Numero, Dias, Percentual, FormaPagamentoId, CondicaoPagamentoId, DataCriacao, DataAtualizacao)
                        VALUES (@Numero, @Dias, @Percentual, @FormaPagamentoId, @CondicaoPagamentoId, GETDATE(), GETDATE());";

                    foreach (var p in c.Parcelas)
                    {
                        p.CondicaoPagamentoId = id;
                        await _cnx.ExecuteAsync(sqlParcela, p, tran);
                    }
                }

                tran.Commit();
                return id;
            }
            catch
            {
                tran.Rollback();
                throw;
            }
        }

        public async Task UpdateAsync(int id, CondicaoPagamento c)
        {
            _cnx.Open();
            using var tran = _cnx.BeginTransaction();
            try
            {
                await _cnx.ExecuteAsync(@"
                    UPDATE CondicoesPagamento SET
                        Descricao       = @Descricao,
                        TaxaJuros       = @TaxaJuros,
                        Multa           = @Multa,
                        Desconto        = @Desconto,
                        DataAtualizacao = GETDATE()
                    WHERE Id = @Id;",
                new { Id = id, c.Descricao, c.TaxaJuros, c.Multa, c.Desconto }, tran);

                await _cnx.ExecuteAsync("DELETE FROM ParcelasCondicaoPagamento WHERE CondicaoPagamentoId = @Id", new { Id = id }, tran);

                if (c.Parcelas != null && c.Parcelas.Any())
                {
                    const string sqlParc = @"
                        INSERT INTO ParcelasCondicaoPagamento
                        (Numero, Dias, Percentual, FormaPagamentoId, CondicaoPagamentoId, DataCriacao, DataAtualizacao)
                        VALUES (@Numero, @Dias, @Percentual, @FormaPagamentoId, @CondicaoPagamentoId, GETDATE(), GETDATE());";

                    foreach (var p in c.Parcelas)
                    {
                        p.CondicaoPagamentoId = id;
                        await _cnx.ExecuteAsync(sqlParc, p, tran);
                    }
                }

                tran.Commit();
            }
            catch
            {
                tran.Rollback();
                throw;
            }
        }

        public Task DeleteAsync(int id) =>
            _cnx.ExecuteAsync(@"
                DELETE FROM ParcelasCondicaoPagamento WHERE CondicaoPagamentoId = @Id;
                DELETE FROM CondicoesPagamento      WHERE Id = @Id;", new { Id = id });
    }
}