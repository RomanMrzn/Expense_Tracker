export const API_PATHS = {
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        ME: '/auth/me',
    },
    CATEGORIES: {
        LIST: '/categories',
        CREATE: '/categories',
        UPDATE: (id) => `/categories/${id}`,
        DELETE: (id) => `/categories/${id}`,
    },
    TRANSACTIONS: {
        LIST: '/transactions',
        CREATE: '/transactions',
        GET_BY_ID: (id) => `/transactions/${id}`,
        UPDATE: (id) => `/transactions/${id}`,
        DELETE: (id) => `/transactions/${id}`,
        ANALYZE: '/transactions/analyze',
    },
    BUDGETS: {
        LIST: '/budgets',
        CREATE: '/budgets',
        UPDATE: (id) => `/budgets/${id}`,
        DELETE: (id) => `/budgets/${id}`,
        ANALYZE: '/budgets/analyze',
    },
    DASHBOARD: {
        SUMMARY: '/dashboard/summary',
        CATEGORY_BREAKDOWN: '/dashboard/category-breakdown',
        MONTHLY_TREND: '/dashboard/monthly-trend',
    },
    INSIGHTS: {
        LIST: '/insights',
        GENERATE: '/insights/generate',
    },
};

export default API_PATHS;
