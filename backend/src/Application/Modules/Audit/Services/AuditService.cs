using Microsoft.EntityFrameworkCore;
using SistemaGranja.Application.Common.Interfaces;
using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.Audit.DTOs;
using SistemaGranja.Shared.Results;

namespace SistemaGranja.Application.Modules.Audit.Services;

public interface IAuditService
{
    Task<Result<PaginatedList<AuditLogDto>>> GetAuditLogsAsync(
        int pageIndex, 
        int pageSize, 
        Guid? farmId = null,
        string? module = null,
        string? action = null,
        string? entityName = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        CancellationToken cancellationToken = default);

    Task<Result<AuditLogDto>> GetAuditLogByIdAsync(Guid id, CancellationToken cancellationToken = default);
}

public class AuditService : IAuditService
{
    private readonly IApplicationDbContext _context;

    public AuditService(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedList<AuditLogDto>>> GetAuditLogsAsync(
        int pageIndex,
        int pageSize,
        Guid? farmId = null,
        string? module = null,
        string? action = null,
        string? entityName = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.AuditLogs.AsNoTracking().AsQueryable();

        if (farmId.HasValue)
            query = query.Where(a => a.FarmId == farmId.Value);

        if (!string.IsNullOrWhiteSpace(module))
            query = query.Where(a => a.Module.ToLower() == module.ToLower().Trim());

        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action.ToLower() == action.ToLower().Trim());

        if (!string.IsNullOrWhiteSpace(entityName))
            query = query.Where(a => a.EntityName.ToLower() == entityName.ToLower().Trim());

        if (fromDate.HasValue)
            query = query.Where(a => a.Timestamp >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(a => a.Timestamp <= toDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);
        var logs = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = logs.Select(l => new AuditLogDto(
            l.Id,
            l.UserId,
            l.UserName,
            l.FarmId,
            l.Action,
            l.Module,
            l.EntityName,
            l.EntityId,
            l.OldValues,
            l.NewValues,
            l.ChangedColumns,
            l.IpAddress,
            l.UserAgent,
            l.Timestamp
        )).ToList();

        return Result<PaginatedList<AuditLogDto>>.Success(new PaginatedList<AuditLogDto>(dtos, totalCount, pageIndex, pageSize));
    }

    public async Task<Result<AuditLogDto>> GetAuditLogByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var log = await _context.AuditLogs.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
        if (log == null)
            return Result<AuditLogDto>.Failure(Error.NotFound);

        return Result<AuditLogDto>.Success(new AuditLogDto(
            log.Id,
            log.UserId,
            log.UserName,
            log.FarmId,
            log.Action,
            log.Module,
            log.EntityName,
            log.EntityId,
            log.OldValues,
            log.NewValues,
            log.ChangedColumns,
            log.IpAddress,
            log.UserAgent,
            log.Timestamp
        ));
    }
}
