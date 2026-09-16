using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.Users.DTOs;
using SistemaGranja.Application.Modules.Users.Services;

namespace SistemaGranja.Api.Controllers.V1;

[Authorize]
public class RolesController : ApiControllerBase
{
    private readonly IUserService _userService;

    public RolesController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<RoleDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRoles(CancellationToken cancellationToken)
    {
        var result = await _userService.GetRolesAsync(cancellationToken);
        return HandleResult(result);
    }

    [HttpGet("permissions")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<PermissionDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPermissions(CancellationToken cancellationToken)
    {
        var result = await _userService.GetPermissionsAsync(cancellationToken);
        return HandleResult(result);
    }
}
