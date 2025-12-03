using System.Data;
using Dapper;
using BarberShop.API.Entities;

namespace BarberShop.API.Repository
{
    public class FornecedorRepository
    {
        private readonly IDbConnection _cnx;
        public FornecedorRepository(IDbConnection cnx)
        {
            _cnx = cnx;
        }

        public Task<IEnumerable<Fornecedor>> GetAllAsync() =>
            _cnx.QueryAsync<Fornecedor>(@"
                                        SELECT 
                                          Id,
                                          DataCriacao,
                                          DataAtualizacao,
                                          TipoPessoa,
                                          NomeRazaoSocial,
                                          ApelidoNomeFantasia,
                                          DataNascimentoCriacao,
                                          CpfCnpj,
                                          RgInscricaoEstadual,
                                          Email,
                                          Telefone,
                                          Rua,
                                          Numero,
                                          Bairro,
                                          Cep,
                                          Complemento,
                                          CondicaoPagamentoId,
                                          IdCidade
                                        FROM dbo.Fornecedores WITH (NOLOCK)
                                        ORDER BY Id DESC;");

        public Task<Fornecedor?> GetByIdAsync(int id) =>
            _cnx.QuerySingleOrDefaultAsync<Fornecedor>(@"
SELECT 
  Id,
  DataCriacao,
  DataAtualizacao,
  TipoPessoa,
  NomeRazaoSocial,
  ApelidoNomeFantasia,
  DataNascimentoCriacao,
  CpfCnpj,
  RgInscricaoEstadual,
  Email,
  Telefone,
  Rua,
  Numero,
  Bairro,
  Cep,
  Complemento,
  CondicaoPagamentoId,
  IdCidade
FROM dbo.Fornecedores
WHERE Id = @id;",
            new { id });

        public Task<int> InsertAsync(Fornecedor f) =>
            _cnx.ExecuteScalarAsync<int>(@"
INSERT INTO dbo.Fornecedores
(
  DataCriacao,
  DataAtualizacao,
  TipoPessoa,
  NomeRazaoSocial,
  ApelidoNomeFantasia,
  DataNascimentoCriacao,
  CpfCnpj,
  RgInscricaoEstadual,
  Email,
  Telefone,
  Rua,
  Numero,
  Bairro,
  Cep,
  Complemento,
  CondicaoPagamentoId,
  IdCidade
)
VALUES
(
  @DataCriacao,
  @DataAtualizacao,
  @TipoPessoa,
  @NomeRazaoSocial,
  @ApelidoNomeFantasia,
  @DataNascimentoCriacao,
  @CpfCnpj,
  @RgInscricaoEstadual,
  @Email,
  @Telefone,
  @Rua,
  @Numero,
  @Bairro,
  @Cep,
  @Complemento,
  @CondicaoPagamentoId,
  @IdCidade
);
SELECT CAST(SCOPE_IDENTITY() AS INT);", f);

        public Task UpdateAsync(int id, Fornecedor f) =>
            _cnx.ExecuteAsync(@"
UPDATE dbo.Fornecedores SET
  DataAtualizacao       = @DataAtualizacao,
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
  Complemento           = @Complemento,
  CondicaoPagamentoId   = @CondicaoPagamentoId,
  IdCidade              = @IdCidade
WHERE Id = @Id;",
            new
            {
                Id = id,
                f.DataAtualizacao,
                f.TipoPessoa,
                f.NomeRazaoSocial,
                f.ApelidoNomeFantasia,
                f.DataNascimentoCriacao,
                f.CpfCnpj,
                f.RgInscricaoEstadual,
                f.Email,
                f.Telefone,
                f.Rua,
                f.Numero,
                f.Bairro,
                f.Cep,
                f.Complemento,
                f.CondicaoPagamentoId,
                f.IdCidade
            });

        public Task DeleteAsync(int id) =>
            _cnx.ExecuteAsync("DELETE FROM dbo.Fornecedores WHERE Id = @id;", new { id });
    }
}
