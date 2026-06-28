import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "⚠️ WARNING: GEMINI_API_KEY is not set. AI features will not work.",
  );
}

const stripMarkdown = (text) => {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\n?/g, "").replace(/\n?```$/g, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\n?/g, "").replace(/\n?```$/g, "");
  }
  return cleaned.trim();
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateWithRetry = async (prompt, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
    } catch (error) {
      const isUnavailable =
        error?.status === 503 || error?.message?.includes("UNAVAILABLE");
      if (isUnavailable && i < retries - 1) {
        console.warn(
          `Gemini unavailable, retrying in ${delay}ms... (attempt ${i + 1}/${retries})`,
        );
        await sleep(delay);
        delay *= 2;
      } else {
        throw error;
      }
    }
  }
};

export const generateMonthlyInsight = async ({
  totalIncome,
  totalExpenses,
  savingsRate,
  expenseBreakdown,
  previousMonths,
  currency = "NRP",
}) => {
  const breakdownText =
    expenseBreakdown.length > 0
      ? expenseBreakdown
          .map((c) => `- ${c.category}: ${currency} ${c.amount.toFixed(2)}`)
          .join("\n")
      : "- No expenses recorded yet";

  const trendText =
    previousMonths.length > 0
      ? previousMonths
          .map(
            (m) =>
              `- ${m.month}: Income ${currency} ${m.income.toFixed(2)}, Expenses ${currency} ${m.expense.toFixed(2)}`,
          )
          .join("\n")
      : "- No previous month data available";

  const prompt = `Analyze this user's monthly financial data and generate actionable insights.

Currency: ${currency}
Total Income (this month): ${currency} ${totalIncome.toFixed(2)}
Total Expenses (this month): ${currency} ${totalExpenses.toFixed(2)}
Savings Rate: ${savingsRate.toFixed(1)}%

Expense breakdown by category (this month):
${breakdownText}

Previous months trend:
${trendText}

Return ONLY valid JSON (no markdown, no commentary) in this exact structure:
{
    "summary": "2-3 sentence summary of the user's financial health this month",
    "highlights": ["Positive observation 1", "Positive observation 2"],
    "concerns": ["Concern 1", "Concern 2"],
    "recommendations": [
        {"title": "Short title", "detail": "Actionable suggestion (1-2 sentences)"}
    ],
    "topSpendingCategory": "Category name or null",
    "estimatedMonthlySavings": number,
    "healthScore": number
}

Constraints:
- "healthScore" must be an integer between 0 and 100.
- Provide 3 recommendations.
- Reference actual numbers from the data. Tone: friendly but honest.`;

  try {
    const response = await generateWithRetry(prompt);
    const cleaned = stripMarkdown(response.text);
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("GenerateMonthlyInsight error:", error);
    throw error;
  }
};

export const generateBudgetAlert = async ({
  categoryName,
  budgetAmount,
  spentAmount,
  daysIntoPeriod,
  totalPeriodDays,
  currency = "USD",
}) => {
  const percentUsed = ((spentAmount / budgetAmount) * 100).toFixed(1);
  const daysLeft = totalPeriodDays - daysIntoPeriod;

  const prompt = `A user is tracking a budget. Generate a helpful alert.

Category: ${categoryName}
Budget: ${currency} ${budgetAmount.toFixed(2)}
Spent so far: ${currency} ${spentAmount.toFixed(2)} (${percentUsed}% used)
Days into period: ${daysIntoPeriod} of ${totalPeriodDays} (${daysLeft} days remaining)

Return ONLY valid JSON (no markdown):
{
    "severity": "info|warning|critical",
    "title": "Short alert title",
    "message": "1-2 sentence empathetic message referencing actual numbers",
    "suggestions": ["Specific action 1", "Specific action 2", "Specific action 3"]
}

Severity guide:
- info: under 70% spent
- warning: 70-100% spent
- critical: over 100% spent`;

  try {
    const response = await generateWithRetry(prompt);
    const cleaned = stripMarkdown(response.text);
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("gemini api error (generateBudgetAlert):", error);
    throw new Error("Failed to generate budget alert");
  }
};

