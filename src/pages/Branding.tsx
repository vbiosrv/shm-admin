import { useState, useEffect } from 'react';
import { Palette, Save, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import { useBrandingStore } from '../store/brandingStore';

function Branding() {
  const { branding, loading, updateBranding, resetBranding } = useBrandingStore();
  const [formData, setFormData] = useState(branding);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setFormData(branding);
  }, [branding]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateBranding(formData);
      toast.success('Настройки брендинга сохранены');
    } catch {
      toast.error('Ошибка сохранения');
    }
  };

  const handleReset = () => {
    setConfirmReset(true);
  };

  const handleConfirmReset = async () => {
    setConfirmReset(false);
    try {
      await resetBranding();
      toast.success('Настройки сброшены');
    } catch {
      toast.error('Ошибка сброса');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 
            className="text-2xl font-bold flex items-center gap-3"
            style={{ color: 'var(--theme-content-text)' }}
          >
            <Palette className="w-7 h-7" style={{ color: 'var(--theme-primary-color)' }} />
            Брендинг
          </h1>
          <p style={{ color: 'var(--theme-content-text-muted)' }} className="mt-1">
            Настройка внешнего вида панели
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReset} className="btn-secondary" disabled={loading}>
            <RotateCcw className="w-4 h-4" />
            Сбросить
          </button>
          <button onClick={handleSave} className="btn-primary" disabled={loading}>
            <Save className="w-4 h-4" />
            Сохранить
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--theme-content-text)' }}>
              Основные настройки
            </h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--theme-content-text)' }}
              >
                Название приложения
              </label>
              <input
                type="text"
                name="appName"
                value={formData.appName}
                onChange={handleChange}
                className="input"
                placeholder="SHM Admin"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--theme-content-text-muted)' }}>
                Отображается в боковой панели
              </p>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--theme-content-text)' }}
              >
                Заголовок страницы
              </label>
              <input
                type="text"
                name="appTitle"
                value={formData.appTitle}
                onChange={handleChange}
                className="input"
                placeholder="SHM Admin Panel"
              />
              <p className="text-xs mt-1" style={{ color: 'var(--theme-content-text-muted)' }}>
                Отображается в заголовке вкладки браузера
              </p>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--theme-content-text)' }}
              >
                Заголовок страницы входа
              </label>
              <input
                type="text"
                name="loginTitle"
                value={formData.loginTitle}
                onChange={handleChange}
                className="input"
                placeholder="SHM Admin"
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--theme-content-text)' }}
              >
                Подзаголовок страницы входа
              </label>
              <input
                type="text"
                name="loginSubtitle"
                value={formData.loginSubtitle}
                onChange={handleChange}
                className="input"
                placeholder="Войдите в систему управления"
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--theme-content-text)' }}
              >
                URL логотипа
              </label>
              <input
                type="text"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                className="input"
                placeholder="https:
              />
              <p className="text-xs mt-1" style={{ color: 'var(--theme-content-text-muted)' }}>
                Оставьте пустым для использования иконки по умолчанию
              </p>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--theme-content-text)' }}
              >
                Основной цвет
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="w-12 h-10 rounded cursor-pointer bg-transparent"
                  style={{ border: '1px solid var(--theme-input-border)' }}
                />
                <input
                  type="text"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleChange}
                  className="input flex-1"
                  placeholder="#22d3ee"
                />
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--theme-content-text)' }}>
              Предпросмотр
            </h2>
          </div>
          <div className="card-body">
            {}
            <div 
              className="rounded-lg p-6 mb-4"
              style={{ backgroundColor: 'var(--theme-content-bg)' }}
            >
              <div className="text-center">
                <div 
                  className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ backgroundColor: formData.primaryColor + '30' }}
                >
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-lg" 
                      style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.primaryColor}dd)` }}
                    />
                  )}
                </div>
                <h3 
                  className="text-lg font-bold"
                  style={{ color: 'var(--theme-content-text)' }}
                >
                  {formData.loginTitle}
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--theme-content-text-muted)' }}
                >
                  {formData.loginSubtitle}
                </p>
              </div>
            </div>

            {}
            <div 
              className="rounded-lg p-4"
              style={{ backgroundColor: 'var(--theme-sidebar-bg)' }}
            >
              <div 
                className="flex items-center gap-3 mb-4 pb-4"
                style={{ borderBottom: '1px solid var(--theme-sidebar-border)' }}
              >
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                ) : (
                  <div 
                    className="w-8 h-8 rounded-lg" 
                    style={{ background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.primaryColor}dd)` }}
                  />
                )}
                <span 
                  className="font-bold"
                  style={{ color: 'var(--theme-header-text)' }}
                >
                  {formData.appName}
                </span>
              </div>
              <div 
                className="text-sm py-2 px-3 rounded-lg"
                style={{ 
                  backgroundColor: formData.primaryColor + '20',
                  color: formData.primaryColor,
                  borderLeft: `2px solid ${formData.primaryColor}`
                }}
              >
                Активный пункт меню
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={handleConfirmReset}
        title="Сброс настроек"
        message="Сбросить настройки к значениям по умолчанию?"
        confirmText="Сбросить"
        variant="warning"
      />
    </div>
  );
}

export default Branding;
