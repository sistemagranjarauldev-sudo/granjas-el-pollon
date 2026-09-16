using SistemaGranja.Domain.Common;
using SistemaGranja.Domain.Enums;

namespace SistemaGranja.Domain.Entities.FarmStructure;

public class Area : BaseEntity
{
    public Guid FarmId { get; set; }
    public Farm Farm { get; set; } = null!;

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public AreaType AreaType { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    // Relaciones
    public ICollection<Shed> Sheds { get; set; } = new List<Shed>();
}
