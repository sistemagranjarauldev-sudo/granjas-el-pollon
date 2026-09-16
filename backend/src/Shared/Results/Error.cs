namespace SistemaGranja.Shared.Results;

public record Error(string Code, string Description)
{
    public static readonly Error None = new(string.Empty, string.Empty);
    public static readonly Error NullValue = new("Error.NullValue", "Se proporcionó un valor nulo.");
    public static readonly Error NotFound = new("Error.NotFound", "El recurso solicitado no fue encontrado.");
    public static readonly Error Conflict = new("Error.Conflict", "Existe un conflicto con el estado actual del recurso.");
    public static readonly Error Unauthorized = new("Error.Unauthorized", "No autorizado para realizar esta acción.");
    public static readonly Error Forbidden = new("Error.Forbidden", "Permisos insuficientes para acceder a este recurso.");
    public static readonly Error Validation = new("Error.Validation", "Ocurrieron uno o más errores de validación.");
}
