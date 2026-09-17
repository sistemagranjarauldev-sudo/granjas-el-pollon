using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SistemaGranja.Domain.Entities.Weighings;

namespace SistemaGranja.Infrastructure.Persistence.Configurations;

public class PigWeighingConfiguration : IEntityTypeConfiguration<PigWeighing>
{
    public void Configure(EntityTypeBuilder<PigWeighing> builder)
    {
        builder.ToTable("PigWeighings");
        builder.HasKey(w => w.Id);

        builder.Property(w => w.WeightKg).HasColumnType("decimal(8,2)").IsRequired();
        builder.Property(w => w.AverageDailyGainGrams).HasColumnType("decimal(8,2)");
        builder.Property(w => w.WeightGainKg).HasColumnType("decimal(8,2)");
        builder.Property(w => w.ResponsibleUserId).HasMaxLength(100);
        builder.Property(w => w.Notes).HasMaxLength(500);

        builder.HasOne(w => w.Pig)
            .WithMany(p => p.Weighings)
            .HasForeignKey(w => w.PigId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(w => new { w.PigId, w.WeighingDate });
    }
}

public class BatchWeighingConfiguration : IEntityTypeConfiguration<BatchWeighing>
{
    public void Configure(EntityTypeBuilder<BatchWeighing> builder)
    {
        builder.ToTable("BatchWeighings");
        builder.HasKey(w => w.Id);

        builder.Property(w => w.TotalSampleWeightKg).HasColumnType("decimal(10,2)").IsRequired();
        builder.Property(w => w.AverageWeightKg).HasColumnType("decimal(8,2)").IsRequired();
        builder.Property(w => w.EstimatedBatchWeightKg).HasColumnType("decimal(12,2)");
        builder.Property(w => w.AverageDailyGainGrams).HasColumnType("decimal(8,2)");
        builder.Property(w => w.WeightGainKg).HasColumnType("decimal(8,2)");
        builder.Property(w => w.ResponsibleUserId).HasMaxLength(100);
        builder.Property(w => w.Notes).HasMaxLength(500);

        builder.HasOne(w => w.Batch)
            .WithMany(b => b.Weighings)
            .HasForeignKey(w => w.BatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(w => new { w.BatchId, w.WeighingDate });
    }
}
