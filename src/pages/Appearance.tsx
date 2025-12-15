import { useState } from 'react';
import { Palette, Save, RotateCcw, Sun, Moon, Monitor, Eye, EyeOff, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
import { useThemeStore, ThemeMode, ThemeColors, darkTheme, lightTheme } from '../store/themeStore';
import { useSettingsStore } from '../store/settingsStore';

interface ColorGroup {
  title: string;
  description: string;
  colors: {
    key: keyof ThemeColors;
    label: string;
    description?: string;
  }[];
}

const colorGroups: ColorGroup[] = [
  {
    title: 'Основные цвета',
    description: 'Акцентный цвет приложения',
    colors: [
      { key: 'primaryColor', label: 'Основной цвет', description: 'Используется для кнопок, ссылок и акцентов' },
      { key: 'primaryColorHover', label: 'Основной при наведении', description: 'Цвет при наведении на элементы' },
    ],
  },
  {
    title: 'Боковая панель',
    description: 'Цвета меню навигации',
    colors: [
      { key: 'sidebarBg', label: 'Фон панели' },
      { key: 'sidebarBorder', label: 'Границы' },
      { key: 'sidebarText', label: 'Текст' },
      { key: 'sidebarTextHover', label: 'Текст при наведении' },
      { key: 'sidebarTextActive', label: 'Активный текст' },
      { key: 'sidebarItemHoverBg', label: 'Фон при наведении' },
      { key: 'sidebarItemActiveBg', label: 'Фон активного пункта' },
    ],
  },
  {
    title: 'Шапка',
    description: 'Верхняя панель',
    colors: [
      { key: 'headerBg', label: 'Фон шапки' },
      { key: 'headerBorder', label: 'Граница' },
      { key: 'headerText', label: 'Текст' },
    ],
  },
  {
    title: 'Контент',
    description: 'Основная область страницы',
    colors: [
      { key: 'contentBg', label: 'Фон страницы' },
      { key: 'contentText', label: 'Основной текст' },
      { key: 'contentTextMuted', label: 'Приглушённый текст' },
    ],
  },
  {
    title: 'Карточки',
    description: 'Блоки с контентом',
    colors: [
      { key: 'cardBg', label: 'Фон карточки' },
      { key: 'cardBorder', label: 'Граница' },
      { key: 'cardHeaderBg', label: 'Фон заголовка' },
    ],
  },
  {
    title: 'Поля ввода',
    description: 'Input, select и другие элементы форм',
    colors: [
      { key: 'inputBg', label: 'Фон поля' },
      { key: 'inputBorder', label: 'Граница' },
      { key: 'inputText', label: 'Текст' },
      { key: 'inputPlaceholder', label: 'Placeholder' },
      { key: 'inputFocusBorder', label: 'Граница при фокусе' },
    ],
  },
  {
    title: 'Таблицы',
    description: 'DataTable и списки',
    colors: [
      { key: 'tableBg', label: 'Фон таблицы' },
      { key: 'tableHeaderBg', label: 'Фон заголовка' },
      { key: 'tableHeaderText', label: 'Текст заголовка' },
      { key: 'tableBorder', label: 'Границы' },
      { key: 'tableRowHoverBg', label: 'Фон строки при наведении' },
      { key: 'tableText', label: 'Текст ячеек' },
    ],
  },
  {
    title: 'Кнопки',
    description: 'Вторичные кнопки',
    colors: [
      { key: 'buttonSecondaryBg', label: 'Фон' },
      { key: 'buttonSecondaryText', label: 'Текст' },
      { key: 'buttonSecondaryBorder', label: 'Граница' },
      { key: 'buttonSecondaryHoverBg', label: 'Фон при наведении' },
    ],
  },
];

function ColorPicker({ 
  colorKey, 
  label, 
  description,
  value, 
  onChange,
  defaultValue,
}: { 
  colorKey: keyof ThemeColors;
  label: string;
  description?: string;
  value: string;
  onChange: (key: keyof ThemeColors, value: string) => void;
  defaultValue: string;
}) {
  const isModified = value !== defaultValue;
  
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value.startsWith('rgba') ? '#888888' : value}
          onChange={(e) => onChange(colorKey, e.target.value)}
          className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
          style={{ 
            borderColor: 'var(--theme-input-border)',
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--theme-content-text)' }}>
            {label}
          </span>
          {isModified && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ 
              backgroundColor: 'var(--theme-primary-color)', 
              color: 'white',
              opacity: 0.8,
            }}>
              изменён
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs" style={{ color: 'var(--theme-content-text-muted)' }}>
            {description}
          </p>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(colorKey, e.target.value)}
        className="input w-32 text-xs font-mono"
      />
    </div>
  );
}

