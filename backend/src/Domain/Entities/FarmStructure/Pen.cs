using SistemaGranja.Domain.Common;
using SistemaGranja.Domain.Enums;

namespace SistemaGranja.Domain.Entities.FarmStructure;

public class Pen : BaseEntity
{
    public Guid ShedId { get; set; }
    public Shed Shed { get; set; } = null!;

    public string Code { get; set; } = string.Empty;
    public PenType PenType { get; set; }
    public int MaxCapacity { get; set; } = 1;
    public int CurrentOccupancy { get; set; } = 0;
    public decimal? DimensionsM2 { get; set; }
    public PenStatus Status { get; set; } = PenStatus.Empty;
    public DateTime? SanitizedAt { get; set; }
    public bool IsActive { get; set; } = true;

    // Métodos de ayuda de dominio
    public bool HasAvailableSpace(int count = 1) => (CurrentOccupancy + count) <= MaxCapacity;
    public int AvailableCapacity => Math.Max(0, MaxCapacity - CurrentOccupancy);
}
