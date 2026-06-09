import { getPendingVoids } from '@/lib/void-actions';
import VoidClient from './VoidClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function VoidApprovalsPage() {
  const pendingVoids = await getPendingVoids();

  return <VoidClient pendingVoids={pendingVoids} />;
}
