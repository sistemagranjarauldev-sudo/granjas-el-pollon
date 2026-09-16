using Microsoft.AspNetCore.Mvc;
using SistemaGranja.Application.Common.Models;
using SistemaGranja.Shared.Results;

namespace SistemaGranja.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult HandleResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
            return Ok(ApiResponse<T>.Ok(result.Value));

        return HandleError(result.Error);
    }

    protected IActionResult HandleResult(Result result)
    {
        if (result.IsSuccess)
            return Ok(ApiResponse.Ok());

        return HandleError(result.Error);
    }

    private IActionResult HandleError(Error error)
    {
        return error.Code switch
        {
            "Error.NotFound" => NotFound(ApiResponse.Fail(error.Description)),
            "Error.Unauthorized" => Unauthorized(ApiResponse.Fail(error.Description)),
            "Error.Forbidden" => StatusCode(StatusCodes.Status403Forbidden, ApiResponse.Fail(error.Description)),
            "Error.Conflict" or "Farm.CodeExists" or "Area.CodeExists" or "Shed.CodeExists" or "Pen.CodeExists" or "User.EmailExists" or "User.UsernameExists" => 
                Conflict(ApiResponse.Fail(error.Description)),
            _ => BadRequest(ApiResponse.Fail(error.Description))
        };
    }
}
