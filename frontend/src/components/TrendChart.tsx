import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TrendPoint } from '../types';
import { DISPLAY_NAMES } from '../types';

type TrendChartProps = {
  canonicalName: string;
  data: TrendPoint[];
};

export default function TrendChart({ canonicalName, data }: TrendChartProps) {
  if (data.length < 2) return null;

  const title = DISPLAY_NAMES[canonicalName] || canonicalName;
  const unit = data[0]?.unit || '';

  const chartData = data.map((d) => ({
    date: d.report_date,
    value: d.value,
    unit: d.unit,
  }));

  return (
    <div className="card trend-chart">
      <h3>{title} trend</h3>
      <p className="text-muted chart-unit">{unit && `Unit: ${unit}`}</p>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8ecef" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
          <Tooltip
            formatter={(value: number) => [`${value} ${unit}`.trim(), title]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2d6a9f"
            strokeWidth={2}
            dot={{ r: 4, fill: '#2d6a9f' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
