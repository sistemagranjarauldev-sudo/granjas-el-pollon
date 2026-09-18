using Microsoft.EntityFrameworkCore;
using SistemaGranja.Application.Common.Interfaces;
using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.Batches.DTOs;
using SistemaGranja.Domain.Entities.Batches;
using SistemaGranja.Domain.Enums;
using SistemaGranja.Shared.Results;

namespace SistemaGranja.Application.Modules.Batches.Services;

public class BatchesService : IBatchesService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public BatchesService(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PaginatedList<BatchDto>>> GetBatchesAsync(
        Guid farmId,
        int pageIndex = 1,
        int pageSize = 20,
        string? search = null,
        BatchStage? stage = null,
        BatchStatus? status = null,
        Guid? penId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Batches
            .Include(b => b.CurrentPen)
                .ThenInclude(p => p!.Shed)
                    .ThenInclude(s => s.Area)
            .Include(b => b.Weighings)
            .Where(b => b.FarmId == farmId && !b.IsDeleted);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(b => b.Code.ToLower().Contains(s) || b.Name.ToLower().Contains(s));
        }

        if (stage.HasValue)
            query = query.Where(b => b.Stage == stage.Value);

        if (status.HasValue)
            query = query.Where(b => b.Status == status.Value);

        if (penId.HasValue)
            query = query.Where(b => b.CurrentPenId == penId.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = items.Select(MapToBatchDto).ToList();
        return Result<PaginatedList<BatchDto>>.Success(new PaginatedList<BatchDto>(dtos, totalCount, pageIndex, pageSize));
    }

    public async Task<Result<BatchDetailDto>> GetBatchByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var batch = await _context.Batches
            .Include(b => b.CurrentPen)
                .ThenInclude(p => p!.Shed)
                    .ThenInclude(s => s.Area)
            .Include(b => b.Movements)
                .ThenInclude(m => m.SourcePen)
            .Include(b => b.Movements)
                .ThenInclude(m => m.TargetPen)
            .Include(b => b.Weighings)
            .FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted, cancellationToken);

        if (batch == null)
            return Result<BatchDetailDto>.Failure(Error.NotFound);

        var lastWeighing = batch.Weighings.OrderByDescending(w => w.WeighingDate).FirstOrDefault();

        var movements = batch.Movements
            .OrderByDescending(m => m.MovementDate)
            .Select(m => new BatchMovementDto(
                m.Id,
                m.BatchId,
                m.SourcePenId,
                m.SourcePen?.Code,
                m.TargetPenId,
                m.TargetPen?.Code ?? "N/A",
                m.Quantity,
                m.MovementDate,
                m.Reason,
                m.ResponsibleUserId,
                m.Notes,
                m.CreatedAt
            )).ToList();

        var weighings = batch.Weighings
            .OrderByDescending(w => w.WeighingDate)
            .Select(w => new BatchWeighingSummaryDto(
                w.Id,
                w.WeighingDate,
                w.Stage,
                w.SampleQuantity,
                w.TotalSampleWeightKg,
                w.AverageWeightKg,
                w.EstimatedBatchWeightKg,
                w.AverageDailyGainGrams,
                w.WeightGainKg,
                w.DaysElapsed,
                w.Notes
            )).ToList();

        var dto = new BatchDetailDto(
            batch.Id,
            batch.FarmId,
            batch.Code,
            batch.Name,
            batch.Stage,
            batch.Stage.ToString(),
            batch.StartDate,
            batch.EndDate,
            batch.InitialQuantity,
            batch.CurrentQuantity,
            batch.InitialWeightKg,
            lastWeighing?.AverageWeightKg,
            lastWeighing?.WeighingDate,
            batch.CurrentPenId,
            batch.CurrentPen?.Code,
            batch.CurrentPen?.Shed?.Name,
            batch.CurrentPen?.Shed?.Area?.Name,
            batch.Status,
            batch.Status.ToString(),
            batch.CalculateDaysInBatch(),
            batch.Notes,
            batch.CreatedAt,
            movements,
            weighings
        );

        return Result<BatchDetailDto>.Success(dto);
    }

    public async Task<Result<IReadOnlyList<BatchDto>>> GetActiveBatchesAsync(Guid farmId, CancellationToken cancellationToken = default)
    {
        var batches = await _context.Batches
            .Include(b => b.CurrentPen)
            .Where(b => b.FarmId == farmId && b.Status == BatchStatus.Active && !b.IsDeleted)
            .OrderBy(b => b.Code)
            .ToListAsync(cancellationToken);

        var dtos = batches.Select(MapToBatchDto).ToList();
        return Result<IReadOnlyList<BatchDto>>.Success(dtos);
    }

    public async Task<Result<BatchDto>> CreateBatchAsync(CreateBatchDto dto, CancellationToken cancellationToken = default)
    {
        var farmExists = await _context.Farms.AnyAsync(f => f.Id == dto.FarmId && !f.IsDeleted, cancellationToken);
        if (!farmExists)
            return Result<BatchDto>.Failure("Farm.NotFound", "La granja especificada no existe.");

        var codeExists = await _context.Batches.AnyAsync(b => b.FarmId == dto.FarmId && b.Code.ToLower() == dto.Code.ToLower().Trim() && !b.IsDeleted, cancellationToken);
        if (codeExists)
            return Result<BatchDto>.Failure("Batch.CodeExists", $"Ya existe un lote con el código '{dto.Code}' en esta granja.");

        if (dto.CurrentPenId.HasValue)
        {
            var pen = await _context.Pens.FirstOrDefaultAsync(p => p.Id == dto.CurrentPenId.Value && !p.IsDeleted, cancellationToken);
            if (pen == null)
                return Result<BatchDto>.Failure("Pen.NotFound", "El corral seleccionado no existe.");

            pen.CurrentOccupancy += dto.InitialQuantity;
            pen.Status = PenStatus.Occupied;
        }

        var batch = new Batch
        {
            FarmId = dto.FarmId,
            Code = dto.Code.Trim().ToUpper(),
            Name = dto.Name.Trim(),
            Stage = dto.Stage,
            StartDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc),
            InitialQuantity = dto.InitialQuantity,
            CurrentQuantity = dto.InitialQuantity,
            InitialWeightKg = dto.InitialWeightKg,
            CurrentPenId = dto.CurrentPenId,
            Status = BatchStatus.Active,
            Notes = dto.Notes?.Trim()
        };

        if (dto.CurrentPenId.HasValue)
        {
            batch.Movements.Add(new BatchMovement
            {
                BatchId = batch.Id,
                SourcePenId = null,
                TargetPenId = dto.CurrentPenId.Value,
                Quantity = dto.InitialQuantity,
                MovementDate = DateTime.SpecifyKind(dto.StartDate, DateTimeKind.Utc),
                Reason = "Apertura e ingreso inicial de lote",
                ResponsibleUserId = _currentUserService.UserId
            });
        }

        _context.Batches.Add(batch);
        await _context.SaveChangesAsync(cancellationToken);

        var detailResult = await GetBatchByIdAsync(batch.Id, cancellationToken);
        if (!detailResult.IsSuccess)
            return Result<BatchDto>.Failure(detailResult.Error);

        return Result<BatchDto>.Success(MapDetailToDto(detailResult.Value!));
    }

    public async Task<Result<BatchDto>> UpdateBatchAsync(Guid id, UpdateBatchDto dto, CancellationToken cancellationToken = default)
    {
        var batch = await _context.Batches.FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted, cancellationToken);
        if (batch == null)
            return Result<BatchDto>.Failure(Error.NotFound);

        // Si se cierra o liquida el lote, liberamos el corral
        if ((dto.Status == BatchStatus.Closed || dto.Status == BatchStatus.Sold) && batch.CurrentPenId.HasValue)
        {
            var pen = await _context.Pens.FirstOrDefaultAsync(p => p.Id == batch.CurrentPenId.Value, cancellationToken);
            if (pen != null && pen.CurrentOccupancy > 0)
            {
                pen.CurrentOccupancy = Math.Max(0, pen.CurrentOccupancy - batch.CurrentQuantity);
                if (pen.CurrentOccupancy == 0 && pen.Status == PenStatus.Occupied)
                    pen.Status = PenStatus.Empty;
            }
            batch.CurrentPenId = null;
        }

        batch.Name = dto.Name.Trim();
        batch.Stage = dto.Stage;
        batch.Status = dto.Status;
        batch.EndDate = dto.EndDate.HasValue ? DateTime.SpecifyKind(dto.EndDate.Value, DateTimeKind.Utc) : null;
        batch.Notes = dto.Notes?.Trim();

        await _context.SaveChangesAsync(cancellationToken);

        var detailResult = await GetBatchByIdAsync(batch.Id, cancellationToken);
        if (!detailResult.IsSuccess)
            return Result<BatchDto>.Failure(detailResult.Error);

        return Result<BatchDto>.Success(MapDetailToDto(detailResult.Value!));
    }

    public async Task<Result> MoveBatchAsync(Guid id, MoveBatchDto dto, CancellationToken cancellationToken = default)
    {
        var batch = await _context.Batches.FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted, cancellationToken);
        if (batch == null)
            return Result.Failure(Error.NotFound);

        if (batch.Status != BatchStatus.Active)
            return Result.Failure("Batch.NotActive", "Solo se pueden trasladar lotes activos.");

        if (dto.Quantity > batch.CurrentQuantity)
            return Result.Failure("Batch.QuantityExceeded", $"La cantidad a trasladar ({dto.Quantity}) no puede exceder el saldo del lote ({batch.CurrentQuantity}).");

        if (batch.CurrentPenId == dto.TargetPenId)
            return Result.Failure("Batch.SamePen", "El corral de destino es el mismo que el corral actual.");

        var targetPen = await _context.Pens.FirstOrDefaultAsync(p => p.Id == dto.TargetPenId && !p.IsDeleted, cancellationToken);
        if (targetPen == null)
            return Result.Failure("Pen.NotFound", "El corral de destino no existe.");

        // Descontar del corral origen
        if (batch.CurrentPenId.HasValue)
        {
            var sourcePen = await _context.Pens.FirstOrDefaultAsync(p => p.Id == batch.CurrentPenId.Value, cancellationToken);
            if (sourcePen != null)
            {
                sourcePen.CurrentOccupancy = Math.Max(0, sourcePen.CurrentOccupancy - dto.Quantity);
                if (sourcePen.CurrentOccupancy == 0 && sourcePen.Status == PenStatus.Occupied)
                    sourcePen.Status = PenStatus.Empty;
            }
        }

        // Incrementar en corral destino
        targetPen.CurrentOccupancy += dto.Quantity;
        targetPen.Status = PenStatus.Occupied;

        var sourcePenId = batch.CurrentPenId;
        batch.CurrentPenId = targetPen.Id;

        var movement = new BatchMovement
        {
            BatchId = batch.Id,
            SourcePenId = sourcePenId,
            TargetPenId = targetPen.Id,
            Quantity = dto.Quantity,
            MovementDate = DateTime.UtcNow,
            Reason = dto.Reason.Trim(),
            ResponsibleUserId = _currentUserService.UserId,
            Notes = dto.Notes?.Trim()
        };

        _context.BatchMovements.Add(movement);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }

    public async Task<Result> DeleteBatchAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var batch = await _context.Batches.FirstOrDefaultAsync(b => b.Id == id && !b.IsDeleted, cancellationToken);
        if (batch == null)
            return Result.Failure(Error.NotFound);

        if (batch.CurrentPenId.HasValue)
        {
            var pen = await _context.Pens.FirstOrDefaultAsync(p => p.Id == batch.CurrentPenId.Value, cancellationToken);
            if (pen != null && pen.CurrentOccupancy > 0)
            {
                pen.CurrentOccupancy = Math.Max(0, pen.CurrentOccupancy - batch.CurrentQuantity);
                if (pen.CurrentOccupancy == 0 && pen.Status == PenStatus.Occupied)
                    pen.Status = PenStatus.Empty;
            }
        }

        batch.IsDeleted = true;
        batch.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    #region Helpers & Mapping
    private static BatchDto MapToBatchDto(Batch b)
    {
        var lastWeighing = b.Weighings?.OrderByDescending(w => w.WeighingDate).FirstOrDefault();

        return new BatchDto(
            b.Id,
            b.FarmId,
            b.Code,
            b.Name,
            b.Stage,
            b.Stage.ToString(),
            b.StartDate,
            b.EndDate,
            b.InitialQuantity,
            b.CurrentQuantity,
            b.InitialWeightKg,
            lastWeighing?.AverageWeightKg,
            lastWeighing?.WeighingDate,
            b.CurrentPenId,
            b.CurrentPen?.Code,
            b.CurrentPen?.Shed?.Name,
            b.CurrentPen?.Shed?.Area?.Name,
            b.Status,
            b.Status.ToString(),
            b.CalculateDaysInBatch(),
            b.Notes,
            b.CreatedAt
        );
    }

    private static BatchDto MapDetailToDto(BatchDetailDto d)
    {
        return new BatchDto(
            d.Id,
            d.FarmId,
            d.Code,
            d.Name,
            d.Stage,
            d.StageName,
            d.StartDate,
            d.EndDate,
            d.InitialQuantity,
            d.CurrentQuantity,
            d.InitialWeightKg,
            d.CurrentAverageWeightKg,
            d.LastWeighingDate,
            d.CurrentPenId,
            d.PenCode,
            d.ShedName,
            d.AreaName,
            d.Status,
            d.StatusName,
            d.DaysInBatch,
            d.Notes,
            d.CreatedAt
        );
    }
    #endregion
}
