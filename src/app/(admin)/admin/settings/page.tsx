import { getAdminProfile, isSuperAdmin } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OrganizationProfileTab from '@/components/admin/settings/organization-profile-tab';
import RoleManagementTab from '@/components/admin/settings/role-management-tab';
import MembershipProgressionTab from '@/components/admin/settings/membership-progression-tab';
import OblastsManagementTab from '@/components/admin/settings/oblasts-management-tab';
import SystemConfigTab from '@/components/admin/settings/system-config-tab';
import EmailTemplatesTab from '@/components/admin/settings/email-templates-tab';
import MessagingSettingsTab from '@/components/admin/settings/messaging-settings-tab';
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
          className="inline-flex items-center gap-2 text-sm text-muted-500 hover:text-bronze mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад до панелі
        </Link>
        <p className="label text-bronze mb-2">НАЛАШТУВАННЯ</p>
        <h1 className="font-syne text-3xl lg:text-4xl font-bold">
          Системні налаштування
        </h1>
        <p className="text-muted-500 mt-2">
          Управління організацією, ролями та системними параметрами
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="organization" className="w-full">
        <TabsList className="flex flex-wrap gap-2 bg-transparent h-auto p-0 mb-8">
          <TabsTrigger
            value="organization"
            className="border border-line rounded-lg bg-panel-900 text-timber-dark font-bold data-[state=active]:bg-timber-dark data-[state=active]:text-canvas h-10 px-3 text-xs sm:text-sm sm:h-12 sm:px-4 flex-1 sm:flex-none min-w-[calc(50%-4px)] sm:min-w-0"
          >
            Організація
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className="border border-line rounded-lg bg-panel-900 text-timber-dark font-bold data-[state=active]:bg-timber-dark data-[state=active]:text-canvas h-10 px-3 text-xs sm:text-sm sm:h-12 sm:px-4 flex-1 sm:flex-none min-w-[calc(50%-4px)] sm:min-w-0"
            disabled={adminProfile.role === 'regional_leader'}
          >
            Ролі
          </TabsTrigger>
          <TabsTrigger
            value="membership"
            className="border border-line rounded-lg bg-panel-900 text-timber-dark font-bold data-[state=active]:bg-timber-dark data-[state=active]:text-canvas h-10 px-3 text-xs sm:text-sm sm:h-12 sm:px-4 flex-1 sm:flex-none min-w-[calc(50%-4px)] sm:min-w-0"
          >
            Прогресія
          </TabsTrigger>
          <TabsTrigger
            value="oblasts"
            className="border border-line rounded-lg bg-panel-900 text-timber-dark font-bold data-[state=active]:bg-timber-dark data-[state=active]:text-canvas h-10 px-3 text-xs sm:text-sm sm:h-12 sm:px-4 flex-1 sm:flex-none min-w-[calc(50%-4px)] sm:min-w-0"
          >
            Області
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="border border-line rounded-lg bg-panel-900 text-timber-dark font-bold data-[state=active]:bg-timber-dark data-[state=active]:text-canvas h-10 px-3 text-xs sm:text-sm sm:h-12 sm:px-4 flex-1 sm:flex-none min-w-[calc(50%-4px)] sm:min-w-0"
          >
            Аудит
          </TabsTrigger>
          <TabsTrigger
            value="email-templates"
            className="border border-line rounded-lg bg-panel-900 text-timber-dark font-bold data-[state=active]:bg-timber-dark data-[state=active]:text-canvas h-10 px-3 text-xs sm:text-sm sm:h-12 sm:px-4 flex-1 sm:flex-none min-w-[calc(50%-4px)] sm:min-w-0"
          >
            Email
          </TabsTrigger>
          <TabsTrigger
            value="messaging"
            className="border border-line rounded-lg bg-panel-900 text-timber-dark font-bold data-[state=active]:bg-timber-dark data-[state=active]:text-canvas h-10 px-3 text-xs sm:text-sm sm:h-12 sm:px-4 flex-1 sm:flex-none min-w-[calc(50%-4px)] sm:min-w-0"
            disabled={!isSuperAdmin(adminProfile.role)}
          >
            Повідомлення
          </TabsTrigger>
          <TabsTrigger
            value="system"
            className="border border-line rounded-lg bg-panel-900 text-timber-dark font-bold data-[state=active]:bg-timber-dark data-[state=active]:text-canvas h-10 px-3 text-xs sm:text-sm sm:h-12 sm:px-4 flex-1 sm:flex-none min-w-[calc(50%-4px)] sm:min-w-0"
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

        <TabsContent value="membership" className="mt-0">
          <MembershipProgressionTab adminProfile={adminProfile} />
        </TabsContent>

        <TabsContent value="oblasts" className="mt-0">
          <OblastsManagementTab />
        </TabsContent>

        <TabsContent value="audit" className="mt-0">
          <div className="border border-line rounded-lg p-4 sm:p-8 bg-panel-900 card-with-joints">
            {/* Joints */}
            <div className="joint joint-tl" />
            <div className="joint joint-tr" />
            <div className="joint joint-bl" />
            <div className="joint joint-br" />

            <h2 className="font-syne text-xl sm:text-2xl font-bold mb-4">Журнал аудиту</h2>
            <p className="text-muted-500">
              Перегляд історії дій адміністраторів
            </p>
            <Link
              href="/admin/settings/audit-log"
              className="mt-4 btn btn-outline"
            >
              Відкрити журнал аудиту
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="email-templates" className="mt-0">
          <EmailTemplatesTab adminProfile={adminProfile} />
        </TabsContent>

        <TabsContent value="messaging" className="mt-0">
          <MessagingSettingsTab adminProfile={adminProfile} />
        </TabsContent>

        <TabsContent value="system" className="mt-0">
          <SystemConfigTab adminProfile={adminProfile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
