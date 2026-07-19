import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { fmtEok } from "../../lib/calc";

export type Slice = { id: string; name: string; value: number; color: string };

/** 자산 비중 도넛 + 범례 리스트 (종목·현금 공용) */
export default function DonutChart({
  slices, centerLabel = "평가금액",
}: {
  slices: Slice[]; centerLabel?: string;
}) {
  const data = slices.filter((s) => s.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0);
  if (data.length === 0 || total === 0) return null;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-40 w-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data} dataKey="value" nameKey="name"
              innerRadius="68%" outerRadius="100%"
              paddingAngle={2} strokeWidth={0}
            >
              {data.map((d) => <Cell key={d.id} fill={d.color} />)}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0];
                return (
                  <div className="card px-3 py-1.5 text-xs shadow-lg">
                    <b>{p.name}</b> · {fmtEok(Number(p.value))} ({Math.round((Number(p.value) / total) * 100)}%)
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-[var(--ink3)]">{centerLabel}</span>
          <span className="text-sm font-bold">{fmtEok(total)}</span>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        {data
          .slice()
          .sort((a, b) => b.value - a.value)
          .map((d) => (
            <div key={d.id} className="flex items-center gap-1.5 text-xs">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
              <span className="truncate text-[var(--ink2)]">{d.name}</span>
              <span className="ml-auto shrink-0 font-semibold tabular-nums">
                {Math.round((d.value / total) * 100)}%
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
