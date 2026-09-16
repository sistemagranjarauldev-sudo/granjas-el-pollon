namespace SistemaGranja.Application.Modules.Audit.DTOs;

public record AuditLogDto(
    Guid Id,
    string? UserId,
    string? UserName,
    Guid? FarmId,
    string Action,
    string Module,
    string EntityName,
    string EntityId,
    string? OldValues,
    string? NewValues,
    string? ChangedColumns,
    string? IpAddress,
    string? UserAgent,
    DateTime Timestamp
);
