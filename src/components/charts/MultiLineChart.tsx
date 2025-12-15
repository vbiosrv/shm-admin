import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface MultiLineChartProps {
  data: any[];
  lines: {
    dataKey: string;
    name: string;
    color: string;
    type?: 'line' | 'bar' | 'area';
  }[];
  xAxisKey?: string;
  title?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  valueFormatter?: (value: number) => string;
}

export function MultiLineChart({
  data,
  lines,
  xAxisKey = 'label',
  title,
  height = 300,
  showGrid = true,
  showLegend = true,
  valueFormatter = (v) => v.toLocaleString(),
}: MultiLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height, color: 'var(--theme-content-text-muted)' }}>
        Нет данных
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height, minHeight: height }}>
      {title && (
        <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--theme-content-text-muted)' }}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--theme-table-border)" 
              strokeOpacity={0.5}
            />
          )}
          <XAxis
            dataKey={xAxisKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--theme-content-text-muted)', fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--theme-content-text-muted)', fontSize: 11 }}
            tickFormatter={valueFormatter}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--theme-card-bg)',
              border: '1px solid var(--theme-card-border)',
              borderRadius: '8px',
              color: 'var(--theme-content-text)',
            }}
            labelStyle={{ color: 'var(--theme-content-text-muted)' }}
            formatter={(value: number, name: string) => [valueFormatter(value), name]}
            cursor={{ stroke: 'rgba(0, 0, 0, 0.3)', strokeWidth: 1, fill: 'rgba(0, 0, 0, 0.15)' }}
          />
          {showLegend && (
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ color: 'var(--theme-content-text)', fontSize: 12 }}>
                  {value}
                </span>
              )}
            />
          )}
          {lines.map((line) => {
            switch (line.type) {
              case 'bar':
                return (
                  <Bar
                    key={line.dataKey}
                    dataKey={line.dataKey}
                    name={line.name}
                    fill={line.color}
                    barSize={20}
                    radius={[4, 4, 0, 0]}
                  />
                );
              case 'area':
                return (
                  <Area
                    key={line.dataKey}
                    type="monotone"
                    dataKey={line.dataKey}
                    name={line.name}
                    stroke={line.color}
                    fill={line.color}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                );
              default:
                return (
                  <Line
                    key={line.dataKey}
                    type="monotone"
                    dataKey={line.dataKey}
                    name={line.name}
                    stroke={line.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: line.color }}
                  />
                );
            }
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MultiLineChart;
