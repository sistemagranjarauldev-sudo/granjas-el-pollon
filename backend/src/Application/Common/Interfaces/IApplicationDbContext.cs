using Microsoft.EntityFrameworkCore;
using SistemaGranja.Domain.Entities.Audit;
using SistemaGranja.Domain.Entities.FarmStructure;
using SistemaGranja.Domain.Entities.Security;

namespace SistemaGranja.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    // Seguridad
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Permission> Permissions { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<UserFarm> UserFarms { get; }
    DbSet<RefreshToken> RefreshTokens { get; }

    // Topología de Granja
    DbSet<Farm> Farms { get; }
    DbSet<Area> Areas { get; }
    DbSet<Shed> Sheds { get; }
    DbSet<Pen> Pens { get; }
    DbSet<FarmConfiguration> FarmConfigurations { get; }

    // Auditoría
    DbSet<AuditLog> AuditLogs { get; }

    // Plantel Porcino y Lotes
    DbSet<SistemaGranja.Domain.Entities.Pigs.Pig> Pigs { get; }
    DbSet<SistemaGranja.Domain.Entities.Pigs.PigMovement> PigMovements { get; }
    DbSet<SistemaGranja.Domain.Entities.Batches.Batch> Batches { get; }
    DbSet<SistemaGranja.Domain.Entities.Batches.BatchMovement> BatchMovements { get; }
    DbSet<SistemaGranja.Domain.Entities.Weighings.PigWeighing> PigWeighings { get; }
    DbSet<SistemaGranja.Domain.Entities.Weighings.BatchWeighing> BatchWeighings { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
