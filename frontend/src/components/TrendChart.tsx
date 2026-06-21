import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '../hooks/useTheme';
import type { TrendPoint } from '../types';
import { DISPLAY_NAMES } from '../types';

type TrendChartProps = {
  canonicalName: string;
  data: TrendPoint[];
};

function getChartColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    grid: styles.getPropertyValue('--chart-grid').trim(),
    axis: styles.getPropertyValue('--chart-axis').trim(),
    primary: styles.getPropertyValue('--primary').trim(),
    tooltipBg: styles.getPropertyValue('--chart-tooltip-bg').trim(),
    tooltipBorder: styles.getPropertyValue('--chart-tooltip-border').trim(),
    tooltipText: styles.getPropertyValue('--chart-tooltip-text').trim(),
  };
}

export default function TrendChart({ canonicalName, data }: TrendChartProps) {
  const { theme } = useTheme();
  const colors = getChartColors();

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
      <ResponsiveContainer key={theme} width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: colors.axis }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: colors.axis }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            formatter={(value: number) => [`${value}${unit ? ` ${unit}` : ''}`, title]}
            labelFormatter={(label) => String(label)}
            contentStyle={{
              background: colors.tooltipBg,
              border: `1px solid ${colors.tooltipBorder}`,
              borderRadius: 8,
              color: colors.tooltipText,
              fontSize: 13,
            }}
            labelStyle={{ color: colors.tooltipText }}
            itemStyle={{ color: colors.primary }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={colors.primary}
            strokeWidth={2}
            dot={{ r: 3, fill: colors.primary }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
