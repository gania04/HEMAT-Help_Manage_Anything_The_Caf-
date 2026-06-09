import { getPosHistory } from '@/lib/pos-actions';
import HistoryClient from './HistoryClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PosHistoryPage() {
  const history = await getPosHistory();

  return <HistoryClient history={history} />;
}
