using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.Weighings.DTOs;
using SistemaGranja.Shared.Results;

namespace SistemaGranja.Application.Modules.Weighings.Services;

public interface IWeighingsService
{
    Task<Result<PaginatedList<PigWeighingDto>>> GetPigWeighingsAsync(
        Guid? pigId = null,
        Guid? farmId = null,
        int pageIndex = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);

    Task<Result<PaginatedList<BatchWeighingDto>>> GetBatchWeighingsAsync(
        Guid? batchId = null,
        Guid? farmId = null,
        int pageIndex = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);

    Task<Result<IReadOnlyList<GrowthCurvePointDto>>> GetPigGrowthCurveAsync(Guid pigId, CancellationToken cancellationToken = default);

    Task<Result<IReadOnlyList<GrowthCurvePointDto>>> GetBatchGrowthCurveAsync(Guid batchId, CancellationToken cancellationToken = default);

    Task<Result<PigWeighingDto>> RecordPigWeighingAsync(RecordPigWeighingDto dto, CancellationToken cancellationToken = default);

    Task<Result<BatchWeighingDto>> RecordBatchWeighingAsync(RecordBatchWeighingDto dto, CancellationToken cancellationToken = default);

    Task<Result> DeletePigWeighingAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Result> DeleteBatchWeighingAsync(Guid id, CancellationToken cancellationToken = default);
}
