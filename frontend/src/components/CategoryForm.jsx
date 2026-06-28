import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../lib/axios.js';
import { API_PATHS } from '../utils/apiPaths.js';
import { lucideIconByName } from '../utils/icons.js';
import Input from './ui/Input.jsx';
import Select from './ui/Select.jsx';
import Button from './ui/Button.jsx';

const ICONS = [
    'tag', 'utensils', 'shopping-cart', 'shopping-bag', 'car', 'home',
    'zap', 'film', 'heart', 'book-open', 'plane', 'briefcase',
    'gift', 'laptop', 'trending-up', 'sparkles',
];

const COLORS = [
    '#10B981', '#22C55E', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6',
    '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E',
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#64748B',
];

const CategoryForm = ({ initial, onSaved, onCancel }) => {
    const [form, setForm] = useState({
        name: initial?.name || '',
        type: initial?.type || 'expense',
        icon: initial?.icon || 'tag',
        color: initial?.color || '#10B981',
    });
    const [saving, setSaving] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (initial) {
                await api.put(API_PATHS.CATEGORIES.UPDATE(initial.id), {
                    name: form.name,
                    icon: form.icon,
                    color: form.color,
                });
                toast.success('Category updated');
            } else {
                await api.post(API_PATHS.CATEGORIES.CREATE, form);
                toast.success('Category created');
            }
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <Input
                label="Name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            {!initial && (
                <Select
                    label="Type"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </Select>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
                <div className="grid grid-cols-8 gap-2">
                    {ICONS.map((name) => {
                        const Icon = lucideIconByName(name);
                        const selected = form.icon === name;
                        return (
                            <button
                                key={name}
                                type="button"
                                onClick={() => setForm({ ...form, icon: name })}
                                className={`h-10 rounded-lg border flex items-center justify-center transition ${
                                    selected
                                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                            >
                                <Icon size={18} />
                            </button>
                        );
                    })}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                    {COLORS.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setForm({ ...form, color })}
                            className={`h-8 w-8 rounded-full transition ring-offset-2 ${
                                form.color === color ? 'ring-2 ring-slate-900' : 'ring-0'
                            }`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                </Button>
            </div>
        </form>
    );
};

export default CategoryForm;
