import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PieChartProps {
  data: { name: string; value: number; color?: string }[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  valueFormatter?: (value: number) => string;
  showLabels?: boolean;
}

const COLORS = [
  '#22d3ee', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

export function PieChart({
  data,
  title,
  height = 300,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 100,
  valueFormatter = (v) => v.toLocaleString(),
  showLabels = false,
}: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height, color: 'var(--theme-content-text-muted)' }}>
        Нет данных
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="var(--theme-content-text-muted)"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={11}
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <div className="w-full" style={{ height, minHeight: height }}>
      {title && (
        <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--theme-content-text-muted)' }}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%" minHeight={height - 30}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            label={showLabels ? renderCustomizedLabel : false}
            labelLine={showLabels}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || COLORS[index % COLORS.length]}
                stroke="var(--theme-card-bg)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--theme-card-bg)',
              border: '1px solid var(--theme-card-border)',
              borderRadius: '8px',
              color: 'var(--theme-content-text)',
            }}
            formatter={(value: number, name: string) => [
              `${valueFormatter(value)} (${((value / total) * 100).toFixed(1)}%)`,
              name,
            ]}
          />
          {showLegend && (
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ color: 'var(--theme-content-text)', fontSize: 12 }}>
                  {value}
                </span>
              )}
            />
          )}
          {}
          {innerRadius > 0 && (
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fill: 'var(--theme-content-text)', fontSize: 14, fontWeight: 600 }}
            >
              {valueFormatter(total)}
            </text>
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PieChart;
