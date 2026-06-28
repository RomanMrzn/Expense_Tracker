import * as Icons from 'lucide-react';

export const lucideIconByName = (iconName) => {
    if (!iconName) return Icons.Tag;
    const pascal = iconName
        .split('-')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join('');
    return Icons[pascal] || Icons.Tag;
};
