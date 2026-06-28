import pool from "../db.js";

const pctChange = (current, previous) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
};

export const getSummary = async (req, res) => {
  try {
    const result = await pool.query(
      `WITH monthly AS (
                SELECT
                    date_trunc('month', transaction_date) AS month,
                    type,
                    SUM(amount) AS total
                FROM transactions
                WHERE user_id = $1
                    AND transaction_date >= date_trunc('month', CURRENT_DATE) - INTERVAL '1 month'
                GROUP BY 1, 2
            )
            SELECT
                COALESCE(SUM(CASE WHEN month = date_trunc('month', CURRENT_DATE) AND type = 'income' THEN total END), 0) AS income_this_month,
                COALESCE(SUM(CASE WHEN month = date_trunc('month', CURRENT_DATE) AND type = 'expense' THEN total END), 0) AS expense_this_month,
                COALESCE(SUM(CASE WHEN month = date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' AND type = 'income' THEN total END), 0) AS income_last_month,
                COALESCE(SUM(CASE WHEN month = date_trunc('month', CURRENT_DATE) - INTERVAL '1 month' AND type = 'expense' THEN total END), 0) AS expense_last_month
            FROM monthly`,
      [req.userId],
    );
    const data = result.rows[0];

    const incomeThisMonth = parseFloat(data.income_this_month);
    const expenseThisMonth = parseFloat(data.expense_this_month);
    const incomeLastMonth = parseFloat(data.income_last_month);
    const expenseLastMonth = parseFloat(data.expense_last_month);
    const balance = incomeThisMonth - expenseThisMonth;
    const savings = incomeThisMonth > 0 ? (balance / incomeThisMonth) * 100 : 0;

    const netSavingsThisMonth = incomeThisMonth - expenseThisMonth;
    const netSavingsLastMonth = incomeLastMonth - expenseLastMonth;

    res.json({
      currentMonth: {
        incomeThisMonth: incomeThisMonth,
        expenseThisMonth: expenseThisMonth,
        balance: balance,
        savings: savings,
        income: pctChange(incomeThisMonth, incomeLastMonth),
        expense: pctChange(expenseThisMonth, expenseLastMonth),
      },
    });
  } catch (error) {
    console.error("GetSummary error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCategoryBreakdown = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
                c.id AS category_id,
                c.name AS category_name,
                c.icon AS category_icon,
                c.color AS category_color,
                SUM(t.amount) AS total,
                COUNT(t.id) AS transaction_count
            FROM transactions t
            JOIN categories c ON c.id = t.category_id
            WHERE t.user_id = $1
                AND t.type = 'expense'
                AND t.transaction_date >= date_trunc('month', CURRENT_DATE)
            GROUP BY c.id
            ORDER BY total DESC`,
      [req.userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GetCategoryBreakdown error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMonthlyTrend = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
                to_char(date_trunc('month', transaction_date), 'YYYY-MM') AS month,
                SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
                SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
            FROM transactions
            WHERE user_id = $1
                AND transaction_date >= date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
            GROUP BY 1
            ORDER BY 1`,
      [req.userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GetMonthlyTrend error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
