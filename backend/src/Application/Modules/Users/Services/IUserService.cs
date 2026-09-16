using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.Users.DTOs;
using SistemaGranja.Shared.Results;

namespace SistemaGranja.Application.Modules.Users.Services;

public interface IUserService
{
    Task<Result<PaginatedList<UserDto>>> GetUsersAsync(int pageIndex, int pageSize, string? search = null, CancellationToken cancellationToken = default);
    Task<Result<UserDto>> GetUserByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<UserDto>> CreateUserAsync(CreateUserDto dto, CancellationToken cancellationToken = default);
    Task<Result<UserDto>> UpdateUserAsync(Guid id, UpdateUserDto dto, CancellationToken cancellationToken = default);
    Task<Result> ToggleUserStatusAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result> DeleteUserAsync(Guid id, CancellationToken cancellationToken = default);

    // Roles y Permisos
    Task<Result<IReadOnlyList<RoleDto>>> GetRolesAsync(CancellationToken cancellationToken = default);
    Task<Result<IReadOnlyList<PermissionDto>>> GetPermissionsAsync(CancellationToken cancellationToken = default);
}
