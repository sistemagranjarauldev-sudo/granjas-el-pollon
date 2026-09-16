using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.FarmStructure.DTOs;
using SistemaGranja.Application.Modules.FarmStructure.Services;

namespace SistemaGranja.Api.Controllers.V1;

[Authorize]
public class ShedsController : ApiControllerBase
{
    private readonly IFarmStructureService _farmService;

    public ShedsController(IFarmStructureService farmService)
    {
        _farmService = farmService;
    }

    [HttpGet("area/{areaId:guid}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<ShedDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetShedsByArea(Guid areaId, CancellationToken cancellationToken)
    {
        var result = await _farmService.GetShedsByAreaIdAsync(areaId, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ShedDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetShedById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _farmService.GetShedByIdAsync(id, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<ShedDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateShed([FromBody] CreateShedDto dto, CancellationToken cancellationToken)
    {
        var result = await _farmService.CreateShedAsync(dto, cancellationToken);
        return HandleResult(result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<ShedDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateShed(Guid id, [FromBody] UpdateShedDto dto, CancellationToken cancellationToken)
    {
        var result = await _farmService.UpdateShedAsync(id, dto, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteShed(Guid id, CancellationToken cancellationToken)
    {
        var result = await _farmService.DeleteShedAsync(id, cancellationToken);
        return HandleResult(result);
    }
}
