using Microsoft.EntityFrameworkCore;
using SistemaGranja.Application.Common.Interfaces;
using SistemaGranja.Application.Modules.Auth.DTOs;
using SistemaGranja.Domain.Entities.Security;
using SistemaGranja.Shared.Results;

namespace SistemaGranja.Application.Modules.Auth.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(
        IApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    public async Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto request, string? ipAddress = null, CancellationToken cancellationToken = default)
    {
        var normalizedIdentifier = request.Identifier.Trim().ToLower();

        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .Include(u => u.UserFarms)
                .ThenInclude(uf => uf.Farm)
            .FirstOrDefaultAsync(u => 
                (u.Username.ToLower() == normalizedIdentifier || u.Email.ToLower() == normalizedIdentifier) && !u.IsDeleted, 
                cancellationToken);

        if (user == null)
            return Result<LoginResponseDto>.Failure(Error.Unauthorized);

        if (!user.IsActive)
            return Result<LoginResponseDto>.Failure("Auth.UserInactive", "El usuario se encuentra desactivado en el sistema.");

        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
            return Result<LoginResponseDto>.Failure(Error.Unauthorized);

        // Actualizar último login
        user.LastLoginAt = DateTime.UtcNow;

        var roles = user.UserRoles.Select(ur => ur.Role.Name).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToList();

        var token = _jwtTokenGenerator.GenerateToken(user, roles, permissions);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken(user.Id, ipAddress);

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync(cancellationToken);

        var userProfile = MapToProfile(user, roles, permissions);

        return Result<LoginResponseDto>.Success(new LoginResponseDto(
            token,
            refreshToken.Token,
            refreshToken.ExpiresAt,
            userProfile
        ));
    }

    public async Task<Result<LoginResponseDto>> RefreshTokenAsync(RefreshTokenRequestDto request, string? ipAddress = null, CancellationToken cancellationToken = default)
    {
        var storedToken = await _context.RefreshTokens
            .Include(rt => rt.User)
                .ThenInclude(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                        .ThenInclude(r => r.RolePermissions)
                            .ThenInclude(rp => rp.Permission)
            .Include(rt => rt.User.UserFarms)
                .ThenInclude(uf => uf.Farm)
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken, cancellationToken);

        if (storedToken == null || !storedToken.IsActive || storedToken.User.IsDeleted || !storedToken.User.IsActive)
            return Result<LoginResponseDto>.Failure(Error.Unauthorized);

        // Revocar el token anterior
        storedToken.IsRevoked = true;
        storedToken.RevokedAt = DateTime.UtcNow;
        storedToken.RevokedByIp = ipAddress;

        var user = storedToken.User;
        var roles = user.UserRoles.Select(ur => ur.Role.Name).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToList();

        var newToken = _jwtTokenGenerator.GenerateToken(user, roles, permissions);
        var newRefreshToken = _jwtTokenGenerator.GenerateRefreshToken(user.Id, ipAddress);
        storedToken.ReplacedByToken = newRefreshToken.Token;

        _context.RefreshTokens.Add(newRefreshToken);
        await _context.SaveChangesAsync(cancellationToken);

        var userProfile = MapToProfile(user, roles, permissions);

        return Result<LoginResponseDto>.Success(new LoginResponseDto(
            newToken,
            newRefreshToken.Token,
            newRefreshToken.ExpiresAt,
            userProfile
        ));
    }

    public async Task<Result> LogoutAsync(string refreshToken, string? ipAddress = null, CancellationToken cancellationToken = default)
    {
        var storedToken = await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.Token == refreshToken, cancellationToken);

        if (storedToken != null && !storedToken.IsRevoked)
        {
            storedToken.IsRevoked = true;
            storedToken.RevokedAt = DateTime.UtcNow;
            storedToken.RevokedByIp = ipAddress;
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Result.Success();
    }

    public async Task<Result<UserProfileDto>> GetCurrentUserProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .Include(u => u.UserRoles)
                .ThenInclude(ur => ur.Role)
                    .ThenInclude(r => r.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
            .Include(u => u.UserFarms)
                .ThenInclude(uf => uf.Farm)
            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted, cancellationToken);

        if (user == null)
            return Result<UserProfileDto>.Failure(Error.NotFound);

        var roles = user.UserRoles.Select(ur => ur.Role.Name).Distinct().ToList();
        var permissions = user.UserRoles
            .SelectMany(ur => ur.Role.RolePermissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToList();

        return Result<UserProfileDto>.Success(MapToProfile(user, roles, permissions));
    }

    private static UserProfileDto MapToProfile(User user, IEnumerable<string> roles, IEnumerable<string> permissions)
    {
        return new UserProfileDto(
            user.Id,
            user.Username,
            user.Email,
            user.FirstName,
            user.LastName,
            user.FullName,
            roles,
            permissions,
            user.UserFarms.Where(uf => !uf.Farm.IsDeleted).Select(uf => new UserFarmDto(
                uf.FarmId,
                uf.Farm.Code,
                uf.Farm.Name,
                uf.IsDefault
            ))
        );
    }
}
