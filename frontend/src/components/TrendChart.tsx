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
  }));

  return (
    <div className="card trend-chart">
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eceff3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            formatter={(value: number) => [`${value}${unit ? ` ${unit}` : ''}`, title]}
            labelFormatter={(label) => String(label)}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#176b4d"
            strokeWidth={2}
            dot={{ r: 3, fill: '#176b4d' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
