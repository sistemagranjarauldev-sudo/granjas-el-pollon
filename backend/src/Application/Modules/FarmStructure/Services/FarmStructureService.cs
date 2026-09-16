using Microsoft.EntityFrameworkCore;
using SistemaGranja.Application.Common.Interfaces;
using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.FarmStructure.DTOs;
using SistemaGranja.Domain.Entities.FarmStructure;
using SistemaGranja.Domain.Enums;
using SistemaGranja.Shared.Results;

namespace SistemaGranja.Application.Modules.FarmStructure.Services;

public class FarmStructureService : IFarmStructureService
{
    private readonly IApplicationDbContext _context;

    public FarmStructureService(IApplicationDbContext context)
    {
        _context = context;
    }

    #region Farms
    public async Task<Result<PaginatedList<FarmDto>>> GetFarmsAsync(int pageIndex, int pageSize, string? search = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Farms
            .Include(f => f.Areas)
                .ThenInclude(a => a.Sheds)
                    .ThenInclude(s => s.Pens)
            .Where(f => !f.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var searchLower = search.Trim().ToLower();
            query = query.Where(f => f.Name.ToLower().Contains(searchLower) || f.Code.ToLower().Contains(searchLower));
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var farms = await query
            .OrderByDescending(f => f.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtoList = farms.Select(f => MapToFarmDto(f)).ToList();

        return Result<PaginatedList<FarmDto>>.Success(new PaginatedList<FarmDto>(dtoList, totalCount, pageIndex, pageSize));
    }

    public async Task<Result<FarmDto>> GetFarmByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var farm = await _context.Farms
            .Include(f => f.Areas)
                .ThenInclude(a => a.Sheds)
                    .ThenInclude(s => s.Pens)
            .FirstOrDefaultAsync(f => f.Id == id && !f.IsDeleted, cancellationToken);

        if (farm == null)
            return Result<FarmDto>.Failure(Error.NotFound);

        return Result<FarmDto>.Success(MapToFarmDto(farm));
    }

    public async Task<Result<FarmDto>> CreateFarmAsync(CreateFarmDto dto, CancellationToken cancellationToken = default)
    {
        var exists = await _context.Farms.AnyAsync(f => f.Code.ToLower() == dto.Code.ToLower().Trim() && !f.IsDeleted, cancellationToken);
        if (exists)
            return Result<FarmDto>.Failure("Farm.CodeExists", $"Ya existe una granja con el código '{dto.Code}'.");

        var farm = new Farm
        {
            Code = dto.Code.Trim().ToUpper(),
            Name = dto.Name.Trim(),
            LegalName = dto.LegalName?.Trim(),
            TaxId = dto.TaxId?.Trim(),
            Location = dto.Location?.Trim(),
            TotalCapacity = dto.TotalCapacity,
            IsActive = true
        };

        // Crear configuraciones por defecto
        SeedDefaultFarmConfigurations(farm);

        _context.Farms.Add(farm);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<FarmDto>.Success(MapToFarmDto(farm));
    }

    public async Task<Result<FarmDto>> UpdateFarmAsync(Guid id, UpdateFarmDto dto, CancellationToken cancellationToken = default)
    {
        var farm = await _context.Farms
            .Include(f => f.Areas)
                .ThenInclude(a => a.Sheds)
                    .ThenInclude(s => s.Pens)
            .FirstOrDefaultAsync(f => f.Id == id && !f.IsDeleted, cancellationToken);

        if (farm == null)
            return Result<FarmDto>.Failure(Error.NotFound);

        farm.Name = dto.Name.Trim();
        farm.LegalName = dto.LegalName?.Trim();
        farm.TaxId = dto.TaxId?.Trim();
        farm.Location = dto.Location?.Trim();
        farm.TotalCapacity = dto.TotalCapacity;
        farm.IsActive = dto.IsActive;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<FarmDto>.Success(MapToFarmDto(farm));
    }

    public async Task<Result> DeleteFarmAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var farm = await _context.Farms.FirstOrDefaultAsync(f => f.Id == id && !f.IsDeleted, cancellationToken);
        if (farm == null)
            return Result.Failure(Error.NotFound);

        farm.IsDeleted = true;
        farm.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
    #endregion

    #region Areas
    public async Task<Result<IReadOnlyList<AreaDto>>> GetAreasByFarmIdAsync(Guid farmId, CancellationToken cancellationToken = default)
    {
        var areas = await _context.Areas
            .Include(a => a.Sheds)
                .ThenInclude(s => s.Pens)
            .Where(a => a.FarmId == farmId && !a.IsDeleted)
            .OrderBy(a => a.Code)
            .ToListAsync(cancellationToken);

        var dtos = areas.Select(MapToAreaDto).ToList();
        return Result<IReadOnlyList<AreaDto>>.Success(dtos);
    }

    public async Task<Result<AreaDto>> GetAreaByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var area = await _context.Areas
            .Include(a => a.Sheds)
                .ThenInclude(s => s.Pens)
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted, cancellationToken);