function Appearance() {
  const { mode, setMode, colors, customColors, setCustomColor, resetCustomColors, resolvedTheme } = useThemeStore();
  const { showHelp, setShowHelp } = useSettingsStore();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Основные цвета']);
  const [confirmReset, setConfirmReset] = useState(false);
  
  const baseColors = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  
  const themes: { value: ThemeMode; label: string; icon: any; description: string }[] = [
    { value: 'system', label: 'Системная', icon: Monitor, description: 'Использовать настройки системы' },
    { value: 'light', label: 'Светлая', icon: Sun, description: 'Яркая тема для дневного использования' },
    { value: 'dark', label: 'Тёмная', icon: Moon, description: 'Тёмная тема для комфортной работы' },
  ];

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const handleReset = () => {
    setConfirmReset(true);
  };

  const handleConfirmReset = () => {
    resetCustomColors();
    setConfirmReset(false);
    toast.success('Цвета сброшены');
  };

  const hasCustomColors = Object.keys(customColors).length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3" style={{ color: 'var(--theme-content-text)' }}>
            <Palette className="w-7 h-7" style={{ color: 'var(--theme-primary-color)' }} />
            Внешний вид
          </h1>
          <p style={{ color: 'var(--theme-content-text-muted)' }} className="mt-1">
            Настройка темы и цветов интерфейса
          </p>
        </div>
        {hasCustomColors && (
          <button onClick={handleReset} className="btn-secondary">
            <RotateCcw className="w-4 h-4" />
            Сбросить цвета
          </button>
        )}
      </div>

      {}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--theme-content-text)' }}>
            Тема оформления
          </h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((theme) => {
              const Icon = theme.icon;
              const isActive = mode === theme.value;
              
              return (
                <button
                  key={theme.value}
                  onClick={() => setMode(theme.value)}
                  className="p-4 rounded-lg border-2 transition-all text-left"
                  style={{
                    backgroundColor: isActive ? 'var(--theme-sidebar-item-active-bg)' : 'transparent',
                    borderColor: isActive ? 'var(--theme-primary-color)' : 'var(--theme-card-border)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon 
                      className="w-5 h-5" 
                      style={{ color: isActive ? 'var(--theme-primary-color)' : 'var(--theme-content-text-muted)' }}
                    />
                    <span 
                      className="font-medium"
                      style={{ color: isActive ? 'var(--theme-primary-color)' : 'var(--theme-content-text)' }}
                    >
                      {theme.label}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--theme-content-text-muted)' }}>
                    {theme.description}
                  </p>
                </button>
              );
            })}
          </div>
          
          {mode === 'system' && (
            <p className="mt-4 text-sm" style={{ color: 'var(--theme-content-text-muted)' }}>
              Текущая системная тема: <strong>{resolvedTheme === 'dark' ? 'Тёмная' : 'Светлая'}</strong>
            </p>
          )}
        </div>
      </div>

      {}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--theme-content-text)' }}>
            Настройки интерфейса
          </h2>
        </div>
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle 
                className="w-5 h-5" 
                style={{ color: 'var(--theme-primary-color)' }}
              />
              <div>
                <span 
                  className="font-medium"
                  style={{ color: 'var(--theme-content-text)' }}
                >
                  Показывать справку
                </span>
                <p className="text-sm" style={{ color: 'var(--theme-content-text-muted)' }}>
                  Кнопки справки рядом с заголовками страниц
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{
                backgroundColor: showHelp ? 'var(--theme-primary-color)' : 'var(--theme-button-secondary-bg)',
              }}
            >
              <span
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow"
                style={{
                  left: showHelp ? '28px' : '4px',
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--theme-content-text)' }}>
            Настройка цветов
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--theme-content-text-muted)' }}>
            Изменённые цвета применяются к обеим темам
          </p>
        </div>
        <div className="card-body p-0">
          {colorGroups.map((group) => {
            const isExpanded = expandedGroups.includes(group.title);
            const modifiedCount = group.colors.filter(c => customColors[c.key]).length;
            
            return (
              <div key={group.title} style={{ borderBottom: '1px solid var(--theme-card-border)' }}>
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:opacity-80 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1">
                      {group.colors.slice(0, 4).map((c, i) => (
                        <div
                          key={c.key}
                          className="w-5 h-5 rounded-full border-2"
                          style={{ 
                            backgroundColor: colors[c.key],
                            borderColor: 'var(--theme-card-bg)',
                            zIndex: 4 - i,
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium" style={{ color: 'var(--theme-content-text)' }}>
                          {group.title}
                        </span>
                        {modifiedCount > 0 && (
                          <span 
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ 
                              backgroundColor: 'var(--theme-primary-color)',
                              color: 'white',
                            }}
                          >
                            {modifiedCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: 'var(--theme-content-text-muted)' }}>
                        {group.description}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <EyeOff className="w-5 h-5" style={{ color: 'var(--theme-content-text-muted)' }} />
                  ) : (
                    <Eye className="w-5 h-5" style={{ color: 'var(--theme-content-text-muted)' }} />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="px-6 pb-4 space-y-1">
                    {group.colors.map((color) => (
                      <ColorPicker
                        key={color.key}
                        colorKey={color.key}
                        label={color.label}
                        description={color.description}
                        value={colors[color.key]}
                        onChange={setCustomColor}
                        defaultValue={baseColors[color.key]}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ConfirmModal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={handleConfirmReset}
        title="Сброс цветов"
        message="Сбросить все пользовательские цвета к значениям по умолчанию?"
        confirmText="Сбросить"
        variant="warning"
      />
    </div>
  );
}

export default Appearance;
