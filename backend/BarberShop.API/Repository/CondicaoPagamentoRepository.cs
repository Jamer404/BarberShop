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
                                SELECT c.*, p.*
                                FROM   CondicoesPagamento c
                                LEFT  JOIN ParcelasCondicaoPagamento p ON p.CondicaoPagamentoId = c.Id";

            var cache = new Dictionary<int, CondicaoPagamento>();

            await _cnx.QueryAsync<CondicaoPagamento, ParcelaCondicaoPagamento, CondicaoPagamento>(
                sql,
                (c, p) =>
                {
                    if (!cache.TryGetValue(c.Id, out var cond))
                    {
                        cond = c;
                        cond.Parcelas = new List<ParcelaCondicaoPagamento>();
                        cache.Add(cond.Id, cond);
                    }
                    if (p != null) cond.Parcelas.Add(p);
                    return cond;
                });

            return cache.Values;
        }

        public async Task<CondicaoPagamento?> GetByIdAsync(int id) =>
            (await GetAllAsync()).FirstOrDefault(x => x.Id == id);

        public async Task<int> InsertAsync(CondicaoPagamento c)
        {
            using var tran = _cnx.BeginTransaction();

            const string sqlHeader = @"
                                        INSERT INTO CondicoesPagamento (Descricao, TaxaJuros, Multa, Desconto, DataCriacao, DataAtualizacao)
                                        VALUES (@Descricao, @TaxaJuros, @Multa, @Desconto, GETDATE(), GETDATE());
                                        SELECT CAST(SCOPE_IDENTITY() AS INT);";

            var id = await _cnx.ExecuteScalarAsync<int>(sqlHeader, c, tran);

            if (c.Parcelas.Any())
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

        public async Task UpdateAsync(int id, CondicaoPagamento c)
        {
            using var tran = _cnx.BeginTransaction();

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

            if (c.Parcelas.Any())
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

        public Task DeleteAsync(int id) =>
            _cnx.ExecuteAsync(@"
                                DELETE FROM ParcelasCondicaoPagamento WHERE CondicaoPagamentoId = @Id;
                                DELETE FROM CondicoesPagamento     WHERE Id = @Id;", new { Id = id });
    }
}
