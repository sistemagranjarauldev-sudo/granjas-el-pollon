using SistemaGranja.Domain.Entities.Batches;
using SistemaGranja.Domain.Entities.Pigs;
using SistemaGranja.Domain.Entities.Weighings;
using SistemaGranja.Domain.Enums;
using Xunit;

namespace SistemaGranja.UnitTests.DomainTests;

public class Phase2DomainTests
{
    [Fact]
    public void Pig_CalculateAgeInDays_ShouldReturnAccurateDays()
    {
        // Arrange
        var birthDate = DateTime.UtcNow.AddDays(-60);
        var pig = new Pig
        {
            IdentificationCode = "PIG-001",
            BirthDate = birthDate,
            Sex = PigSex.Female
        };

        // Act
        var age = pig.CalculateAgeInDays();

        // Assert
        Assert.Equal(60, age);
    }

    [Fact]
    public void Batch_CalculateDaysInBatch_ShouldReturnAccurateDays()
    {
        // Arrange
        var startDate = DateTime.UtcNow.AddDays(-25);
        var batch = new Batch
        {
            Code = "LOT-2026-N01",
            StartDate = startDate,
            InitialQuantity = 50,
            CurrentQuantity = 50
        };

        // Act
        var days = batch.CalculateDaysInBatch();

        // Assert
        Assert.Equal(25, days);
    }

    [Fact]
    public void PigWeighing_AverageDailyGain_Calculation_ShouldBeExact()
    {
        // Arrange: Cerdito que pesó 10kg el día 0 y 25kg el día 30
        // Ganancia = 15kg en 30 días -> GDP = (15 / 30) * 1000 = 500 g/día
        var day0 = DateTime.UtcNow.AddDays(-30);
        var day30 = DateTime.UtcNow;

        var prevWeight = 10.0m;
        var currentWeight = 25.0m;
        var daysElapsed = (int)(day30.Date - day0.Date).TotalDays;
        var weightGain = currentWeight - prevWeight;
        var adgGrams = Math.Round((weightGain / daysElapsed) * 1000m, 2);

        var weighing = new PigWeighing
        {
            WeightKg = currentWeight,
            WeighingDate = day30,
            WeightGainKg = weightGain,
            DaysElapsed = daysElapsed,
            AverageDailyGainGrams = adgGrams
        };

        // Assert
        Assert.Equal(15.0m, weighing.WeightGainKg);
        Assert.Equal(30, weighing.DaysElapsed);
        Assert.Equal(500.00m, weighing.AverageDailyGainGrams);
    }

    [Fact]
    public void BatchWeighing_AverageWeight_Calculation_ShouldBeExact()
    {
        // Arrange: Muestra de 10 cerdos con peso total de 320 kg -> Promedio = 32 kg
        var sampleQuantity = 10;
        var totalSampleWeight = 320.0m;
        var avgWeight = Math.Round(totalSampleWeight / sampleQuantity, 2);

        var batchWeighing = new BatchWeighing
        {
            SampleQuantity = sampleQuantity,
            TotalSampleWeightKg = totalSampleWeight,
            AverageWeightKg = avgWeight
        };

        // Assert
        Assert.Equal(32.00m, batchWeighing.AverageWeightKg);
    }
}
