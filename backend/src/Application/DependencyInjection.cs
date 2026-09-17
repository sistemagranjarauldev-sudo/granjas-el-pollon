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
        services.AddScoped<SistemaGranja.Application.Modules.Pigs.Services.IPigsService, SistemaGranja.Application.Modules.Pigs.Services.PigsService>();
        services.AddScoped<SistemaGranja.Application.Modules.Batches.Services.IBatchesService, SistemaGranja.Application.Modules.Batches.Services.BatchesService>();
        services.AddScoped<SistemaGranja.Application.Modules.Weighings.Services.IWeighingsService, SistemaGranja.Application.Modules.Weighings.Services.WeighingsService>();

        return services;
    }
}
