using System.Data;
using Dapper;
using BarberShop.API.Entities;

namespace BarberShop.API.Repository
{
    public class TransportadoraRepository
    {
        private readonly IDbConnection _conn;
        public TransportadoraRepository(IDbConnection conn) => _conn = conn;

        public async Task<IEnumerable<Transportadora>> GetAllAsync()
        {
            const string sql = @"
SELECT
    Id, TipoPessoa, RazaoSocial, NomeFantasia, Endereco, Numero, Complemento, Bairro, Cep,
    IdCidade, Cnpj, InscricaoEstadual, IdCondicaoPagamento, Ativo, DataCriacao, DataAtualizacao
FROM dbo.Transportadoras
ORDER BY Id DESC;";
            return await _conn.QueryAsync<Transportadora>(sql);
        }

        public async Task<Transportadora?> GetByIdAsync(int id)
        {
            const string baseSql = @"
SELECT
    Id, TipoPessoa, RazaoSocial, NomeFantasia, Endereco, Numero, Complemento, Bairro, Cep,
    IdCidade, Cnpj, InscricaoEstadual, IdCondicaoPagamento, Ativo, DataCriacao, DataAtualizacao
FROM dbo.Transportadoras
WHERE Id = @Id;";

            var t = await _conn.QueryFirstOrDefaultAsync<Transportadora>(baseSql, new { Id = id });
            if (t is null) return null;

            var emails = await _conn.QueryAsync<string>(
                "SELECT Email FROM dbo.TransportadoraEmails WHERE TransportadoraId = @Id ORDER BY Id",
                new { Id = id });

            var tels = await _conn.QueryAsync<string>(
                "SELECT Telefone FROM dbo.TransportadoraTelefones WHERE TransportadoraId = @Id ORDER BY Id",
                new { Id = id });

            var veics = await _conn.QueryAsync<int>(
                "SELECT VeiculoId FROM dbo.TransportadoraVeiculos WHERE TransportadoraId = @Id ORDER BY VeiculoId",
                new { Id = id });

            t.Emails = emails.ToList();
            t.Telefones = tels.ToList();
            t.VeiculoIds = veics.ToList();
            return t;
        }

