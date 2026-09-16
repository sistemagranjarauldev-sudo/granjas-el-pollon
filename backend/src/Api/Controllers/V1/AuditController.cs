using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.Audit.DTOs;
using SistemaGranja.Application.Modules.Audit.Services;

namespace SistemaGranja.Api.Controllers.V1;

[Authorize]
public class AuditController : ApiControllerBase
{
    private readonly IAuditService _auditService;

    public AuditController(IAuditService auditService)
    {
        _auditService = auditService;
    }

    [HttpGet("logs")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<AuditLogDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? farmId = null,
        [FromQuery] string? module = null,
        [FromQuery] string? action = null,
        [FromQuery] string? entityName = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _auditService.GetAuditLogsAsync(
            pageIndex, pageSize, farmId, module, action, entityName, fromDate, toDate, cancellationToken);

        return HandleResult(result);
    }

    [HttpGet("logs/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<AuditLogDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAuditLogById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _auditService.GetAuditLogByIdAsync(id, cancellationToken);
        return HandleResult(result);
    }
}
