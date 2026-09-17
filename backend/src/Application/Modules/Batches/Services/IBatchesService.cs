using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.Batches.DTOs;
using SistemaGranja.Domain.Enums;
using SistemaGranja.Shared.Results;

namespace SistemaGranja.Application.Modules.Batches.Services;

public interface IBatchesService
{
    Task<Result<PaginatedList<BatchDto>>> GetBatchesAsync(
        Guid farmId,
        int pageIndex = 1,
        int pageSize = 20,
        string? search = null,
        BatchStage? stage = null,
        BatchStatus? status = null,
        Guid? penId = null,
        CancellationToken cancellationToken = default);

    Task<Result<BatchDetailDto>> GetBatchByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Result<IReadOnlyList<BatchDto>>> GetActiveBatchesAsync(Guid farmId, CancellationToken cancellationToken = default);

    Task<Result<BatchDto>> CreateBatchAsync(CreateBatchDto dto, CancellationToken cancellationToken = default);

    Task<Result<BatchDto>> UpdateBatchAsync(Guid id, UpdateBatchDto dto, CancellationToken cancellationToken = default);

    Task<Result> MoveBatchAsync(Guid id, MoveBatchDto dto, CancellationToken cancellationToken = default);

    Task<Result> DeleteBatchAsync(Guid id, CancellationToken cancellationToken = default);
}
