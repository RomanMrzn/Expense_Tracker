const styles = {
    income: 'bg-emerald-50 text-emerald-700',
    expense: 'bg-rose-50 text-rose-700',
    warning: 'bg-amber-50 text-amber-700',
    info: 'bg-blue-50 text-blue-700',
    critical: 'bg-red-50 text-red-700',
    neutral: 'bg-slate-100 text-slate-700',
};

const StatusPill = ({ variant = 'neutral', children }) => {
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${styles[variant] || styles.neutral}`}>
            {children}
        </span>
    );
};

export default StatusPill;
