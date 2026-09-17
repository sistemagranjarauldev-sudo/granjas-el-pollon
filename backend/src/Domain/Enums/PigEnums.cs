namespace SistemaGranja.Domain.Enums;

public enum PigSex
{
    Female = 1,       // Cerda reproductora / Primeriza
    Male = 2,         // Verraco reproductor
    CastratedMale = 3 // Cebón / Lechón castrado
}

public enum PigStatus
{
    Active = 1,      // Activo en granja
    Sold = 2,        // Vendido
    Dead = 3,        // Muerto
    Culled = 4,      // Descartado / Desecho
    Transferred = 5  // Trasladado a otra granja
}

public enum ReproductiveStatus
{
    Gilt = 1,        // Primeriza / Nulípara
    Open = 2,        // Vacía / En espera de celo
    Inseminated = 3, // Inseminada / Servida recientemente
    Pregnant = 4,    // Confirmada gestante (Ecografía positiva)
    Lactating = 5,   // En maternidad amamantando camada
    Dry = 6          // Seca / Destetada
}

public enum PigEntryType
{
    BornInFarm = 1,  // Nacido en granja
    Purchased = 2,   // Comprado de granja externa / Pie de cría
    Transferred = 3  // Trasladado de otra unidad productiva
}

public enum BatchStage
{
    Lactation = 1,        // Lactancia (Maternidad 0 - 21/28 días)
    Nursery = 2,          // Destete / Transición / Recría (6kg - 30kg)
    Grower = 3,           // Crecimiento / Desarrollo (30kg - 65kg)
    Finisher = 4,         // Cebo / Engorde final (65kg - 115kg+)
    ReplacementGilt = 5   // Futuras reproductoras
}

public enum BatchStatus
{
    Active = 1,      // Lote activo en engorde/recría
    Closed = 2,      // Lote cerrado / liquidado completamente
    Transferred = 3, // Lote transferido
    Sold = 4         // Lote vendido
}
