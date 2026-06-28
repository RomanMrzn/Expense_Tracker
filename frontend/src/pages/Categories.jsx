import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Folder } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios.js';
import { API_PATHS } from '../utils/apiPaths.js';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import CategoryBadge from '../components/CategoryBadge.jsx';
import StatusPill from '../components/StatusPill.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Spinner from '../components/Spinner.jsx';
import CategoryForm from '../components/CategoryForm.jsx';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await api.get(API_PATHS.CATEGORIES.LIST);
            setCategories(res.data);
        } catch (err) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const onEdit = (c) => {
        setEditing(c);
        setModalOpen(true);
    };

    const onCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const onDelete = async (id) => {
        if (!confirm('Delete this category? Transactions in this category will become uncategorized.')) return;
        try {
            await api.delete(API_PATHS.CATEGORIES.DELETE(id));
            toast.success('Category deleted');
            fetchCategories();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const onSaved = () => {
        setModalOpen(false);
        fetchCategories();
    };

    const income = categories.filter((c) => c.type === 'income');
    const expense = categories.filter((c) => c.type === 'expense');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Categories</h1>
                    <p className="text-sm text-slate-500 mt-1.5">Organize transactions by category</p>
                </div>
                <Button onClick={onCreate}>
                    <Plus size={16} /> Add Category
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Spinner />
                </div>
            ) : categories.length === 0 ? (
                <EmptyState
                    icon={Folder}
                    title="No categories"
                    description="Add a category to start organizing your transactions."
                />
            ) : (
                <>
                    {[
                        { label: 'Income', items: income },
                        { label: 'Expense', items: expense },
                    ].map((group) => (
                        <div key={group.label}>
                            <h2 className="font-semibold text-slate-900 mb-3">
                                {group.label} <span className="text-slate-400 font-normal">({group.items.length})</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {group.items.map((c) => (
                                    <div
                                        key={c.id}
                                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between"
                                    >
                                        <CategoryBadge name={c.name} icon={c.icon} color={c.color} />
                                        <div className="flex items-center gap-1.5">
                                            {c.is_default && <StatusPill variant="neutral">default</StatusPill>}
                                            <button
                                                onClick={() => onEdit(c)}
                                                className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(c.id)}
                                                className="p-1.5 hover:bg-rose-50 rounded-md text-rose-500 transition"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </>
            )}

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Edit Category' : 'New Category'}
            >
                <CategoryForm initial={editing} onSaved={onSaved} onCancel={() => setModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Categories;
