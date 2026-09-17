using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.Pigs.DTOs;
using SistemaGranja.Domain.Enums;
using SistemaGranja.Shared.Results;

namespace SistemaGranja.Application.Modules.Pigs.Services;

public interface IPigsService
{
    Task<Result<PaginatedList<PigDto>>> GetPigsAsync(
        Guid farmId,
        int pageIndex = 1,
        int pageSize = 20,
        string? search = null,
        PigSex? sex = null,
        PigStatus? status = null,
        Guid? penId = null,
        Guid? batchId = null,
        CancellationToken cancellationToken = default);

    Task<Result<PigDetailDto>> GetPigByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Result<IReadOnlyList<PigDto>>> GetAvailableBreedingPigsAsync(
        Guid farmId,
        PigSex sex,
        CancellationToken cancellationToken = default);

    Task<Result<GenealogyNodeDto>> GetGenealogyTreeAsync(Guid id, int depth = 3, CancellationToken cancellationToken = default);

    Task<Result<PigDto>> CreatePigAsync(CreatePigDto dto, CancellationToken cancellationToken = default);

    Task<Result<PigDto>> UpdatePigAsync(Guid id, UpdatePigDto dto, CancellationToken cancellationToken = default);

    Task<Result> MovePigAsync(Guid id, MovePigDto dto, CancellationToken cancellationToken = default);

    Task<Result> DeletePigAsync(Guid id, CancellationToken cancellationToken = default);
}
