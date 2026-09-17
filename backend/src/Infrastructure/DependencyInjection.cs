using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SistemaGranja.Application.Common.Interfaces;
using SistemaGranja.Infrastructure.Identity;
using SistemaGranja.Infrastructure.Persistence;
using SistemaGranja.Infrastructure.Persistence.Interceptors;

namespace SistemaGranja.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Interceptors
        services.AddScoped<SoftDeleteInterceptor>();
        services.AddScoped<AuditSaveChangesInterceptor>();

        // DbContext
        var provider = configuration.GetValue<string>("DatabaseProvider") ?? "";
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Data Source=SistemaGranjaPorcina.db";
        var useSqlite = configuration.GetValue<bool>("UseSqlite", false);

        var isPostgres = provider.Equals("PostgreSql", StringComparison.OrdinalIgnoreCase) ||
                         provider.Equals("Postgres", StringComparison.OrdinalIgnoreCase) ||
                         provider.Equals("Supabase", StringComparison.OrdinalIgnoreCase) ||
                         connectionString.Contains("Host=", StringComparison.OrdinalIgnoreCase) ||
                         connectionString.Contains("Username=postgres", StringComparison.OrdinalIgnoreCase) ||
                         connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
                         connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase);

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            var softDeleteInterceptor = sp.GetRequiredService<SoftDeleteInterceptor>();
            var auditInterceptor = sp.GetRequiredService<AuditSaveChangesInterceptor>();

            if (isPostgres)
            {
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    npgsqlOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null);
                })
                .AddInterceptors(softDeleteInterceptor, auditInterceptor);
            }
            else if (useSqlite || connectionString.EndsWith(".db", StringComparison.OrdinalIgnoreCase))
            {
                options.UseSqlite(connectionString, sqliteOptions =>
                {
                    sqliteOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                })
                .AddInterceptors(softDeleteInterceptor, auditInterceptor);
            }
            else
            {
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                    sqlOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null);
                })
                .AddInterceptors(softDeleteInterceptor, auditInterceptor);
            }
        });

        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());

        // Identity Services
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();

        return services;
    }
}
