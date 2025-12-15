import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { Save, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import JsonEditor from '../components/JsonEditor';
import UserSelect from '../components/UserSelect';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  data: Record<string, any> | null;
  onSave: (data: Record<string, any>) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}

export default function ProfileModal({
  open,
  onClose,
  data,
  onSave,
  onDelete,
}: ProfileModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({ ...data });
    } else {
      setFormData({});
    }
  }, [data, open]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
      toast.success('Профиль сохранён');
    } catch (error) {
      toast.error('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    
    setDeleting(true);
    setConfirmDelete(false);
    try {
      await onDelete();
      onClose();
      toast.success('Профиль удалён');
    } catch (error) {
      toast.error('Ошибка удаления');
    } finally {
      setDeleting(false);
    }
  };

  const inputStyles = {
    backgroundColor: 'var(--theme-input-bg)',
    borderColor: 'var(--theme-input-border)',
    color: 'var(--theme-input-text)',
  };

  const labelStyles = {
    color: 'var(--theme-content-text-muted)',
  };

  const renderFooter = () => (
    <div className="flex justify-between w-full">
      <div>
        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 rounded flex items-center gap-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? 'Удаление...' : 'Удалить'}
          </button>
        )}
      </div>
      <div className="flex gap-2">
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
          Отмена
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50 btn-success"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--accent-text)',
          }}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Профиль #${data?.id || ''}`}
      footer={renderFooter()}
      size="xl"
    >
      <div className="space-y-4">
        {}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <label className="w-28 text-sm font-medium shrink-0" style={labelStyles}>
              ID
            </label>
            <input
              type="text"
              value={formData.id || ''}
              disabled
              className="flex-1 px-3 py-2 text-sm rounded border opacity-60"
              style={inputStyles}
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="w-28 text-sm font-medium shrink-0" style={labelStyles}>
              Пользователь
            </label>
            <div className="flex-1">
                <UserSelect value={formData.user_id} readonly />
            </div>
          </div>
        </div>

        {}
        <div className="pt-2">
          <label className="text-sm font-medium" style={labelStyles}>
            Данные
          </label>
          <div className="mt-2">
            <JsonEditor
              data={formData.data ?? {}}
              onChange={(newData) => handleChange('data', newData)}
              showInput={true}
            />
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Удаление профиля"
        message={`Вы уверены, что хотите удалить профиль #${formData.id}?`}
        confirmText="Удалить"
        variant="danger"
        loading={deleting}
      />
    </Modal>
  );
}
