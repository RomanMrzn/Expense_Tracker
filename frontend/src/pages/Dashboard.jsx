import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowRight,
  Target,
} from "lucide-react";
import api from "../lib/axios.js";
import { API_PATHS } from "../utils/apiPaths.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatCurrency, formatDate } from "../utils/format.js";
import KpiCard from "../components/KpiCard.jsx";
import CategoryBadge from "../components/CategoryBadge.jsx";
import MonthlyTrendChart from "../components/charts/MonthlyTrendChart.jsx";
import CategoryBreakdownChart from "../components/charts/CategoryBreakdownChart.jsx";
import Spinner from "../components/Spinner.jsx";

const Dashboard = () => {
  const { user } = useAuth();
  const currency = user?.currency || "USD";
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [recent, setRecent] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, t, b, r, bd] = await Promise.all([
          api.get(API_PATHS.DASHBOARD.SUMMARY),
          api.get(API_PATHS.DASHBOARD.MONTHLY_TREND),
          api.get(API_PATHS.DASHBOARD.CATEGORY_BREAKDOWN),
          api.get(API_PATHS.TRANSACTIONS.LIST, { params: { limit: 5 } }),
          api.get(API_PATHS.BUDGETS.LIST),
        ]);
        setSummary(s.data);
        setTrend(t.data);
        setBreakdown(b.data);
        setRecent(r.data);
        setBudgets(bd.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spent), 0);
  const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);
  const aggPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const aggColor =
    aggPct >= 100 ? "#F43F5E" : aggPct >= 70 ? "#F59E0B" : "#10B981";

  if (loading || !summary) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1.5">
          An overview of your finances this month
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Balance"
          value={formatCurrency(summary.balance, currency)}
          icon={Wallet}
          accent="violet"
        />
        <KpiCard
          label="Income"
          value={formatCurrency(summary.incomeThisMonth, currency)}
          delta={summary.incomeDelta}
          icon={TrendingUp}
          accent="orange"
        />
        <KpiCard
          label="Expenses"
          value={formatCurrency(summary.expenseThisMonth, currency)}
          delta={summary.expenseDelta}
          icon={TrendingDown}
          accent="rose"
        />
        <KpiCard
          label="Savings Rate"
          value={`${(summary.savingsRate ?? 0).toFixed(1)}%`}
          icon={PiggyBank}
          accent="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Monthly Trend
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Income vs expenses, last 6 months
            </p>
          </div>
          <MonthlyTrendChart data={trend} currency={currency} />
        </div>
        <div className="bg-white rounded-3xl border border-slate-100 p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Top Categories
            </h2>
            <p className="text-xs text-slate-500 mt-1">Spending this month</p>
          </div>
          <CategoryBreakdownChart data={breakdown} currency={currency} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Recent Transactions
            </h2>
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 transition"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">
              No transactions yet.
            </p>
          ) : (
            <div className="space-y-1">
              {recent.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryBadge
                      icon={t.category_icon}
                      color={t.category_color}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {t.description || t.category_name || "Untitled"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t.category_name || "Uncategorized"} ·{" "}
                        {formatDate(t.transaction_date)}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-bold shrink-0 ${t.type === "income" ? "text-emerald-600" : "text-orange-500"}`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {formatCurrency(t.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Budget Status
            </h2>
            <Link
              to="/budgets"
              className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 transition"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          {budgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                <Target size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-1">
                No budgets yet
              </p>
              <Link
                to="/budgets"
                className="text-xs text-violet-600 font-medium hover:text-violet-700"
              >
                Create one →
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <div className="text-2xl font-bold tracking-tight text-slate-900">
                      {formatCurrency(totalSpent, currency)}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      of {formatCurrency(totalBudget, currency)} total
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-sm font-bold"
                      style={{ color: aggColor }}
                    >
                      {aggPct.toFixed(0)}%
                    </div>
                    <div className="text-[10px] text-slate-500">used</div>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(aggPct, 100)}%`,
                      backgroundColor: aggColor,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {budgets.slice(0, 4).map((b) => {
                  const spent = parseFloat(b.spent);
                  const total = parseFloat(b.amount);
                  const pct =
                    total > 0 ? Math.min((spent / total) * 100, 100) : 0;
                  const color =
                    pct >= 100 ? "#F43F5E" : pct >= 70 ? "#F59E0B" : "#10B981";
                  return (
                    <div key={b.id}>
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="text-slate-700 font-medium truncate">
                          {b.category_name}
                        </span>
                        <span className="text-slate-500 shrink-0 ml-2 text-[11px]">
                          {formatCurrency(spent, currency)} /{" "}
                          {formatCurrency(total, currency)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
