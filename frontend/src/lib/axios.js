// =============================================================================
// MOCK AXIOS CLIENT
// -----------------------------------------------------------------------------
// This is a temporary mock that returns sample data from utils/mockData.js so the
// app runs without a backend. When you're ready to wire up the real backend,
// REPLACE THE ENTIRE CONTENTS OF THIS FILE with the real axios client below,
// and DELETE utils/mockData.js.
//
// --- REAL AXIOS CLIENT (paste this when backend is ready) ---
//
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const is401 = err.response?.status === 401;
    const isAuthRoute = ["/login", "/register"].includes(
      window.location.pathname,
    );
    const isAuthEndpoint = err.config?.url?.includes("/auth/");

    if (is401 && !isAuthRoute && !isAuthEndpoint) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;
//
// =============================================================================

// import {
//     mockUser,
//     mockCategories,
//     mockTransactions,
//     mockBudgets,
//     mockDashboardSummary,
//     mockMonthlyTrend,
//     mockCategoryBreakdown,
//     mockInsights,
//     mockInsightGenerators,
//     mockBudgetAnalyses,
//     mockTransactionAnalysis,
// } from '../utils/mockData.js';

// const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

// let nextId = 1000;
// const newId = () => nextId++;

// const filterTransactions = (params = {}) => {
//     let result = [...mockTransactions];
//     if (params.search) {
//         const q = String(params.search).toLowerCase();
//         result = result.filter(
//             (t) =>
//                 (t.description || '').toLowerCase().includes(q) ||
//                 (t.notes || '').toLowerCase().includes(q)
//         );
//     }
//     if (params.categoryId) {
//         result = result.filter((t) => String(t.category_id) === String(params.categoryId));
//     }
//     if (params.type) {
//         result = result.filter((t) => t.type === params.type);
//     }
//     const limit = parseInt(params.limit, 10) || 50;
//     return result.slice(0, limit);
// };

// const generateInsight = (type) => ({
//     id: newId(),
//     insight_type: type,
//     period_start: null,
//     period_end: null,
//     content_json: mockInsightGenerators[type] || mockInsightGenerators.monthly_summary,
//     created_at: new Date().toISOString(),
// });

// const api = {
//     get: async (url, config = {}) => {
//         await delay();
//         const params = config.params || {};

//         if (url === '/auth/me') return { data: mockUser };
//         if (url === '/categories') return { data: mockCategories };
//         if (url === '/transactions') return { data: filterTransactions(params) };
//         if (url === '/budgets') return { data: mockBudgets };
//         if (url === '/dashboard/summary') return { data: mockDashboardSummary };
//         if (url === '/dashboard/monthly-trend') return { data: mockMonthlyTrend };
//         if (url === '/dashboard/category-breakdown') return { data: mockCategoryBreakdown };
//         if (url === '/insights') return { data: mockInsights };

//         const txnIdMatch = url.match(/^\/transactions\/(\d+)$/);
//         if (txnIdMatch) {
//             const txn = mockTransactions.find((t) => t.id === parseInt(txnIdMatch[1], 10));
//             return { data: txn || null };
//         }

//         return { data: null };
//     },

//     post: async (url, body = {}) => {
//         await delay();

//         if (url === '/auth/login') {
//             const token = 'mock-token';
//             localStorage.setItem('token', token);
//             return {
//                 data: {
//                     user: { ...mockUser, email: body.email || mockUser.email },
//                     token,
//                 },
//             };
//         }
//         if (url === '/auth/register') {
//             const token = 'mock-token';
//             localStorage.setItem('token', token);
//             return {
//                 data: {
//                     user: {
//                         id: newId(),
//                         name: body.name || mockUser.name,
//                         email: body.email || mockUser.email,
//                         currency: body.currency || 'USD',
//                     },
//                     token,
//                 },
//             };
//         }
//         if (url === '/transactions') return { data: { id: newId(), ...body } };
//         if (url === '/categories') return { data: { id: newId(), is_default: false, ...body } };
//         if (url === '/budgets') return { data: { id: newId(), ...body } };
//         if (url === '/insights/generate') return { data: generateInsight(body.type) };
//         if (url === '/transactions/analyze') return { data: mockTransactionAnalysis };
//         if (url === '/budgets/analyze') return { data: { analyses: mockBudgetAnalyses } };

//         return { data: null };
//     },

//     put: async (url, body = {}) => {
//         await delay();
//         const idMatch = url.match(/\/(\d+)$/);
//         const id = idMatch ? parseInt(idMatch[1], 10) : newId();
//         return { data: { id, ...body } };
//     },

//     delete: async () => {
//         await delay();
//         return { data: { message: 'Deleted' } };
//     },
// };

// export default api;
