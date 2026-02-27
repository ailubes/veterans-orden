import { createClient } from '@/lib/supabase/server';

export interface OrgSettings {
  organization_name: string;
  organization_contact_email: string;
  organization_contact_phone: string;
  organization_about: string;
  organization_address: string;
  organization_edrpou: string;
  organization_bank_name: string;
  organization_bank_mfo: string;
  organization_bank_iban: string;
  organization_bank_address: string;
}

const DEFAULTS: OrgSettings = {
  organization_name: 'Громадська організація «Орден Ветеранів»',
  organization_contact_email: 'info@ordenv.org',
  organization_contact_phone: '',
  organization_about: '',
  organization_address: '',
  organization_edrpou: '14282829',
  organization_bank_name: 'АТ «ПЕРШИЙ УКРАЇНСЬКИЙ МІЖНАРОДНИЙ БАНК»',
  organization_bank_mfo: '334851',
  organization_bank_iban: 'UA383348510000000026007327586',
  organization_bank_address: '04070, Україна, м. Київ, вул. Андріївська, 4',
};

export async function getOrgSettings(): Promise<OrgSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('organization_settings')
      .select('key, value')
      .in('key', Object.keys(DEFAULTS));

    if (!data?.length) return DEFAULTS;

    const map = new Map(data.map((r) => [r.key, r.value]));
    return {
      organization_name: String(map.get('organization_name') ?? DEFAULTS.organization_name),
      organization_contact_email: String(map.get('organization_contact_email') ?? DEFAULTS.organization_contact_email),
      organization_contact_phone: String(map.get('organization_contact_phone') ?? DEFAULTS.organization_contact_phone),
      organization_about: String(map.get('organization_about') ?? DEFAULTS.organization_about),
      organization_address: String(map.get('organization_address') ?? DEFAULTS.organization_address),
      organization_edrpou: String(map.get('organization_edrpou') ?? DEFAULTS.organization_edrpou),
      organization_bank_name: String(map.get('organization_bank_name') ?? DEFAULTS.organization_bank_name),
      organization_bank_mfo: String(map.get('organization_bank_mfo') ?? DEFAULTS.organization_bank_mfo),
      organization_bank_iban: String(map.get('organization_bank_iban') ?? DEFAULTS.organization_bank_iban),
      organization_bank_address: String(map.get('organization_bank_address') ?? DEFAULTS.organization_bank_address),
    };
  } catch {
    return DEFAULTS;
  }
}
