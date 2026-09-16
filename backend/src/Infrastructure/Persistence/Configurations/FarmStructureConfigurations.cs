using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SistemaGranja.Domain.Entities.FarmStructure;

namespace SistemaGranja.Infrastructure.Persistence.Configurations;

public class FarmEntityConfiguration : IEntityTypeConfiguration<Farm>
{
    public void Configure(EntityTypeBuilder<Farm> builder)
    {
        builder.ToTable("Farms");
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Code).IsRequired().HasMaxLength(50);
        builder.Property(f => f.Name).IsRequired().HasMaxLength(150);
        builder.Property(f => f.LegalName).HasMaxLength(200);
        builder.Property(f => f.TaxId).HasMaxLength(50);
        builder.Property(f => f.Location).HasMaxLength(250);

        builder.HasIndex(f => f.Code).IsUnique().HasFilter("IsDeleted = 0");
    }
}

public class AreaConfiguration : IEntityTypeConfiguration<Area>
{
    public void Configure(EntityTypeBuilder<Area> builder)
    {
        builder.ToTable("Areas");
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Code).IsRequired().HasMaxLength(50);
        builder.Property(a => a.Name).IsRequired().HasMaxLength(100);
        builder.Property(a => a.Description).HasMaxLength(500);

        builder.HasOne(a => a.Farm)
            .WithMany(f => f.Areas)
            .HasForeignKey(a => a.FarmId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(a => new { a.FarmId, a.Code }).IsUnique().HasFilter("IsDeleted = 0");
    }
}

public class ShedConfiguration : IEntityTypeConfiguration<Shed>
{
    public void Configure(EntityTypeBuilder<Shed> builder)
    {
        builder.ToTable("Sheds");
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Code).IsRequired().HasMaxLength(50);
        builder.Property(s => s.Name).IsRequired().HasMaxLength(100);

        builder.HasOne(s => s.Area)
            .WithMany(a => a.Sheds)
            .HasForeignKey(s => s.AreaId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(s => new { s.AreaId, s.Code }).IsUnique().HasFilter("IsDeleted = 0");
    }
}

public class PenConfiguration : IEntityTypeConfiguration<Pen>
{
    public void Configure(EntityTypeBuilder<Pen> builder)
    {
        builder.ToTable("Pens");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Code).IsRequired().HasMaxLength(50);
        builder.Property(p => p.DimensionsM2).HasColumnType("decimal(8,2)");

        builder.HasOne(p => p.Shed)
            .WithMany(s => s.Pens)
            .HasForeignKey(p => p.ShedId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => new { p.ShedId, p.Code }).IsUnique().HasFilter("IsDeleted = 0");
    }
}

public class FarmConfigurationEntityTypeConfiguration : IEntityTypeConfiguration<FarmConfiguration>
{
    public void Configure(EntityTypeBuilder<FarmConfiguration> builder)
    {
        builder.ToTable("FarmConfigurations");
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Key).IsRequired().HasMaxLength(100);
        builder.Property(c => c.Value).IsRequired().HasMaxLength(1000);
        builder.Property(c => c.Description).HasMaxLength(250);
        builder.Property(c => c.ValueType).HasMaxLength(50);

        builder.HasOne(c => c.Farm)
            .WithMany(f => f.Configurations)
            .HasForeignKey(c => c.FarmId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(c => new { c.FarmId, c.Key }).IsUnique().HasFilter("IsDeleted = 0");
    }
}
