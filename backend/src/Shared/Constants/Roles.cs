namespace SistemaGranja.Shared.Constants;

public static class Roles
{
    public const string Administrator = "Administrador";
    public const string FarmManager = "Gerente";
    public const string Veterinarian = "Veterinario";
    public const string Production = "Producción";
    public const string Warehouse = "Almacén";
    public const string Sales = "Ventas";
    public const string Operator = "Operario";

    public static readonly string[] AllRoles = 
    {
        Administrator, FarmManager, Veterinarian, Production, Warehouse, Sales, Operator
    };
}
