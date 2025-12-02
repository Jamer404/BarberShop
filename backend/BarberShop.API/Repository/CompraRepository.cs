using System.Data;
using Dapper;
using BarberShop.API.Entities;

namespace BarberShop.API.Repository
{
    public class CompraRepository
    {
        private readonly IDbConnection _cnx;
        public CompraRepository(IDbConnection cnx)
        {
            _cnx = cnx;
        }

        public Task<IEnumerable<Compra>> GetAllAsync() =>
            _cnx.QueryAsync<Compra>(@"
            SELECT
                Id, FornecedorId, Modelo, Serie, Numero,
                DataEmissao, DataChegada,
                TipoFrete, ValorFrete, ValorSeguro, OutrasDespesas,
                TotalProdutos, TotalPagar,
                CondicaoPagamentoId, TransportadoraId, PlacaVeiculo,
                Observacao, DataCancelamento,
                CriadoEm, AtualizadoEm
            FROM dbo.NotaCompra WITH (NOLOCK)
            ORDER BY Id DESC;
            ");

        public Task<Compra?> GetByIdAsync(long id) =>
            _cnx.QuerySingleOrDefaultAsync<Compra>(@"
            SELECT
                Id, FornecedorId, Modelo, Serie, Numero,
                DataEmissao, DataChegada,
                TipoFrete, ValorFrete, ValorSeguro, OutrasDespesas,
                TotalProdutos, TotalPagar,
                CondicaoPagamentoId, TransportadoraId, PlacaVeiculo,
                Observacao, DataCancelamento,
                CriadoEm, AtualizadoEm
            FROM dbo.NotaCompra
            WHERE Id = @id;
", new { id });

        public async Task<long> InsertAsync(Compra c, IEnumerable<NotaCompraItem> itens)
        {
            _cnx.Open();
            using var tran = _cnx.BeginTransaction();
            try
            {
                const string sqlNota = @"
INSERT INTO dbo.NotaCompra
(
    FornecedorId, Modelo, Serie, Numero,
    DataEmissao, DataChegada,
    TipoFrete, ValorFrete, ValorSeguro, OutrasDespesas,
    TotalProdutos, TotalPagar,
    CondicaoPagamentoId, TransportadoraId, PlacaVeiculo,
    Observacao, DataCancelamento,
    CriadoEm, AtualizadoEm
)
VALUES
(
    @FornecedorId, @Modelo, @Serie, @Numero,
    @DataEmissao, @DataChegada,
    @TipoFrete, @ValorFrete, @ValorSeguro, @OutrasDespesas,
    @TotalProdutos, @TotalPagar,
    @CondicaoPagamentoId, @TransportadoraId, @PlacaVeiculo,
    @Observacao, @DataCancelamento,
    SYSUTCDATETIME(), NULL
);

SELECT CAST(SCOPE_IDENTITY() AS BIGINT);
";

                var id = await _cnx.ExecuteScalarAsync<long>(sqlNota, c, tran);

                if (itens != null)
                {
                    const string sqlItem = @"
                    INSERT INTO dbo.NotaCompraItem
                    (
                        NotaCompraId,
                        ProdutoId,
                        UnidadeId,
                        Quantidade,
                        PrecoUnit,
                        DescontoUnit,
                        LiquidoUnit,
                        Rateio,
                        CustoFinalUnit,
                        CustoFinal,
                        Total,
                        CriadoEm
                    )
                    VALUES
                    (
                        @NotaCompraId,
                        @ProdutoId,
                        @UnidadeId,
                        @Quantidade,
                        @PrecoUnit,
                        @DescontoUnit,
                        @LiquidoUnit,
                        @Rateio,
                        @CustoFinalUnit,
                        (@Total + @Rateio),
                        @Total,
                        SYSUTCDATETIME()
                    );";

                    foreach (var item in itens)
                    {
                        item.NotaCompraId = id;
                        await _cnx.ExecuteAsync(sqlItem, item, tran);
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

        public Task UpdateAsync(long id, Compra c) =>
            _cnx.ExecuteAsync(@"
            UPDATE dbo.NotaCompra SET
                DataChegada         = @DataChegada,
                TipoFrete           = @TipoFrete,
                ValorFrete          = @ValorFrete,
                ValorSeguro         = @ValorSeguro,
                OutrasDespesas      = @OutrasDespesas,
                TotalProdutos       = @TotalProdutos,
                TotalPagar          = @TotalPagar,
                CondicaoPagamentoId = @CondicaoPagamentoId,
                TransportadoraId    = @TransportadoraId,
                PlacaVeiculo        = @PlacaVeiculo,
                Observacao          = @Observacao,
                DataCancelamento    = @DataCancelamento,
                AtualizadoEm        = SYSUTCDATETIME()
            WHERE Id = @Id;
            ", new
            {
                Id = id,
                c.DataChegada,
                c.TipoFrete,
                c.ValorFrete,
                c.ValorSeguro,
                c.OutrasDespesas,
                c.TotalProdutos,
                c.TotalPagar,
                c.CondicaoPagamentoId,
                c.TransportadoraId,
                c.PlacaVeiculo,
                c.Observacao,
                c.DataCancelamento
            });

        public Task DeleteAsync(long id) =>
            _cnx.ExecuteAsync("DELETE FROM dbo.NotaCompra WHERE Id = @id;", new { id });
    }
}