        if (area == null)
            return Result<AreaDto>.Failure(Error.NotFound);

        return Result<AreaDto>.Success(MapToAreaDto(area));
    }

    public async Task<Result<AreaDto>> CreateAreaAsync(CreateAreaDto dto, CancellationToken cancellationToken = default)
    {
        var farmExists = await _context.Farms.AnyAsync(f => f.Id == dto.FarmId && !f.IsDeleted, cancellationToken);
        if (!farmExists)
            return Result<AreaDto>.Failure("Farm.NotFound", "La granja especificada no existe.");

        var codeExists = await _context.Areas.AnyAsync(a => a.FarmId == dto.FarmId && a.Code.ToLower() == dto.Code.ToLower().Trim() && !a.IsDeleted, cancellationToken);
        if (codeExists)
            return Result<AreaDto>.Failure("Area.CodeExists", $"Ya existe un área con el código '{dto.Code}' en esta granja.");

        var area = new Area
        {
            FarmId = dto.FarmId,
            Code = dto.Code.Trim().ToUpper(),
            Name = dto.Name.Trim(),
            AreaType = dto.AreaType,
            Description = dto.Description?.Trim(),
            IsActive = true
        };

        _context.Areas.Add(area);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<AreaDto>.Success(MapToAreaDto(area));
    }

    public async Task<Result<AreaDto>> UpdateAreaAsync(Guid id, UpdateAreaDto dto, CancellationToken cancellationToken = default)
    {
        var area = await _context.Areas
            .Include(a => a.Sheds)
                .ThenInclude(s => s.Pens)
            .FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted, cancellationToken);

        if (area == null)
            return Result<AreaDto>.Failure(Error.NotFound);

        area.Name = dto.Name.Trim();
        area.AreaType = dto.AreaType;
        area.Description = dto.Description?.Trim();
        area.IsActive = dto.IsActive;

        await _context.SaveChangesAsync(cancellationToken);
        return Result<AreaDto>.Success(MapToAreaDto(area));
    }

    public async Task<Result> DeleteAreaAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var area = await _context.Areas.FirstOrDefaultAsync(a => a.Id == id && !a.IsDeleted, cancellationToken);
        if (area == null)
            return Result.Failure(Error.NotFound);

        area.IsDeleted = true;
        area.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
    #endregion

    #region Sheds
    public async Task<Result<IReadOnlyList<ShedDto>>> GetShedsByAreaIdAsync(Guid areaId, CancellationToken cancellationToken = default)
    {
        var sheds = await _context.Sheds
            .Include(s => s.Area)
            .Include(s => s.Pens)
            .Where(s => s.AreaId == areaId && !s.IsDeleted)
            .OrderBy(s => s.Code)
            .ToListAsync(cancellationToken);

        var dtos = sheds.Select(MapToShedDto).ToList();
        return Result<IReadOnlyList<ShedDto>>.Success(dtos);
    }

    public async Task<Result<ShedDto>> GetShedByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var shed = await _context.Sheds
            .Include(s => s.Area)
            .Include(s => s.Pens)
            .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted, cancellationToken);

        if (shed == null)
            return Result<ShedDto>.Failure(Error.NotFound);

        return Result<ShedDto>.Success(MapToShedDto(shed));
    }

    public async Task<Result<ShedDto>> CreateShedAsync(CreateShedDto dto, CancellationToken cancellationToken = default)
    {
        var area = await _context.Areas.FirstOrDefaultAsync(a => a.Id == dto.AreaId && !a.IsDeleted, cancellationToken);
        if (area == null)
            return Result<ShedDto>.Failure("Area.NotFound", "El área especificada no existe.");

        var codeExists = await _context.Sheds.AnyAsync(s => s.AreaId == dto.AreaId && s.Code.ToLower() == dto.Code.ToLower().Trim() && !s.IsDeleted, cancellationToken);
        if (codeExists)
            return Result<ShedDto>.Failure("Shed.CodeExists", $"Ya existe un galpón con el código '{dto.Code}' en esta área.");

        var shed = new Shed
        {
            AreaId = dto.AreaId,
            Code = dto.Code.Trim().ToUpper(),
            Name = dto.Name.Trim(),
            VentilationType = dto.VentilationType,
            TotalCapacity = dto.TotalCapacity,
            IsActive = true
        };

        _context.Sheds.Add(shed);
        await _context.SaveChangesAsync(cancellationToken);

        shed.Area = area;
        return Result<ShedDto>.Success(MapToShedDto(shed));
    }

    public async Task<Result<ShedDto>> UpdateShedAsync(Guid id, UpdateShedDto dto, CancellationToken cancellationToken = default)
    {
        var shed = await _context.Sheds
            .Include(s => s.Area)
            .Include(s => s.Pens)
            .FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted, cancellationToken);

        if (shed == null)
            return Result<ShedDto>.Failure(Error.NotFound);

        shed.Name = dto.Name.Trim();
        shed.VentilationType = dto.VentilationType;
        shed.TotalCapacity = dto.TotalCapacity;
        shed.IsActive = dto.IsActive;

        await _context.SaveChangesAsync(cancellationToken);
        return Result<ShedDto>.Success(MapToShedDto(shed));
    }

    public async Task<Result> DeleteShedAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var shed = await _context.Sheds.FirstOrDefaultAsync(s => s.Id == id && !s.IsDeleted, cancellationToken);
        if (shed == null)
            return Result.Failure(Error.NotFound);

        shed.IsDeleted = true;
        shed.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
    #endregion

    #region Pens
    public async Task<Result<IReadOnlyList<PenDto>>> GetPensByShedIdAsync(Guid shedId, CancellationToken cancellationToken = default)
    {
        var pens = await _context.Pens
            .Include(p => p.Shed)
                .ThenInclude(s => s.Area)
            .Where(p => p.ShedId == shedId && !p.IsDeleted)
            .OrderBy(p => p.Code)
            .ToListAsync(cancellationToken);

        var dtos = pens.Select(MapToPenDto).ToList();
        return Result<IReadOnlyList<PenDto>>.Success(dtos);
    }

    public async Task<Result<PenDto>> GetPenByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var pen = await _context.Pens
            .Include(p => p.Shed)
                .ThenInclude(s => s.Area)
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);

        if (pen == null)
            return Result<PenDto>.Failure(Error.NotFound);

        return Result<PenDto>.Success(MapToPenDto(pen));
    }

    public async Task<Result<PenDto>> CreatePenAsync(CreatePenDto dto, CancellationToken cancellationToken = default)
    {
        var shed = await _context.Sheds
            .Include(s => s.Area)
            .FirstOrDefaultAsync(s => s.Id == dto.ShedId && !s.IsDeleted, cancellationToken);

        if (shed == null)
            return Result<PenDto>.Failure("Shed.NotFound", "El galpón especificado no existe.");

        var codeExists = await _context.Pens.AnyAsync(p => p.ShedId == dto.ShedId && p.Code.ToLower() == dto.Code.ToLower().Trim() && !p.IsDeleted, cancellationToken);
        if (codeExists)
            return Result<PenDto>.Failure("Pen.CodeExists", $"Ya existe un corral con el código '{dto.Code}' en este galpón.");

        var pen = new Pen
        {
            ShedId = dto.ShedId,
            Code = dto.Code.Trim().ToUpper(),
            PenType = dto.PenType,
            MaxCapacity = dto.MaxCapacity,
            DimensionsM2 = dto.DimensionsM2,
            Status = PenStatus.Empty,
            CurrentOccupancy = 0,
            IsActive = true
        };

        _context.Pens.Add(pen);
        await _context.SaveChangesAsync(cancellationToken);

        pen.Shed = shed;
        return Result<PenDto>.Success(MapToPenDto(pen));
    }

    public async Task<Result<PenDto>> UpdatePenAsync(Guid id, UpdatePenDto dto, CancellationToken cancellationToken = default)
    {
        var pen = await _context.Pens
            .Include(p => p.Shed)
                .ThenInclude(s => s.Area)
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);

        if (pen == null)
            return Result<PenDto>.Failure(Error.NotFound);

        if (dto.MaxCapacity < pen.CurrentOccupancy)
            return Result<PenDto>.Failure("Pen.CapacityTooLow", $"La nueva capacidad ({dto.MaxCapacity}) no puede ser menor a los animales alojados actualmente ({pen.CurrentOccupancy}).");

        pen.PenType = dto.PenType;
        pen.MaxCapacity = dto.MaxCapacity;
        pen.DimensionsM2 = dto.DimensionsM2;
        pen.Status = dto.Status;
        pen.IsActive = dto.IsActive;

        await _context.SaveChangesAsync(cancellationToken);
        return Result<PenDto>.Success(MapToPenDto(pen));
    }

    public async Task<Result> UpdatePenStatusAsync(Guid id, PenStatus status, CancellationToken cancellationToken = default)
    {
        var pen = await _context.Pens.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);
        if (pen == null)
            return Result.Failure(Error.NotFound);

        pen.Status = status;
        if (status == PenStatus.Sanitizing)
            pen.SanitizedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result> DeletePenAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var pen = await _context.Pens.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);
        if (pen == null)
            return Result.Failure(Error.NotFound);

        if (pen.CurrentOccupancy > 0)
            return Result.Failure("Pen.NotEmpty", "No se puede eliminar un corral que tiene animales actualmente.");

        pen.IsDeleted = true;
        pen.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
    #endregion

    #region Farm Configurations
    public async Task<Result<IReadOnlyList<FarmConfigurationDto>>> GetFarmConfigurationsAsync(Guid farmId, CancellationToken cancellationToken = default)
    {
        var configs = await _context.FarmConfigurations
            .Where(c => c.FarmId == farmId && !c.IsDeleted)
            .OrderBy(c => c.Key)
            .ToListAsync(cancellationToken);

        var dtos = configs.Select(c => new FarmConfigurationDto(c.Id, c.FarmId, c.Key, c.Value, c.Description, c.ValueType)).ToList();
        return Result<IReadOnlyList<FarmConfigurationDto>>.Success(dtos);
    }

    public async Task<Result> UpdateFarmConfigurationAsync(Guid farmId, UpdateFarmConfigurationDto dto, CancellationToken cancellationToken = default)
    {
        var config = await _context.FarmConfigurations
            .FirstOrDefaultAsync(c => c.FarmId == farmId && c.Key == dto.Key && !c.IsDeleted, cancellationToken);

        if (config == null)
        {
            config = new FarmConfiguration
            {
                FarmId = farmId,
                Key = dto.Key,
                Value = dto.Value,
                Description = "Parámetro configurado por usuario"
            };
            _context.FarmConfigurations.Add(config);
        }
        else
        {
            config.Value = dto.Value;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
    #endregion

    #region Helpers & Mappings
    private static FarmDto MapToFarmDto(Farm f)
    {
        var allSheds = f.Areas?.SelectMany(a => a.Sheds).ToList() ?? new List<Shed>();
        var allPens = allSheds.SelectMany(s => s.Pens).ToList();

        return new FarmDto(
            f.Id,
            f.Code,
            f.Name,
            f.LegalName,
            f.TaxId,
            f.Location,
            f.TotalCapacity,
            allPens.Sum(p => p.CurrentOccupancy),
            f.Areas?.Count(a => !a.IsDeleted) ?? 0,
            allSheds.Count(s => !s.IsDeleted),
            allPens.Count(p => !p.IsDeleted),
            f.IsActive,
            f.CreatedAt
        );
    }

    private static AreaDto MapToAreaDto(Area a)
    {
        var sheds = a.Sheds?.Where(s => !s.IsDeleted).ToList() ?? new List<Shed>();
        var pens = sheds.SelectMany(s => s.Pens?.Where(p => !p.IsDeleted) ?? Enumerable.Empty<Pen>()).ToList();

        return new AreaDto(
            a.Id,
            a.FarmId,
            a.Code,
            a.Name,
            a.AreaType,
            a.AreaType.ToString(),
            a.Description,
            sheds.Count,
            pens.Count,
            pens.Sum(p => p.MaxCapacity),
            pens.Sum(p => p.CurrentOccupancy),
            a.IsActive
        );
    }

    private static ShedDto MapToShedDto(Shed s)
    {
        var pens = s.Pens?.Where(p => !p.IsDeleted).ToList() ?? new List<Pen>();

        return new ShedDto(
            s.Id,
            s.AreaId,
            s.Area?.Name ?? string.Empty,
            s.Code,
            s.Name,
            s.VentilationType,
            s.TotalCapacity > 0 ? s.TotalCapacity : pens.Sum(p => p.MaxCapacity),
            pens.Sum(p => p.CurrentOccupancy),
            pens.Count,
            s.IsActive
        );
    }

    private static PenDto MapToPenDto(Pen p)
    {
        return new PenDto(
            p.Id,
            p.ShedId,
            p.Shed?.Name ?? string.Empty,
            p.Shed?.Area?.Name ?? string.Empty,
            p.Code,
            p.PenType,
            p.PenType.ToString(),
            p.MaxCapacity,
            p.CurrentOccupancy,
            p.AvailableCapacity,
            p.DimensionsM2,
            p.Status,
            p.Status.ToString(),
            p.SanitizedAt,
            p.IsActive
        );
    }

    private static void SeedDefaultFarmConfigurations(Farm farm)
    {
        farm.Configurations = new List<FarmConfiguration>
        {
            new() { FarmId = farm.Id, Key = "GestationDays", Value = "114", Description = "Días promedio de gestación", ValueType = "int" },
            new() { FarmId = farm.Id, Key = "LactationDays", Value = "21", Description = "Días promedio de lactancia / edad al destete", ValueType = "int" },
            new() { FarmId = farm.Id, Key = "WeanToEstrusDays", Value = "5", Description = "Días promedio de intervalo destete a celo", ValueType = "int" },
            new() { FarmId = farm.Id, Key = "InventoryCostingMethod", Value = "WeightedAverage", Description = "Método de costeo de inventario", ValueType = "string" },
            new() { FarmId = farm.Id, Key = "QuarantineDays", Value = "30", Description = "Días estándar de cuarentena para nuevos ingresos", ValueType = "int" }
        };
    }
    #endregion
}
