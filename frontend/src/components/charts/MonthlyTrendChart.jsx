import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';
import { formatMonth, formatCurrency } from '../../utils/format.js';

const MonthlyTrendChart = ({ data, currency }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-sm text-slate-400">
                No data yet
            </div>
        );
    }

    const formatted = data.map((d) => ({
        month: formatMonth(d.month),
        income: parseFloat(d.income),
        expense: parseFloat(d.expense),
    }));

    return (
        <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formatted} barCategoryGap="35%" barGap={6}>
                    <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#A78BFA" />
                            <stop offset="100%" stopColor="#7C3AED" />
                        </linearGradient>
                        <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FB923C" />
                            <stop offset="100%" stopColor="#EA580C" />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis
                        dataKey="month"
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        width={48}
                    />
                    <Tooltip
                        cursor={false}
                        contentStyle={{
                            borderRadius: 12,
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(107, 114, 128, 0.15)',
                            fontSize: 12,
                        }}
                        formatter={(value) => formatCurrency(value, currency)}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                        iconType="circle"
                        payload={[
                            { value: 'income', type: 'circle', color: '#7C3AED' },
                            { value: 'expense', type: 'circle', color: '#EA580C' },
                        ]}
                    />
                    <Bar
                        dataKey="income"
                        fill="url(#incomeGradient)"
                        radius={[10, 10, 10, 10]}
                        background={{ fill: '#f1f5f9', radius: 10 }}
                    />
                    <Bar
                        dataKey="expense"
                        fill="url(#expenseGradient)"
                        radius={[10, 10, 10, 10]}
                        background={{ fill: '#f1f5f9', radius: 10 }}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default MonthlyTrendChart;
