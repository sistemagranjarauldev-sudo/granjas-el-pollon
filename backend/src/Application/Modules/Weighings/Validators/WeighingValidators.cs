using FluentValidation;
using SistemaGranja.Application.Modules.Weighings.DTOs;

namespace SistemaGranja.Application.Modules.Weighings.Validators;

public class RecordPigWeighingValidator : AbstractValidator<RecordPigWeighingDto>
{
    public RecordPigWeighingValidator()
    {
        RuleFor(x => x.PigId)
            .NotEmpty().WithMessage("El animal es obligatorio.");

        RuleFor(x => x.WeightKg)
            .GreaterThan(0).WithMessage("El peso debe ser mayor a 0 kg.")
            .LessThan(600).WithMessage("El peso no puede exceder 600 kg.");

        RuleFor(x => x.WeighingDate)
            .NotEmpty().WithMessage("La fecha del pesaje es obligatoria.")
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1)).WithMessage("La fecha del pesaje no puede ser futura.");

        RuleFor(x => x.Stage)
            .IsInEnum().WithMessage("La etapa zootécnica especificada no es válida.");
    }
}

public class RecordBatchWeighingValidator : AbstractValidator<RecordBatchWeighingDto>
{
    public RecordBatchWeighingValidator()
    {
        RuleFor(x => x.BatchId)
            .NotEmpty().WithMessage("El lote es obligatorio.");

        RuleFor(x => x.SampleQuantity)
            .GreaterThan(0).WithMessage("La cantidad muestreada debe ser mayor a 0.");

        RuleFor(x => x.TotalSampleWeightKg)
            .GreaterThan(0).WithMessage("El peso total de la muestra debe ser mayor a 0 kg.");

        RuleFor(x => x.WeighingDate)
            .NotEmpty().WithMessage("La fecha del pesaje es obligatoria.")
            .LessThanOrEqualTo(DateTime.UtcNow.AddDays(1)).WithMessage("La fecha del pesaje no puede ser futura.");

        RuleFor(x => x.Stage)
            .IsInEnum().WithMessage("La etapa zootécnica especificada no es válida.");
    }
}
