const Select = ({ label, error, className = '', children, ...props }) => {
    return (
        <div className="space-y-1.5">
            {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
            <select
                className={`w-full px-3 py-2 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent ${className}`}
                {...props}
            >
                {children}
            </select>
            {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
    );
};

export default Select;
