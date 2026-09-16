using SistemaGranja.Domain.Common;
using SistemaGranja.Domain.Entities.Security;

namespace SistemaGranja.Domain.Entities.FarmStructure;

public class Farm : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? LegalName { get; set; }
    public string? TaxId { get; set; }
    public string? Location { get; set; }
    public int TotalCapacity { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Relaciones
    public ICollection<Area> Areas { get; set; } = new List<Area>();
    public ICollection<UserFarm> UserFarms { get; set; } = new List<UserFarm>();
    public ICollection<FarmConfiguration> Configurations { get; set; } = new List<FarmConfiguration>();
}
