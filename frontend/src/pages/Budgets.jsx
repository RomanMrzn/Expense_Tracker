import { useEffect, useState } from 'react';
import { Plus, Target, Pencil, Trash2, Sparkles, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios.js';
import { API_PATHS } from '../utils/apiPaths.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency } from '../utils/format.js';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import CategoryBadge from '../components/CategoryBadge.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Spinner from '../components/Spinner.jsx';
import BudgetForm from '../components/BudgetForm.jsx';

const statusStyles = {
    good: {
        Icon: CheckCircle2,
        label: 'On Track',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        iconColor: 'text-emerald-600',
    },
    caution: {
        Icon: AlertTriangle,
        label: 'Watch It',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        iconColor: 'text-amber-600',
    },
    concerning: {
        Icon: AlertOctagon,
        label: 'Over Budget',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        iconColor: 'text-rose-600',
    },
};

const AnalysisSkeleton = () => (
    <div className="mt-4 pt-4 border-t border-slate-100 animate-pulse">
        <div className="flex items-start gap-2.5">
            <div className="shrink-0 h-6 w-6 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
                <div className="h-3.5 w-20 bg-slate-200 rounded-full" />
                <div className="h-2.5 bg-slate-200 rounded w-full" />
                <div className="h-2.5 bg-slate-200 rounded w-4/5" />
            </div>
        </div>
    </div>
);

const Budgets = () => {
    const { user } = useAuth();
    const currency = user?.currency || 'USD';
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [analyses, setAnalyses] = useState({});
    const [analyzing, setAnalyzing] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [bRes, cRes] = await Promise.all([
                api.get(API_PATHS.BUDGETS.LIST),
                api.get(API_PATHS.CATEGORIES.LIST),
            ]);
            setBudgets(bRes.data);
            setCategories(cRes.data);
        } catch (err) {
            toast.error('Failed to load budgets');
        } finally {
            setLoading(false);
        }
    };

    const analyzeAll = async () => {
        setAnalyses({});
        setAnalyzing(true);
        try {
            const res = await api.post(API_PATHS.BUDGETS.ANALYZE);
            const map = {};
            (res.data.analyses || []).forEach((a) => {
                map[a.budgetId] = a;
            });
            setAnalyses(map);
        } catch (err) {
            console.error('Failed to analyze budgets', err);
        } finally {
            setAnalyzing(false);
        }
    };

    useEffect(() => {
        fetchData();
        analyzeAll();
    }, []);

    const onEdit = (b) => {
        setEditing(b);
        setModalOpen(true);
    };

    const onCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const onDelete = async (id) => {
        if (!confirm('Delete this budget?')) return;
        try {
            await api.delete(API_PATHS.BUDGETS.DELETE(id));
            toast.success('Budget deleted');
            fetchData();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const onSaved = () => {
        setModalOpen(false);
        fetchData();
        analyzeAll();
    };

    const hasAnalyses = Object.keys(analyses).length > 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Budgets</h1>
                    <p className="text-sm text-slate-500 mt-1.5">
                        Set spending limits per category — AI scores each one automatically
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={analyzeAll}
                        disabled={analyzing || budgets.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {analyzing ? <Spinner size="sm" /> : <Sparkles size={14} />}
                        {analyzing ? 'Analyzing' : hasAnalyses ? 'Re-analyze' : 'Analyze'}
                    </button>
                    <Button onClick={onCreate}>
                        <Plus size={16} /> Add Budget
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Spinner />
                </div>
            ) : budgets.length === 0 ? (
                <EmptyState
                    icon={Target}
                    title="No budgets yet"
                    description="Create a budget to track spending limits."
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {budgets.map((b) => {
                        const spent = parseFloat(b.spent);
                        const total = parseFloat(b.amount);
                        const pct = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
                        const over = spent > total;
                        const barColor =
                            pct >= 100 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
                        const analysis = analyses[b.id];
                        const style = analysis ? statusStyles[analysis.status] : null;

                        return (
                            <div
                                key={b.id}
                                className="bg-white rounded-3xl border border-slate-100 p-6 hover:border-slate-200 transition"
                            >
                                <div className="flex items-start justify-between mb-5">
                                    <CategoryBadge
                                        name={b.category_name}
                                        icon={b.category_icon}
                                        color={b.category_color}
                                    />
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => onEdit(b)}
                                            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(b.id)}
                                            className="p-1.5 hover:bg-rose-50 rounded-md text-rose-500 transition"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mb-3 flex items-baseline justify-between">
                                    <span className="text-3xl font-bold tracking-tight text-slate-900">
                                        {formatCurrency(spent, currency)}
                                    </span>
                                    <span className="text-sm text-slate-500">
                                        of {formatCurrency(total, currency)}
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${barColor} transition-all`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                                <div className="mt-2.5 flex items-center justify-between text-xs">
                                    <span className="text-slate-500 capitalize">{b.period} · {pct.toFixed(0)}% used</span>
                                    <span className={over ? 'text-rose-600 font-medium' : 'text-slate-500'}>
                                        {over
                                            ? `Over by ${formatCurrency(spent - total, currency)}`
                                            : `${formatCurrency(total - spent, currency)} left`}
                                    </span>
                                </div>

                                {analysis && style ? (
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <div className="flex items-start gap-2.5">
                                            <div className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${style.bg}`}>
                                                <style.Icon size={14} className={style.iconColor} />
                                            </div>
                                            <div className="min-w-0">
                                                <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${style.bg} ${style.text} mb-1`}>
                                                    {style.label}
                                                </span>
                                                <p className="text-xs text-slate-600 leading-relaxed">{analysis.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : analyzing ? (
                                    <AnalysisSkeleton />
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Edit Budget' : 'New Budget'}
            >
                <BudgetForm
                    initial={editing}
                    categories={categories.filter((c) => c.type === 'expense')}
                    onSaved={onSaved}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default Budgets;
