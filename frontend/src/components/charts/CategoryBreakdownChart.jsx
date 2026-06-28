import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatCurrency } from '../../utils/format.js';

const GRADIENTS = [
    { id: 'cat-violet', from: '#A78BFA', to: '#7C3AED', solid: '#7C3AED' },
    { id: 'cat-orange', from: '#FB923C', to: '#EA580C', solid: '#EA580C' },
    { id: 'cat-blue', from: '#60A5FA', to: '#2563EB', solid: '#2563EB' },
    { id: 'cat-emerald', from: '#34D399', to: '#059669', solid: '#059669' },
    { id: 'cat-rose', from: '#FB7185', to: '#E11D48', solid: '#E11D48' },
    { id: 'cat-amber', from: '#FBBF24', to: '#D97706', solid: '#D97706' },
];

const CategoryBreakdownChart = ({ data, currency }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-sm text-slate-400">
                No expenses yet
            </div>
        );
    }

    const top = data.slice(0, 5);
    const formatted = top.map((d, i) => {
        const g = GRADIENTS[i % GRADIENTS.length];
        return {
            name: d.category_name,
            value: parseFloat(d.total),
            gradientId: g.id,
            solid: g.solid,
        };
    });

    return (
        <div>
            <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <defs>
                            {GRADIENTS.map((g) => (
                                <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={g.from} />
                                    <stop offset="100%" stopColor={g.to} />
                                </linearGradient>
                            ))}
                        </defs>
                        <Pie
                            data={formatted}
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {formatted.map((entry) => (
                                <Cell key={entry.name} fill={`url(#${entry.gradientId})`} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                borderRadius: 12,
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(107, 114, 128, 0.15)',
                                fontSize: 12,
                            }}
                            formatter={(v) => formatCurrency(v, currency)}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-3 space-y-2">
                {formatted.map((c) => (
                    <div key={c.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.solid }} />
                            <span className="text-xs text-slate-700 truncate">{c.name}</span>
                        </div>
                        <span className="text-xs font-medium text-slate-900 shrink-0 ml-2">
                            {formatCurrency(c.value, currency)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryBreakdownChart;
