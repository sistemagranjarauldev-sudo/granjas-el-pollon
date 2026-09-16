import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FarmConfiguration } from '../../types';
import { farmStructureService } from './farmStructureService';
import { Sliders, Check } from 'lucide-react';

export interface FarmConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmId: string;
  farmName: string;
}

export const FarmConfigModal: React.FC<FarmConfigModalProps> = ({
  isOpen,
  onClose,
  farmId,
  farmName,
}) => {
  const [configs, setConfigs] = useState<FarmConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && farmId) {
      loadConfigs();
    }
  }, [isOpen, farmId]);

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const res = await farmStructureService.getFarmConfigurations(farmId);
      if (res.success && res.data) {
        setConfigs(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateConfig = async (key: string, value: string) => {
    try {
      await farmStructureService.updateFarmConfiguration(farmId, key, value);
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } catch {
      // Ignorar error de guardado
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-emerald-600" />
          <span>Configuración Zootécnica — {farmName}</span>
        </div>
      }
      description="Parámetros biológicos y operativos personalizables para esta granja"
      maxWidth="lg"
      footer={
        <Button variant="primary" size="sm" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      {isLoading ? (
        <div className="py-8 text-center text-sm text-slate-500">Cargando parámetros...</div>
      ) : configs.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          No hay parámetros configurados para esta granja.
        </div>
      ) : (
        <div className="space-y-4">
          {configs.map((config) => (
            <div
              key={config.id}
              className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-4"
            >
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900">{config.description || config.key}</p>
                <p className="text-[11px] font-mono text-slate-500">{config.key}</p>
              </div>
              <div className="flex items-center gap-2 w-44">
                <Input
                  defaultValue={config.value}
                  onBlur={(e) => {
                    if (e.target.value !== config.value) {
                      handleUpdateConfig(config.key, e.target.value);
                    }
                  }}
                  className="py-1 text-xs"
                />
                {savedKey === config.key && (
                  <span className="text-emerald-600 animate-fadeIn">
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
