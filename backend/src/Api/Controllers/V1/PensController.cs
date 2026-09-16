using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.FarmStructure.DTOs;
using SistemaGranja.Application.Modules.FarmStructure.Services;
using SistemaGranja.Domain.Enums;

namespace SistemaGranja.Api.Controllers.V1;

[Authorize]
public class PensController : ApiControllerBase
{
    private readonly IFarmStructureService _farmService;

    public PensController(IFarmStructureService farmService)
    {
        _farmService = farmService;
    }

    [HttpGet("shed/{shedId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<PenDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPensByShed(Guid shedId, CancellationToken cancellationToken)
    {
        var result = await _farmService.GetPensByShedIdAsync(shedId, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PenDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPenById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _farmService.GetPenByIdAsync(id, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<PenDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreatePen([FromBody] CreatePenDto dto, CancellationToken cancellationToken)
    {
        var result = await _farmService.CreatePenAsync(dto, cancellationToken);
        return HandleResult(result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<PenDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePen(Guid id, [FromBody] UpdatePenDto dto, CancellationToken cancellationToken)
    {
        var result = await _farmService.UpdatePenAsync(id, dto, cancellationToken);
        return HandleResult(result);
    }

    [HttpPatch("{id:guid}/status")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] PenStatus status, CancellationToken cancellationToken)
    {
        var result = await _farmService.UpdatePenStatusAsync(id, status, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePen(Guid id, CancellationToken cancellationToken)
    {
        var result = await _farmService.DeletePenAsync(id, cancellationToken);
        return HandleResult(result);
    }
}
