const Textarea = ({ label, error, className = '', ...props }) => {
    return (
        <div className="space-y-1.5">
            {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
            <textarea
                className={`w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent ${className}`}
                {...props}
            />
            {error && <p className="text-xs text-rose-600">{error}</p>}
        </div>
    );
};

export default Textarea;
