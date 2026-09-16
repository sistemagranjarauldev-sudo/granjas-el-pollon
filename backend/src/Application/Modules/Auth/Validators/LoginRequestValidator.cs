using FluentValidation;
using SistemaGranja.Application.Modules.Auth.DTOs;

namespace SistemaGranja.Application.Modules.Auth.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequestDto>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Identifier)
            .NotEmpty().WithMessage("El usuario o correo electrónico es requerido.")
            .MaximumLength(150).WithMessage("El identificador no puede exceder 150 caracteres.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("La contraseña es requerida.")
            .MinimumLength(6).WithMessage("La contraseña debe tener al menos 6 caracteres.");
    }
}
