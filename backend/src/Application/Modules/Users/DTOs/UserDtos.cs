namespace SistemaGranja.Application.Modules.Users.DTOs;

public record UserDto(
    Guid Id,
    string Username,
    string Email,
    string FirstName,
    string LastName,
    string FullName,
    string? Phone,
    bool IsActive,
    DateTime? LastLoginAt,
    DateTime CreatedAt,
    IEnumerable<string> Roles,
    IEnumerable<UserFarmAssignmentDto> AssignedFarms
);

public record CreateUserDto(
    string Username,
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string? Phone,
    IEnumerable<Guid> RoleIds,
    IEnumerable<Guid> FarmIds,
    Guid? DefaultFarmId
);

public record UpdateUserDto(
    string FirstName,
    string LastName,
    string? Phone,
    bool IsActive,
    IEnumerable<Guid> RoleIds,
    IEnumerable<Guid> FarmIds,
    Guid? DefaultFarmId
);

public record RoleDto(
    Guid Id,
    string Name,
    string Description,
    bool IsSystemRole,
    IEnumerable<PermissionDto> Permissions
);

public record PermissionDto(
    Guid Id,
    string Code,
    string Module,
    string Description
);

public record UserFarmAssignmentDto(
    Guid FarmId,
    string FarmCode,
    string FarmName,
    bool IsDefault
);
