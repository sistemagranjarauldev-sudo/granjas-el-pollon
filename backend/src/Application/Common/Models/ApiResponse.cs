namespace SistemaGranja.Application.Common.Models;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public IDictionary<string, string[]>? Errors { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "Operación completada exitosamente.") =>
        new() { Success = true, Data = data, Message = message };

    public static ApiResponse<T> Fail(string message, IDictionary<string, string[]>? errors = null) =>
        new() { Success = false, Message = message, Errors = errors };
}

public class ApiResponse : ApiResponse<object>
{
    public static ApiResponse Ok(string message = "Operación completada exitosamente.") =>
        new() { Success = true, Message = message };

    public static new ApiResponse Fail(string message, IDictionary<string, string[]>? errors = null) =>
        new() { Success = false, Message = message, Errors = errors };
}
