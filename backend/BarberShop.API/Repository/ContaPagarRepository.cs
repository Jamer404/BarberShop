using System.Data;
using Dapper;
using BarberShop.API.Entities;

namespace BarberShop.API.Repository
{
    public class ContaPagarRepository
    {
        private readonly IDbConnection _cnx;

        public ContaPagarRepository(IDbConnection cnx)
        {
            _cnx = cnx;
        }

        public Task<IEnumerable<ContaPagar>> GetAllAsync() =>
            _cnx.QueryAsync<ContaPagar>(@"
SELECT
    Id,
    NotaCompraId,
    FornecedorId,
    Modelo,
    Serie,
    Numero,
    NumParcela,
    ValorParcela,
    DataEmissao,
    DataVencimento,
    DataPagamento,
    ValorPago,
    Juros,
    Multa,
    Desconto,
    Status,
    FormaPagamentoId,
    Observacao,
    CriadoEm,
    AtualizadoEm
FROM dbo.ContasPagar WITH (NOLOCK)
ORDER BY DataVencimento, Id;
");

        public Task<ContaPagar?> GetByIdAsync(long id) =>
            _cnx.QuerySingleOrDefaultAsync<ContaPagar>(@"
SELECT
    Id,
    NotaCompraId,
    FornecedorId,
    Modelo,
    Serie,
    Numero,
    NumParcela,
    ValorParcela,
    DataEmissao,
    DataVencimento,
    DataPagamento,
    ValorPago,
    Juros,
    Multa,
    Desconto,
    Status,
    FormaPagamentoId,
    Observacao,
    CriadoEm,
    AtualizadoEm
FROM dbo.ContasPagar
WHERE Id = @id;
", new { id });

        public Task<long> InsertAsync(ContaPagar c) =>
            _cnx.ExecuteScalarAsync<long>(@"
INSERT INTO dbo.ContasPagar
(
    NotaCompraId,
    FornecedorId,
    Modelo,
    Serie,
    Numero,
    NumParcela,
    ValorParcela,
    DataEmissao,
    DataVencimento,
    DataPagamento,
    ValorPago,
    Juros,
    Multa,
    Desconto,
    Status,
    FormaPagamentoId,
    Observacao,
    CriadoEm,
    AtualizadoEm
)
VALUES
(
    @NotaCompraId,
    @FornecedorId,
    @Modelo,
    @Serie,
    @Numero,
    @NumParcela,
    @ValorParcela,
    @DataEmissao,
    @DataVencimento,
    @DataPagamento,
    @ValorPago,
    @Juros,
    @Multa,
    @Desconto,
    @Status,
    @FormaPagamentoId,
    @Observacao,
    SYSUTCDATETIME(),
    NULL
);

SELECT CAST(SCOPE_IDENTITY() AS BIGINT);
", c);

        public Task UpdateAsync(long id, ContaPagar c) =>
            _cnx.ExecuteAsync(@"
UPDATE dbo.ContasPagar SET
    DataVencimento   = @DataVencimento,
    DataPagamento    = @DataPagamento,
    ValorPago        = @ValorPago,
    Juros            = @Juros,
    Multa            = @Multa,
    Desconto         = @Desconto,
    Status           = @Status,
    FormaPagamentoId = @FormaPagamentoId,
    Observacao       = @Observacao,
    AtualizadoEm     = SYSUTCDATETIME()
WHERE Id = @Id;
", new
            {
                Id = id,
                c.DataVencimento,
                c.DataPagamento,
                c.ValorPago,
                c.Juros,
                c.Multa,
                c.Desconto,
                c.Status,
                c.FormaPagamentoId,
                c.Observacao
            });

        public Task DeleteAsync(long id) =>
            _cnx.ExecuteAsync(@"
DELETE FROM dbo.ContasPagar
WHERE Id = @id;
", new { id });
    }
}
