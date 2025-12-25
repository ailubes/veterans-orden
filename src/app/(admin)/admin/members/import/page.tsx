import { getAdminProfile } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MembersCSVImport } from '@/components/admin/members-csv-import';

export default async function MembersImportPage() {
  const adminProfile = await getAdminProfile();

  if (!adminProfile) {
    redirect('/dashboard');
  }

  // Only super_admin and admin can import members
  if (!['super_admin', 'admin'].includes(adminProfile.role)) {
    redirect('/admin/members');
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-2 text-sm text-timber-beam hover:text-accent mb-4"
        >
          <ArrowLeft size={16} />
          Назад до членів
        </Link>
        <p className="label mb-2">АДМІНІСТРУВАННЯ</p>
        <h1 className="font-syne text-3xl font-bold">Імпорт членів з CSV</h1>
        <p className="text-timber-beam mt-2">
          Масове додавання членів через завантаження CSV файлу
        </p>
      </div>

      {/* Import Component */}
      <MembersCSVImport />
    </div>
  );
}
