import { AdminProfile } from '@/lib/permissions';
import DocumentManager from './document-manager';

interface PressKitTabProps {
  adminProfile: AdminProfile;
}

export default function PressKitTab({ adminProfile }: PressKitTabProps) {
  return (
    <DocumentManager
      category="press_kit"
      title="Прес-кіт"
      description="Логотипи, брендбук, прес-релізи для медіа"
      accept=".pdf,.jpg,.jpeg,.png,.webp,.zip,.doc,.docx"
      adminProfile={adminProfile}
    />
  );
}
