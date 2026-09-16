using SistemaGranja.Domain.Entities.Security;

namespace SistemaGranja.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user, IEnumerable<string> roles, IEnumerable<string> permissions);
    RefreshToken GenerateRefreshToken(Guid userId, string? ipAddress = null);
}
