using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.FarmStructure.DTOs;
using SistemaGranja.Application.Modules.FarmStructure.Services;

namespace SistemaGranja.Api.Controllers.V1;

[Authorize]
public class FarmsController : ApiControllerBase
{
    private readonly IFarmStructureService _farmService;

    public FarmsController(IFarmStructureService farmService)
    {
        _farmService = farmService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PaginatedList<FarmDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFarms([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null, CancellationToken cancellationToken = default)
    {
        var result = await _farmService.GetFarmsAsync(pageIndex, pageSize, search, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<FarmDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFarmById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _farmService.GetFarmByIdAsync(id, cancellationToken);
        return HandleResult(result);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<FarmDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateFarm([FromBody] CreateFarmDto dto, CancellationToken cancellationToken)
    {
        var result = await _farmService.CreateFarmAsync(dto, cancellationToken);
        return HandleResult(result);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<FarmDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateFarm(Guid id, [FromBody] UpdateFarmDto dto, CancellationToken cancellationToken)
    {
        var result = await _farmService.UpdateFarmAsync(id, dto, cancellationToken);
        return HandleResult(result);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteFarm(Guid id, CancellationToken cancellationToken)
    {
        var result = await _farmService.DeleteFarmAsync(id, cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("{id:guid}/configurations")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<FarmConfigurationDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetConfigurations(Guid id, CancellationToken cancellationToken)
    {
        var result = await _farmService.GetFarmConfigurationsAsync(id, cancellationToken);
        return HandleResult(result);
    }

    [HttpPut("{id:guid}/configurations")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateConfiguration(Guid id, [FromBody] UpdateFarmConfigurationDto dto, CancellationToken cancellationToken)
    {
        var result = await _farmService.UpdateFarmConfigurationAsync(id, dto, cancellationToken);
        return HandleResult(result);
    }
}
