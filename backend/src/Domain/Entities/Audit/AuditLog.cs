namespace SistemaGranja.Domain.Entities.Audit;

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public Guid? FarmId { get; set; }
    public string Action { get; set; } = string.Empty;       // CREATE, UPDATE, DELETE, VOID, LOGIN, LOGOUT
    public string Module { get; set; } = string.Empty;       // FarmStructure, Pigs, etc.
    public string EntityName { get; set; } = string.Empty;   // Farm, Area, Pen, etc.
    public string EntityId { get; set; } = string.Empty;     // PK as string
    public string? OldValues { get; set; }                   // JSON
    public string? NewValues { get; set; }                   // JSON
    public string? ChangedColumns { get; set; }              // JSON array
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
