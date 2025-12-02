using BarberShop.API.Connection;
using BarberShop.API.Repository;
using System.Data;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<DbConnectionFactory>();
builder.Services.AddScoped<IDbConnection>(provider =>
    provider.GetRequiredService<DbConnectionFactory>().CreateConnection());
builder.Services.AddScoped<PaisRepository>();
builder.Services.AddScoped<EstadoRepository>();
builder.Services.AddScoped<CidadeRepository>();
builder.Services.AddScoped<FuncionarioRepository>();
builder.Services.AddScoped<ClienteRepository>();
builder.Services.AddScoped<FornecedorRepository>();
builder.Services.AddScoped<FormaPagamentoRepository>();
builder.Services.AddScoped<CondicaoPagamentoRepository>();
builder.Services.AddScoped<MarcaRepository>();
builder.Services.AddScoped<ProdutoRepository>();
builder.Services.AddScoped<CategoriaRepository>();
builder.Services.AddScoped<UnidadeMedidaRepository>();
builder.Services.AddScoped<CompraRepository>();
builder.Services.AddScoped<CargoRepository>();
builder.Services.AddScoped<VeiculoRepository>();
builder.Services.AddScoped<TransportadoraRepository>();
builder.Services.AddScoped<NotaCompraItemRepository>();
builder.Services.AddScoped<ContaPagarRepository>();
builder.Services.AddScoped<VendaProdutoRepository>();
builder.Services.AddScoped<VendaRepository>();



var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
