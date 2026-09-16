using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.FarmStructure.DTOs;
using SistemaGranja.Domain.Enums;
using SistemaGranja.Shared.Results;

namespace SistemaGranja.Application.Modules.FarmStructure.Services;

public interface IFarmStructureService
{
    // Granjas
    Task<Result<PaginatedList<FarmDto>>> GetFarmsAsync(int pageIndex, int pageSize, string? search = null, CancellationToken cancellationToken = default);
    Task<Result<FarmDto>> GetFarmByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<FarmDto>> CreateFarmAsync(CreateFarmDto dto, CancellationToken cancellationToken = default);
    Task<Result<FarmDto>> UpdateFarmAsync(Guid id, UpdateFarmDto dto, CancellationToken cancellationToken = default);
    Task<Result> DeleteFarmAsync(Guid id, CancellationToken cancellationToken = default);

    // Áreas
    Task<Result<IReadOnlyList<AreaDto>>> GetAreasByFarmIdAsync(Guid farmId, CancellationToken cancellationToken = default);
    Task<Result<AreaDto>> GetAreaByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<AreaDto>> CreateAreaAsync(CreateAreaDto dto, CancellationToken cancellationToken = default);
    Task<Result<AreaDto>> UpdateAreaAsync(Guid id, UpdateAreaDto dto, CancellationToken cancellationToken = default);
    Task<Result> DeleteAreaAsync(Guid id, CancellationToken cancellationToken = default);

    // Galpones
    Task<Result<IReadOnlyList<ShedDto>>> GetShedsByAreaIdAsync(Guid areaId, CancellationToken cancellationToken = default);
    Task<Result<ShedDto>> GetShedByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<ShedDto>> CreateShedAsync(CreateShedDto dto, CancellationToken cancellationToken = default);
    Task<Result<ShedDto>> UpdateShedAsync(Guid id, UpdateShedDto dto, CancellationToken cancellationToken = default);
    Task<Result> DeleteShedAsync(Guid id, CancellationToken cancellationToken = default);

    // Corrales / Jaulas
    Task<Result<IReadOnlyList<PenDto>>> GetPensByShedIdAsync(Guid shedId, CancellationToken cancellationToken = default);
    Task<Result<PenDto>> GetPenByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<PenDto>> CreatePenAsync(CreatePenDto dto, CancellationToken cancellationToken = default);
    Task<Result<PenDto>> UpdatePenAsync(Guid id, UpdatePenDto dto, CancellationToken cancellationToken = default);
    Task<Result> UpdatePenStatusAsync(Guid id, PenStatus status, CancellationToken cancellationToken = default);
    Task<Result> DeletePenAsync(Guid id, CancellationToken cancellationToken = default);

    // Configuraciones de Granja
    Task<Result<IReadOnlyList<FarmConfigurationDto>>> GetFarmConfigurationsAsync(Guid farmId, CancellationToken cancellationToken = default);
    Task<Result> UpdateFarmConfigurationAsync(Guid farmId, UpdateFarmConfigurationDto dto, CancellationToken cancellationToken = default);
}
