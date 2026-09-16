using SistemaGranja.Application.Modules.Auth.DTOs;
using SistemaGranja.Shared.Results;

namespace SistemaGranja.Application.Modules.Auth.Services;

public interface IAuthService
{
    Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto request, string? ipAddress = null, CancellationToken cancellationToken = default);
    Task<Result<LoginResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto request, string? ipAddress = null, CancellationToken cancellationToken = default);
    Task<Result> LogoutAsync(string refreshToken, string? ipAddress = null, CancellationToken cancellationToken = default);
    Task<Result<UserProfileDto>> GetCurrentUserProfileAsync(Guid userId, CancellationToken cancellationToken = default);
}
