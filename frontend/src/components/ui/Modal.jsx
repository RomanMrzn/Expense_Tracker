import { useEffect } from 'react';
import { X } from 'lucide-react';

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
};

const Modal = ({ open, onClose, title, children, size = 'md' }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (open) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-white rounded-2xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
                <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
                    <h2 className="font-semibold text-slate-900">{title}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-md text-slate-500 transition">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-5 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
