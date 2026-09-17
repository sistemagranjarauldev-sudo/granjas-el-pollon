using SistemaGranja.Domain.Common;
using SistemaGranja.Domain.Entities.FarmStructure;

namespace SistemaGranja.Domain.Entities.Batches;

public class BatchMovement : BaseEntity
{
    public Guid BatchId { get; set; }
    public Batch Batch { get; set; } = null!;

    public Guid? SourcePenId { get; set; }
    public Pen? SourcePen { get; set; }

    public Guid TargetPenId { get; set; }
    public Pen TargetPen { get; set; } = null!;

    public int Quantity { get; set; }
    public DateTime MovementDate { get; set; } = DateTime.UtcNow;
    public string Reason { get; set; } = string.Empty;
    public string? ResponsibleUserId { get; set; }
    public string? Notes { get; set; }
}
