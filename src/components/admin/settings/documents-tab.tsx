import { AdminProfile } from '@/lib/permissions';
import DocumentManager from './document-manager';

interface DocumentsTabProps {
  adminProfile: AdminProfile;
}

export default function DocumentsTab({ adminProfile }: DocumentsTabProps) {
  return (
    <DocumentManager
      category="documents"
      title="Офіційні документи"
      description="Статут, реєстраційні рішення, звіти та інші офіційні документи"
      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods"
      adminProfile={adminProfile}
    />
  );
}
