import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { shm_request } from '../../lib/shm_request';
import DynamicPaymentForm, { PaymentFormSchema, PaymentFieldSchema } from '../../components/DynamicPaymentForm';

export interface PaymentSystem {
  name: string;
  title: string;
  description: string;
  infoMessage?: string;
  price?: number;
  fields: PaymentFieldSchema[];
}

interface UniversalPaymentModalProps {
  open: boolean;
  onClose: () => void;
  system: PaymentSystem;
}

export const UniversalPaymentModal: React.FC<UniversalPaymentModalProps> = ({ open, onClose, system }) => {
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);

  const cardStyles = {
    backgroundColor: 'var(--theme-card-bg)',
    borderColor: 'var(--theme-card-border)',
    color: 'var(--theme-content-text)',
  };

  useEffect(() => {
    if (open) {
      loadExistingData();
    }
  }, [open, system]);

  const loadExistingData = async () => {
    try {
      // Загружаем существующие настройки платежной системы
      const configResponse = await shm_request('shm/v1/admin/config/pay_systems');
      const currentConfig = configResponse.data?.[0] || {};

      // Получаем данные для текущей платежной системы
      if (currentConfig[system.name]) {
        setExistingData(currentConfig[system.name]);
      }
    } catch (error) {
      // Не показываем ошибку пользователю, просто оставляем форму пустой
    }
  };

  const handleFormSubmit = async (formData: Record<string, any>) => {
    try {
      // Получаем текущие настройки платежных систем
      const configResponse = await shm_request('shm/v1/admin/config/pay_systems');
      const currentConfig = configResponse.data?.[0] || {};

      // Подготовка данных для сохранения
      const systemConfig: any = {
        ...formData,
      };

      // Преобразуем числовые поля
      if (formData.weight) systemConfig.weight = Number(formData.weight);
      if (formData.lifetime) systemConfig.lifetime = Number(formData.lifetime);

      // Добавляем/обновляем настройки для текущей платежной системы
      const updatedConfig = {
        ...currentConfig,
        [system.name]: systemConfig
      };

      // Сохраняем обновленную конфигурацию
      await shm_request('shm/v1/admin/config', {
        method: 'POST',
        body: JSON.stringify({
          key: 'pay_systems',
          value: updatedConfig,
        }),
      });

      toast.success(`Настройки ${system.title} сохранены`);
      onClose();
    } catch (error) {
      toast.error('Ошибка сохранения настроек');
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={cardStyles}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b sticky top-0 z-10"
             style={{
               borderColor: 'var(--theme-card-border)',
               backgroundColor: 'var(--theme-card-bg)'
             }}>
          <h2 className="text-xl font-semibold">{system.title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--theme-content-text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {system.description && (
            <p className="text-sm mb-4" style={{ color: 'var(--theme-content-text-muted)' }}>
              {system.description}
            </p>
          )}

          {system.price && system.price > 0 ? (
            <div className="p-3 rounded mb-4" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--accent-primary)' }}>
                Стоимость подключения: {system.price} ₽
              </p>
            </div>
          ) : undefined}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2"
                   style={{ borderColor: 'var(--accent-primary)' }}></div>
            </div>
          ) : system.fields ? (
            <DynamicPaymentForm
              schema={{
                name: system.name,
                title: system.title,
                description: system.description,
                infoMessage: system.infoMessage,
                fields: system.fields
              }}
              existingData={existingData}
              onSubmit={handleFormSubmit}
              onCancel={onClose}
            />
          ) : (
            <div className="text-center p-4">
              <p style={{ color: 'var(--theme-content-text-muted)' }}>
                Схема настройки для {system.title} временно недоступна
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
