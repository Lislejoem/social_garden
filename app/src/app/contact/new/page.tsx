import { requireUserId } from '@/lib/auth';
import NewContactClient from './NewContactClient';

export default async function NewContactPage() {
  await requireUserId();
  return <NewContactClient />;
}
