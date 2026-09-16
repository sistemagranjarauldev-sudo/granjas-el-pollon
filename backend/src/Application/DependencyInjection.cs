using System.Reflection;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using SistemaGranja.Application.Modules.Audit.Services;
using SistemaGranja.Application.Modules.Auth.Services;
using SistemaGranja.Application.Modules.FarmStructure.Services;
using SistemaGranja.Application.Modules.Users.Services;

namespace SistemaGranja.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        // Registrar servicios de aplicación
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IFarmStructureService, FarmStructureService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IAuditService, AuditService>();

        return services;
    }
}