        public async Task<int> InsertAsync(Transportadora t)
        {
            if (_conn.State != ConnectionState.Open) _conn.Open();
            using var tx = _conn.BeginTransaction();
            try
            {
                const string insertSql = @"
INSERT INTO dbo.Transportadoras
(TipoPessoa, RazaoSocial, NomeFantasia, Endereco, Numero, Complemento, Bairro, Cep,
 IdCidade, Cnpj, InscricaoEstadual, IdCondicaoPagamento, Ativo, DataCriacao, DataAtualizacao)
VALUES
(@TipoPessoa, @RazaoSocial, @NomeFantasia, @Endereco, @Numero, @Complemento, @Bairro, @Cep,
 @IdCidade, @Cnpj, @InscricaoEstadual, @IdCondicaoPagamento, @Ativo, SYSDATETIME(), SYSDATETIME());
SELECT CAST(SCOPE_IDENTITY() AS INT);";

                var id = await _conn.ExecuteScalarAsync<int>(insertSql, t, tx);

                if (t.Emails?.Count > 0)
                {
                    const string sqlE = @"INSERT INTO dbo.TransportadoraEmails (TransportadoraId, Email)
                                          VALUES (@TransportadoraId, @Email);";
                    var rows = t.Emails.Select(e => new { TransportadoraId = id, Email = e });
                    await _conn.ExecuteAsync(sqlE, rows, tx);
                }

                if (t.Telefones?.Count > 0)
                {
                    const string sqlT = @"INSERT INTO dbo.TransportadoraTelefones (TransportadoraId, Telefone)
                                          VALUES (@TransportadoraId, @Telefone);";
                    var rows = t.Telefones.Select(f => new { TransportadoraId = id, Telefone = f });
                    await _conn.ExecuteAsync(sqlT, rows, tx);
                }

                if (t.VeiculoIds?.Count > 0)
                {
                    const string sqlV = @"INSERT INTO dbo.TransportadoraVeiculos (TransportadoraId, VeiculoId)
                                          VALUES (@TransportadoraId, @VeiculoId);";
                    var rows = t.VeiculoIds.Select(v => new { TransportadoraId = id, VeiculoId = v });
                    await _conn.ExecuteAsync(sqlV, rows, tx);
                }

                tx.Commit();
                return id;
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }

        public async Task UpdateAsync(int id, Transportadora t)
        {
            if (_conn.State != ConnectionState.Open) _conn.Open();
            using var tx = _conn.BeginTransaction();
            try
            {
                const string updSql = @"
UPDATE dbo.Transportadoras SET
    TipoPessoa          = @TipoPessoa,
    RazaoSocial         = @RazaoSocial,
    NomeFantasia        = @NomeFantasia,
    Endereco            = @Endereco,
    Numero              = @Numero,
    Complemento         = @Complemento,
    Bairro              = @Bairro,
    Cep                 = @Cep,
    IdCidade            = @IdCidade,
    Cnpj                = @Cnpj,
    InscricaoEstadual   = @InscricaoEstadual,
    IdCondicaoPagamento = @IdCondicaoPagamento,
    Ativo               = @Ativo,
    DataAtualizacao     = SYSDATETIME()
WHERE Id = @Id;";

                await _conn.ExecuteAsync(updSql, new
                {
                    Id = id,
                    t.TipoPessoa,
                    t.RazaoSocial,
                    t.NomeFantasia,
                    t.Endereco,
                    t.Numero,
                    t.Complemento,
                    t.Bairro,
                    t.Cep,
                    t.IdCidade,
                    t.Cnpj,
                    t.InscricaoEstadual,
                    t.IdCondicaoPagamento,
                    t.Ativo
                }, tx);

                await _conn.ExecuteAsync("DELETE FROM dbo.TransportadoraEmails WHERE TransportadoraId = @Id", new { Id = id }, tx);
                await _conn.ExecuteAsync("DELETE FROM dbo.TransportadoraTelefones WHERE TransportadoraId = @Id", new { Id = id }, tx);
                await _conn.ExecuteAsync("DELETE FROM dbo.TransportadoraVeiculos WHERE TransportadoraId = @Id", new { Id = id }, tx);

                if (t.Emails?.Count > 0)
                {
                    const string sqlE = @"INSERT INTO dbo.TransportadoraEmails (TransportadoraId, Email)
                                          VALUES (@TransportadoraId, @Email);";
                    var rows = t.Emails.Select(e => new { TransportadoraId = id, Email = e });
                    await _conn.ExecuteAsync(sqlE, rows, tx);
                }

                if (t.Telefones?.Count > 0)
                {
                    const string sqlT = @"INSERT INTO dbo.TransportadoraTelefones (TransportadoraId, Telefone)
                                          VALUES (@TransportadoraId, @Telefone);";
                    var rows = t.Telefones.Select(f => new { TransportadoraId = id, Telefone = f });
                    await _conn.ExecuteAsync(sqlT, rows, tx);
                }

                if (t.VeiculoIds?.Count > 0)
                {
                    const string sqlV = @"INSERT INTO dbo.TransportadoraVeiculos (TransportadoraId, VeiculoId)
                                          VALUES (@TransportadoraId, @VeiculoId);";
                    var rows = t.VeiculoIds.Select(v => new { TransportadoraId = id, VeiculoId = v });
                    await _conn.ExecuteAsync(sqlV, rows, tx);
                }

                tx.Commit();
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }

        public async Task DeleteAsync(int id)
        {
            if (_conn.State != ConnectionState.Open) _conn.Open();
            using var tx = _conn.BeginTransaction();
            try
            {
                await _conn.ExecuteAsync("DELETE FROM dbo.TransportadoraVeiculos WHERE TransportadoraId = @Id", new { Id = id }, tx);
                await _conn.ExecuteAsync("DELETE FROM dbo.TransportadoraTelefones WHERE TransportadoraId = @Id", new { Id = id }, tx);
                await _conn.ExecuteAsync("DELETE FROM dbo.TransportadoraEmails   WHERE TransportadoraId = @Id", new { Id = id }, tx);

                await _conn.ExecuteAsync("DELETE FROM dbo.Transportadoras WHERE Id = @Id", new { Id = id }, tx);
                tx.Commit();
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }
    }
}
