using System.Reflection;
using Microsoft.EntityFrameworkCore;
using SistemaGranja.Application.Common.Interfaces;
using SistemaGranja.Domain.Entities.Audit;
using SistemaGranja.Domain.Entities.FarmStructure;
using SistemaGranja.Domain.Entities.Security;

namespace SistemaGranja.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext, IApplicationDbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // Seguridad
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<UserFarm> UserFarms => Set<UserFarm>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // Topología de Granja
    public DbSet<Farm> Farms => Set<Farm>();
    public DbSet<Area> Areas => Set<Area>();
    public DbSet<Shed> Sheds => Set<Shed>();
    public DbSet<Pen> Pens => Set<Pen>();
    public DbSet<FarmConfiguration> FarmConfigurations => Set<FarmConfiguration>();

    // Auditoría
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Adaptar filtros de índices según el motor de BD (PostgreSQL vs SQL Server/SQLite)
        if (Database.IsNpgsql())
        {
            foreach (var entity in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var index in entity.GetIndexes())
                {
                    if (index.GetFilter() == "IsDeleted = 0")
                    {
                        index.SetFilter("\"IsDeleted\" = false");
                    }
                }
            }
        }
    }
}
