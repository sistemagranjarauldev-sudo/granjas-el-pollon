using Microsoft.EntityFrameworkCore;
using SistemaGranja.Application.Common.Interfaces;
using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.Users.DTOs;
using SistemaGranja.Domain.Entities.Security;
using SistemaGranja.Shared.Results;

namespace SistemaGranja.Application.Modules.Users.Services;

public class UserService : IUserService
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public UserService(IApplicationDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<PaginatedList<UserDto>>> GetUsersAsync(int pageIndex, int pageSize, string? search = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.UserFarms)
                .ThenInclude(uf => uf.Farm)
            .Where(u => !u.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(u =>
                u.Username.ToLower().Contains(searchLower) ||
                u.Email.ToLower().Contains(searchLower) ||
                u.FirstName.ToLower().Contains(searchLower) ||
                u.LastName.ToLower().Contains(searchLower));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var users = await query
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = users.Select(MapToUserDto).ToList();
        return Result<PaginatedList<UserDto>>.Success(new PaginatedList<UserDto>(dtos, totalCount, pageIndex, pageSize));
    }

    public async Task<Result<UserDto>> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
            .Include(u => u.UserFarms)
                .ThenInclude(uf => uf.Farm)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);

        if (user == null)
            return Result<UserDto>.Failure(Error.NotFound);

        return Result<UserDto>.Success(MapToUserDto(user));
    }

    public async Task<Result<UserDto>> CreateUserAsync(CreateUserDto dto, CancellationToken cancellationToken = default)
    {
        var emailExists = await _context.Users.AnyAsync(u => u.Email.ToLower() == dto.Email.ToLower().Trim() && !u.IsDeleted, cancellationToken);
        if (emailExists)
            return Result<UserDto>.Failure("User.EmailExists", "El correo electrónico ya se encuentra registrado.");

        var usernameExists = await _context.Users.AnyAsync(u => u.Username.ToLower() == dto.Username.ToLower().Trim() && !u.IsDeleted, cancellationToken);
        if (usernameExists)
            return Result<UserDto>.Failure("User.UsernameExists", "El nombre de usuario ya se encuentra registrado.");

        var user = new User
        {
            Username = dto.Username.Trim(),
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = _passwordHasher.HashPassword(dto.Password),
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Phone = dto.Phone?.Trim(),
            IsActive = true
        };

        // Asignar roles
        foreach (var roleId in dto.RoleIds)
        {
            user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = roleId });
        }

        // Asignar granjas
        foreach (var farmId in dto.FarmIds)
        {
            user.UserFarms.Add(new UserFarm
            {
                UserId = user.Id,
                FarmId = farmId,
                IsDefault = dto.DefaultFarmId.HasValue && dto.DefaultFarmId.Value == farmId
            });
        }

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetUserByIdAsync(user.Id, cancellationToken);
    }

    public async Task<Result<UserDto>> UpdateUserAsync(Guid id, UpdateUserDto dto, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
            .Include(u => u.UserFarms)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);

        if (user == null)
            return Result<UserDto>.Failure(Error.NotFound);

        user.FirstName = dto.FirstName.Trim();
        user.LastName = dto.LastName.Trim();
        user.Phone = dto.Phone?.Trim();
        user.IsActive = dto.IsActive;

        // Actualizar roles
        _context.UserRoles.RemoveRange(user.UserRoles);
        foreach (var roleId in dto.RoleIds)
        {
            user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = roleId });
        }

        // Actualizar granjas
        _context.UserFarms.RemoveRange(user.UserFarms);
        foreach (var farmId in dto.FarmIds)
        {
            user.UserFarms.Add(new UserFarm
            {
                UserId = user.Id,
                FarmId = farmId,
                IsDefault = dto.DefaultFarmId.HasValue && dto.DefaultFarmId.Value == farmId
            });
        }

        await _context.SaveChangesAsync(cancellationToken);
        return await GetUserByIdAsync(user.Id, cancellationToken);
    }

    public async Task<Result> ToggleUserStatusAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);
        if (user == null)
            return Result.Failure(Error.NotFound);

        user.IsActive = !user.IsActive;
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result> DeleteUserAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted, cancellationToken);
        if (user == null)
            return Result.Failure(Error.NotFound);

        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result<IReadOnlyList<RoleDto>>> GetRolesAsync(CancellationToken cancellationToken = default)
    {
        var roles = await _context.Roles
            .Include(r => r.RolePermissions)
                .ThenInclude(rp => rp.Permission)
            .Where(r => !r.IsDeleted)
            .ToListAsync(cancellationToken);

        var dtos = roles.Select(r => new RoleDto(
            r.Id,
            r.Name,
            r.Description,
            r.IsSystemRole,
            r.RolePermissions.Select(rp => new PermissionDto(
                rp.Permission.Id,
                rp.Permission.Code,
                rp.Permission.Module,
                rp.Permission.Description
            ))
        )).ToList();

        return Result<IReadOnlyList<RoleDto>>.Success(dtos);
    }

    public async Task<Result<IReadOnlyList<PermissionDto>>> GetPermissionsAsync(CancellationToken cancellationToken = default)
    {
        var permissions = await _context.Permissions
            .Where(p => !p.IsDeleted)
            .OrderBy(p => p.Module)
            .ThenBy(p => p.Code)
            .Select(p => new PermissionDto(p.Id, p.Code, p.Module, p.Description))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<PermissionDto>>.Success(permissions);
    }

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto(
            user.Id,
            user.Username,
            user.Email,
            user.FirstName,
            user.LastName,
            user.FullName,
            user.Phone,
            user.IsActive,
            user.LastLoginAt,
            user.CreatedAt,
            user.UserRoles.Select(ur => ur.Role.Name).ToList(),
            user.UserFarms.Where(uf => !uf.Farm.IsDeleted).Select(uf => new UserFarmAssignmentDto(
                uf.FarmId,
                uf.Farm.Code,
                uf.Farm.Name,
                uf.IsDefault
            )).ToList()
        );
    }
}
