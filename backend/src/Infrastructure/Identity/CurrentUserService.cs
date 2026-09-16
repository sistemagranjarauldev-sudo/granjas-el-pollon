using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using SistemaGranja.Application.Common.Interfaces;

namespace SistemaGranja.Infrastructure.Identity;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) 
                          ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue("sub");

    public string? UserName => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name)
                            ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

    public Guid? FarmId
    {
        get
        {
            if (_httpContextAccessor.HttpContext?.Request?.Headers.TryGetValue("X-Farm-Id", out var farmIdHeader) == true &&
                Guid.TryParse(farmIdHeader, out var farmGuid))
            {
                return farmGuid;
            }
            return null;
        }
    }

    public string? IpAddress => _httpContextAccessor.HttpContext?.Connection?.RemoteIpAddress?.ToString();

    public string? UserAgent => _httpContextAccessor.HttpContext?.Request?.Headers["User-Agent"].ToString();

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;
}
