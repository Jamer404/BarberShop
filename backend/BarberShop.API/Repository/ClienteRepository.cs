using System.Data;
using Dapper;
using BarberShop.API.Entities;

namespace BarberShop.API.Repository
{
    public class ClienteRepository
    {
        private readonly IDbConnection _connection;

        public ClienteRepository(IDbConnection connection) =>
            _connection = connection;

        public async Task<IEnumerable<Cliente>> GetAllAsync()
        {
            const string sql = "SELECT * FROM Clientes";
            return await _connection.QueryAsync<Cliente>(sql);
        }

        public async Task<Cliente?> GetByIdAsync(int id)
        {
            const string sql = "SELECT * FROM Clientes WHERE Id = @Id";
            return await _connection.QueryFirstOrDefaultAsync<Cliente>(sql, new { Id = id });
        }

        public async Task<int> InsertAsync(Cliente cliente)
        {
            const string sql = @"
                                INSERT INTO Clientes
                                ( TipoPessoa, NomeRazaoSocial, ApelidoNomeFantasia, DataNascimentoCriacao,
                                  CpfCnpj, RgInscricaoEstadual, Email, Telefone,
                                  Rua, Numero, Bairro, Cep, Classificacao, Complemento,
                                  Pf, Sexo, IdCidade, IdCondicaoPagamento, LimiteCredito,
                                  DataCriacao, DataAtualizacao, Ativo )
                                VALUES
                                ( @TipoPessoa, @NomeRazaoSocial, @ApelidoNomeFantasia, @DataNascimentoCriacao,
                                  @CpfCnpj, @RgInscricaoEstadual, @Email, @Telefone,
                                  @Rua, @Numero, @Bairro, @Cep, @Classificacao, @Complemento,
                                  @Pf, @Sexo, @IdCidade, @IdCondicaoPagamento, @LimiteCredito,
                                  @DataCriacao, @DataAtualizacao, @Ativo );

                                SELECT CAST(SCOPE_IDENTITY() AS int);";

            cliente.DataCriacao = cliente.DataAtualizacao = DateTime.UtcNow;
            return await _connection.ExecuteScalarAsync<int>(sql, cliente);
        }

        public async Task<bool> UpdateAsync(Cliente cliente)
        {
            const string sql = @"
                                UPDATE Clientes SET
                                  TipoPessoa            = @TipoPessoa,
                                  NomeRazaoSocial       = @NomeRazaoSocial,
                                  ApelidoNomeFantasia   = @ApelidoNomeFantasia,
                                  DataNascimentoCriacao = @DataNascimentoCriacao,
                                  CpfCnpj               = @CpfCnpj,
                                  RgInscricaoEstadual   = @RgInscricaoEstadual,
                                  Email                 = @Email,
                                  Telefone              = @Telefone,
                                  Rua                   = @Rua,
                                  Numero                = @Numero,
                                  Bairro                = @Bairro,
                                  Cep                   = @Cep,
                                  Classificacao         = @Classificacao,
                                  Complemento           = @Complemento,
                                  Pf                    = @Pf,
                                  Sexo                  = @Sexo,
                                  IdCidade              = @IdCidade,
                                  IdCondicaoPagamento   = @IdCondicaoPagamento,
                                  LimiteCredito         = @LimiteCredito,
                                  DataAtualizacao       = @DataAtualizacao,
                                  Ativo                 = @Ativo
                                WHERE Id = @Id;";

            cliente.DataAtualizacao = DateTime.UtcNow;
            var affected = await _connection.ExecuteAsync(sql, cliente);
            return affected > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            const string sql = "DELETE FROM Clientes WHERE Id = @Id";
            var affected = await _connection.ExecuteAsync(sql, new { Id = id });
            return affected > 0;
        }
    }
}
