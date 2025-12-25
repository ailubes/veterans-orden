/**
 * Profile completion utilities
 * Check if user has filled all required profile fields
 */

export interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  oblast_id: string | null;
  city: string | null;
  patronymic?: string | null;
}

export interface ProfileCompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  completionPercentage: number;
}

/**
 * Required fields for profile completion
 */
const REQUIRED_FIELDS = [
  'first_name',
  'last_name',
  'phone',
  'date_of_birth',
  'oblast_id',
  'city',
] as const;

/**
 * Field labels in Ukrainian
 */
export const FIELD_LABELS: Record<string, string> = {
  first_name: "Ім'я",
  last_name: 'Прізвище',
  phone: 'Телефон',
  date_of_birth: 'Дата народження',
  oblast_id: 'Область',
  city: 'Місто',
  patronymic: 'По батькові',
};

/**
 * Check if profile is complete
 *
 * @param profile User profile object
 * @returns Profile completion status
 */
export function checkProfileCompletion(
  profile: UserProfile | null
): ProfileCompletionStatus {
  if (!profile) {
    return {
      isComplete: false,
      missingFields: [...REQUIRED_FIELDS],
      completionPercentage: 0,
    };
  }

  const missingFields: string[] = [];

  REQUIRED_FIELDS.forEach((field) => {
    const value = profile[field as keyof UserProfile];
    if (!value || value === '') {
      missingFields.push(field);
    }
  });

  const completionPercentage = Math.round(
    ((REQUIRED_FIELDS.length - missingFields.length) / REQUIRED_FIELDS.length) * 100
  );

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage,
  };
}

/**
 * Get friendly field name in Ukrainian
 */
export function getFieldLabel(fieldName: string): string {
  return FIELD_LABELS[fieldName] || fieldName;
}
