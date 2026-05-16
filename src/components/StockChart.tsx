import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { ChartPoint } from '../types/finnhub';

export interface SeriesData {
  symbol: string;
  color: string;
  points: ChartPoint[];
}

interface Props {
  data: ChartPoint[];
  compareSeries?: SeriesData[];
  mainSymbol?: string;
  positive: boolean;
}

function toPercentSeries(points: ChartPoint[]): { date: string; time: number; pct: number }[] {
  if (!points.length) return [];
  const base = points[0].price;
  return points.map((p) => ({
    date: p.date,
    time: p.time,
    pct: ((p.price - base) / base) * 100,
  }));
}

export default function StockChart({
  data,
  compareSeries,
  mainSymbol = 'Hauptwert',
  positive,
}: Props) {
  const mainColor = positive ? '#3fb950' : '#f85149';
  const isCompare = !!compareSeries && compareSeries.length > 0;

  if (!data.length) {
    return (
      <div className="loading">
        Keine historischen Daten verfügbar (Finnhub Free-Plan limitiert die Candle-API).
      </div>
    );
  }

  if (!isCompare) {
    return (
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={mainColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={mainColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#8b949e"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              minTickGap={40}
            />
            <YAxis
              stroke="#8b949e"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              tickFormatter={(v: number) => v.toFixed(0)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: 8,
                color: '#e6edf3',
              }}
              labelStyle={{ color: '#8b949e' }}
              formatter={(value: number) => [value.toFixed(2), 'Kurs']}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={mainColor}
              strokeWidth={2}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  const allSeries: SeriesData[] = [
    { symbol: mainSymbol, color: mainColor, points: data },
    ...compareSeries,
  ];

  const merged = mergeByDate(allSeries);

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={merged} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#8b949e"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            minTickGap={40}
          />
          <YAxis
            stroke="#8b949e"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            domain={['auto', 'auto']}
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              borderRadius: 8,
              color: '#e6edf3',
            }}
            labelStyle={{ color: '#8b949e' }}
            formatter={(value: number, name) => [`${value.toFixed(2)}%`, name as string]}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {allSeries.map((s) => (
            <Line
              key={s.symbol}
              type="monotone"
              dataKey={s.symbol}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function mergeByDate(series: SeriesData[]): Record<string, string | number>[] {
  const dateMap = new Map<number, string>();
  series.forEach((s) => {
    s.points.forEach((p) => dateMap.set(p.time, p.date));
  });
  const sortedTimes = [...dateMap.keys()].sort((a, b) => a - b);

  const pctLookups = series.map((s) => {
    const pcts = toPercentSeries(s.points);
    const map = new Map<number, number>();
    pcts.forEach((p) => map.set(p.time, p.pct));
    return { symbol: s.symbol, map };
  });

  return sortedTimes.map((t) => {
    const row: Record<string, string | number> = {
      time: t,
      date: dateMap.get(t) ?? '',
    };
    pctLookups.forEach(({ symbol, map }) => {
      const v = map.get(t);
      if (v !== undefined) row[symbol] = v;
    });
    return row;
  });
}
