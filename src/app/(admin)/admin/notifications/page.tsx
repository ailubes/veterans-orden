import { getAdminProfile, isRegionalLeaderOnly } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { NotificationForm } from '@/components/admin/notifications/notification-form';
import { NotificationHistory } from '@/components/admin/notifications/notification-history';

export default async function AdminNotificationsPage() {
  // Check admin access
  const adminProfile = await getAdminProfile();
  if (!adminProfile) {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm text-timber-beam hover:text-accent mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад до панелі
        </Link>
        <p className="label text-accent mb-2">АДМІНІСТРУВАННЯ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">
          Сповіщення
        </h1>
        <p className="text-timber-beam mt-2">
          Надсилайте повідомлення членам мережі за різними критеріями
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Send Notification Form */}
        <div>
          <h2 className="font-syne text-xl font-bold mb-4">
            Надіслати сповіщення
          </h2>
          <NotificationForm
            adminStaffRole={adminProfile.staff_role}
            adminMembershipRole={adminProfile.membership_role}
            adminId={adminProfile.id}
            isRegionalLeaderOnly={isRegionalLeaderOnly(adminProfile.staff_role, adminProfile.membership_role)}
          />
        </div>

        {/* Notification History */}
        <div>
          <h2 className="font-syne text-xl font-bold mb-4">
            Історія сповіщень
          </h2>
          <NotificationHistory />
        </div>
      </div>
    </div>
  );
}
