namespace SistemaGranja.Application.Modules.Auth.DTOs;

public record LoginRequestDto(string Identifier, string Password);

public record LoginResponseDto(
    string Token,
    string RefreshToken,
    DateTime ExpiresAt,
    UserProfileDto User
);

public record RefreshTokenRequestDto(string Token, string RefreshToken);

public record UserProfileDto(
    Guid Id,
    string Username,
    string Email,
    string FirstName,
    string LastName,
    string FullName,
    IEnumerable<string> Roles,
    IEnumerable<string> Permissions,
    IEnumerable<UserFarmDto> AssignedFarms
);

public record UserFarmDto(
    Guid FarmId,
    string FarmCode,
    string FarmName,
    bool IsDefault
);
