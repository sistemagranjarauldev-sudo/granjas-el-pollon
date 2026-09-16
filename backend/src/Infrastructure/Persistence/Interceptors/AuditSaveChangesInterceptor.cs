using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using SistemaGranja.Application.Common.Interfaces;
using SistemaGranja.Domain.Entities.Audit;

namespace SistemaGranja.Infrastructure.Persistence.Interceptors;

public class AuditSaveChangesInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUserService _currentUserService;
    private List<AuditEntry>? _auditEntries;

    public AuditSaveChangesInterceptor(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        _auditEntries = OnBeforeSaveChanges(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        _auditEntries = OnBeforeSaveChanges(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override int SavedChanges(SaveChangesCompletedEventData eventData, int result)
    {
        OnAfterSaveChanges(eventData.Context);
        return base.SavedChanges(eventData, result);
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default)
    {
        await OnAfterSaveChangesAsync(eventData.Context, cancellationToken);
        return await base.SavedChangesAsync(eventData, result, cancellationToken);
    }

    private List<AuditEntry> OnBeforeSaveChanges(DbContext? context)
    {
        if (context == null) return new List<AuditEntry>();

        context.ChangeTracker.DetectChanges();
        var auditEntries = new List<AuditEntry>();

        foreach (var entry in context.ChangeTracker.Entries())
        {
            if (entry.Entity is AuditLog || entry.State == EntityState.Detached || entry.State == EntityState.Unchanged)
                continue;

            var auditEntry = new AuditEntry(entry)
            {
                EntityName = entry.Entity.GetType().Name,
                UserId = _currentUserService.UserId,
                UserName = _currentUserService.UserName,
                FarmId = _currentUserService.FarmId,
                IpAddress = _currentUserService.IpAddress,
                UserAgent = _currentUserService.UserAgent,
                Timestamp = DateTime.UtcNow
            };

            auditEntries.Add(auditEntry);

            foreach (var property in entry.Properties)
            {
                if (property.IsTemporary)
                {
                    auditEntry.TemporaryProperties.Add(property);
                    continue;
                }

                string propertyName = property.Metadata.Name;
                if (property.Metadata.IsPrimaryKey())
                {
                    auditEntry.KeyValues[propertyName] = property.CurrentValue;
                    continue;
                }

                switch (entry.State)
                {
                    case EntityState.Added:
                        auditEntry.Action = "CREATE";
                        auditEntry.NewValues[propertyName] = property.CurrentValue;
                        break;

                    case EntityState.Deleted:
                        auditEntry.Action = "DELETE";
                        auditEntry.OldValues[propertyName] = property.OriginalValue;
                        break;

                    case EntityState.Modified:
                        if (property.IsModified)
                        {
                            auditEntry.Action = "UPDATE";
                            auditEntry.ChangedColumns.Add(propertyName);
                            auditEntry.OldValues[propertyName] = property.OriginalValue;
                            auditEntry.NewValues[propertyName] = property.CurrentValue;
                        }
                        break;
                }
            }
        }

        return auditEntries;
    }

    private void OnAfterSaveChanges(DbContext? context)
    {
        if (context == null || _auditEntries == null || _auditEntries.Count == 0) return;

        foreach (var auditEntry in _auditEntries)
        {
            foreach (var prop in auditEntry.TemporaryProperties)
            {
                if (prop.Metadata.IsPrimaryKey())
                {
                    auditEntry.KeyValues[prop.Metadata.Name] = prop.CurrentValue;
                }
                else
                {
                    auditEntry.NewValues[prop.Metadata.Name] = prop.CurrentValue;
                }
            }

            context.Set<AuditLog>().Add(auditEntry.ToAudit());
        }

        context.SaveChanges();
    }

    private async Task OnAfterSaveChangesAsync(DbContext? context, CancellationToken cancellationToken)
    {
        if (context == null || _auditEntries == null || _auditEntries.Count == 0) return;

        foreach (var auditEntry in _auditEntries)
        {
            foreach (var prop in auditEntry.TemporaryProperties)
            {
                if (prop.Metadata.IsPrimaryKey())
                {
                    auditEntry.KeyValues[prop.Metadata.Name] = prop.CurrentValue;
                }
                else
                {
                    auditEntry.NewValues[prop.Metadata.Name] = prop.CurrentValue;
                }
            }

            context.Set<AuditLog>().Add(auditEntry.ToAudit());
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}

internal class AuditEntry
{
    public EntityEntry Entry { get; }
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public Guid? FarmId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public DateTime Timestamp { get; set; }
    public Dictionary<string, object?> KeyValues { get; } = new();
    public Dictionary<string, object?> OldValues { get; } = new();
    public Dictionary<string, object?> NewValues { get; } = new();
    public List<PropertyEntry> TemporaryProperties { get; } = new();
    public List<string> ChangedColumns { get; } = new();

    public AuditEntry(EntityEntry entry)
    {
        Entry = entry;
    }

    public AuditLog ToAudit()
    {
        return new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = UserId,
            UserName = UserName,
            FarmId = FarmId,
            Action = Action,
            Module = DetermineModule(EntityName),
            EntityName = EntityName,
            EntityId = KeyValues.Values.FirstOrDefault()?.ToString() ?? Guid.Empty.ToString(),
            OldValues = OldValues.Count == 0 ? null : JsonSerializer.Serialize(OldValues),
            NewValues = NewValues.Count == 0 ? null : JsonSerializer.Serialize(NewValues),
            ChangedColumns = ChangedColumns.Count == 0 ? null : JsonSerializer.Serialize(ChangedColumns),
            IpAddress = IpAddress,
            UserAgent = UserAgent,
            Timestamp = Timestamp
        };
    }

    private static string DetermineModule(string entityName) => entityName switch
    {
        "User" or "Role" or "Permission" or "UserRole" or "RolePermission" or "UserFarm" or "RefreshToken" => "Security",
        "Farm" or "Area" or "Shed" or "Pen" or "FarmConfiguration" => "FarmStructure",
        _ => "General"
    };
}
