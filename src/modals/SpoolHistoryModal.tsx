import React, { useState } from 'react';
import Modal from '../components/Modal';
import Console from '../components/Console';
import JsonEditor from '../components/JsonEditor';
import { X, Terminal } from 'lucide-react';

interface SpoolHistoryModalProps {
  open: boolean;
  onClose: () => void;
  data: Record<string, any> | null;
}

export default function SpoolHistoryModal({
  open,
  onClose,
  data,
}: SpoolHistoryModalProps) {
  const [showConsole, setShowConsole] = useState(false);

  const inputStyles = {
    backgroundColor: 'var(--theme-input-bg)',
    borderColor: 'var(--theme-input-border)',
    color: 'var(--theme-input-text)',
  };

  const labelStyles = {
    color: 'var(--theme-content-text-muted)',
  };

  const renderFooter = () => (
    <div className="flex justify-end gap-2 w-full">
      <button
        onClick={onClose}
        className="px-4 py-2 rounded flex items-center gap-2"
        style={{
          backgroundColor: 'var(--theme-button-secondary-bg)',
          color: 'var(--theme-button-secondary-text)',
          border: '1px solid var(--theme-button-secondary-border)',
        }}
      >
        <X className="w-4 h-4" />
        Закрыть
      </button>
    </div>
  );

  if (showConsole && data?.response?.pipeline_id) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Просмотр логов"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <button
              onClick={() => setShowConsole(false)}
              className="px-4 py-2 rounded flex items-center gap-2"
              style={{
                backgroundColor: 'var(--theme-button-secondary-bg)',
                color: 'var(--theme-button-secondary-text)',
                border: '1px solid var(--theme-button-secondary-border)',
              }}
            >
              Назад
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded flex items-center gap-2"
              style={{
                backgroundColor: 'var(--theme-button-secondary-bg)',
                color: 'var(--theme-button-secondary-text)',
                border: '1px solid var(--theme-button-secondary-border)',
              }}
            >
              <X className="w-4 h-4" />
              Закрыть
            </button>
          </div>
        }
        size="xl"
      >
        <Console pipelineId={data.response.pipeline_id} />
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Задача #${data?.spool_id || data?.id || ''}`}
      footer={renderFooter()}
      size="xl"
    >
      <div className="space-y-4">
        {/* Событие */}
        <div className="flex items-center gap-3">
          <label className="w-32 text-sm font-medium shrink-0" style={labelStyles}>
            Событие
          </label>
          <input
            type="text"
            value={data?.event?.title || ''}
            disabled
            className="flex-1 px-3 py-2 text-sm rounded border disabled:opacity-50"
            style={inputStyles}
          />
        </div>

        {/* Статус */}
        <div className="flex items-center gap-3">
          <label className="w-32 text-sm font-medium shrink-0" style={labelStyles}>
            Статус
          </label>
          <input
            type="text"
            value={data?.status || ''}
            disabled
            className="w-40 px-3 py-2 text-sm rounded border disabled:opacity-50"
            style={inputStyles}
          />
        </div>

        {/* Пользователь */}
        <div className="flex items-center gap-3">
          <label className="w-32 text-sm font-medium shrink-0" style={labelStyles}>
            Пользователь
          </label>
          <input
            type="text"
            value={data?.user_id || ''}
            disabled
            className="flex-1 px-3 py-2 text-sm rounded border disabled:opacity-50"
            style={inputStyles}
          />
        </div>

        {/* Услуга */}
        {data?.settings?.user_service_id && (
          <div className="flex items-center gap-3">
            <label className="w-32 text-sm font-medium shrink-0" style={labelStyles}>
              Услуга
            </label>
            <input
              type="text"
              value={data.settings.user_service_id || ''}
              disabled
              className="flex-1 px-3 py-2 text-sm rounded border disabled:opacity-50"
              style={inputStyles}
            />
          </div>
        )}

        {/* Даты */}
        <div className="flex items-center gap-3">
          <label className="w-32 text-sm font-medium shrink-0" style={labelStyles}>
            Создана
          </label>
          <input
            type="text"
            value={data?.created || ''}
            disabled
            className="flex-1 px-3 py-2 text-sm rounded border disabled:opacity-50"
            style={inputStyles}
          />
          <label className="w-32 text-sm font-medium shrink-0" style={labelStyles}>
            Выполнена
          </label>
          <input
            type="text"
            value={data?.executed || ''}
            disabled
            className="flex-1 px-3 py-2 text-sm rounded border disabled:opacity-50"
            style={inputStyles}
          />
        </div>

        {/* Console Button */}
        {data?.response?.pipeline_id && (
          <div className="flex items-center gap-3">
            <label className="w-32 text-sm font-medium shrink-0" style={labelStyles}>
              Console
            </label>
            <button
              onClick={() => setShowConsole(true)}
              className="px-4 py-2 rounded flex items-center gap-2"
              style={{
                backgroundColor: 'var(--accent-success)',
                color: 'white',
              }}
            >
              <Terminal className="w-4 h-4" />
              Показать логи
            </button>
          </div>
        )}

        {/* Response */}
        {data?.response && (
          <div className="flex items-start gap-3">
            <label className="w-32 text-sm font-medium shrink-0 pt-2" style={labelStyles}>
              Response
            </label>
            <div className="flex-1">
              <JsonEditor
                data={data.response}
                onChange={() => {}}
                readonly={true}
              />
            </div>
          </div>
        )}

        {/* Event */}
        {data?.event && (
          <div className="flex items-start gap-3">
            <label className="w-32 text-sm font-medium shrink-0 pt-2" style={labelStyles}>
              Event
            </label>
            <div className="flex-1">
              <JsonEditor
                data={data.event}
                onChange={() => {}}
                readonly={true}
              />
            </div>
          </div>
        )}

        {/* Settings */}
        {data?.settings && (
          <div className="flex items-start gap-3">
            <label className="w-32 text-sm font-medium shrink-0 pt-2" style={labelStyles}>
              Settings
            </label>
            <div className="flex-1">
              <JsonEditor
                data={data.settings}
                onChange={() => {}}
                readonly={true}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
