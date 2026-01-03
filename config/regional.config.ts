/**
 * Regional Configuration
 *
 * Defines the geographic/organizational structure for Order of Veterans.
 * Uses a commandery-based system (комендатури) instead of administrative oblasts.
 */

export type RegionalStructure = 'oblasts' | 'commanderies';
export type RegionType = 'commandery' | 'city';

interface RegionUnit {
  code: string;
  name: string;
  type: RegionType;
  parent?: string | null;
}

export const regionalConfig = {
  // Structure type
  type: 'commanderies' as RegionalStructure,

  // Database configuration
  tableName: 'commanderies',
  relationField: 'commanderyId',

  // Commandery units (macro-regions + major cities)
  units: [
    // Macro-regions (5 main commanderies)
    {
      code: 'CMD-NORTH',
      name: 'Північна комендатура',
      type: 'commandery',
      parent: null,
    },
    {
      code: 'CMD-SOUTH',
      name: 'Південна комендатура',
      type: 'commandery',
      parent: null,
    },
    {
      code: 'CMD-WEST',
      name: 'Західна комендатура',
      type: 'commandery',
      parent: null,
    },
    {
      code: 'CMD-EAST',
      name: 'Східна комендатура',
      type: 'commandery',
      parent: null,
    },
    {
      code: 'CMD-CENTER',
      name: 'Центральна комендатура',
      type: 'commandery',
      parent: null,
    },

    // Major city commanderies
    {
      code: 'CMD-KYIV',
      name: 'Київська комендатура',
      type: 'city',
      parent: 'CMD-CENTER',
    },
    {
      code: 'CMD-ODESA',
      name: 'Одеська комендатура',
      type: 'city',
      parent: 'CMD-SOUTH',
    },
    {
      code: 'CMD-LVIV',
      name: 'Львівська комендатура',
      type: 'city',
      parent: 'CMD-WEST',
    },
    {
      code: 'CMD-KHARKIV',
      name: 'Харківська комендатура',
      type: 'city',
      parent: 'CMD-EAST',
    },
    {
      code: 'CMD-DNIPRO',
      name: 'Дніпровська комендатура',
      type: 'city',
      parent: 'CMD-EAST',
    },
    {
      code: 'CMD-MYKOLAIV',
      name: 'Миколаївська комендатура',
      type: 'city',
      parent: 'CMD-SOUTH',
    },
    {
      code: 'CMD-ZAPORIZHZHIA',
      name: 'Запорізька комендатура',
      type: 'city',
      parent: 'CMD-SOUTH',
    },
    {
      code: 'CMD-CHERNIHIV',
      name: 'Чернігівська комендатура',
      type: 'city',
      parent: 'CMD-NORTH',
    },
    {
      code: 'CMD-SUMY',
      name: 'Сумська комендатура',
      type: 'city',
      parent: 'CMD-NORTH',
    },
    {
      code: 'CMD-POLTAVA',
      name: 'Полтавська комендатура',
      type: 'city',
      parent: 'CMD-CENTER',
    },
  ] as RegionUnit[],

  // UI labels
  labels: {
    singular: 'комендатура',
    plural: 'комендатури',
    leader: 'Комендант',
    group: 'Підрозділ',
    member: 'Боєць',
  },
} as const;

export type RegionalConfig = typeof regionalConfig;