export const generateSavingsTips = async ({
  topCategories,
  monthlyIncome,
  currency = "USD",
}) => {
  const categoryText =
    topCategories.length > 0
      ? topCategories
          .map(
            (c) =>
              `- ${c.category}: ${currency} ${c.amount.toFixed(2)} across ${c.transactionCount} transactions`,
          )
          .join("\n")
      : "- No spending data available";

  const prompt = `Generate personalized savings tips for a user.

Monthly Income (last 30 days): ${currency} ${monthlyIncome.toFixed(2)}
Top spending categories (last 30 days):
${categoryText}

Return ONLY valid JSON (no markdown):
{
    "overallTip": "Top-level 1-sentence advice",
    "tips": [
        {
            "category": "Category this targets",
            "title": "Short tip title",
            "detail": "2-3 sentence actionable suggestion",
            "estimatedSavings": number
        }
    ]
}

Provide exactly 4 tips. Each tip should reference an actual category from the data and include a realistic monthly savings estimate.`;

  try {
    const response = await generateWithRetry(prompt);

    const cleaned = stripMarkdown(response.text);
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini api error (generateSavingsTips):", error);
    throw new Error("Failed to generate savings tips");
  }
};

export const analyzeTransactionList = async ({
  transactions,
  currency = "NRP",
}) => {
  const formatDate = (d) => {
    if (!d) return "";
    if (d instanceof Date) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    return String(d.split("T")[0]);
  };

  const lines = transactions
    .slice(0, 5)
    .map((t) => {
      const date = formatDate(t.transaction_date);
      const amt = parseFloat(t.amount).toFixed(2);
      const cat = t.category_name || "uncategorized";
      const desc = t.description ? ` | ${t.description}` : "";
      return `- ${date}: ${t.type} ${currency} ${amt} | ${cat}${desc}`;
    })
    .join("\n");

  const prompt = `Analyze these ${transactions.length} transactions and provide a concise, helpful spending analysis.

Transactions (up to 50 shown):
${lines}

Return ONLY valid JSON (no markdown):
{
    "summary": "1-2 sentence overview of recent activity",
    "unusualActivity": ["Any anomalies detected or empty array"],
    "keyTakeaway": "Single most impactful insight for the user"
}`;

  try {
    const response = await generateWithRetry(prompt);

    const cleaned = stripMarkdown(response.text);
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini api error (analyzeTransactionList):", error);
    throw new Error("Failed to analyze transaction list");
  }
};

export const analyzeBudgetList = async ({ budgets, currency = "USD" }) => {
  const lines = budgets
    .map((b) => {
      const spent = parseFloat(b.spent);
      const total = parseFloat(b.amount);
      const pct = total > 0 ? ((spent / total) * 100).toFixed(1) : "0";
      return `Budget ID ${b.id} | Category: ${b.category_name} | Limit: ${currency} ${total.toFixed(2)} | Spent: ${currency} ${spent.toFixed(2)} (${pct}% used)`;
    })
    .join("\n");

  const prompt = `You're a personal finance assistant. Analyze each budget below and provide a one-sentence assessment.

Today: ${new Date().toISOString().split("T")[0]}

Budgets:
${lines}

For each budget, return:
- status: 'good' (well-paced, under target), 'caution' (approaching limit or above 70%), or 'concerning' (over budget)
- message: A specific, friendly 1-sentence assessment with actionable feedback or encouragement

Return ONLY valid JSON (no markdown):
{
    "analyses": [
        { "budgetId": number, "status": "good|caution|concerning", "message": "string" }
    ]
}`;

  try {
    const response = await generateWithRetry(prompt);

    const cleaned = stripMarkdown(response.text);
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Gemini api error (analyzeBudgetList):", error);
    throw new Error("Failed to analyze budget list");
  }
};

export default {
  generateMonthlyInsight,
  generateBudgetAlert,
  generateSavingsTips,
  analyzeTransactionList,
  analyzeBudgetList,
};
