using FluentAssertions;
using SistemaGranja.Domain.Entities.FarmStructure;
using SistemaGranja.Domain.Enums;
using Xunit;

namespace SistemaGranja.UnitTests.DomainTests;

public class PenCapacityTests
{
    [Fact]
    public void Pen_HasAvailableSpace_ShouldReturnTrue_WhenOccupancyIsLessThanCapacity()
    {
        // Arrange
        var pen = new Pen
        {
            Code = "COR-01",
            MaxCapacity = 20,
            CurrentOccupancy = 15,
            PenType = PenType.GrowerFinisherPen,
            Status = PenStatus.Occupied
        };

        // Act & Assert
        pen.HasAvailableSpace(5).Should().BeTrue();
        pen.HasAvailableSpace(6).Should().BeFalse();
        pen.AvailableCapacity.Should().Be(5);
    }

    [Fact]
    public void Pen_AvailableCapacity_ShouldReturnZero_WhenOverCapacity()
    {
        // Arrange
        var pen = new Pen
        {
            Code = "COR-02",
            MaxCapacity = 10,
            CurrentOccupancy = 12
        };

        // Act & Assert
        pen.AvailableCapacity.Should().Be(0);
        pen.HasAvailableSpace(1).Should().BeFalse();
    }
}
