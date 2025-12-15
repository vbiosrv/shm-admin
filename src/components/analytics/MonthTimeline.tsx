import { useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isSameDay,
} from 'date-fns';
import { ru } from 'date-fns/locale';

interface DayData {
  date: Date;
  value: number;
  label?: string;
}

interface MonthTimelineProps {
  data: DayData[];
  title?: string;
  valueFormatter?: (value: number) => string;
  colorScale?: 'green' | 'blue' | 'purple' | 'amber';
}

const colorScales = {
  green: ['#064e3b', '#047857', '#10b981', '#34d399', '#6ee7b7'],
  blue: ['#1e3a5f', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'],
  purple: ['#4c1d95', '#6d28d9', '#8b5cf6', '#a78bfa', '#c4b5fd'],
  amber: ['#78350f', '#b45309', '#f59e0b', '#fbbf24', '#fcd34d'],
};

export function MonthTimeline({
  data,
  title,
  valueFormatter = (v) => v.toLocaleString(),
  colorScale = 'green',
}: MonthTimelineProps) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthName = format(now, 'LLLL yyyy', { locale: ru });

  const daysInMonth = useMemo(() => {
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [monthStart, monthEnd]);

  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(d => {
      const key = format(d.date, 'yyyy-MM-dd');
      map.set(key, d.value);
    });
    return map;
  }, [data]);

  const maxValue = useMemo(() => {
    return Math.max(...data.map(d => d.value), 1);
  }, [data]);

  const getColor = (value: number) => {
    if (value === 0) return 'var(--theme-table-bg)';
    const scale = colorScales[colorScale];
    const intensity = Math.min(Math.floor((value / maxValue) * (scale.length - 1)), scale.length - 1);
    return scale[intensity];
  };

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const startDayOfWeek = (monthStart.getDay() + 6) % 7; 

  const weeks = useMemo(() => {
    const result: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];
    
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push(null);
    }
    
    daysInMonth.forEach(day => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      result.push(currentWeek);
    }
    
    return result;
  }, [daysInMonth, startDayOfWeek]);

  const totalValue = data.reduce((sum, d) => sum + d.value, 0);
  const activeDays = data.filter(d => d.value > 0).length;

  return (
    <div className="w-full">
      {title && (
        <h3 
          className="text-sm font-medium mb-3 capitalize"
          style={{ color: 'var(--theme-content-text)' }}
        >
          {title} — {monthName}
        </h3>
      )}
      
      {}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map(day => (
          <div 
            key={day}
            className="text-center text-xs py-1"
            style={{ color: 'var(--theme-content-text-muted)' }}
          >
            {day}
          </div>
        ))}
      </div>

      {}
      <div className="flex flex-col gap-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => {
              if (!day) {
                return (
                  <div 
                    key={`empty-${weekIndex}-${dayIndex}`} 
                    className="aspect-square rounded"
                  />
                );
              }

              const dateKey = format(day, 'yyyy-MM-dd');
              const value = dataMap.get(dateKey) || 0;
              const isCurrentDay = isToday(day);
              const dayNum = format(day, 'd');

              return (
                <div
                  key={dateKey}
                  className={`
                    aspect-square rounded flex items-center justify-center text-xs
                    cursor-default transition-all hover:ring-2 hover:ring-offset-1 hover:ring-cyan-400
                    ${isCurrentDay ? 'ring-2 ring-offset-1 ring-cyan-400' : ''}
                  `}
                  style={{
                    backgroundColor: getColor(value),
                    color: value > maxValue * 0.3 ? '#fff' : 'var(--theme-content-text-muted)',
                  }}
                  title={`${format(day, 'dd.MM.yyyy')}: ${valueFormatter(value)}`}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {}
      <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: 'var(--theme-card-border)' }}>
        {}
        <div className="flex items-center gap-1">
          <span className="text-xs mr-1" style={{ color: 'var(--theme-content-text-muted)' }}>Меньше</span>
          {[0, ...colorScales[colorScale]].map((color, idx) => (
            <div
              key={idx}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: idx === 0 ? 'var(--theme-table-bg)' : String(color) }}
            />
          ))}
          <span className="text-xs ml-1" style={{ color: 'var(--theme-content-text-muted)' }}>Больше</span>
        </div>

        {}
        <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--theme-content-text-muted)' }}>
          <span>Всего: <strong style={{ color: 'var(--theme-content-text)' }}>{valueFormatter(totalValue)}</strong></span>
          <span>Активных дней: <strong style={{ color: 'var(--theme-content-text)' }}>{activeDays}</strong></span>
        </div>
      </div>
    </div>
  );
}

export default MonthTimeline;
