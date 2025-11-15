using System.Data;
using Dapper;
using Microsoft.Data.SqlClient;
using Api.Models.NotaCompra;

public class NotaCompraRepository
{
    private readonly IDbConnection _conn;
    public NotaCompraRepository(IDbConnection conn) { _conn = conn; }

    public async Task<long> InsertAsync(CreateNotaCompraDto dto)
    {
        using var tx = _conn.BeginTransaction();
        try
        {
            var sql = @"
INSERT INTO dbo.NotaCompra
(Modelo, Serie, Numero, FornecedorId, DataEmissao, DataChegada, TipoFrete,
 ValorFrete, ValorSeguro, OutrasDespesas, TotalProdutos, TotalPagar,
 CondicaoPagamentoId, TransportadoraId, PlacaVeiculo, Observacao)
VALUES
(@Modelo, @Serie, @Numero, @FornecedorId, @DataEmissao, @DataChegada, @TipoFrete,
 @ValorFrete, @ValorSeguro, @OutrasDespesas, @TotalProdutos, @TotalPagar,
 @CondicaoPagamentoId, @TransportadoraId, @PlacaVeiculo, @Observacao);
SELECT CAST(SCOPE_IDENTITY() AS BIGINT);";

            var notaId = await _conn.ExecuteScalarAsync<long>(sql, dto, tx);

            const string sqlItem = @"
INSERT INTO dbo.NotaCompraItem
(NotaCompraId, ProdutoId, UnidadeId, Quantidade, PrecoUnit, DescontoUnit, LiquidoUnit,
 Total, Rateio, CustoFinalUnit, CustoFinal)
VALUES
(@NotaCompraId, @ProdutoId, @UnidadeId, @Quantidade, @PrecoUnit, @DescontoUnit, @LiquidoUnit,
 @Total, @Rateio, @CustoFinalUnit, @CustoFinal);";

            foreach (var it in dto.Itens)
            {
                var p = new
                {
                    NotaCompraId = notaId,
                    it.ProdutoId,
                    it.UnidadeId,
                    it.Quantidade,
                    it.PrecoUnit,
                    it.DescontoUnit,
                    it.LiquidoUnit,
                    it.Total,
                    it.Rateio,
                    it.CustoFinalUnit,
                    it.CustoFinal
                };
                await _conn.ExecuteAsync(sqlItem, p, tx);
            }

            const string sqlParcela = @"
INSERT INTO dbo.NotaCompraParcela
(NotaCompraId, Numero, FormaPagamentoId, DataVencimento, ValorParcela)
VALUES
(@NotaCompraId, @Numero, @FormaPagamentoId, @DataVencimento, @ValorParcela);";

            foreach (var par in dto.Parcelas)
            {
                var p = new
                {
                    NotaCompraId = notaId,
                    par.Numero,
                    par.FormaPagamentoId,
                    par.DataVencimento,
                    par.ValorParcela
                };
                await _conn.ExecuteAsync(sqlParcela, p, tx);
            }

            tx.Commit();
            return notaId;
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    public async Task<NotaCompraView?> GetByIdAsync(long id)
    {
        var nota = await _conn.QueryFirstOrDefaultAsync<NotaCompraView>(
            "SELECT * FROM dbo.NotaCompra WHERE Id=@id", new { id });
        if (nota is null) return null;

        var itens = await _conn.QueryAsync<NotaCompraItemView>(
            "SELECT * FROM dbo.NotaCompraItem WHERE NotaCompraId=@id ORDER BY Id", new { id });
        var parcelas = await _conn.QueryAsync<NotaCompraParcelaView>(
            "SELECT * FROM dbo.NotaCompraParcela WHERE NotaCompraId=@id ORDER BY Numero", new { id });

        nota.Itens = itens.ToList();
        nota.Parcelas = parcelas.ToList();
        return nota;
    }

    public async Task UpdateAsync(long id, UpdateNotaCompraDto dto)
    {
        using var tx = _conn.BeginTransaction();
        try
        {
            var sql = @"
UPDATE dbo.NotaCompra SET
 Modelo=@Modelo, Serie=@Serie, Numero=@Numero, FornecedorId=@FornecedorId,
 DataEmissao=@DataEmissao, DataChegada=@DataChegada, TipoFrete=@TipoFrete,
 ValorFrete=@ValorFrete, ValorSeguro=@ValorSeguro, OutrasDespesas=@OutrasDespesas,
 TotalProdutos=@TotalProdutos, TotalPagar=@TotalPagar,
 CondicaoPagamentoId=@CondicaoPagamentoId, TransportadoraId=@TransportadoraId,
 PlacaVeiculo=@PlacaVeiculo, Observacao=@Observacao, AtualizadoEm=SYSDATETIME()
WHERE Id=@Id;";

            await _conn.ExecuteAsync(sql, new
            {
                Id = id,
                dto.Modelo,
                dto.Serie,
                dto.Numero,
                dto.FornecedorId,
                dto.DataEmissao,
                dto.DataChegada,
                dto.TipoFrete,
                dto.ValorFrete,
                dto.ValorSeguro,
                dto.OutrasDespesas,
                dto.TotalProdutos,
                dto.TotalPagar,
                dto.CondicaoPagamentoId,
                dto.TransportadoraId,
                dto.PlacaVeiculo,
                dto.Observacao
            }, tx);

            // Estratégia simples: remove e re-insere itens e parcelas
            await _conn.ExecuteAsync("DELETE FROM dbo.NotaCompraItem WHERE NotaCompraId=@Id", new { Id = id }, tx);
            await _conn.ExecuteAsync("DELETE FROM dbo.NotaCompraParcela WHERE NotaCompraId=@Id", new { Id = id }, tx);

            const string sqlItem = @"
INSERT INTO dbo.NotaCompraItem
(NotaCompraId, ProdutoId, UnidadeId, Quantidade, PrecoUnit, DescontoUnit, LiquidoUnit,
 Total, Rateio, CustoFinalUnit, CustoFinal)
VALUES
(@NotaCompraId, @ProdutoId, @UnidadeId, @Quantidade, @PrecoUnit, @DescontoUnit, @LiquidoUnit,
 @Total, @Rateio, @CustoFinalUnit, @CustoFinal);";

            foreach (var it in dto.Itens)
            {
                await _conn.ExecuteAsync(sqlItem, new
                {
                    NotaCompraId = id,
                    it.ProdutoId,
                    it.UnidadeId,
                    it.Quantidade,
                    it.PrecoUnit,
                    it.DescontoUnit,
                    it.LiquidoUnit,
                    it.Total,
                    it.Rateio,
                    it.CustoFinalUnit,
                    it.CustoFinal
                }, tx);
            }

            const string sqlParcela = @"
INSERT INTO dbo.NotaCompraParcela
(NotaCompraId, Numero, FormaPagamentoId, DataVencimento, ValorParcela)
VALUES
(@NotaCompraId, @Numero, @FormaPagamentoId, @DataVencimento, @ValorParcela);";

            foreach (var par in dto.Parcelas)
            {
                await _conn.ExecuteAsync(sqlParcela, new
                {
                    NotaCompraId = id,
                    par.Numero,
                    par.FormaPagamentoId,
                    par.DataVencimento,
                    par.ValorParcela
                }, tx);
            }

            tx.Commit();
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    public Task<int> DeleteAsync(long id) =>
        _conn.ExecuteAsync("DELETE FROM dbo.NotaCompra WHERE Id=@id", new { id });
}
