using FluentValidation;
using SistemaGranja.Application.Modules.Batches.DTOs;

namespace SistemaGranja.Application.Modules.Batches.Validators;

public class CreateBatchValidator : AbstractValidator<CreateBatchDto>
{
    public CreateBatchValidator()
    {
        RuleFor(x => x.FarmId)
            .NotEmpty().WithMessage("La granja es obligatoria.");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("El código del lote es obligatorio.")
            .MaximumLength(50).WithMessage("El código no puede exceder 50 caracteres.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("El nombre descriptivo del lote es obligatorio.")
            .MaximumLength(150).WithMessage("El nombre no puede exceder 150 caracteres.");

        RuleFor(x => x.Stage)
            .IsInEnum().WithMessage("La etapa productiva especificada no es válida.");

        RuleFor(x => x.InitialQuantity)
            .GreaterThan(0).WithMessage("La cantidad inicial de animales debe ser mayor a 0.");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("La fecha de inicio del lote es obligatoria.")
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1)).WithMessage("La fecha de inicio no puede ser futura.");
    }
}

public class MoveBatchValidator : AbstractValidator<MoveBatchDto>
{
    public MoveBatchValidator()
    {
        RuleFor(x => x.TargetPenId)
            .NotEmpty().WithMessage("El corral de destino es obligatorio.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("La cantidad a trasladar debe ser mayor a 0.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("El motivo del traslado es obligatorio.")
            .MaximumLength(200).WithMessage("El motivo no puede exceder 200 caracteres.");
    }
}
