import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pigsService } from '../pigs/pigsService';
import { batchesService } from '../batches/batchesService';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Scale, Users, User } from 'lucide-react';

interface WeighingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  farmId: string;
  defaultPigId?: string;
  defaultBatchId?: string;
  isLoading?: boolean;
}

export const WeighingModal: React.FC<WeighingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  farmId,
  defaultPigId,
  defaultBatchId,
  isLoading = false,
}) => {
  const [mode, setMode] = useState<'individual' | 'batch'>(
    defaultBatchId ? 'batch' : 'individual'
  );

  // Form states
  const [weighingDate, setWeighingDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [pigId, setPigId] = useState(defaultPigId || '');
  const [weightKg, setWeightKg] = useState<number | ''>('');

  const [batchId, setBatchId] = useState(defaultBatchId || '');
  const [sampleQuantity, setSampleQuantity] = useState<number | ''>(10);
  const [totalSampleWeightKg, setTotalSampleWeightKg] = useState<number | ''>('');

  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (defaultBatchId) {
        setMode('batch');
        setBatchId(defaultBatchId);
      } else if (defaultPigId) {
        setMode('individual');
        setPigId(defaultPigId);
      }
      setWeighingDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setError(null);
    }
  }, [isOpen, defaultPigId, defaultBatchId]);

  // Queries for select options
  const { data: pigsData } = useQuery({
    queryKey: ['active-pigs-select', farmId],
    queryFn: () => pigsService.getPigs(1, 100),
    enabled: isOpen && mode === 'individual' && !defaultPigId,
  });

  const { data: batchesData } = useQuery({
    queryKey: ['active-batches-select', farmId],
    queryFn: () => batchesService.getActiveBatches(),
    enabled: isOpen && mode === 'batch' && !defaultBatchId,
  });

  const pigs = pigsData?.data?.items || [];
  const batches = batchesData?.data || [];

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (mode === 'individual') {
        const targetPigId = defaultPigId || pigId;
        if (!targetPigId) {
          setError('Debe seleccionar el animal');
          return;
        }
        if (!weightKg || Number(weightKg) <= 0) {
          setError('El peso debe ser mayor a 0 kg');
          return;
        }

        await onSubmit({
          pigId: targetPigId,
          weighingDate: new Date(weighingDate).toISOString(),
          weightKg: Number(weightKg),
          notes: notes || undefined,
        });
      } else {
        const targetBatchId = defaultBatchId || batchId;
        if (!targetBatchId) {
          setError('Debe seleccionar el lote');
          return;
        }
        if (!sampleQuantity || Number(sampleQuantity) <= 0) {
          setError('La cantidad de muestra debe ser mayor a 0');
          return;
        }
        if (!totalSampleWeightKg || Number(totalSampleWeightKg) <= 0) {
          setError('El peso total de la muestra debe ser mayor a 0 kg');
          return;
        }

        await onSubmit({
          batchId: targetBatchId,
          weighingDate: new Date(weighingDate).toISOString(),
          sampleQuantity: Number(sampleQuantity),
          totalSampleWeightKg: Number(totalSampleWeightKg),
          notes: notes || undefined,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al registrar el pesaje');
    }
  };

  const calculatedAverage =
    sampleQuantity && totalSampleWeightKg && Number(sampleQuantity) > 0
      ? (Number(totalSampleWeightKg) / Number(sampleQuantity)).toFixed(2)
      : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-emerald-600" />
          <span>Registrar Pesaje y Control Ponderal</span>
        </div>
      }
      maxWidth="md"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        {/* Mode Switcher */}
        {!defaultPigId && !defaultBatchId && (
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('individual')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'individual'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Individual (Arete)
            </button>
            <button
              type="button"
              onClick={() => setMode('batch')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'batch'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Colectivo (Lote)
            </button>
          </div>
        )}

        {/* Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Fecha de Pesaje *
          </label>
          <Input
            type="date"
            value={weighingDate}
            onChange={(e) => setWeighingDate(e.target.value)}
            required
          />
        </div>

        {/* Individual Fields */}
        {mode === 'individual' ? (
          <>
            {!defaultPigId && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seleccionar Animal *
                </label>
                <select
                  className="block w-full rounded-lg border border-slate-300 text-xs py-2 px-3 bg-white"
                  value={pigId}
                  onChange={(e) => setPigId(e.target.value)}
                  required
                >
                  <option value="">-- Seleccionar Arete --</option>
                  {pigs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.identificationCode} - {p.breed} ({p.sexName}) - {p.penCode || 'Sin corral'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Peso Registrado (kg) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.1"
                placeholder="Ej. 85.50"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : '')}
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                El sistema calculará automáticamente la ganancia diaria de peso (GDP) comparando con el pesaje anterior.
              </p>
            </div>
          </>
        ) : (
          /* Batch Fields */
          <>
            {!defaultBatchId && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seleccionar Lote *
                </label>
                <select
                  className="block w-full rounded-lg border border-slate-300 text-xs py-2 px-3 bg-white"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  required
                >
                  <option value="">-- Seleccionar Lote Activo --</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} - {b.name} ({b.currentQuantity} cabezas - {b.stageName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cabezas Muestreadas *
                </label>
                <Input
                  type="number"
                  min="1"
                  placeholder="Ej. 15"
                  value={sampleQuantity}
                  onChange={(e) =>
                    setSampleQuantity(e.target.value ? Number(e.target.value) : '')
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Peso Total Muestra (kg) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.1"
                  placeholder="Ej. 450.00"
                  value={totalSampleWeightKg}
                  onChange={(e) =>
                    setTotalSampleWeightKg(e.target.value ? Number(e.target.value) : '')
                  }
                  required
                />
              </div>
            </div>

            {calculatedAverage && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-800">
                  Peso Promedio Estimado:
                </span>
                <span className="text-base font-black text-emerald-700">
                  {calculatedAverage} kg / cerdo
                </span>
              </div>
            )}
          </>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Notas / Observaciones
          </label>
          <textarea
            className="block w-full rounded-lg border border-slate-300 text-xs p-2.5 bg-white"
            rows={2}
            placeholder="Ej. Pesaje de transición a etapa de engorde..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
            Guardar Pesaje
          </Button>
        </div>
      </form>
    </Modal>
  );
};
