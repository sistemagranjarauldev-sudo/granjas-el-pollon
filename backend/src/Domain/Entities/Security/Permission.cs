using SistemaGranja.Domain.Common;

namespace SistemaGranja.Domain.Entities.Security;

public class Permission : BaseEntity
{
    public string Code { get; set; } = string.Empty;       // e.g. "farms:create", "pigs:view"
    public string Module { get; set; } = string.Empty;     // e.g. "FarmStructure", "Pigs"
    public string Description { get; set; } = string.Empty;

    // Relaciones
    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
