using SistemaGranja.Domain.Common;
using SistemaGranja.Domain.Entities.FarmStructure;

namespace SistemaGranja.Domain.Entities.Pigs;

public class PigMovement : BaseEntity
{
    public Guid PigId { get; set; }
    public Pig Pig { get; set; } = null!;

    public Guid? SourcePenId { get; set; }
    public Pen? SourcePen { get; set; }

    public Guid TargetPenId { get; set; }
    public Pen TargetPen { get; set; } = null!;

    public DateTime MovementDate { get; set; } = DateTime.UtcNow;
    public string Reason { get; set; } = string.Empty; // ej. Traslado a gestación, Entrada a maternidad, Cuarentena
    public string? ResponsibleUserId { get; set; }
    public string? Notes { get; set; }
}
