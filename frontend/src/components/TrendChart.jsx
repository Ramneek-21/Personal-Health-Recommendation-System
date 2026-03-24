import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function TrendChart({ title, data, color, mode = "area" }) {
  const Chart = mode === "bar" ? BarChart : AreaChart;

  return (
    <div className="panel min-w-0 overflow-hidden p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-ink/60">Trend</p>
          <h3 className="font-display text-2xl text-ink">{title}</h3>
        </div>
      </div>
      <div className="h-60 sm:h-64 xl:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={data}>
            <CartesianGrid stroke="rgba(17, 33, 58, 0.08)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#5f6572", fontSize: 12 }} />
            <YAxis tick={{ fill: "#5f6572", fontSize: 12 }} />
            <Tooltip />
            {mode === "bar" ? (
              <Bar dataKey="value" fill={color} radius={[12, 12, 0, 0]} />
            ) : (
              <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.25} />
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
