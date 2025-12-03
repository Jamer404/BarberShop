using System.Data;
using Dapper;
using BarberShop.API.Entities;

namespace BarberShop.API.Repository
{
    public class VendaRepository
    {
        private readonly IDbConnection _cnx;

        public VendaRepository(IDbConnection cnx)
        {
            _cnx = cnx;
        }

        public Task<IEnumerable<Venda>> GetAllAsync() =>
            _cnx.QueryAsync<Venda>(@"
SELECT
    NumeroNota,
    Modelo,
    Serie,
    ClienteId,
    DataEmissao,
    TransportadoraId,
    PlacaVeiculo,
    TipoFrete,
    ValorFrete,
    TotalProdutos,
    TotalPagar,
    CondicaoPagamentoId,
    Observacao,
    DataCancelamento,
    CriadoEm,
    AtualizadoEm
FROM dbo.NotaVenda WITH (NOLOCK)
ORDER BY DataEmissao DESC, NumeroNota;");

        public Task<Venda?> GetByIdAsync(string numeroNota, string modelo, string serie, int clienteId) =>
            _cnx.QuerySingleOrDefaultAsync<Venda>(@"
SELECT
    NumeroNota,
    Modelo,
    Serie,
    ClienteId,
    DataEmissao,
    TransportadoraId,
    PlacaVeiculo,
    TipoFrete,
    ValorFrete,
    TotalProdutos,
    TotalPagar,
    CondicaoPagamentoId,
    Observacao,
    DataCancelamento,
    CriadoEm,
    AtualizadoEm
FROM dbo.NotaVenda
WHERE NumeroNota = @NumeroNota
  AND Modelo     = @Modelo
  AND Serie      = @Serie
  AND ClienteId  = @ClienteId;",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId });

        public async Task InsertAsync(Venda venda, IEnumerable<VendaProduto> itens)
        {
            using var tx = _cnx.BeginTransaction();

            const string sqlHeader = @"
INSERT INTO dbo.NotaVenda
(
    NumeroNota,
    Modelo,
    Serie,
    ClienteId,
    DataEmissao,
    TransportadoraId,
    PlacaVeiculo,
    TipoFrete,
    ValorFrete,
    TotalProdutos,
    TotalPagar,
    CondicaoPagamentoId,
    Observacao,
    DataCancelamento,
    CriadoEm,
    AtualizadoEm
)
VALUES
(
    @NumeroNota,
    @Modelo,
    @Serie,
    @ClienteId,
    @DataEmissao,
    @TransportadoraId,
    @PlacaVeiculo,
    @TipoFrete,
    @ValorFrete,
    @TotalProdutos,
    @TotalPagar,
    @CondicaoPagamentoId,
    @Observacao,
    @DataCancelamento,
    SYSUTCDATETIME(),
    NULL
);";

            await _cnx.ExecuteAsync(sqlHeader, venda, tx);

            const string sqlItem = @"
INSERT INTO dbo.NotaVendaProduto
(
    NumeroNota,
    Modelo,
    Serie,
    ClienteId,
    ProdutoId,
    Quantidade,
    PrecoUnit,
    Desconto,
    CriadoEm,
    AtualizadoEm
)
VALUES
(
    @NumeroNota,
    @Modelo,
    @Serie,
    @ClienteId,
    @ProdutoId,
    @Quantidade,
    @PrecoUnit,
    @Desconto,
    SYSUTCDATETIME(),
    NULL
);";

            foreach (var item in itens)
            {
                await _cnx.ExecuteAsync(sqlItem, item, tx);
            }

            tx.Commit();
        }

        public Task UpdateAsync(Venda v) =>
            _cnx.ExecuteAsync(@"
UPDATE dbo.NotaVenda SET
    DataEmissao        = @DataEmissao,
    TransportadoraId   = @TransportadoraId,
    PlacaVeiculo       = @PlacaVeiculo,
    TipoFrete          = @TipoFrete,
    ValorFrete         = @ValorFrete,
    TotalProdutos      = @TotalProdutos,
    TotalPagar         = @TotalPagar,
    CondicaoPagamentoId = @CondicaoPagamentoId,
    Observacao         = @Observacao,
    DataCancelamento   = @DataCancelamento,
    AtualizadoEm       = SYSUTCDATETIME()
WHERE NumeroNota = @NumeroNota
  AND Modelo     = @Modelo
  AND Serie      = @Serie
  AND ClienteId  = @ClienteId;",
            v);

        public Task DeleteAsync(string numeroNota, string modelo, string serie, int clienteId) =>
            _cnx.ExecuteAsync(@"
DELETE FROM dbo.NotaVenda
WHERE NumeroNota = @NumeroNota
  AND Modelo     = @Modelo
  AND Serie      = @Serie
  AND ClienteId  = @ClienteId;",
            new { NumeroNota = numeroNota, Modelo = modelo, Serie = serie, ClienteId = clienteId });
    }
}
