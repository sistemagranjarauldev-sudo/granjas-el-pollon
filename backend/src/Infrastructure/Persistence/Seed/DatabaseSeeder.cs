using Microsoft.EntityFrameworkCore;
using SistemaGranja.Application.Common.Interfaces;
using SistemaGranja.Domain.Entities.Security;
using SistemaGranja.Shared.Constants;

namespace SistemaGranja.Infrastructure.Persistence.Seed;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        // 1. Permisos
        var defaultPermissions = new List<Permission>
        {
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111101"), Code = Permissions.UsersView, Module = "Security", Description = "Ver lista de usuarios" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111102"), Code = Permissions.UsersCreate, Module = "Security", Description = "Crear nuevos usuarios" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111103"), Code = Permissions.UsersUpdate, Module = "Security", Description = "Modificar usuarios existentes" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111104"), Code = Permissions.UsersDelete, Module = "Security", Description = "Eliminar usuarios" },
            
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111105"), Code = Permissions.FarmsView, Module = "FarmStructure", Description = "Ver granjas" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111106"), Code = Permissions.FarmsCreate, Module = "FarmStructure", Description = "Crear granjas" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111107"), Code = Permissions.FarmsUpdate, Module = "FarmStructure", Description = "Modificar granjas" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111108"), Code = Permissions.FarmsDelete, Module = "FarmStructure", Description = "Eliminar granjas" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111109"), Code = Permissions.FarmConfigUpdate, Module = "FarmStructure", Description = "Modificar parámetros de granja" },

            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111110"), Code = Permissions.AreasManage, Module = "FarmStructure", Description = "Administrar áreas" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Code = Permissions.ShedsManage, Module = "FarmStructure", Description = "Administrar galpones" },
            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111112"), Code = Permissions.PensManage, Module = "FarmStructure", Description = "Administrar corrales y jaulas" },

            new() { Id = Guid.Parse("11111111-1111-1111-1111-111111111113"), Code = Permissions.AuditView, Module = "Audit", Description = "Consultar registros de auditoría" }
        };

        foreach (var perm in defaultPermissions)
        {
            if (!await context.Permissions.AnyAsync(p => p.Code == perm.Code))
            {
                context.Permissions.Add(perm);
            }
        }
        await context.SaveChangesAsync();

        // 2. Roles del Sistema
        var defaultRoles = new List<Role>
        {
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222201"), Name = Roles.Administrator, Description = "Acceso total a todos los módulos y configuraciones del sistema", IsSystemRole = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222202"), Name = Roles.FarmManager, Description = "Gestión ejecutiva y operativa de la granja", IsSystemRole = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222203"), Name = Roles.Veterinarian, Description = "Sanidad animal, planes de vacunación y tratamientos", IsSystemRole = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222204"), Name = Roles.Production, Description = "Manejo zootécnico, pesajes, reproducción y maternidad", IsSystemRole = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222205"), Name = Roles.Warehouse, Description = "Control de stock, insumos y alimentos", IsSystemRole = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222206"), Name = Roles.Sales, Description = "Ventas, clientes y liquidación de salidas", IsSystemRole = true },
            new() { Id = Guid.Parse("22222222-2222-2222-2222-222222222207"), Name = Roles.Operator, Description = "Registro diario de actividades en granja", IsSystemRole = true }
        };

        foreach (var role in defaultRoles)
        {
            if (!await context.Roles.AnyAsync(r => r.Name == role.Name))
            {
                context.Roles.Add(role);
            }
        }
        await context.SaveChangesAsync();

        // 3. Asignar todos los permisos al rol de Administrador
        var adminRole = await context.Roles.Include(r => r.RolePermissions).FirstOrDefaultAsync(r => r.Name == Roles.Administrator);
        if (adminRole != null)
        {
            var allDbPermissions = await context.Permissions.ToListAsync();
            foreach (var perm in allDbPermissions)
            {
                if (!adminRole.RolePermissions.Any(rp => rp.PermissionId == perm.Id))
                {
                    adminRole.RolePermissions.Add(new RolePermission
                    {
                        RoleId = adminRole.Id,
                        PermissionId = perm.Id
                    });
                }
            }
            await context.SaveChangesAsync();
        }

        // 4. Usuario Administrador Inicial
        var adminUserExists = await context.Users.AnyAsync(u => u.Username == "admin");
        if (!adminUserExists && adminRole != null)
        {
            var adminUser = new User
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333301"),
                Username = "admin",
                Email = "admin@granja.com",
                FirstName = "Administrador",
                LastName = "General",
                PasswordHash = passwordHasher.HashPassword("Admin123*"),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "SYSTEM"
            };

            adminUser.UserRoles.Add(new UserRole
            {
                UserId = adminUser.Id,
                RoleId = adminRole.Id
            });

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        }
    }
}
