import { requireUserId } from '@/lib/auth';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  await requireUserId();
  return <SettingsClient />;
}
