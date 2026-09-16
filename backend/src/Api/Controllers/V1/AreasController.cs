using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.FarmStructure.DTOs;
using SistemaGranja.Application.Modules.FarmStructure.Services;

namespace SistemaGranja.Api.Controllers.V1;

[Authorize]
public class AreasController : ApiControllerBase
{
    private readonly IFarmStructureService _farmService;

    public AreasController(IFarmStructureService farmService)
    {
        _farmService = farmService;
    }

    [HttpGet("farm/{farmId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<AreaDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAreasByFarm(Guid farmId, CancellationToken cancellationToken)
    {
        var result = await _farmService.GetAreasByFarmIdAsync(farmId, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<AreaDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAreaById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _farmService.GetAreaByIdAsync(id, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<AreaDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateArea([FromBody] CreateAreaDto dto, CancellationToken cancellationToken)
    {
        var result = await _farmService.CreateAreaAsync(dto, cancellationToken);
        return HandleResult(result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<AreaDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateArea(Guid id, [FromBody] UpdateAreaDto dto, CancellationToken cancellationToken)
    {
        var result = await _farmService.UpdateAreaAsync(id, dto, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteArea(Guid id, CancellationToken cancellationToken)
    {
        var result = await _farmService.DeleteAreaAsync(id, cancellationToken);
        return HandleResult(result);
    }
}
