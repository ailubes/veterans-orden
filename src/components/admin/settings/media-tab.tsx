import { AdminProfile } from '@/lib/permissions';
import DocumentManager from './document-manager';

interface MediaTabProps {
  adminProfile: AdminProfile;
}

export default function MediaTab({ adminProfile }: MediaTabProps) {
  return (
    <DocumentManager
      category="media"
      title="Медіа"
      description="Фотографії, відео та аудіо матеріали організації"
      accept=".jpg,.jpeg,.png,.webp,.gif,.mp4,.mov,.mp3,.wav"
      adminProfile={adminProfile}
    />
  );
}
