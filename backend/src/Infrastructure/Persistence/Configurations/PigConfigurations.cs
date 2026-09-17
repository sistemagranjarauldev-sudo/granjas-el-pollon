using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SistemaGranja.Domain.Entities.Pigs;

namespace SistemaGranja.Infrastructure.Persistence.Configurations;

public class PigConfiguration : IEntityTypeConfiguration<Pig>
{
    public void Configure(EntityTypeBuilder<Pig> builder)
    {
        builder.ToTable("Pigs");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.IdentificationCode).IsRequired().HasMaxLength(50);
        builder.Property(p => p.ElectronicId).HasMaxLength(50);
        builder.Property(p => p.Breed).IsRequired().HasMaxLength(100);
        builder.Property(p => p.GeneticLine).HasMaxLength(100);
        builder.Property(p => p.ExitReason).HasMaxLength(250);
        builder.Property(p => p.Notes).HasMaxLength(1000);

        builder.HasOne(p => p.Farm)
            .WithMany()
            .HasForeignKey(p => p.FarmId)
            .OnDelete(DeleteBehavior.Restrict);

        // Padre (Sire)
        builder.HasOne(p => p.Sire)
            .WithMany(s => s.OffspringAsSire)
            .HasForeignKey(p => p.SireId)
            .OnDelete(DeleteBehavior.Restrict);

        // Madre (Dam)
        builder.HasOne(p => p.Dam)
            .WithMany(d => d.OffspringAsDam)
            .HasForeignKey(p => p.DamId)
            .OnDelete(DeleteBehavior.Restrict);

        // Ubicación
        builder.HasOne(p => p.CurrentPen)
            .WithMany()
            .HasForeignKey(p => p.CurrentPenId)
            .OnDelete(DeleteBehavior.SetNull);

        // Lote
        builder.HasOne(p => p.CurrentBatch)
            .WithMany(b => b.Pigs)
            .HasForeignKey(p => p.CurrentBatchId)
            .OnDelete(DeleteBehavior.SetNull);

        // Índices únicos y de búsqueda
        builder.HasIndex(p => new { p.FarmId, p.IdentificationCode }).IsUnique().HasFilter("IsDeleted = 0");
        builder.HasIndex(p => new { p.FarmId, p.Status });
        builder.HasIndex(p => p.CurrentPenId);
        builder.HasIndex(p => p.CurrentBatchId);
        builder.HasIndex(p => p.SireId);
        builder.HasIndex(p => p.DamId);
    }
}

public class PigMovementConfiguration : IEntityTypeConfiguration<PigMovement>
{
    public void Configure(EntityTypeBuilder<PigMovement> builder)
    {
        builder.ToTable("PigMovements");
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Reason).IsRequired().HasMaxLength(200);
        builder.Property(m => m.ResponsibleUserId).HasMaxLength(100);
        builder.Property(m => m.Notes).HasMaxLength(500);

        builder.HasOne(m => m.Pig)
            .WithMany(p => p.Movements)
            .HasForeignKey(m => m.PigId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.SourcePen)
            .WithMany()
            .HasForeignKey(m => m.SourcePenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.TargetPen)
            .WithMany()
            .HasForeignKey(m => m.TargetPenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(m => new { m.PigId, m.MovementDate });
    }
}
