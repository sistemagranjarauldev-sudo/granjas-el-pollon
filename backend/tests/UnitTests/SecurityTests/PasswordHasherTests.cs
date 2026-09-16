using FluentAssertions;
using SistemaGranja.Infrastructure.Identity;
using Xunit;

namespace SistemaGranja.UnitTests.SecurityTests;

public class PasswordHasherTests
{
    private readonly PasswordHasher _hasher = new();

    [Fact]
    public void HashPassword_ShouldReturnNonEmptyHash()
    {
        // Act
        var hash = _hasher.HashPassword("Admin123*");

        // Assert
        hash.Should().NotBeNullOrWhiteSpace();
        hash.Should().NotBe("Admin123*");
    }

    [Fact]
    public void VerifyPassword_ShouldReturnTrue_ForCorrectPassword()
    {
        // Arrange
        var password = "SecureP@ssword2026";
        var hash = _hasher.HashPassword(password);

        // Act
        var result = _hasher.VerifyPassword(password, hash);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_ShouldReturnFalse_ForIncorrectPassword()
    {
        // Arrange
        var hash = _hasher.HashPassword("CorrectPassword");

        // Act
        var result = _hasher.VerifyPassword("WrongPassword", hash);

        // Assert
        result.Should().BeFalse();
    }
}
