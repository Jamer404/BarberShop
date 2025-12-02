using System.Data;
using Dapper;
using BarberShop.API.Entities;

namespace BarberShop.API.Repository
{
    public class NotaCompraItemRepository
    {
        private readonly IDbConnection _cnx;

        public NotaCompraItemRepository(IDbConnection cnx)
        {
            _cnx = cnx;
        }

        public Task<IEnumerable<NotaCompraItem>> GetByNotaAsync(long notaCompraId) =>
            _cnx.QueryAsync<NotaCompraItem>(@"
            SELECT
                Id,
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
            FROM dbo.NotaCompraItem WITH (NOLOCK)
            WHERE NotaCompraId = @notaCompraId
            ORDER BY Id;",
                new { notaCompraId });


        public Task<NotaCompraItem?> GetByIdAsync(long id) =>
            _cnx.QuerySingleOrDefaultAsync<NotaCompraItem>(@"
            SELECT
                Id,
                NotaCompraId,
                ProdutoId,
                UnidadeId,
                Quantidade,
                PrecoUnit,
                DescontoUnit,
                LiquidoUnit,
                Rateio,
                CustoFinalUnit,
                Total,
                CriadoEm
            FROM dbo.NotaCompraItem
            WHERE Id = @id;",
                        new { id });

        public Task<long> InsertAsync(NotaCompraItem item) =>
     _cnx.ExecuteScalarAsync<long>(@"
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
        );

        SELECT CAST(SCOPE_IDENTITY() AS BIGINT);",
         item);

        public Task UpdateAsync(long id, NotaCompraItem item) =>
            _cnx.ExecuteAsync(@"
UPDATE dbo.NotaCompraItem SET
    ProdutoId      = @ProdutoId,
    UnidadeId      = @UnidadeId,
    Quantidade     = @Quantidade,
    PrecoUnit      = @PrecoUnit,
    DescontoUnit   = @DescontoUnit,
    LiquidoUnit    = @LiquidoUnit,
    Rateio         = @Rateio,
    CustoFinalUnit = @CustoFinalUnit,
    Total          = @Total,
    AtualizadoEm   = SYSUTCDATETIME()
WHERE Id = @Id;",
            new
            {
                Id = id,
                item.ProdutoId,
                item.UnidadeId,
                item.Quantidade,
                item.PrecoUnit,
                item.DescontoUnit,
                item.LiquidoUnit,
                item.Rateio,
                item.CustoFinalUnit,
                item.Total
            });

        public Task DeleteAsync(long id) =>
            _cnx.ExecuteAsync("DELETE FROM dbo.NotaCompraItem WHERE Id = @id;", new { id });
    }
}
