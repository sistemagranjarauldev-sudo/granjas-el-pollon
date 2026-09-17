using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using SistemaGranja.Api.Middlewares;
using SistemaGranja.Application;
using SistemaGranja.Application.Common.Interfaces;
using SistemaGranja.Infrastructure;
using SistemaGranja.Infrastructure.Persistence;
using SistemaGranja.Infrastructure.Persistence.Seed;

var builder = WebApplication.CreateBuilder(args);

// 1. Configuración de Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// 2. Inyección de Capas de Clean Architecture
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

// 3. Autenticación JWT
var jwtSecret = builder.Configuration["JwtSettings:Secret"] ?? "SuperSecretKeyForDevelopmentPurposes1234567890";
var jwtIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "SistemaGranjaPorcinaApi";
var jwtAudience = builder.Configuration["JwtSettings:Audience"] ?? "SistemaGranjaPorcinaApp";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 4. CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 5. Controladores y Formato JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// 6. Swagger / OpenAPI con soporte para JWT y X-Farm-Id
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Sistema Integral de Gestión Porcina API",
        Version = "v1",
        Description = "API RESTful empresarial para gestión integral de granjas porcinas."
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingrese 'Bearer' [espacio] y luego su token JWT válido.\r\n\r\nEjemplo: \"Bearer eyJhbGciOiJIUzI1Ni...\""
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 7. Migraciones automáticas y Seeder inicial en desarrollo
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var passwordHasher = services.GetRequiredService<IPasswordHasher>();
        
        if (context.Database.IsRelational())
        {
            var databaseCreator = Microsoft.EntityFrameworkCore.Infrastructure.AccessorExtensions.GetService<Microsoft.EntityFrameworkCore.Storage.IDatabaseCreator>(context.Database) as Microsoft.EntityFrameworkCore.Storage.IRelationalDatabaseCreator;
            if (databaseCreator != null)
            {
                try
                {
                    _ = await context.Permissions.AnyAsync();
                }
                catch
                {
                    Log.Information("Creando tablas del sistema en la base de datos...");
                    await databaseCreator.CreateTablesAsync();
                }

                // Verificar y auto-aprovisionar tablas de la Fase 2 (Pigs, Batches, Weighings)
                try
                {
                    _ = await context.Pigs.AnyAsync();
                }
                catch
                {
                    Log.Information("Aprovisionando tablas de la Fase 2 (Plantel Porcino, Lotes, Pesajes)...");
                    await context.Database.ExecuteSqlRawAsync(@"
                        CREATE TABLE IF NOT EXISTS ""Batches"" (
                            ""Id"" uuid NOT NULL PRIMARY KEY,
                            ""FarmId"" uuid NOT NULL REFERENCES ""Farms""(""Id"") ON DELETE RESTRICT,
                            ""Code"" varchar(50) NOT NULL,
                            ""Name"" varchar(150) NOT NULL,
                            ""Stage"" integer NOT NULL,
                            ""StartDate"" timestamp with time zone NOT NULL,
                            ""EndDate"" timestamp with time zone NULL,
                            ""InitialQuantity"" integer NOT NULL,
                            ""CurrentQuantity"" integer NOT NULL,
                            ""InitialWeightKg"" numeric(10,2) NULL,
                            ""CurrentPenId"" uuid NULL REFERENCES ""Pens""(""Id"") ON DELETE SET NULL,
                            ""Status"" integer NOT NULL,
                            ""Notes"" varchar(1000) NULL,
                            ""CreatedAt"" timestamp with time zone NOT NULL,
                            ""CreatedBy"" text NULL,
                            ""LastModifiedAt"" timestamp with time zone NULL,
                            ""LastModifiedBy"" text NULL,
                            ""IsDeleted"" boolean NOT NULL DEFAULT false,
                            ""DeletedAt"" timestamp with time zone NULL,
                            ""DeletedBy"" text NULL
                        );

                        CREATE TABLE IF NOT EXISTS ""Pigs"" (
                            ""Id"" uuid NOT NULL PRIMARY KEY,
                            ""FarmId"" uuid NOT NULL REFERENCES ""Farms""(""Id"") ON DELETE RESTRICT,
                            ""IdentificationCode"" varchar(50) NOT NULL,
                            ""ElectronicId"" varchar(50) NULL,
                            ""Sex"" integer NOT NULL,
                            ""Breed"" varchar(100) NOT NULL,
                            ""GeneticLine"" varchar(100) NULL,
                            ""BirthDate"" timestamp with time zone NOT NULL,
                            ""EntryDate"" timestamp with time zone NOT NULL,
                            ""EntryType"" integer NOT NULL,
                            ""SireId"" uuid NULL REFERENCES ""Pigs""(""Id"") ON DELETE RESTRICT,
                            ""DamId"" uuid NULL REFERENCES ""Pigs""(""Id"") ON DELETE RESTRICT,
                            ""CurrentPenId"" uuid NULL REFERENCES ""Pens""(""Id"") ON DELETE SET NULL,
                            ""CurrentBatchId"" uuid NULL REFERENCES ""Batches""(""Id"") ON DELETE SET NULL,
                            ""Status"" integer NOT NULL,
                            ""ReproductiveStatus"" integer NOT NULL,
                            ""Parity"" integer NOT NULL DEFAULT 0,
                            ""ExitDate"" timestamp with time zone NULL,
                            ""ExitReason"" varchar(250) NULL,
                            ""Notes"" varchar(1000) NULL,
                            ""CreatedAt"" timestamp with time zone NOT NULL,
                            ""CreatedBy"" text NULL,
                            ""LastModifiedAt"" timestamp with time zone NULL,
                            ""LastModifiedBy"" text NULL,
                            ""IsDeleted"" boolean NOT NULL DEFAULT false,
                            ""DeletedAt"" timestamp with time zone NULL,
                            ""DeletedBy"" text NULL
                        );

                        CREATE TABLE IF NOT EXISTS ""PigMovements"" (
                            ""Id"" uuid NOT NULL PRIMARY KEY,
                            ""PigId"" uuid NOT NULL REFERENCES ""Pigs""(""Id"") ON DELETE CASCADE,
                            ""SourcePenId"" uuid NULL REFERENCES ""Pens""(""Id"") ON DELETE RESTRICT,
                            ""TargetPenId"" uuid NOT NULL REFERENCES ""Pens""(""Id"") ON DELETE RESTRICT,
                            ""MovementDate"" timestamp with time zone NOT NULL,
                            ""Reason"" varchar(200) NOT NULL,
                            ""ResponsibleUserId"" varchar(100) NULL,
                            ""Notes"" varchar(500) NULL,
                            ""CreatedAt"" timestamp with time zone NOT NULL,
                            ""CreatedBy"" text NULL,
                            ""LastModifiedAt"" timestamp with time zone NULL,
                            ""LastModifiedBy"" text NULL,
                            ""IsDeleted"" boolean NOT NULL DEFAULT false,
                            ""DeletedAt"" timestamp with time zone NULL,
                            ""DeletedBy"" text NULL
                        );

                        CREATE TABLE IF NOT EXISTS ""BatchMovements"" (
                            ""Id"" uuid NOT NULL PRIMARY KEY,
                            ""BatchId"" uuid NOT NULL REFERENCES ""Batches""(""Id"") ON DELETE CASCADE,
                            ""SourcePenId"" uuid NULL REFERENCES ""Pens""(""Id"") ON DELETE RESTRICT,
                            ""TargetPenId"" uuid NOT NULL REFERENCES ""Pens""(""Id"") ON DELETE RESTRICT,
                            ""Quantity"" integer NOT NULL,
                            ""MovementDate"" timestamp with time zone NOT NULL,
                            ""Reason"" varchar(200) NOT NULL,
                            ""ResponsibleUserId"" varchar(100) NULL,
                            ""Notes"" varchar(500) NULL,
                            ""CreatedAt"" timestamp with time zone NOT NULL,
                            ""CreatedBy"" text NULL,
                            ""LastModifiedAt"" timestamp with time zone NULL,
                            ""LastModifiedBy"" text NULL,
                            ""IsDeleted"" boolean NOT NULL DEFAULT false,
                            ""DeletedAt"" timestamp with time zone NULL,
                            ""DeletedBy"" text NULL
                        );

                        CREATE TABLE IF NOT EXISTS ""PigWeighings"" (
                            ""Id"" uuid NOT NULL PRIMARY KEY,
                            ""PigId"" uuid NOT NULL REFERENCES ""Pigs""(""Id"") ON DELETE CASCADE,
                            ""WeighingDate"" timestamp with time zone NOT NULL,
                            ""WeightKg"" numeric(8,2) NOT NULL,
                            ""AverageDailyGainGrams"" numeric(8,2) NULL,
                            ""WeightGainKg"" numeric(8,2) NULL,
                            ""ResponsibleUserId"" varchar(100) NULL,
                            ""Notes"" varchar(500) NULL,
                            ""CreatedAt"" timestamp with time zone NOT NULL,
                            ""CreatedBy"" text NULL,
                            ""LastModifiedAt"" timestamp with time zone NULL,
                            ""LastModifiedBy"" text NULL,
                            ""IsDeleted"" boolean NOT NULL DEFAULT false,
                            ""DeletedAt"" timestamp with time zone NULL,
                            ""DeletedBy"" text NULL
                        );

                        CREATE TABLE IF NOT EXISTS ""BatchWeighings"" (
                            ""Id"" uuid NOT NULL PRIMARY KEY,
                            ""BatchId"" uuid NOT NULL REFERENCES ""Batches""(""Id"") ON DELETE CASCADE,
                            ""WeighingDate"" timestamp with time zone NOT NULL,
                            ""SampleQuantity"" integer NOT NULL,
                            ""TotalSampleWeightKg"" numeric(10,2) NOT NULL,
                            ""AverageWeightKg"" numeric(8,2) NOT NULL,
                            ""EstimatedBatchWeightKg"" numeric(12,2) NULL,
                            ""AverageDailyGainGrams"" numeric(8,2) NULL,
                            ""WeightGainKg"" numeric(8,2) NULL,
                            ""ResponsibleUserId"" varchar(100) NULL,
                            ""Notes"" varchar(500) NULL,
                            ""CreatedAt"" timestamp with time zone NOT NULL,
                            ""CreatedBy"" text NULL,
                            ""LastModifiedAt"" timestamp with time zone NULL,
                            ""LastModifiedBy"" text NULL,
                            ""IsDeleted"" boolean NOT NULL DEFAULT false,
                            ""DeletedAt"" timestamp with time zone NULL,
                            ""DeletedBy"" text NULL
                        );

                        CREATE UNIQUE INDEX IF NOT EXISTS ""IX_Pigs_FarmId_IdentificationCode"" ON ""Pigs"" (""FarmId"", ""IdentificationCode"") WHERE ""IsDeleted"" = false;
                        CREATE UNIQUE INDEX IF NOT EXISTS ""IX_Batches_FarmId_Code"" ON ""Batches"" (""FarmId"", ""Code"") WHERE ""IsDeleted"" = false;
                    ");
                    Log.Information("Tablas de la Fase 2 aprovisionadas exitosamente.");
                }
            }
        }
        
        await DatabaseSeeder.SeedAsync(context, passwordHasher);
        Log.Information("Base de datos y datos semilla verificados correctamente.");
    }
    catch (Exception ex)
    {
        Log.Warning(ex, "Nota: No se pudo conectar a la base de datos SQL Server al iniciar. Verifique la cadena de conexión.");
    }
}

// 8. Pipeline HTTP
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Granja Porcina API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseSerilogRequestLogging();
app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Para soporte de pruebas de integración con WebApplicationFactory
public partial class Program { }
