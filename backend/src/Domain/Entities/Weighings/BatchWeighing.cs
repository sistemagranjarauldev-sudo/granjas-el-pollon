using SistemaGranja.Domain.Common;
using SistemaGranja.Domain.Entities.Batches;
using SistemaGranja.Domain.Enums;

namespace SistemaGranja.Domain.Entities.Weighings;

public class BatchWeighing : BaseEntity
{
    public Guid BatchId { get; set; }
    public Batch Batch { get; set; } = null!;

    public DateTime WeighingDate { get; set; }
    public BatchStage Stage { get; set; } = BatchStage.Nursery;

    public int SampleQuantity { get; set; }           // Cantidad de cerdos en la muestra pesada
    public decimal TotalSampleWeightKg { get; set; }  // Peso total de la muestra
    public decimal AverageWeightKg { get; set; }      // Peso promedio calculado
    public decimal? EstimatedBatchWeightKg { get; set; } // Peso estimado total del lote

    // Rendimiento ponderal respecto al pesaje grupal anterior
    public decimal? AverageDailyGainGrams { get; set; }
    public decimal? WeightGainKg { get; set; }
    public int? DaysElapsed { get; set; }

    public string? ResponsibleUserId { get; set; }
    public string? Notes { get; set; }
}
