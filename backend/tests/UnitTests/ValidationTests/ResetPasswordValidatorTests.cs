using FluentAssertions;
using SistemaGranja.Application.Modules.Users.DTOs;
using SistemaGranja.Application.Modules.Users.Validators;
using Xunit;

namespace SistemaGranja.UnitTests.ValidationTests;

public class ResetPasswordValidatorTests
{
    private readonly ResetPasswordValidator _validator = new();

    [Theory]
    [InlineData("")]
    [InlineData("12345")]
    public void Validate_ShouldFail_WhenPasswordIsInvalid(string password)
    {
        var dto = new ResetPasswordDto(password);
        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(ResetPasswordDto.NewPassword));
    }

    [Fact]
    public void Validate_ShouldPass_WhenPasswordIsValid()
    {
        var dto = new ResetPasswordDto("Admin123*");
        var result = _validator.Validate(dto);

        result.IsValid.Should().BeTrue();
    }
}
