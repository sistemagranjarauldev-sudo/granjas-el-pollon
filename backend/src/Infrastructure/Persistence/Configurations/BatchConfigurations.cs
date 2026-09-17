using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SistemaGranja.Domain.Entities.Batches;

namespace SistemaGranja.Infrastructure.Persistence.Configurations;

public class BatchConfiguration : IEntityTypeConfiguration<Batch>
{
    public void Configure(EntityTypeBuilder<Batch> builder)
    {
        builder.ToTable("Batches");
        builder.HasKey(b => b.Id);

        builder.Property(b => b.Code).IsRequired().HasMaxLength(50);
        builder.Property(b => b.Name).IsRequired().HasMaxLength(150);
        builder.Property(b => b.InitialWeightKg).HasColumnType("decimal(10,2)");
        builder.Property(b => b.Notes).HasMaxLength(1000);

        builder.HasOne(b => b.Farm)
            .WithMany()
            .HasForeignKey(b => b.FarmId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(b => b.CurrentPen)
            .WithMany()
            .HasForeignKey(b => b.CurrentPenId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(b => new { b.FarmId, b.Code }).IsUnique().HasFilter("IsDeleted = 0");
        builder.HasIndex(b => new { b.FarmId, b.Status });
        builder.HasIndex(b => b.CurrentPenId);
    }
}

public class BatchMovementConfiguration : IEntityTypeConfiguration<BatchMovement>
{
    public void Configure(EntityTypeBuilder<BatchMovement> builder)
    {
        builder.ToTable("BatchMovements");
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Reason).IsRequired().HasMaxLength(200);
        builder.Property(m => m.ResponsibleUserId).HasMaxLength(100);
        builder.Property(m => m.Notes).HasMaxLength(500);

        builder.HasOne(m => m.Batch)
            .WithMany(b => b.Movements)
            .HasForeignKey(m => m.BatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(m => m.SourcePen)
            .WithMany()
            .HasForeignKey(m => m.SourcePenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.TargetPen)
            .WithMany()
            .HasForeignKey(m => m.TargetPenId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(m => new { m.BatchId, m.MovementDate });
    }
}
