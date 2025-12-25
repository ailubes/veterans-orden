import { getAdminProfile, isSuperAdmin } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrganizationProfileTab from '@/components/admin/settings/organization-profile-tab';
import RoleManagementTab from '@/components/admin/settings/role-management-tab';
import OblastsManagementTab from '@/components/admin/settings/oblasts-management-tab';
import SystemConfigTab from '@/components/admin/settings/system-config-tab';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AdminSettingsPage() {
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
        <p className="label text-accent mb-2">НАЛАШТУВАННЯ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">
          Системні налаштування
        </h1>
        <p className="text-timber-beam mt-2">
          Управління організацією, ролями та системними параметрами
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 bg-transparent h-auto p-0 mb-8">
          <TabsTrigger
            value="organization"
            className="border-2 border-timber-dark bg-canvas text-timber-dark font-bold data-[state=active]:bg-accent data-[state=active]:text-canvas h-12"
          >
            Організація
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className="border-2 border-timber-dark bg-canvas text-timber-dark font-bold data-[state=active]:bg-accent data-[state=active]:text-canvas h-12"
            disabled={adminProfile.role === 'regional_leader'}
          >
            Ролі
          </TabsTrigger>
          <TabsTrigger
            value="oblasts"
            className="border-2 border-timber-dark bg-canvas text-timber-dark font-bold data-[state=active]:bg-accent data-[state=active]:text-canvas h-12"
          >
            Області
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="border-2 border-timber-dark bg-canvas text-timber-dark font-bold data-[state=active]:bg-accent data-[state=active]:text-canvas h-12"
          >
            Аудит
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="border-2 border-timber-dark bg-canvas text-timber-dark font-bold data-[state=active]:bg-accent data-[state=active]:text-canvas h-12"
            disabled={!isSuperAdmin(adminProfile.role)}
          >
            Система
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="mt-0">
          <OrganizationProfileTab adminProfile={adminProfile} />
        </TabsContent>

        <TabsContent value="roles" className="mt-0">
          <RoleManagementTab adminProfile={adminProfile} />
        </TabsContent>

        <TabsContent value="oblasts" className="mt-0">
          <OblastsManagementTab />
        </TabsContent>

        <TabsContent value="audit" className="mt-0">
          <div className="border-2 border-timber-dark p-8 bg-canvas relative">
            {/* Joints */}
            <div className="joint" style={{ top: '-6px', left: '-6px' }} />
            <div className="joint" style={{ top: '-6px', right: '-6px' }} />
            <div className="joint" style={{ bottom: '-6px', left: '-6px' }} />
            <div className="joint" style={{ bottom: '-6px', right: '-6px' }} />

            <h2 className="font-syne text-2xl font-bold mb-4">Журнал аудиту</h2>
            <p className="text-timber-beam">
              Перегляд історії дій адміністраторів
            </p>
            <Link
              href="/admin/settings/audit-log"
              className="mt-4 inline-block px-6 py-2 border-2 border-timber-dark bg-accent text-canvas hover:bg-timber-dark transition-colors"
            >
              Відкрити журнал аудиту
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="system" className="mt-0">
          <SystemConfigTab adminProfile={adminProfile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
