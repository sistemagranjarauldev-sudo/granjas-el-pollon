using Microsoft.EntityFrameworkCore;
using SistemaGranja.Application.Common.Interfaces;
using SistemaGranja.Application.Common.Models;
using SistemaGranja.Application.Modules.Weighings.DTOs;
using SistemaGranja.Domain.Entities.Weighings;
using SistemaGranja.Shared.Results;

namespace SistemaGranja.Application.Modules.Weighings.Services;

public class WeighingsService : IWeighingsService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public WeighingsService(IApplicationDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PaginatedList<PigWeighingDto>>> GetPigWeighingsAsync(
        Guid? pigId = null,
        Guid? farmId = null,
        int pageIndex = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.PigWeighings
            .Include(w => w.Pig)
            .Where(w => !w.IsDeleted);

        if (pigId.HasValue)
            query = query.Where(w => w.PigId == pigId.Value);

        if (farmId.HasValue)
            query = query.Where(w => w.Pig.FarmId == farmId.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(w => w.WeighingDate)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = items.Select(MapToPigWeighingDto).ToList();
        return Result<PaginatedList<PigWeighingDto>>.Success(new PaginatedList<PigWeighingDto>(dtos, totalCount, pageIndex, pageSize));
    }

    public async Task<Result<PaginatedList<BatchWeighingDto>>> GetBatchWeighingsAsync(
        Guid? batchId = null,
        Guid? farmId = null,
        int pageIndex = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _context.BatchWeighings
            .Include(w => w.Batch)
            .Where(w => !w.IsDeleted);

        if (batchId.HasValue)
            query = query.Where(w => w.BatchId == batchId.Value);

        if (farmId.HasValue)
            query = query.Where(w => w.Batch.FarmId == farmId.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(w => w.WeighingDate)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = items.Select(MapToBatchWeighingDto).ToList();
        return Result<PaginatedList<BatchWeighingDto>>.Success(new PaginatedList<BatchWeighingDto>(dtos, totalCount, pageIndex, pageSize));
    }

    public async Task<Result<IReadOnlyList<GrowthCurvePointDto>>> GetPigGrowthCurveAsync(Guid pigId, CancellationToken cancellationToken = default)
    {
        var weighings = await _context.PigWeighings
            .Where(w => w.PigId == pigId && !w.IsDeleted)
            .OrderBy(w => w.WeighingDate)
            .ToListAsync(cancellationToken);

        var points = weighings.Select(w => new GrowthCurvePointDto(
            w.WeighingDate,
            w.AgeDays,
            w.WeightKg,
            w.AverageDailyGainGrams
        )).ToList();

        return Result<IReadOnlyList<GrowthCurvePointDto>>.Success(points);
    }

    public async Task<Result<IReadOnlyList<GrowthCurvePointDto>>> GetBatchGrowthCurveAsync(Guid batchId, CancellationToken cancellationToken = default)
    {
        var batch = await _context.Batches.FirstOrDefaultAsync(b => b.Id == batchId && !b.IsDeleted, cancellationToken);
        if (batch == null)
            return Result<IReadOnlyList<GrowthCurvePointDto>>.Failure(Error.NotFound);

        var weighings = await _context.BatchWeighings
            .Where(w => w.BatchId == batchId && !w.IsDeleted)
            .OrderBy(w => w.WeighingDate)
            .ToListAsync(cancellationToken);

        var points = weighings.Select(w => new GrowthCurvePointDto(
            w.WeighingDate,
            Math.Max(0, (int)(w.WeighingDate.Date - batch.StartDate.Date).TotalDays),
            w.AverageWeightKg,
            w.AverageDailyGainGrams
        )).ToList();

        return Result<IReadOnlyList<GrowthCurvePointDto>>.Success(points);
    }

    public async Task<Result<PigWeighingDto>> RecordPigWeighingAsync(RecordPigWeighingDto dto, CancellationToken cancellationToken = default)
    {
        var pig = await _context.Pigs.FirstOrDefaultAsync(p => p.Id == dto.PigId && !p.IsDeleted, cancellationToken);
        if (pig == null)
            return Result<PigWeighingDto>.Failure("Pig.NotFound", "El animal especificado no existe.");

        var ageInDays = pig.CalculateAgeInDays(dto.WeighingDate);

        // Buscar pesaje anterior más reciente
        var previousWeighing = await _context.PigWeighings
            .Where(w => w.PigId == dto.PigId && w.WeighingDate < dto.WeighingDate && !w.IsDeleted)
            .OrderByDescending(w => w.WeighingDate)
            .FirstOrDefaultAsync(cancellationToken);

        decimal? weightGainKg = null;
        int? daysElapsed = null;
        decimal? adgGrams = null;

        if (previousWeighing != null)
        {
            daysElapsed = Math.Max(1, (int)(dto.WeighingDate.Date - previousWeighing.WeighingDate.Date).TotalDays);
            weightGainKg = dto.WeightKg - previousWeighing.WeightKg;
            adgGrams = Math.Round((weightGainKg.Value / daysElapsed.Value) * 1000m, 2);
        }

        var weighing = new PigWeighing
        {
            PigId = dto.PigId,
            WeighingDate = dto.WeighingDate,
            WeightKg = dto.WeightKg,
            AgeDays = ageInDays,
            Stage = dto.Stage,
            WeightGainKg = weightGainKg,
            DaysElapsed = daysElapsed,
            AverageDailyGainGrams = adgGrams,
            ResponsibleUserId = _currentUserService.UserId,
            Notes = dto.Notes?.Trim()
        };

        _context.PigWeighings.Add(weighing);
        await _context.SaveChangesAsync(cancellationToken);

        weighing.Pig = pig;
        return Result<PigWeighingDto>.Success(MapToPigWeighingDto(weighing));
    }

    public async Task<Result<BatchWeighingDto>> RecordBatchWeighingAsync(RecordBatchWeighingDto dto, CancellationToken cancellationToken = default)
    {
        var batch = await _context.Batches.FirstOrDefaultAsync(b => b.Id == dto.BatchId && !b.IsDeleted, cancellationToken);
        if (batch == null)
            return Result<BatchWeighingDto>.Failure("Batch.NotFound", "El lote especificado no existe.");

        var avgWeight = Math.Round(dto.TotalSampleWeightKg / dto.SampleQuantity, 2);
        var estimatedBatchWeight = Math.Round(avgWeight * batch.CurrentQuantity, 2);

        // Buscar pesaje grupal anterior más reciente
        var previousWeighing = await _context.BatchWeighings
            .Where(w => w.BatchId == dto.BatchId && w.WeighingDate < dto.WeighingDate && !w.IsDeleted)
            .OrderByDescending(w => w.WeighingDate)
            .FirstOrDefaultAsync(cancellationToken);

        decimal? weightGainKg = null;
        int? daysElapsed = null;
        decimal? adgGrams = null;

        if (previousWeighing != null)
        {
            daysElapsed = Math.Max(1, (int)(dto.WeighingDate.Date - previousWeighing.WeighingDate.Date).TotalDays);
            weightGainKg = avgWeight - previousWeighing.AverageWeightKg;
            adgGrams = Math.Round((weightGainKg.Value / daysElapsed.Value) * 1000m, 2);
        }

        var weighing = new BatchWeighing
        {
            BatchId = dto.BatchId,
            WeighingDate = dto.WeighingDate,
            Stage = dto.Stage,
            SampleQuantity = dto.SampleQuantity,
            TotalSampleWeightKg = dto.TotalSampleWeightKg,
            AverageWeightKg = avgWeight,
            EstimatedBatchWeightKg = estimatedBatchWeight,
            WeightGainKg = weightGainKg,
            DaysElapsed = daysElapsed,
            AverageDailyGainGrams = adgGrams,
            ResponsibleUserId = _currentUserService.UserId,
            Notes = dto.Notes?.Trim()
        };

        _context.BatchWeighings.Add(weighing);
        await _context.SaveChangesAsync(cancellationToken);

        weighing.Batch = batch;
        return Result<BatchWeighingDto>.Success(MapToBatchWeighingDto(weighing));
    }

    public async Task<Result> DeletePigWeighingAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var weighing = await _context.PigWeighings.FirstOrDefaultAsync(w => w.Id == id && !w.IsDeleted, cancellationToken);
        if (weighing == null)
            return Result.Failure(Error.NotFound);

        weighing.IsDeleted = true;
        weighing.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    public async Task<Result> DeleteBatchWeighingAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var weighing = await _context.BatchWeighings.FirstOrDefaultAsync(w => w.Id == id && !w.IsDeleted, cancellationToken);
        if (weighing == null)
            return Result.Failure(Error.NotFound);

        weighing.IsDeleted = true;
        weighing.DeletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }

    #region Helpers & Mapping
    private static PigWeighingDto MapToPigWeighingDto(PigWeighing w)
    {
        return new PigWeighingDto(
            w.Id,
            w.PigId,
            w.Pig?.IdentificationCode ?? string.Empty,
            w.WeighingDate,
            w.WeightKg,
            w.AgeDays,
            w.Stage,
            w.Stage.ToString(),
            w.AverageDailyGainGrams,
            w.WeightGainKg,
            w.DaysElapsed,
            w.ResponsibleUserId,
            w.Notes,
            w.CreatedAt
        );
    }

    private static BatchWeighingDto MapToBatchWeighingDto(BatchWeighing w)
    {
        return new BatchWeighingDto(
            w.Id,
            w.BatchId,
            w.Batch?.Code ?? string.Empty,
            w.Batch?.Name ?? string.Empty,
            w.WeighingDate,
            w.Stage,
            w.Stage.ToString(),
            w.SampleQuantity,
            w.TotalSampleWeightKg,
            w.AverageWeightKg,
            w.EstimatedBatchWeightKg,
            w.AverageDailyGainGrams,
            w.WeightGainKg,
            w.DaysElapsed,
            w.ResponsibleUserId,
            w.Notes,
            w.CreatedAt
        );
    }
    #endregion
}
