using FluentValidation;
using SistemaGranja.Application.Modules.FarmStructure.DTOs;

namespace SistemaGranja.Application.Modules.FarmStructure.Validators;

public class CreateFarmValidator : AbstractValidator<CreateFarmDto>
{
    public CreateFarmValidator()
    {
        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("El código de la granja es obligatorio.")
            .MaximumLength(50).WithMessage("El código no puede exceder 50 caracteres.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre de la granja es obligatorio.")
            .MaximumLength(150).WithMessage("El nombre no puede exceder 150 caracteres.");

        RuleFor(x => x.TotalCapacity)
            .GreaterThanOrEqualTo(0).WithMessage("La capacidad total debe ser mayor o igual a 0.");
    }
}

public class CreateAreaValidator : AbstractValidator<CreateAreaDto>
{
    public CreateAreaValidator()
    {
        RuleFor(x => x.FarmId)
            .NotEmpty().WithMessage("La granja es obligatoria.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("El código del área es obligatorio.")
            .MaximumLength(50).WithMessage("El código no puede exceder 50 caracteres.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre del área es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no puede exceder 100 caracteres.");

        RuleFor(x => x.AreaType)
            .IsInEnum().WithMessage("El tipo de área especificado no es válido.");
    }
}

public class CreateShedValidator : AbstractValidator<CreateShedDto>
{
    public CreateShedValidator()
    {
        RuleFor(x => x.AreaId)
            .NotEmpty().WithMessage("El área es obligatoria.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("El código del galpón es obligatorio.")
            .MaximumLength(50).WithMessage("El código no puede exceder 50 caracteres.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre del galpón es obligatorio.")
            .MaximumLength(100).WithMessage("El nombre no puede exceder 100 caracteres.");
    }
}

public class CreatePenValidator : AbstractValidator<CreatePenDto>
{
    public CreatePenValidator()
    {
        RuleFor(x => x.ShedId)
            .NotEmpty().WithMessage("El galpón es obligatorio.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("El código del corral es obligatorio.")
            .MaximumLength(50).WithMessage("El código no puede exceder 50 caracteres.");

        RuleFor(x => x.MaxCapacity)
            .GreaterThan(0).WithMessage("La capacidad máxima del corral debe ser mayor a 0.");

        RuleFor(x => x.PenType)
            .IsInEnum().WithMessage("El tipo de corral especificado no es válido.");
    }
}
