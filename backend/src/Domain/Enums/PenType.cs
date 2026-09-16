namespace SistemaGranja.Domain.Enums;

public enum PenType
{
    IndividualGestationCrate = 1, // Jaula individual de gestación
    GroupGestationPen = 2,        // Corral grupal con o sin alimentación electrónica
    FarrowingCrate = 3,           // Jaula / Sala de maternidad y lactancia
    NurseryPen = 4,               // Corral de destete / transición
    GrowerFinisherPen = 5,        // Corral de cebo / engorde
    BoarPen = 6,                  // Corral de verraco
    HospitalPen = 7,              // Corral de enfermería / aislamiento
    QuarantinePen = 8             // Corral de cuarentena
}
