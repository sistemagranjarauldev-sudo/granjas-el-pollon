using SistemaGranja.Domain.Enums;

namespace SistemaGranja.Application.Modules.Weighings.DTOs;

public record PigWeighingDto(
    Guid Id,
    Guid PigId,
    string PigCode,
    DateTime WeighingDate,
    decimal WeightKg,
    int AgeDays,
    BatchStage Stage,
    string StageName,
    decimal? AverageDailyGainGrams,
    decimal? WeightGainKg,
    int? DaysElapsed,
    string? ResponsibleUserId,
    string? Notes,
    DateTime CreatedAt
);

public record BatchWeighingDto(
    Guid Id,
    Guid BatchId,
    string BatchCode,
    string BatchName,
    DateTime WeighingDate,
    BatchStage Stage,
    string StageName,
    int SampleQuantity,
    decimal TotalSampleWeightKg,
    decimal AverageWeightKg,
    decimal? EstimatedBatchWeightKg,
    decimal? AverageDailyGainGrams,
    decimal? WeightGainKg,
    int? DaysElapsed,
    string? ResponsibleUserId,
    string? Notes,
    DateTime CreatedAt
);

public record RecordPigWeighingDto(
    Guid PigId,
    DateTime WeighingDate,
    decimal WeightKg,
    BatchStage Stage,
    string? Notes
);

public record RecordBatchWeighingDto(
    Guid BatchId,
    DateTime WeighingDate,
    BatchStage Stage,
    int SampleQuantity,
    decimal TotalSampleWeightKg,
    string? Notes
);

public record GrowthCurvePointDto(
    DateTime Date,
    int AgeDays,
    decimal WeightKg,
    decimal? AverageDailyGainGrams
);
