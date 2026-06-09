import { getPendingExpenses } from '@/lib/expense-actions';
import ApprovalClient from './ApprovalClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExpenseApprovalsPage() {
  const pendingExpenses = await getPendingExpenses();

  return <ApprovalClient pendingExpenses={pendingExpenses} />;
}
