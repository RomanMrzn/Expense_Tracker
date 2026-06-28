import { useState } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Check,
    AlertCircle,
    Lightbulb,
    TrendingUp,
    AlertTriangle,
    Sparkles,
    ArrowRight,
} from 'lucide-react';
import { timeAgo } from '../utils/format.js';

const labelMap = {
    monthly_summary: 'Monthly Summary',
    budget_alert: 'Budget Alert',
    savings_tips: 'Savings Tips',
};

const typeStyles = {
    monthly_summary: { gradient: 'from-violet-400 to-violet-600', Icon: TrendingUp },
    budget_alert: { gradient: 'from-rose-400 to-rose-600', Icon: AlertTriangle },
    savings_tips: { gradient: 'from-blue-400 to-blue-600', Icon: Lightbulb },
};

const HealthScoreGauge = ({ score = 0 }) => {
    const safe = Math.max(0, Math.min(100, Number(score) || 0));
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (safe / 100) * circumference;
    const color = safe >= 70 ? '#10B981' : safe >= 40 ? '#F59E0B' : '#F43F5E';
    const label = safe >= 70 ? 'Healthy' : safe >= 40 ? 'Watch' : 'Risky';

    return (
        <div className="relative h-36 w-36 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r={radius} stroke="#E2E8F0" strokeWidth="10" fill="none" />
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke={color}
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold tracking-tight text-slate-900">{safe}</div>
                <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color }}>
                    {label}
                </div>
            </div>
        </div>
    );
};

const Stat = ({ label, value, accent = 'slate' }) => {
    const accents = {
        emerald: 'text-emerald-600',
        rose: 'text-rose-600',
        violet: 'text-violet-600',
        amber: 'text-amber-600',
        slate: 'text-slate-900',
    };
    return (
        <div className="bg-slate-50 rounded-2xl p-4">
            <div className="text-xs text-slate-500 mb-1 font-medium">{label}</div>
            <div className={`text-xl font-bold tracking-tight ${accents[accent]}`}>{value}</div>
        </div>
    );
};

