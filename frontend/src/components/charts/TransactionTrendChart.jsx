import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/format.js';

const TransactionTrendChart = ({ data, currency, interval = 3 }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-sm text-slate-400">
                No data yet
            </div>
        );
    }

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#A78BFA" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="#A78BFA" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FB923C" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="#FB923C" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        interval={interval}
                    />
                    <YAxis
                        tick={{ fill: '#6b7280', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        width={48}
                    />
                    <Tooltip
                        cursor={{ stroke: '#cbd5e1', strokeDasharray: '3 3' }}
                        contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(107, 114, 128, 0.15)',
                            fontSize: 12,
                        }}
                        formatter={(v) => formatCurrency(v, currency)}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                        iconType="circle"
                        payload={[
                            { value: 'income', type: 'circle', color: '#7C3AED' },
                            { value: 'expense', type: 'circle', color: '#EA580C' },
                        ]}
                    />
                    <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#7C3AED"
                        strokeWidth={2.5}
                        fill="url(#incomeArea)"
                        activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="expense"
                        stroke="#EA580C"
                        strokeWidth={2.5}
                        fill="url(#expenseArea)"
                        activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TransactionTrendChart;
