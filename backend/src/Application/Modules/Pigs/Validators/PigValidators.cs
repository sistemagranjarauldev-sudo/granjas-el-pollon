using FluentValidation;
using SistemaGranja.Application.Modules.Pigs.DTOs;

namespace SistemaGranja.Application.Modules.Pigs.Validators;

public class CreatePigValidator : AbstractValidator<CreatePigDto>
{
    public CreatePigValidator()
    {
        RuleFor(x => x.FarmId)
            .NotEmpty().WithMessage("La granja es obligatoria.");

        RuleFor(x => x.IdentificationCode)
            .NotEmpty().WithMessage("El código/arete de identificación es obligatorio.")
            .MaximumLength(50).WithMessage("El código no puede exceder 50 caracteres.");

        RuleFor(x => x.Sex)
            .IsInEnum().WithMessage("El sexo del animal especificado no es válido.");

        RuleFor(x => x.Breed)
            .NotEmpty().WithMessage("La raza o genética es obligatoria.")
            .MaximumLength(100).WithMessage("La raza no puede exceder 100 caracteres.");

        RuleFor(x => x.BirthDate)
            .NotEmpty().WithMessage("La fecha de nacimiento es obligatoria.")
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1)).WithMessage("La fecha de nacimiento no puede ser futura.");

        RuleFor(x => x.EntryDate)
            .NotEmpty().WithMessage("La fecha de ingreso es obligatoria.")
            .GreaterThanOrEqualTo(x => x.BirthDate).WithMessage("La fecha de ingreso no puede ser anterior al nacimiento.");
    }
}

public class MovePigValidator : AbstractValidator<MovePigDto>
{
    public MovePigValidator()
    {
        RuleFor(x => x.TargetPenId)
            .NotEmpty().WithMessage("El corral de destino es obligatorio.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("El motivo del traslado es obligatorio.")
            .MaximumLength(200).WithMessage("El motivo no puede exceder 200 caracteres.");
    }
}
