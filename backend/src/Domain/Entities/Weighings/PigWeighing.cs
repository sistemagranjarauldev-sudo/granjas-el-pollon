using SistemaGranja.Domain.Common;
using SistemaGranja.Domain.Entities.Pigs;
using SistemaGranja.Domain.Enums;

namespace SistemaGranja.Domain.Entities.Weighings;

public class PigWeighing : BaseEntity
{
    public Guid PigId { get; set; }
    public Pig Pig { get; set; } = null!;

    public DateTime WeighingDate { get; set; }
    public decimal WeightKg { get; set; }
    public int AgeDays { get; set; }
    public BatchStage Stage { get; set; } = BatchStage.Nursery;

    // Ganancia Diaria de Peso calculada respecto al pesaje anterior inmediato
    public decimal? AverageDailyGainGrams { get; set; }
    public decimal? WeightGainKg { get; set; }
    public int? DaysElapsed { get; set; }

    public string? ResponsibleUserId { get; set; }
    public string? Notes { get; set; }
}
