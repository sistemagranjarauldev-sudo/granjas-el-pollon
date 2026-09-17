using SistemaGranja.Domain.Enums;

namespace SistemaGranja.Application.Modules.Batches.DTOs;

public record BatchDto(
    Guid Id,
    Guid FarmId,
    string Code,
    string Name,
    BatchStage Stage,
    string StageName,
    DateTime StartDate,
    DateTime? EndDate,
    int InitialQuantity,
    int CurrentQuantity,
    decimal? InitialWeightKg,
    decimal? CurrentAverageWeightKg,
    DateTime? LastWeighingDate,
    Guid? CurrentPenId,
    string? PenCode,
    string? ShedName,
    string? AreaName,
    BatchStatus Status,
    string StatusName,
    int DaysInBatch,
    string? Notes,
    DateTime CreatedAt
);

public record BatchDetailDto(
    Guid Id,
    Guid FarmId,
    string Code,
    string Name,
    BatchStage Stage,
    string StageName,
    DateTime StartDate,
    DateTime? EndDate,
    int InitialQuantity,
    int CurrentQuantity,
    decimal? InitialWeightKg,
    decimal? CurrentAverageWeightKg,
    DateTime? LastWeighingDate,
    Guid? CurrentPenId,
    string? PenCode,
    string? ShedName,
    string? AreaName,
    BatchStatus Status,
    string StatusName,
    int DaysInBatch,
    string? Notes,
    DateTime CreatedAt,
    IReadOnlyList<BatchMovementDto> Movements,
    IReadOnlyList<BatchWeighingSummaryDto> Weighings
);

public record BatchMovementDto(
    Guid Id,
    Guid BatchId,
    Guid? SourcePenId,
    string? SourcePenCode,
    Guid TargetPenId,
    string TargetPenCode,
    int Quantity,
    DateTime MovementDate,
    string Reason,
    string? ResponsibleUserId,
    string? Notes,
    DateTime CreatedAt
);

public record BatchWeighingSummaryDto(
    Guid Id,
    DateTime WeighingDate,
    BatchStage Stage,
    int SampleQuantity,
    decimal TotalSampleWeightKg,
    decimal AverageWeightKg,
    decimal? EstimatedBatchWeightKg,
    decimal? AverageDailyGainGrams,
    decimal? WeightGainKg,
    int? DaysElapsed,
    string? Notes
);

public record CreateBatchDto(
    Guid FarmId,
    string Code,
    string Name,
    BatchStage Stage,
    DateTime StartDate,
    int InitialQuantity,
    decimal? InitialWeightKg,
    Guid? CurrentPenId,
    string? Notes
);

public record UpdateBatchDto(
    string Name,
    BatchStage Stage,
    BatchStatus Status,
    DateTime? EndDate,
    string? Notes
);

public record MoveBatchDto(
    Guid TargetPenId,
    int Quantity,
    string Reason,
    string? Notes
);
