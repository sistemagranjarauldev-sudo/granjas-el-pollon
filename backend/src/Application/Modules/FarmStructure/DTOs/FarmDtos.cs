using SistemaGranja.Domain.Enums;

namespace SistemaGranja.Application.Modules.FarmStructure.DTOs;

public record FarmDto(
    Guid Id,
    string Code,
    string Name,
    string? LegalName,
    string? TaxId,
    string? Location,
    int TotalCapacity,
    int CurrentOccupancy,
    int TotalAreas,
    int TotalSheds,
    int TotalPens,
    bool IsActive,
    DateTime CreatedAt
);

public record CreateFarmDto(
    string Code,
    string Name,
    string? LegalName,
    string? TaxId,
    string? Location,
    int TotalCapacity = 0
);

public record UpdateFarmDto(
    string Name,
    string? LegalName,
    string? TaxId,
    string? Location,
    int TotalCapacity,
    bool IsActive
);

public record AreaDto(
    Guid Id,
    Guid FarmId,
    string Code,
    string Name,
    AreaType AreaType,
    string AreaTypeName,
    string? Description,
    int TotalSheds,
    int TotalPens,
    int TotalCapacity,
    int CurrentOccupancy,
    bool IsActive
);

public record CreateAreaDto(
    Guid FarmId,
    string Code,
    string Name,
    AreaType AreaType,
    string? Description
);

public record UpdateAreaDto(
    string Name,
    AreaType AreaType,
    string? Description,
    bool IsActive
);

public record ShedDto(
    Guid Id,
    Guid AreaId,
    string AreaName,
    string Code,
    string Name,
    int VentilationType,
    int TotalCapacity,
    int CurrentOccupancy,
    int TotalPens,
    bool IsActive
);

public record CreateShedDto(
    Guid AreaId,
    string Code,
    string Name,
    int VentilationType = 1,
    int TotalCapacity = 0
);

public record UpdateShedDto(
    string Name,
    int VentilationType,
    int TotalCapacity,
    bool IsActive
);

public record PenDto(
    Guid Id,
    Guid ShedId,
    string ShedName,
    string AreaName,
    string Code,
    PenType PenType,
    string PenTypeName,
    int MaxCapacity,
    int CurrentOccupancy,
    int AvailableCapacity,
    decimal? DimensionsM2,
    PenStatus Status,
    string StatusName,
    DateTime? SanitizedAt,
    bool IsActive
);

public record CreatePenDto(
    Guid ShedId,
    string Code,
    PenType PenType,
    int MaxCapacity,
    decimal? DimensionsM2
);

public record UpdatePenDto(
    PenType PenType,
    int MaxCapacity,
    decimal? DimensionsM2,
    PenStatus Status,
    bool IsActive
);

public record FarmConfigurationDto(
    Guid Id,
    Guid FarmId,
    string Key,
    string Value,
    string Description,
    string ValueType
);

public record UpdateFarmConfigurationDto(
    string Key,
    string Value
);
