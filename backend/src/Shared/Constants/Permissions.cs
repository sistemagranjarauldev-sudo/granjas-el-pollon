namespace SistemaGranja.Shared.Constants;

public static class Permissions
{
    // Autenticación y Usuarios
    public const string UsersView = "users:view";
    public const string UsersCreate = "users:create";
    public const string UsersUpdate = "users:update";
    public const string UsersDelete = "users:delete";

    // Estructura de Granja
    public const string FarmsView = "farms:view";
    public const string FarmsCreate = "farms:create";
    public const string FarmsUpdate = "farms:update";
    public const string FarmsDelete = "farms:delete";
    public const string FarmConfigUpdate = "farms:config_update";

    // Áreas, Galpones y Corrales
    public const string AreasManage = "areas:manage";
    public const string ShedsManage = "sheds:manage";
    public const string PensManage = "pens:manage";

    // Auditoría
    public const string AuditView = "audit:view";
}
