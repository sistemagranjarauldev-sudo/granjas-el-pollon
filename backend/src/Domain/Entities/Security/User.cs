using SistemaGranja.Domain.Common;

namespace SistemaGranja.Domain.Entities.Security;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }

    // Relaciones de navegación
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<UserFarm> UserFarms { get; set; } = new List<UserFarm>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    public string FullName => $"{FirstName} {LastName}".Trim();
}
