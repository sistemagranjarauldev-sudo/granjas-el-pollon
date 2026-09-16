namespace SistemaGranja.Domain.Enums;

public enum PenStatus
{
    Empty = 1,          // Vacío y disponible
    Occupied = 2,       // Ocupado con animales
    Maintenance = 3,    // En reparación / mantenimiento
    Sanitizing = 4      // En vacío sanitario / desinfección
}
