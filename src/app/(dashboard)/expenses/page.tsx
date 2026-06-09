import { getExpenses, getBudgetAlerts } from '@/lib/expense-actions';
import ExpenseClient from './ExpenseClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExpensesPage() {
  const expenses = await getExpenses();
  const budgetAlerts = await getBudgetAlerts();

  return <ExpenseClient expenses={expenses} budgetAlerts={budgetAlerts} />;
}
