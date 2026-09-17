using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.Weighings.DTOs;
using SistemaGranja.Application.Modules.Weighings.Services;

namespace SistemaGranja.Api.Controllers.V1;

[Authorize]
public class WeighingsController : ApiControllerBase
{
    private readonly IWeighingsService _weighingsService;

    public WeighingsController(IWeighingsService weighingsService)
    {
        _weighingsService = weighingsService;
    }

    [HttpGet("pigs")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<PigWeighingDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPigWeighings(
        [FromHeader(Name = "X-Farm-Id")] Guid? farmId,
        [FromQuery] Guid? pigId,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _weighingsService.GetPigWeighingsAsync(pigId, farmId, pageIndex, pageSize, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("batches")]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<BatchWeighingDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBatchWeighings(
        [FromHeader(Name = "X-Farm-Id")] Guid? farmId,
        [FromQuery] Guid? batchId,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _weighingsService.GetBatchWeighingsAsync(batchId, farmId, pageIndex, pageSize, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("pigs/{pigId:guid}/curve")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<GrowthCurvePointDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPigGrowthCurve(Guid pigId, CancellationToken cancellationToken)
    {
        var result = await _weighingsService.GetPigGrowthCurveAsync(pigId, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("batches/{batchId:guid}/curve")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<GrowthCurvePointDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBatchGrowthCurve(Guid batchId, CancellationToken cancellationToken)
    {
        var result = await _weighingsService.GetBatchGrowthCurveAsync(batchId, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost("pigs")]
    [ProducesResponseType(typeof(ApiResponse<PigWeighingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RecordPigWeighing([FromBody] RecordPigWeighingDto dto, CancellationToken cancellationToken)
    {
        var result = await _weighingsService.RecordPigWeighingAsync(dto, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost("batches")]
    [ProducesResponseType(typeof(ApiResponse<BatchWeighingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RecordBatchWeighing([FromBody] RecordBatchWeighingDto dto, CancellationToken cancellationToken)
    {
        var result = await _weighingsService.RecordBatchWeighingAsync(dto, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("pigs/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePigWeighing(Guid id, CancellationToken cancellationToken)
    {
        var result = await _weighingsService.DeletePigWeighingAsync(id, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("batches/{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteBatchWeighing(Guid id, CancellationToken cancellationToken)
    {
        var result = await _weighingsService.DeleteBatchWeighingAsync(id, cancellationToken);
        return HandleResult(result);
    }
}
