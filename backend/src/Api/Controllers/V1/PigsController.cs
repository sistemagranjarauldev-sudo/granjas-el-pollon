using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.Pigs.DTOs;
using SistemaGranja.Application.Modules.Pigs.Services;
using SistemaGranja.Domain.Enums;

namespace SistemaGranja.Api.Controllers.V1;

[Authorize]
public class PigsController : ApiControllerBase
{
    private readonly IPigsService _pigsService;

    public PigsController(IPigsService pigsService)
    {
        _pigsService = pigsService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<PigDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPigs(
        [FromHeader(Name = "X-Farm-Id")] Guid farmId,
        [FromQuery] int pageIndex = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] PigSex? sex = null,
        [FromQuery] PigStatus? status = null,
        [FromQuery] Guid? penId = null,
        [FromQuery] Guid? batchId = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _pigsService.GetPigsAsync(farmId, pageIndex, pageSize, search, sex, status, penId, batchId, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PigDetailDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPigById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _pigsService.GetPigByIdAsync(id, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("breeding/{sex}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<PigDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAvailableBreedingPigs(
        [FromHeader(Name = "X-Farm-Id")] Guid farmId,
        PigSex sex,
        CancellationToken cancellationToken)
    {
        var result = await _pigsService.GetAvailableBreedingPigsAsync(farmId, sex, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}/genealogy")]
    [ProducesResponseType(typeof(ApiResponse<GenealogyNodeDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetGenealogyTree(Guid id, [FromQuery] int depth = 3, CancellationToken cancellationToken = default)
    {
        var result = await _pigsService.GetGenealogyTreeAsync(id, depth, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<PigDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreatePig(
        [FromHeader(Name = "X-Farm-Id")] Guid? headerFarmId,
        [FromBody] CreatePigDto dto,
        CancellationToken cancellationToken)
    {
        var farmId = dto.FarmId != Guid.Empty ? dto.FarmId : (headerFarmId ?? Guid.Empty);
        var effectiveDto = dto with { FarmId = farmId };

        var result = await _pigsService.CreatePigAsync(effectiveDto, cancellationToken);
        return HandleResult(result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PigDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePig(Guid id, [FromBody] UpdatePigDto dto, CancellationToken cancellationToken)
    {
        var result = await _pigsService.UpdatePigAsync(id, dto, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost("{id:guid}/move")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MovePig(Guid id, [FromBody] MovePigDto dto, CancellationToken cancellationToken)
    {
        var result = await _pigsService.MovePigAsync(id, dto, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePig(Guid id, CancellationToken cancellationToken)
    {
        var result = await _pigsService.DeletePigAsync(id, cancellationToken);
        return HandleResult(result);
    }
}
