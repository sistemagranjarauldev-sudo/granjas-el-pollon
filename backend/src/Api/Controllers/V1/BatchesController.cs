using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.Batches.DTOs;
using SistemaGranja.Application.Modules.Batches.Services;
using SistemaGranja.Domain.Enums;

namespace SistemaGranja.Api.Controllers.V1;

[Authorize]
public class BatchesController : ApiControllerBase
{
    private readonly IBatchesService _batchesService;

    public BatchesController(IBatchesService batchesService)
    {
        _batchesService = batchesService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<BatchDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBatches(
        [FromHeader(Name = "X-Farm-Id")] Guid farmId,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] BatchStage? stage = null,
        [FromQuery] BatchStatus? status = null,
        [FromQuery] Guid? penId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _batchesService.GetBatchesAsync(farmId, pageIndex, pageSize, search, stage, status, penId, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<BatchDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBatchById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _batchesService.GetBatchByIdAsync(id, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("active")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<BatchDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetActiveBatches(
        [FromHeader(Name = "X-Farm-Id")] Guid farmId,
        CancellationToken cancellationToken)
    {
        var result = await _batchesService.GetActiveBatchesAsync(farmId, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<BatchDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateBatch(
        [FromHeader(Name = "X-Farm-Id")] Guid? headerFarmId,
        [FromBody] CreateBatchDto dto,
        CancellationToken cancellationToken)
    {
        var farmId = dto.FarmId != Guid.Empty ? dto.FarmId : (headerFarmId ?? Guid.Empty);
        var effectiveDto = dto with { FarmId = farmId };

        var result = await _batchesService.CreateBatchAsync(effectiveDto, cancellationToken);
        return HandleResult(result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<BatchDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateBatch(Guid id, [FromBody] UpdateBatchDto dto, CancellationToken cancellationToken)
    {
        var result = await _batchesService.UpdateBatchAsync(id, dto, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost("{id:guid}/move")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MoveBatch(Guid id, [FromBody] MoveBatchDto dto, CancellationToken cancellationToken)
    {
        var result = await _batchesService.MoveBatchAsync(id, dto, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteBatch(Guid id, CancellationToken cancellationToken)
    {
        var result = await _batchesService.DeleteBatchAsync(id, cancellationToken);
        return HandleResult(result);
    }
}
