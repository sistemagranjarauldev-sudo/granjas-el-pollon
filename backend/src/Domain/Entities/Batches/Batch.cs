using SistemaGranja.Domain.Common;
using SistemaGranja.Domain.Entities.FarmStructure;
using SistemaGranja.Domain.Entities.Pigs;
using SistemaGranja.Domain.Entities.Weighings;
using SistemaGranja.Domain.Enums;

namespace SistemaGranja.Domain.Entities.Batches;

public class Batch : BaseEntity
{
    public Guid FarmId { get; set; }
    public Farm Farm { get; set; } = null!;

    public string Code { get; set; } = string.Empty; // ej. LOT-2026-N01
    public string Name { get; set; } = string.Empty; // ej. Lote Destete Semana 12
    public BatchStage Stage { get; set; } = BatchStage.Nursery;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public int InitialQuantity { get; set; } = 0;
    public int CurrentQuantity { get; set; } = 0;
    public decimal? InitialWeightKg { get; set; }

    public Guid? CurrentPenId { get; set; }
    public Pen? CurrentPen { get; set; }

    public BatchStatus Status { get; set; } = BatchStatus.Active;
    public string? Notes { get; set; }

    // Relaciones
    public ICollection<Pig> Pigs { get; set; } = new List<Pig>();
    public ICollection<BatchMovement> Movements { get; set; } = new List<BatchMovement>();
    public ICollection<BatchWeighing> Weighings { get; set; } = new List<BatchWeighing>();

    // Métodos de Dominio
    public int CalculateDaysInBatch(DateTime? targetDate = null)
    {
        var end = EndDate ?? targetDate ?? DateTime.UtcNow;
        return Math.Max(0, (int)(end.Date - StartDate.Date).TotalDays);
    }
}
