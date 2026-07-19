import {
  CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useDark } from "../../hooks/useDark";
import { fmtNum } from "../../lib/calc";

/** 매수할 때마다 계단처럼 쌓이는 수량 차트 */
export default function StepChart({
  data, color,
}: {
  data: Array<{ date: string; qty: number }>;
  color: string;
}) {
  const dark = useDark();
  if (data.length === 0) return null;
  const tickGap = Math.max(1, Math.ceil(data.length / 5));
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 12, right: 12, left: 4, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={dark ? "#2c2c2a" : "#e1e0d9"} strokeWidth={1} />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`}
          interval={tickGap - 1}
          tick={{ fill: "#898781", fontSize: 11 }}
          axisLine={{ stroke: dark ? "#383835" : "#c3c2b7" }}
          tickLine={false}
        />
        <YAxis hide domain={[0, "auto"]} />
        <Tooltip
          cursor={{ stroke: dark ? "#383835" : "#c3c2b7", strokeWidth: 1 }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="card px-3 py-1.5 text-xs shadow-lg">
                {String(label)} · <b>{fmtNum(Number(payload[0].value))}주</b>
              </div>
            );
          }}
        />
        <Line
          type="stepAfter" dataKey="qty"
          stroke={color} strokeWidth={2}
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
