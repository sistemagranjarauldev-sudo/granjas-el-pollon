using FluentAssertions;
using SistemaGranja.Application.Modules.FarmStructure.DTOs;
using SistemaGranja.Application.Modules.FarmStructure.Validators;
using SistemaGranja.Domain.Enums;
using Xunit;

namespace SistemaGranja.UnitTests.ValidationTests;

public class FarmValidatorsTests
{
    private readonly CreateFarmValidator _farmValidator = new();
    private readonly CreatePenValidator _penValidator = new();

    [Fact]
    public void CreateFarmValidator_ShouldFail_WhenCodeOrNameIsEmpty()
    {
        // Arrange
        var invalidDto = new CreateFarmDto("", "", null, null, null);

        // Act
        var result = _farmValidator.Validate(invalidDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateFarmDto.Code));
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateFarmDto.Name));
    }

    [Fact]
    public void CreateFarmValidator_ShouldPass_ForValidInput()
    {
        // Arrange
        var validDto = new CreateFarmDto("GRA-01", "Granja El Porvenir", "Porvenir S.A.", "123456789", "Km 15", 5000);

        // Act
        var result = _farmValidator.Validate(validDto);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void CreatePenValidator_ShouldFail_WhenMaxCapacityIsZeroOrNegative()
    {
        // Arrange
        var invalidDto = new CreatePenDto(Guid.NewGuid(), "COR-01", PenType.GrowerFinisherPen, 0, null);

        // Act
        var result = _penValidator.Validate(invalidDto);

        // Assert
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreatePenDto.MaxCapacity));
    }
}
