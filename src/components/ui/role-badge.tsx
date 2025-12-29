'use client';

import Image from 'next/image';
import { MEMBERSHIP_ROLES, STAFF_ROLES } from '@/lib/constants';
import {
  UserPlus,
  UserCheck,
  Users,
  Award,
  Crown,
  MapPin,
  Globe,
  Star,
  Shield,
  Edit3,
} from 'lucide-react';

type MembershipRole = keyof typeof MEMBERSHIP_ROLES;
type StaffRole = keyof typeof STAFF_ROLES;

interface RoleBadgeProps {
  membershipRole: MembershipRole;
  staffRole?: StaffRole;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'image';
  className?: string;
}

const roleIcons: Record<MembershipRole, React.ElementType> = {
  supporter: UserPlus,
  candidate: UserCheck,
  member: Users,
  honorary_member: Award,
  network_leader: Crown,
  regional_leader: MapPin,
  national_leader: Globe,
  network_guide: Star,
};

const staffIcons: Record<StaffRole, React.ElementType | null> = {
  none: null,
  news_editor: Edit3,
  admin: Shield,
  super_admin: Shield,
};

const roleColors: Record<MembershipRole, string> = {
  supporter: 'bg-gray-100 text-gray-700 border-gray-300',
  candidate: 'bg-blue-100 text-blue-700 border-blue-300',
  member: 'bg-green-100 text-green-700 border-green-300',
  honorary_member: 'bg-purple-100 text-purple-700 border-purple-300',
  network_leader: 'bg-orange-100 text-orange-700 border-orange-300',
  regional_leader: 'bg-red-100 text-red-700 border-red-300',
  national_leader: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  network_guide: 'bg-amber-100 text-amber-800 border-amber-400',
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
  lg: 'text-base px-4 py-1.5',
  xl: 'text-lg px-5 py-2',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
};

const imageSizes = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

export default function RoleBadge({
  membershipRole,
  staffRole = 'none',
  showLabel = true,
  size = 'md',
  variant = 'icon',
  className = '',
}: RoleBadgeProps) {
  const roleInfo = MEMBERSHIP_ROLES[membershipRole];
  const Icon = roleIcons[membershipRole];
  const StaffIcon = staffRole !== 'none' ? staffIcons[staffRole] : null;

  if (!roleInfo) {
    return null;
  }

  // Image variant - shows the SVG badge image
  if (variant === 'image') {
    const imageSize = imageSizes[size];
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <Image
          src={`/images/role-badges/${membershipRole}.svg`}
          alt={roleInfo.label}
          width={imageSize}
          height={imageSize}
          className="flex-shrink-0"
          title={roleInfo.description}
        />
        {showLabel && (
          <div className="flex flex-col">
            <span className={`font-bold ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
              {roleInfo.label}
            </span>
            {size !== 'sm' && (
              <span className="text-xs text-timber-beam">
                Рівень {roleInfo.level}
              </span>
            )}
          </div>
        )}
        {/* Staff badge */}
        {StaffIcon && staffRole !== 'none' && (
          <span
            className={`
              inline-flex items-center gap-1 rounded-full border
              bg-timber-dark text-canvas border-timber-dark
              ${sizeClasses[size]}
            `}
            title={STAFF_ROLES[staffRole].label}
          >
            <StaffIcon className={iconSizes[size]} />
            {showLabel && <span>{STAFF_ROLES[staffRole].label}</span>}
          </span>
        )}
      </div>
    );
  }

  // Icon variant (default) - shows the pill-style badge with icon
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Main role badge */}
      <span
        className={`
          inline-flex items-center gap-1.5 rounded-full border font-medium
          ${roleColors[membershipRole]}
          ${sizeClasses[size]}
        `}
        title={roleInfo.description}
      >
        <Icon className={iconSizes[size]} />
        {showLabel && <span>{roleInfo.label}</span>}
      </span>

      {/* Staff badge (if applicable) */}
      {StaffIcon && staffRole !== 'none' && (
        <span
          className={`
            inline-flex items-center gap-1 rounded-full border
            bg-timber-dark text-canvas border-timber-dark
            ${sizeClasses[size]}
          `}
          title={STAFF_ROLES[staffRole].label}
        >
          <StaffIcon className={iconSizes[size]} />
          {showLabel && <span>{STAFF_ROLES[staffRole].label}</span>}
        </span>
      )}
    </div>
  );
}

// Export a simpler version for lists (icon only)
export function RoleBadgeCompact({
  membershipRole,
  className = '',
}: {
  membershipRole: MembershipRole;
  className?: string;
}) {
  const Icon = roleIcons[membershipRole];
  const roleInfo = MEMBERSHIP_ROLES[membershipRole];

  return (
    <span
      className={`
        inline-flex items-center justify-center w-6 h-6 rounded-full
        ${roleColors[membershipRole]}
        ${className}
      `}
      title={roleInfo?.label}
    >
      <Icon className="w-3.5 h-3.5" />
    </span>
  );
}

// Export image-only badge for showcases
export function RoleBadgeImage({
  membershipRole,
  size = 'md',
  className = '',
}: {
  membershipRole: MembershipRole;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const roleInfo = MEMBERSHIP_ROLES[membershipRole];
  const imageSize = imageSizes[size];

  if (!roleInfo) {
    return null;
  }

  return (
    <Image
      src={`/images/role-badges/${membershipRole}.svg`}
      alt={roleInfo.label}
      width={imageSize}
      height={imageSize}
      className={`flex-shrink-0 ${className}`}
      title={`${roleInfo.label} - ${roleInfo.description}`}
    />
  );
}
