using SistemaGranja.Domain.Common;

namespace SistemaGranja.Domain.Entities.FarmStructure;

public class Shed : BaseEntity
{
    public Guid AreaId { get; set; }
    public Area Area { get; set; } = null!;

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int VentilationType { get; set; } = 1; // 1=Natural, 2=Tunnel, 3=NegativePressure
    public int TotalCapacity { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    // Relaciones
    public ICollection<Pen> Pens { get; set; } = new List<Pen>();
}
