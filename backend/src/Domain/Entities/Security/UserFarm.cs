using SistemaGranja.Domain.Entities.FarmStructure;

namespace SistemaGranja.Domain.Entities.Security;

public class UserFarm
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid FarmId { get; set; }
    public Farm Farm { get; set; } = null!;

    public bool IsDefault { get; set; } = false;
}
