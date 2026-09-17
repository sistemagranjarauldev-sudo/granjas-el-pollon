using SistemaGranja.Domain.Common;
using SistemaGranja.Domain.Entities.Batches;
using SistemaGranja.Domain.Entities.FarmStructure;
using SistemaGranja.Domain.Entities.Weighings;
using SistemaGranja.Domain.Enums;

namespace SistemaGranja.Domain.Entities.Pigs;

public class Pig : BaseEntity
{
    public Guid FarmId { get; set; }
    public Farm Farm { get; set; } = null!;

    public string IdentificationCode { get; set; } = string.Empty; // Arete / Tatuaje
    public string? ElectronicId { get; set; }                      // Microchip / RFID
    public PigSex Sex { get; set; } = PigSex.Female;
    public string Breed { get; set; } = string.Empty;              // Raza o línea
    public string? GeneticLine { get; set; }                       // ej. Camborough, PIC 337, DanBred
    public DateTime BirthDate { get; set; }
    public DateTime EntryDate { get; set; }
    public PigEntryType EntryType { get; set; } = PigEntryType.BornInFarm;

    // Genealogía
    public Guid? SireId { get; set; }
    public Pig? Sire { get; set; } // Padre (Macho)

    public Guid? DamId { get; set; }
    public Pig? Dam { get; set; }  // Madre (Hembra)

    // Ubicación Física y Lote
    public Guid? CurrentPenId { get; set; }
    public Pen? CurrentPen { get; set; }

    public Guid? CurrentBatchId { get; set; }
    public Batch? CurrentBatch { get; set; }

    // Estados
    public PigStatus Status { get; set; } = PigStatus.Active;
    public ReproductiveStatus ReproductiveStatus { get; set; } = ReproductiveStatus.Gilt;
    public int Parity { get; set; } = 0; // Número de partos acumulados

    public DateTime? ExitDate { get; set; }
    public string? ExitReason { get; set; }
    public string? Notes { get; set; }

    // Relaciones
    public ICollection<PigMovement> Movements { get; set; } = new List<PigMovement>();
    public ICollection<PigWeighing> Weighings { get; set; } = new List<PigWeighing>();
    public ICollection<Pig> OffspringAsSire { get; set; } = new List<Pig>();
    public ICollection<Pig> OffspringAsDam { get; set; } = new List<Pig>();

    // Métodos de Dominio
    public int CalculateAgeInDays(DateTime? targetDate = null)
    {
        var date = targetDate ?? DateTime.UtcNow;
        return Math.Max(0, (int)(date.Date - BirthDate.Date).TotalDays);
    }
}