const MonthlySummaryView = ({ c }) => (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-center bg-linear-to-br from-violet-50 via-white to-blue-50 rounded-2xl p-6 border border-slate-100">
            <HealthScoreGauge score={c.healthScore} />
            <div className="flex-1 min-w-0">
                <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-2">
                    AI Summary
                </div>
                <p className="text-slate-700 leading-relaxed">{c.summary}</p>
                {c.topSpendingCategory && (
                    <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full">
                        <span className="text-slate-400">Top category</span>
                        <span className="font-semibold text-slate-900">{c.topSpendingCategory}</span>
                    </div>
                )}
            </div>
        </div>

        {typeof c.estimatedMonthlySavings === 'number' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Stat label="Health Score" value={`${c.healthScore ?? 0}/100`} accent="violet" />
                <Stat
                    label="Estimated Savings"
                    value={`$${Number(c.estimatedMonthlySavings).toLocaleString()}/mo`}
                    accent="emerald"
                />
                <Stat
                    label="Recommendations"
                    value={c.recommendations?.length || 0}
                    accent="slate"
                />
            </div>
        )}

        {c.highlights?.length > 0 && (
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Check size={14} className="text-emerald-600" />
                    <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        What's going well
                    </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {c.highlights.map((h, i) => (
                        <div
                            key={i}
                            className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3"
                        >
                            <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                <Check size={12} className="text-white" strokeWidth={3} />
                            </div>
                            <p className="text-sm text-emerald-900 leading-relaxed">{h}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {c.concerns?.length > 0 && (
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={14} className="text-rose-600" />
                    <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Areas to watch
                    </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {c.concerns.map((concern, i) => (
                        <div
                            key={i}
                            className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3"
                        >
                            <div className="h-6 w-6 rounded-full bg-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                                <AlertCircle size={12} className="text-white" strokeWidth={3} />
                            </div>
                            <p className="text-sm text-rose-900 leading-relaxed">{concern}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {c.recommendations?.length > 0 && (
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-violet-600" />
                    <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Recommendations
                    </h4>
                </div>
                <div className="space-y-2">
                    {c.recommendations.map((r, i) => (
                        <div
                            key={i}
                            className="p-4 bg-white border border-slate-200 hover:border-violet-200 rounded-2xl transition flex items-start gap-3"
                        >
                            <div className="h-7 w-7 rounded-full bg-linear-to-br from-violet-400 to-violet-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                                {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-sm text-slate-900 mb-0.5">{r.title}</div>
                                <p className="text-sm text-slate-600 leading-relaxed">{r.detail}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

const SavingsTipsView = ({ c }) => {
    const totalSavings = (c.tips || []).reduce(
        (sum, t) => sum + (Number(t.estimatedSavings) || 0),
        0
    );

    return (
        <div className="space-y-5">
            {c.overallTip && (
                <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-violet-500 to-violet-700 p-5 text-white">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                            <Lightbulb size={18} className="text-white" />
                        </div>
                        <div>
                            <div className="text-[11px] uppercase tracking-wider font-semibold text-white/70 mb-1">
                                Top tip
                            </div>
                            <p className="text-sm leading-relaxed font-medium">{c.overallTip}</p>
                        </div>
                    </div>
                </div>
            )}

            {totalSavings > 0 && (
                <div className="grid grid-cols-2 gap-3">
                    <Stat label="Total potential" value={`$${totalSavings.toFixed(0)}/mo`} accent="emerald" />
                    <Stat label="Tips" value={c.tips?.length || 0} accent="violet" />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {c.tips?.map((t, i) => {
                    const savings = Number(t.estimatedSavings) || 0;
                    return (
                        <div
                            key={i}
                            className="group relative p-5 rounded-2xl bg-white border border-slate-100 hover:border-violet-200 hover:shadow-sm transition"
                        >
                            <div className="flex items-center justify-between mb-3">
                                {t.category && (
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full">
                                        {t.category}
                                    </span>
                                )}
                                {savings > 0 && (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                                        <TrendingUp size={11} />~${savings}/mo
                                    </span>
                                )}
                            </div>
                            <h5 className="text-base font-bold text-slate-900 mb-1.5">{t.title}</h5>
                            <p className="text-sm text-slate-600 leading-relaxed">{t.detail}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const BudgetAlertView = ({ c }) => {
    const severity = c.severity || 'info';
    const sev = {
        info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-500', text: 'text-blue-900', accent: 'text-blue-700' },
        warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-500', text: 'text-amber-900', accent: 'text-amber-700' },
        critical: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'bg-rose-500', text: 'text-rose-900', accent: 'text-rose-700' },
    }[severity];

    return (
        <div className="space-y-5">
            <div className={`p-5 rounded-2xl ${sev.bg} ${sev.border} border`}>
                <div className="flex items-start gap-3">
                    <div className={`h-10 w-10 rounded-xl ${sev.icon} flex items-center justify-center shrink-0`}>
                        <AlertTriangle size={18} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] uppercase tracking-wider font-bold ${sev.accent} bg-white/60 px-2 py-0.5 rounded-full`}>
                                {severity}
                            </span>
                        </div>
                        {c.title && <h4 className={`font-bold ${sev.text} text-base mb-1`}>{c.title}</h4>}
                        <p className={`text-sm ${sev.text} opacity-90 leading-relaxed`}>{c.message}</p>
                    </div>
                </div>
            </div>

            {c.suggestions?.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <ArrowRight size={14} className="text-violet-600" />
                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Suggested actions
                        </h4>
                    </div>
                    <div className="space-y-2">
                        {c.suggestions.map((sug, i) => (
                            <div
                                key={i}
                                className="p-4 bg-white border border-slate-200 hover:border-violet-200 rounded-2xl flex items-start gap-3 transition"
                            >
                                <div className="h-7 w-7 rounded-full bg-violet-50 flex items-center justify-center shrink-0 text-xs font-bold text-violet-700">
                                    {i + 1}
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed">{sug}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const previewText = (insight) => {
    const c = insight.content_json;
    if (insight.insight_type === 'monthly_summary') return c.summary || '';
    if (insight.insight_type === 'budget_alert') return c.message || c.title || '';
    if (insight.insight_type === 'savings_tips') return c.overallTip || '';
    return '';
};

const headerChip = (insight) => {
    const c = insight.content_json;
    if (insight.insight_type === 'monthly_summary' && typeof c.healthScore === 'number') {
        const score = c.healthScore;
        const tone = score >= 70 ? 'bg-emerald-50 text-emerald-700' : score >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700';
        return <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${tone}`}>Score {score}</span>;
    }
    if (insight.insight_type === 'budget_alert' && c.severity) {
        const tone = c.severity === 'critical' ? 'bg-rose-50 text-rose-700' : c.severity === 'warning' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700';
        return <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${tone}`}>{c.severity}</span>;
    }
    if (insight.insight_type === 'savings_tips') {
        const total = (c.tips || []).reduce((s, t) => s + (Number(t.estimatedSavings) || 0), 0);
        if (total > 0) {
            return <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">~${total}/mo</span>;
        }
    }
    return null;
};

const InsightCard = ({ insight, defaultExpanded = false }) => {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const c = insight.content_json;
    const t = typeStyles[insight.insight_type] || typeStyles.monthly_summary;
    const TypeIcon = t.Icon;

    return (
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden hover:border-slate-200 transition">
            <button
                onClick={() => setExpanded((v) => !v)}
                className="w-full p-5 flex items-start gap-4 text-left hover:bg-slate-50/40 transition"
            >
                <div className={`h-12 w-12 rounded-2xl bg-linear-to-br ${t.gradient} flex items-center justify-center shrink-0`}>
                    <TypeIcon size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h3 className="font-bold text-slate-900">{labelMap[insight.insight_type]}</h3>
                        {headerChip(insight)}
                        <span className="text-xs text-slate-400">{timeAgo(insight.created_at)}</span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{previewText(insight)}</p>
                </div>
                {expanded ? (
                    <ChevronUp size={18} className="text-slate-400 shrink-0 mt-1" />
                ) : (
                    <ChevronDown size={18} className="text-slate-400 shrink-0 mt-1" />
                )}
            </button>
            {expanded && (
                <div className="px-5 pb-6 border-t border-slate-100 pt-5">
                    {insight.insight_type === 'monthly_summary' && <MonthlySummaryView c={c} />}
                    {insight.insight_type === 'budget_alert' && <BudgetAlertView c={c} />}
                    {insight.insight_type === 'savings_tips' && <SavingsTipsView c={c} />}
                </div>
            )}
        </div>
    );
};

export default InsightCard;
