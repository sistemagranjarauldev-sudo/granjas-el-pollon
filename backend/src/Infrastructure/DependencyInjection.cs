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
        var connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Server=localhost;Database=SistemaGranjaPorcinaDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True";

        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            var softDeleteInterceptor = sp.GetRequiredService<SoftDeleteInterceptor>();
            var auditInterceptor = sp.GetRequiredService<AuditSaveChangesInterceptor>();

            options.UseSqlServer(connectionString, sqlOptions =>
            {
                sqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                sqlOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null);
            })
            .AddInterceptors(softDeleteInterceptor, auditInterceptor);
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
