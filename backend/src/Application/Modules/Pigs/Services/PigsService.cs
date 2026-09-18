using Microsoft.EntityFrameworkCore;
using SistemaGranja.Application.Common.Interfaces;
using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.Pigs.DTOs;
using SistemaGranja.Domain.Entities.Pigs;
using SistemaGranja.Domain.Enums;
using SistemaGranja.Shared.Results;

namespace SistemaGranja.Application.Modules.Pigs.Services;

public class PigsService : IPigsService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public PigsService(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PaginatedList<PigDto>>> GetPigsAsync(
        Guid farmId,
        int pageIndex = 1,
        int pageSize = 20,
        string? search = null,
        PigSex? sex = null,
        PigStatus? status = null,
        Guid? penId = null,
        Guid? batchId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Pigs
            .Include(p => p.Sire)
            .Include(p => p.Dam)
            .Include(p => p.CurrentPen)
                .ThenInclude(pen => pen!.Shed)
                    .ThenInclude(shed => shed.Area)
            .Include(p => p.CurrentBatch)
            .Include(p => p.Weighings)
            .Where(p => p.FarmId == farmId && !p.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(p => p.IdentificationCode.ToLower().Contains(s) ||
                                     (p.ElectronicId != null && p.ElectronicId.ToLower().Contains(s)) ||
                                     p.Breed.ToLower().Contains(s));
        }

        if (sex.HasValue)
            query = query.Where(p => p.Sex == sex.Value);

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        if (penId.HasValue)
            query = query.Where(p => p.CurrentPenId == penId.Value);

        if (batchId.HasValue)
            query = query.Where(p => p.CurrentBatchId == batchId.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = items.Select(MapToPigDto).ToList();
        return Result<PaginatedList<PigDto>>.Success(new PaginatedList<PigDto>(dtos, totalCount, pageIndex, pageSize));
    }

    public async Task<Result<PigDetailDto>> GetPigByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var pig = await _context.Pigs
            .Include(p => p.Sire)
            .Include(p => p.Dam)
            .Include(p => p.CurrentPen)
                .ThenInclude(pen => pen!.Shed)
                    .ThenInclude(shed => shed.Area)
            .Include(p => p.CurrentBatch)
            .Include(p => p.Movements)
                .ThenInclude(m => m.SourcePen)
            .Include(p => p.Movements)
                .ThenInclude(m => m.TargetPen)
            .Include(p => p.Weighings)
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);

        if (pig == null)
            return Result<PigDetailDto>.Failure(Error.NotFound);

        var lastWeighing = pig.Weighings.OrderByDescending(w => w.WeighingDate).FirstOrDefault();

        var movements = pig.Movements
            .OrderByDescending(m => m.MovementDate)
            .Select(m => new PigMovementDto(
                m.Id,
                m.PigId,
                m.SourcePenId,
                m.SourcePen?.Code,
                m.TargetPenId,
                m.TargetPen?.Code ?? "N/A",
                m.MovementDate,
                m.Reason,
                m.ResponsibleUserId,
                m.Notes,
                m.CreatedAt
            )).ToList();

        var weighings = pig.Weighings
            .OrderByDescending(w => w.WeighingDate)
            .Select(w => new PigWeighingSummaryDto(
                w.Id,
                w.WeighingDate,
                w.WeightKg,
                w.AgeDays,
                w.Stage,
                w.AverageDailyGainGrams,
                w.WeightGainKg,
                w.DaysElapsed,
                w.Notes
            )).ToList();

        var dto = new PigDetailDto(
            pig.Id,
            pig.FarmId,
            pig.IdentificationCode,
            pig.ElectronicId,
            pig.Sex,
            pig.Sex.ToString(),
            pig.Breed,
            pig.GeneticLine,
            pig.BirthDate,
            pig.EntryDate,
            pig.EntryType,
            pig.EntryType.ToString(),
            pig.SireId,
            pig.Sire?.IdentificationCode,
            pig.Sire?.Breed,
            pig.DamId,
            pig.Dam?.IdentificationCode,
            pig.Dam?.Breed,
            pig.CurrentPenId,
            pig.CurrentPen?.Code,
            pig.CurrentPen?.Shed?.Name,
            pig.CurrentPen?.Shed?.Area?.Name,
            pig.CurrentBatchId,
            pig.CurrentBatch?.Code,
            pig.Status,
            pig.Status.ToString(),
            pig.ReproductiveStatus,
            pig.ReproductiveStatus.ToString(),
            pig.Parity,
            pig.CalculateAgeInDays(),
            lastWeighing?.WeightKg,
            lastWeighing?.WeighingDate,
            pig.ExitDate,
            pig.ExitReason,
            pig.Notes,
            pig.CreatedAt,
            movements,
            weighings
        );

        return Result<PigDetailDto>.Success(dto);
    }

    public async Task<Result<IReadOnlyList<PigDto>>> GetAvailableBreedingPigsAsync(
        Guid farmId,
        PigSex sex,
        CancellationToken cancellationToken = default)
    {
        var pigs = await _context.Pigs
            .Where(p => p.FarmId == farmId && p.Sex == sex && p.Status == PigStatus.Active && !p.IsDeleted)
            .OrderBy(p => p.IdentificationCode)
            .ToListAsync(cancellationToken);

        var dtos = pigs.Select(MapToPigDto).ToList();
        return Result<IReadOnlyList<PigDto>>.Success(dtos);
    }

    public async Task<Result<GenealogyNodeDto>> GetGenealogyTreeAsync(Guid id, int depth = 3, CancellationToken cancellationToken = default)
    {
        var pig = await _context.Pigs
            .Include(p => p.Sire)
            .Include(p => p.Dam)
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);

        if (pig == null)
            return Result<GenealogyNodeDto>.Failure(Error.NotFound);

        var tree = await BuildGenealogyNodeAsync(pig, depth, cancellationToken);
        return Result<GenealogyNodeDto>.Success(tree);
    }

    public async Task<Result<PigDto>> CreatePigAsync(CreatePigDto dto, CancellationToken cancellationToken = default)
    {
        // 1. Validar Granja
        var farmExists = await _context.Farms.AnyAsync(f => f.Id == dto.FarmId && !f.IsDeleted, cancellationToken);
        if (!farmExists)
            return Result<PigDto>.Failure("Farm.NotFound", "La granja especificada no existe.");

        // 2. Validar Código Único en la Granja
        var codeExists = await _context.Pigs.AnyAsync(p => p.FarmId == dto.FarmId && p.IdentificationCode.ToLower() == dto.IdentificationCode.ToLower().Trim() && !p.IsDeleted, cancellationToken);
        if (codeExists)
            return Result<PigDto>.Failure("Pig.CodeExists", $"Ya existe un animal con el código/arete '{dto.IdentificationCode}' en esta granja.");

        // 3. Validar Genealogía (Padre debe ser Macho, Madre debe ser Hembra)
        if (dto.SireId.HasValue)
        {
            var sire = await _context.Pigs.FirstOrDefaultAsync(p => p.Id == dto.SireId.Value && !p.IsDeleted, cancellationToken);
            if (sire == null)
                return Result<PigDto>.Failure("Pig.SireNotFound", "El padre (macho) especificado no existe.");
            if (sire.Sex != PigSex.Male)
                return Result<PigDto>.Failure("Pig.InvalidSireSex", "El padre debe ser de sexo Macho.");
        }

        if (dto.DamId.HasValue)
        {
            var dam = await _context.Pigs.FirstOrDefaultAsync(p => p.Id == dto.DamId.Value && !p.IsDeleted, cancellationToken);
            if (dam == null)
                return Result<PigDto>.Failure("Pig.DamNotFound", "La madre (hembra) especificada no existe.");
            if (dam.Sex != PigSex.Female)
                return Result<PigDto>.Failure("Pig.InvalidDamSex", "La madre debe ser de sexo Hembra.");
        }

        // 4. Validar Corral si se asigna
        if (dto.CurrentPenId.HasValue)
        {
            var pen = await _context.Pens.FirstOrDefaultAsync(p => p.Id == dto.CurrentPenId.Value && !p.IsDeleted, cancellationToken);
            if (pen == null)
                return Result<PigDto>.Failure("Pen.NotFound", "El corral seleccionado no existe.");
            
            pen.CurrentOccupancy += 1;
            pen.Status = PenStatus.Occupied;
        }

        var pig = new Pig
        {
            FarmId = dto.FarmId,
            IdentificationCode = dto.IdentificationCode.Trim().ToUpper(),
            ElectronicId = dto.ElectronicId?.Trim(),
            Sex = dto.Sex,
            Breed = dto.Breed.Trim(),
            GeneticLine = dto.GeneticLine?.Trim(),
            BirthDate = DateTime.SpecifyKind(dto.BirthDate, DateTimeKind.Utc),
            EntryDate = DateTime.SpecifyKind(dto.EntryDate, DateTimeKind.Utc),
            EntryType = dto.EntryType,
            SireId = dto.SireId,
            DamId = dto.DamId,
            CurrentPenId = dto.CurrentPenId,
            CurrentBatchId = dto.CurrentBatchId,
            Status = PigStatus.Active,
            ReproductiveStatus = dto.ReproductiveStatus,
            Notes = dto.Notes?.Trim()
        };

        // Si se asignó corral inicial, registramos el primer movimiento
        if (dto.CurrentPenId.HasValue)
        {
            pig.Movements.Add(new PigMovement
            {
                PigId = pig.Id,
                SourcePenId = null,
                TargetPenId = dto.CurrentPenId.Value,
                MovementDate = DateTime.SpecifyKind(dto.EntryDate, DateTimeKind.Utc),
                Reason = "Ingreso inicial a la granja",
                ResponsibleUserId = _currentUserService.UserId
            });
        }

        _context.Pigs.Add(pig);
        await _context.SaveChangesAsync(cancellationToken);

        var detailResult = await GetPigByIdAsync(pig.Id, cancellationToken);
        if (!detailResult.IsSuccess)
            return Result<PigDto>.Failure(detailResult.Error);

        return Result<PigDto>.Success(MapDetailToDto(detailResult.Value!));
    }

    public async Task<Result<PigDto>> UpdatePigAsync(Guid id, UpdatePigDto dto, CancellationToken cancellationToken = default)
    {
        var pig = await _context.Pigs.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);
        if (pig == null)
            return Result<PigDto>.Failure(Error.NotFound);

        // Validar que no sea su propio padre o madre
        if (dto.SireId.HasValue && dto.SireId.Value == id)
            return Result<PigDto>.Failure("Pig.SelfParent", "Un animal no puede ser su propio padre.");
        if (dto.DamId.HasValue && dto.DamId.Value == id)
            return Result<PigDto>.Failure("Pig.SelfParent", "Un animal no puede ser su propia madre.");

        // Si cambia a estado de baja (Vendido, Muerto, Descartado), liberamos el corral
        var isDeactivating = (dto.Status == PigStatus.Sold || dto.Status == PigStatus.Dead || dto.Status == PigStatus.Culled);
        if (isDeactivating && pig.CurrentPenId.HasValue)
        {
            var pen = await _context.Pens.FirstOrDefaultAsync(p => p.Id == pig.CurrentPenId.Value, cancellationToken);
            if (pen != null && pen.CurrentOccupancy > 0)
            {
                pen.CurrentOccupancy = Math.Max(0, pen.CurrentOccupancy - 1);
                if (pen.CurrentOccupancy == 0 && pen.Status == PenStatus.Occupied)
                    pen.Status = PenStatus.Empty;
            }
            pig.CurrentPenId = null;
        }

        pig.ElectronicId = dto.ElectronicId?.Trim();
        pig.Breed = dto.Breed.Trim();
        pig.GeneticLine = dto.GeneticLine?.Trim();
        pig.BirthDate = DateTime.SpecifyKind(dto.BirthDate, DateTimeKind.Utc);
        pig.SireId = dto.SireId;
        pig.DamId = dto.DamId;
        pig.Status = dto.Status;
        pig.ReproductiveStatus = dto.ReproductiveStatus;
        pig.Parity = dto.Parity;
        pig.ExitDate = dto.ExitDate.HasValue ? DateTime.SpecifyKind(dto.ExitDate.Value, DateTimeKind.Utc) : null;
        pig.ExitReason = dto.ExitReason?.Trim();
        pig.Notes = dto.Notes?.Trim();

        await _context.SaveChangesAsync(cancellationToken);

        var detailResult = await GetPigByIdAsync(pig.Id, cancellationToken);
        if (!detailResult.IsSuccess)
            return Result<PigDto>.Failure(detailResult.Error);

        return Result<PigDto>.Success(MapDetailToDto(detailResult.Value!));
    }

    public async Task<Result> MovePigAsync(Guid id, MovePigDto dto, CancellationToken cancellationToken = default)
    {
        var pig = await _context.Pigs.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);
        if (pig == null)
            return Result.Failure(Error.NotFound);

        if (pig.Status != PigStatus.Active)
            return Result.Failure("Pig.NotActive", "Solo se pueden trasladar animales activos.");

        if (pig.CurrentPenId == dto.TargetPenId)
            return Result.Failure("Pig.SamePen", "El corral de destino es el mismo que el corral actual.");

        var targetPen = await _context.Pens.FirstOrDefaultAsync(p => p.Id == dto.TargetPenId && !p.IsDeleted, cancellationToken);
        if (targetPen == null)
            return Result.Failure("Pen.NotFound", "El corral de destino no existe.");

        // Descontar del corral origen
        if (pig.CurrentPenId.HasValue)
        {
            var sourcePen = await _context.Pens.FirstOrDefaultAsync(p => p.Id == pig.CurrentPenId.Value, cancellationToken);
            if (sourcePen != null)
            {
                sourcePen.CurrentOccupancy = Math.Max(0, sourcePen.CurrentOccupancy - 1);
                if (sourcePen.CurrentOccupancy == 0 && sourcePen.Status == PenStatus.Occupied)
                    sourcePen.Status = PenStatus.Empty;
            }
        }

        // Incrementar en corral destino
        targetPen.CurrentOccupancy += 1;
        targetPen.Status = PenStatus.Occupied;

        var sourcePenId = pig.CurrentPenId;
        pig.CurrentPenId = targetPen.Id;

        var movement = new PigMovement
        {
            PigId = pig.Id,
            SourcePenId = sourcePenId,
            TargetPenId = targetPen.Id,
            MovementDate = DateTime.UtcNow,
            Reason = dto.Reason.Trim(),
            ResponsibleUserId = _currentUserService.UserId,
            Notes = dto.Notes?.Trim()
        };

        _context.PigMovements.Add(movement);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result> DeletePigAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var pig = await _context.Pigs.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);
        if (pig == null)
            return Result.Failure(Error.NotFound);

        // Liberar ocupación del corral
        if (pig.CurrentPenId.HasValue)
        {
            var pen = await _context.Pens.FirstOrDefaultAsync(p => p.Id == pig.CurrentPenId.Value, cancellationToken);
            if (pen != null && pen.CurrentOccupancy > 0)
            {
                pen.CurrentOccupancy = Math.Max(0, pen.CurrentOccupancy - 1);
                if (pen.CurrentOccupancy == 0 && pen.Status == PenStatus.Occupied)
                    pen.Status = PenStatus.Empty;
            }
        }

        pig.IsDeleted = true;
        pig.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    #region Helpers & Mapping
    private async Task<GenealogyNodeDto> BuildGenealogyNodeAsync(Pig pig, int depth, CancellationToken cancellationToken)
    {
        GenealogyNodeDto? sireNode = null;
        GenealogyNodeDto? damNode = null;

        if (depth > 1)
        {
            if (pig.SireId.HasValue)
            {
                var sire = await _context.Pigs
                    .Include(s => s.Sire)
                    .Include(s => s.Dam)
                    .FirstOrDefaultAsync(p => p.Id == pig.SireId.Value && !p.IsDeleted, cancellationToken);

                if (sire != null)
                    sireNode = await BuildGenealogyNodeAsync(sire, depth - 1, cancellationToken);
            }

            if (pig.DamId.HasValue)
            {
                var dam = await _context.Pigs
                    .Include(d => d.Sire)
                    .Include(d => d.Dam)
                    .FirstOrDefaultAsync(p => p.Id == pig.DamId.Value && !p.IsDeleted, cancellationToken);

                if (dam != null)
                    damNode = await BuildGenealogyNodeAsync(dam, depth - 1, cancellationToken);
            }
        }

        return new GenealogyNodeDto(pig.Id, pig.IdentificationCode, pig.Sex, pig.Breed, sireNode, damNode);
    }

    private static PigDto MapToPigDto(Pig p)
    {
        var lastWeighing = p.Weighings?.OrderByDescending(w => w.WeighingDate).FirstOrDefault();

        return new PigDto(
            p.Id,
            p.FarmId,
            p.IdentificationCode,
            p.ElectronicId,
            p.Sex,
            p.Sex.ToString(),
            p.Breed,
            p.GeneticLine,
            p.BirthDate,
            p.EntryDate,
            p.EntryType,
            p.EntryType.ToString(),
            p.SireId,
            p.Sire?.IdentificationCode,
            p.DamId,
            p.Dam?.IdentificationCode,
            p.CurrentPenId,
            p.CurrentPen?.Code,
            p.CurrentPen?.Shed?.Name,
            p.CurrentPen?.Shed?.Area?.Name,
            p.CurrentBatchId,
            p.CurrentBatch?.Code,
            p.Status,
            p.Status.ToString(),
            p.ReproductiveStatus,
            p.ReproductiveStatus.ToString(),
            p.Parity,
            p.CalculateAgeInDays(),
            lastWeighing?.WeightKg,
            lastWeighing?.WeighingDate,
            p.ExitDate,
            p.ExitReason,
            p.Notes,
            p.CreatedAt
        );
    }

    private static PigDto MapDetailToDto(PigDetailDto d)
    {
        return new PigDto(
            d.Id,
            d.FarmId,
            d.IdentificationCode,
            d.ElectronicId,
            d.Sex,
            d.SexName,
            d.Breed,
            d.GeneticLine,
            d.BirthDate,
            d.EntryDate,
            d.EntryType,
            d.EntryTypeName,
            d.SireId,
            d.SireCode,
            d.DamId,
            d.DamCode,
            d.CurrentPenId,
            d.PenCode,
            d.ShedName,
            d.AreaName,
            d.CurrentBatchId,
            d.BatchCode,
            d.Status,
            d.StatusName,
            d.ReproductiveStatus,
            d.ReproductiveStatusName,
            d.Parity,
            d.AgeInDays,
            d.CurrentWeightKg,
            d.LastWeighingDate,
            d.ExitDate,
            d.ExitReason,
            d.Notes,
            d.CreatedAt
        );
    }
    #endregion
}
