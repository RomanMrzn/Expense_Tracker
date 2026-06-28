import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, Wallet, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios.js';
import { API_PATHS } from '../utils/apiPaths.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatDate } from '../utils/format.js';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import CategoryBadge from '../components/CategoryBadge.jsx';
import StatusPill from '../components/StatusPill.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Spinner from '../components/Spinner.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionTrendChart from '../components/charts/TransactionTrendChart.jsx';

const Transactions = () => {
    const { user } = useAuth();
    const currency = user?.currency || 'USD';
    const [allTransactions, setAllTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ search: '', type: '', categoryId: '' });
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [analysisLoading, setAnalysisLoading] = useState(false);
    const [timeRange, setTimeRange] = useState('monthly');
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 20;

    const fetchData = async () => {
        const params = { limit: 2000 };
        if (filters.search) params.search = filters.search;
        if (filters.categoryId) params.categoryId = filters.categoryId;
        try {
            setLoading(true);
            const [tRes, cRes] = await Promise.all([
                api.get(API_PATHS.TRANSACTIONS.LIST, { params }),
                api.get(API_PATHS.CATEGORIES.LIST),
            ]);
            setAllTransactions(tRes.data);
            setCategories(cRes.data);
        } catch (err) {
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters.search, filters.categoryId]);

    useEffect(() => {
        setPage(1);
    }, [filters.search, filters.type, filters.categoryId]);

    const transactions = useMemo(
        () =>
            filters.type
                ? allTransactions.filter((t) => t.type === filters.type)
                : allTransactions,
        [allTransactions, filters.type]
    );

    const counts = useMemo(
        () => ({
            all: allTransactions.length,
            income: allTransactions.filter((t) => t.type === 'income').length,
            expense: allTransactions.filter((t) => t.type === 'expense').length,
        }),
        [allTransactions]
    );

    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const trendData = useMemo(() => {
        const now = new Date();
        const txnKey = (t) => (t.transaction_date || '').split('T')[0];
        const addAmount = (entry, t) => {
            const amount = parseFloat(t.amount);
            if (t.type === 'income') entry.income += amount;
            else entry.expense += amount;
        };

        if (timeRange === '30d' || timeRange === '3m') {
            const totalDays = timeRange === '30d' ? 30 : 90;
            const buckets = [];
            for (let i = totalDays - 1; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                const label = `${d.getMonth() + 1}/${d.getDate()}`;
                buckets.push({ key, label, income: 0, expense: 0 });
            }
            const map = new Map(buckets.map((b) => [b.key, b]));
            allTransactions.forEach((t) => {
                const entry = map.get(txnKey(t));
                if (entry) addAmount(entry, t);
            });
            return buckets;
        }

        if (timeRange === 'monthly') {
            const buckets = [];
            for (let i = 11; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const label = `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
                buckets.push({ key, label, income: 0, expense: 0 });
            }
            const map = new Map(buckets.map((b) => [b.key, b]));
            allTransactions.forEach((t) => {
                const [year, month] = txnKey(t).split('-');
                const entry = map.get(`${year}-${month}`);
                if (entry) addAmount(entry, t);
            });
            return buckets;
        }

        if (timeRange === 'yearly') {
            const buckets = [];
            for (let i = 4; i >= 0; i--) {
                const y = String(now.getFullYear() - i);
                buckets.push({ key: y, label: y, income: 0, expense: 0 });
            }
            const map = new Map(buckets.map((b) => [b.key, b]));
            allTransactions.forEach((t) => {
                const year = txnKey(t).split('-')[0];
                const entry = map.get(year);
                if (entry) addAmount(entry, t);
            });
            return buckets;
        }

        return [];
    }, [allTransactions, timeRange]);

    const chartInterval = timeRange === '30d' ? 3 : timeRange === '3m' ? 10 : 0;

    const totalPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const startIdx = (safePage - 1) * PAGE_SIZE;
    const paginated = transactions.slice(startIdx, startIdx + PAGE_SIZE);

    const getPageNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        if (safePage <= 4) return [1, 2, 3, 4, 5, '…', totalPages];
        if (safePage >= totalPages - 3) {
            return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }
        return [1, '…', safePage - 1, safePage, safePage + 1, '…', totalPages];
    };

    const onEdit = (t) => {
        setEditing(t);
        setModalOpen(true);
    };
    const onCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };
    const onDelete = async (id) => {
        if (!confirm('Delete this transaction?')) return;
        try {
            await api.delete(API_PATHS.TRANSACTIONS.DELETE(id));
            toast.success('Transaction deleted');
            fetchData();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };
    const onSaved = () => {
        setModalOpen(false);
        fetchData();
    };

    const generateInsight = async () => {
        if (transactions.length === 0) {
            toast.error('No transactions in view to analyze');
            return;
        }
        setAnalysisLoading(true);
        try {
            const ids = transactions.slice(0, 50).map((t) => t.id);
            const res = await api.post(API_PATHS.TRANSACTIONS.ANALYZE, { transactionIds: ids });
            setAnalysis(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to analyze');
        } finally {
            setAnalysisLoading(false);
        }
    };

    const tabs = [
        { value: '', label: 'All', count: counts.all, badge: 'bg-slate-200 text-slate-700' },
        { value: 'income', label: 'Income', count: counts.income, badge: 'bg-emerald-100 text-emerald-700' },
        { value: 'expense', label: 'Expense', count: counts.expense, badge: 'bg-rose-100 text-rose-700' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transactions</h1>
                    <p className="text-sm text-slate-500 mt-1.5">All your income and expenses</p>
                </div>
                <Button onClick={onCreate}>
                    <Plus size={16} /> Add Transaction
                </Button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Transaction Trend</h2>
                        <p className="text-xs text-slate-500 mt-1">Income vs expenses over time</p>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full shrink-0">
                        {[
                            { value: '30d', label: '30D' },
                            { value: '3m', label: '3M' },
                            { value: 'monthly', label: 'Monthly' },
                            { value: 'yearly', label: 'Yearly' },
                        ].map((r) => (
                            <button
                                key={r.value}
                                onClick={() => setTimeRange(r.value)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                                    timeRange === r.value
                                        ? 'bg-white shadow-sm text-slate-900'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>
                <TransactionTrendChart data={trendData} currency={currency} interval={chartInterval} />
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-5">
                {!analysis ? (
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-violet-400 to-violet-600 flex items-center justify-center shrink-0">
                                <Sparkles size={18} className="text-white" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-semibold text-slate-900">AI Spending Insight</h3>
                                <p className="text-sm text-slate-500 truncate">
                                    Get a quick analysis of the {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} in this view
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={generateInsight}
                            disabled={analysisLoading || transactions.length === 0}
                            size="sm"
                        >
                            {analysisLoading ? (
                                <>
                                    <Spinner size="sm" />
                                    Analyzing
                                </>
                            ) : (
                                <>
                                    <Sparkles size={14} />
                                    Generate
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-xl bg-linear-to-br from-violet-400 to-violet-600 flex items-center justify-center shrink-0">
                            <Sparkles size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-slate-900">AI Spending Insight</h3>
                                {analysis.highlight && (
                                    <span className="inline-flex items-center bg-violet-50 text-violet-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                        {analysis.highlight}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">{analysis.insight}</p>
                            <button
                                onClick={generateInsight}
                                disabled={analysisLoading}
                                className="mt-3 text-xs font-medium text-violet-600 hover:text-violet-700 disabled:opacity-50"
                            >
                                {analysisLoading ? 'Re-analyzing...' : 'Re-analyze'}
                            </button>
                        </div>
                        <button
                            onClick={() => setAnalysis(null)}
                            className="text-slate-400 hover:text-slate-600 shrink-0 p-1"
                            title="Dismiss"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            placeholder="Search description or notes..."
                            className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full self-start lg:self-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.value || 'all'}
                                onClick={() => setFilters({ ...filters, type: tab.value })}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-2 ${
                                    filters.type === tab.value
                                        ? 'bg-white shadow-sm text-slate-900'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                {tab.label}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${tab.badge}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    <select
                        value={filters.categoryId}
                        onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
                        className="px-4 py-2 rounded-full border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                        <option value="">All categories</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Spinner />
                    </div>
                ) : transactions.length === 0 ? (
                    <EmptyState
                        icon={Wallet}
                        title="No transactions"
                        description="Try adjusting filters, or add a new transaction."
                        action={
                            <Button onClick={onCreate}>
                                <Plus size={16} /> Add Transaction
                            </Button>
                        }
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                    <th className="pb-4 pr-4">Category</th>
                                    <th className="pb-4 pr-4">Description</th>
                                    <th className="pb-4 pr-4">Date</th>
                                    <th className="pb-4 pr-4">Type</th>
                                    <th className="pb-4 pr-4 text-right">Amount</th>
                                    <th className="pb-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginated.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/60 transition">
                                        <td className="py-4 pr-4">
                                            <CategoryBadge
                                                name={t.category_name || 'Uncategorized'}
                                                icon={t.category_icon}
                                                color={t.category_color}
                                                size="sm"
                                            />
                                        </td>
                                        <td className="py-4 pr-4 text-sm text-slate-700">
                                            {t.description || '—'}
                                        </td>
                                        <td className="py-4 pr-4 text-sm text-slate-500 whitespace-nowrap">
                                            {formatDate(t.transaction_date)}
                                        </td>
                                        <td className="py-4 pr-4">
                                            <StatusPill variant={t.type === 'income' ? 'income' : 'expense'}>
                                                {t.type}
                                            </StatusPill>
                                        </td>
                                        <td
                                            className={`py-4 pr-4 text-sm font-semibold text-right whitespace-nowrap ${
                                                t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                                            }`}
                                        >
                                            {t.type === 'income' ? '+' : '-'}
                                            {formatCurrency(t.amount, currency)}
                                        </td>
                                        <td className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => onEdit(t)}
                                                    className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(t.id)}
                                                    className="p-1.5 hover:bg-rose-50 rounded-md text-rose-500 transition"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-5 border-t border-slate-100">
                                <div className="text-xs text-slate-500">
                                    Showing{' '}
                                    <span className="font-semibold text-slate-700">
                                        {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, transactions.length)}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-semibold text-slate-700">{transactions.length}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={safePage === 1}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    {getPageNumbers().map((p, i) =>
                                        p === '…' ? (
                                            <span key={`gap-${i}`} className="px-1.5 text-slate-400 text-sm">
                                                {p}
                                            </span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`h-8 min-w-8 px-2.5 rounded-lg text-sm font-medium transition ${
                                                    safePage === p
                                                        ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                                                        : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )}
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={safePage === totalPages}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Edit Transaction' : 'New Transaction'}
            >
                <TransactionForm
                    initial={editing}
                    categories={categories}
                    onSaved={onSaved}
                    onCancel={() => setModalOpen(false)}
                />
            </Modal>
        </div>
    );
};

export default Transactions;
