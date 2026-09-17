using SistemaGranja.Domain.Enums;

namespace SistemaGranja.Application.Modules.Pigs.DTOs;

public record PigDto(
    Guid Id,
    Guid FarmId,
    string IdentificationCode,
    string? ElectronicId,
    PigSex Sex,
    string SexName,
    string Breed,
    string? GeneticLine,
    DateTime BirthDate,
    DateTime EntryDate,
    PigEntryType EntryType,
    string EntryTypeName,
    Guid? SireId,
    string? SireCode,
    Guid? DamId,
    string? DamCode,
    Guid? CurrentPenId,
    string? PenCode,
    string? ShedName,
    string? AreaName,
    Guid? CurrentBatchId,
    string? BatchCode,
    PigStatus Status,
    string StatusName,
    ReproductiveStatus ReproductiveStatus,
    string ReproductiveStatusName,
    int Parity,
    int AgeInDays,
    decimal? CurrentWeightKg,
    DateTime? LastWeighingDate,
    DateTime? ExitDate,
    string? ExitReason,
    string? Notes,
    DateTime CreatedAt
);

public record PigDetailDto(
    Guid Id,
    Guid FarmId,
    string IdentificationCode,
    string? ElectronicId,
    PigSex Sex,
    string SexName,
    string Breed,
    string? GeneticLine,
    DateTime BirthDate,
    DateTime EntryDate,
    PigEntryType EntryType,
    string EntryTypeName,
    Guid? SireId,
    string? SireCode,
    string? SireBreed,
    Guid? DamId,
    string? DamCode,
    string? DamBreed,
    Guid? CurrentPenId,
    string? PenCode,
    string? ShedName,
    string? AreaName,
    Guid? CurrentBatchId,
    string? BatchCode,
    PigStatus Status,
    string StatusName,
    ReproductiveStatus ReproductiveStatus,
    string ReproductiveStatusName,
    int Parity,
    int AgeInDays,
    decimal? CurrentWeightKg,
    DateTime? LastWeighingDate,
    DateTime? ExitDate,
    string? ExitReason,
    string? Notes,
    DateTime CreatedAt,
    IReadOnlyList<PigMovementDto> Movements,
    IReadOnlyList<PigWeighingSummaryDto> Weighings
);

public record PigMovementDto(
    Guid Id,
    Guid PigId,
    Guid? SourcePenId,
    string? SourcePenCode,
    Guid TargetPenId,
    string TargetPenCode,
    DateTime MovementDate,
    string Reason,
    string? ResponsibleUserId,
    string? Notes,
    DateTime CreatedAt
);

public record PigWeighingSummaryDto(
    Guid Id,
    DateTime WeighingDate,
    decimal WeightKg,
    int AgeDays,
    BatchStage Stage,
    decimal? AverageDailyGainGrams,
    decimal? WeightGainKg,
    int? DaysElapsed,
    string? Notes
);

public record CreatePigDto(
    Guid FarmId,
    string IdentificationCode,
    string? ElectronicId,
    PigSex Sex,
    string Breed,
    string? GeneticLine,
    DateTime BirthDate,
    DateTime EntryDate,
    PigEntryType EntryType,
    Guid? SireId,
    Guid? DamId,
    Guid? CurrentPenId,
    Guid? CurrentBatchId,
    ReproductiveStatus ReproductiveStatus,
    string? Notes
);

public record UpdatePigDto(
    string? ElectronicId,
    string Breed,
    string? GeneticLine,
    DateTime BirthDate,
    Guid? SireId,
    Guid? DamId,
    PigStatus Status,
    ReproductiveStatus ReproductiveStatus,
    int Parity,
    DateTime? ExitDate,
    string? ExitReason,
    string? Notes
);

public record MovePigDto(
    Guid TargetPenId,
    string Reason,
    string? Notes
);

public record GenealogyNodeDto(
    Guid Id,
    string Code,
    PigSex Sex,
    string Breed,
    GenealogyNodeDto? Sire,
    GenealogyNodeDto? Dam
);
