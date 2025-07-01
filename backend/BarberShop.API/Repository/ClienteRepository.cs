using System.Data;
using Dapper;
using BarberShop.API.Entities;

namespace BarberShop.API.Repository
{
    public class ClienteRepository
    {
        private readonly IDbConnection _connection;

        public ClienteRepository(IDbConnection connection)
        {
            _connection = connection;
        }

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
                INSERT INTO Clientes (
                    NomeRazaoSocial, ApelidoNomeFantasia, CpfCnpj, RgInscricaoEstadual,
                    TipoPessoa, Classificacao, PF, Sexo, DataNascimento,
                    Email, Telefone, Rua, Numero, Complemento, Bairro, Cep, 
                    IdCidade, IdCondicaoPagamento, LimiteCredito, Ativo, 
                    DataCriacao, DataAtualizacao
                ) VALUES (
                    @NomeRazaoSocial, @ApelidoNomeFantasia, @CpfCnpj, @RgInscricaoEstadual,
                    @TipoPessoa, @Classificacao, @PF, @Sexo, @DataNascimento, 
                    @Email, @Telefone, @Rua, @Numero, @Complemento, @Bairro, @Cep,
                    @IdCidade, @IdCondicaoPagamento, @LimiteCredito, @Ativo,
                    GETDATE(), GETDATE()
                );
                SELECT CAST(SCOPE_IDENTITY() AS int);";

            return await _connection.ExecuteScalarAsync<int>(sql, cliente);
        }

        public async Task<bool> UpdateAsync(Cliente cliente)
        {
            const string sql = @"
                UPDATE Clientes SET
                    NomeRazaoSocial     = @NomeRazaoSocial,
                    ApelidoNomeFantasia = @ApelidoNomeFantasia,
                    CpfCnpj             = @CpfCnpj,
                    RgInscricaoEstadual = @RgInscricaoEstadual,
                    TipoPessoa          = @TipoPessoa,
                    Classificacao       = @Classificacao,
                    PF                  = @PF,
                    Sexo                = @Sexo,
                    DataNascimento      = @DataNascimento,
                    Email               = @Email,
                    Telefone            = @Telefone,
                    Rua                 = @Rua,
                    Numero              = @Numero,
                    Bairro              = @Bairro,
                    Cep                 = @Cep,
                    Complemento         = @Complemento,
                    IdCidade            = @IdCidade,
                    IdCondicaoPagamento = @IdCondicaoPagamento,
                    LimiteCredito       = @LimiteCredito,
                    Ativo               = @Ativo,
                    DataAtualizacao     = GETDATE()
                WHERE Id = @Id;";

            var affectedRows = await _connection.ExecuteAsync(sql, cliente);
            return affectedRows > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            const string sql = "DELETE FROM Clientes WHERE Id = @Id";
            var affectedRows = await _connection.ExecuteAsync(sql, new { Id = id });
            return affectedRows > 0;
        }
    }
}