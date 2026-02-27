import type { Metadata } from 'next';
import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';
import { getOrgSettings } from '@/lib/settings/org-settings';
import { createServiceClient } from '@/lib/supabase/server';
import { Download, FileIcon } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Документи — Орден Ветеранів',
  description: 'Офіційні документи, реквізити та юридична інформація ГО «Орден Ветеранів».',
};

interface OrgDocument {
  id: string;
  name: string;
  url: string;
  mime_type: string | null;
  size_bytes: number | null;
}

async function getDocumentsByCategory() {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from('organization_documents')
      .select('id, name, url, mime_type, size_bytes, category')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (!data) return { documents: [], media: [], press_kit: [] };

    return {
      documents: data.filter(d => d.category === 'documents') as OrgDocument[],
      media: data.filter(d => d.category === 'media') as OrgDocument[],
      press_kit: data.filter(d => d.category === 'press_kit') as OrgDocument[],
    };
  } catch {
    return { documents: [], media: [], press_kit: [] };
  }
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1048576) return ` (${(bytes / 1024).toFixed(0)} КБ)`;
  return ` (${(bytes / 1048576).toFixed(1)} МБ)`;
}

function DocList({ items }: { items: OrgDocument[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="not-prose space-y-2 mb-4">
      {items.map(doc => (
        <li key={doc.id}>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center gap-2 text-sm text-bronze hover:underline"
          >
            {doc.mime_type?.startsWith('image/') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={doc.url} alt={doc.name} className="w-16 h-16 object-cover rounded border border-line shrink-0" />
            ) : (
              <FileIcon className="w-4 h-4 shrink-0" />
            )}
            <span>{doc.name}{formatBytes(doc.size_bytes)}</span>
            <Download className="w-3.5 h-3.5 shrink-0 opacity-60" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export default async function DocumentsPage() {
  const [org, { documents, media, press_kit }] = await Promise.all([
    getOrgSettings(),
    getDocumentsByCategory(),
  ]);

  return (
    <PageLayout>
      <PageHeader
        subtitle="// ДОКУМЕНТИ"
        title="СТАТУТ, РЕКВІЗИТИ, ЗВІТИ"
        description="Офіційні документи організації для ознайомлення та завантаження."
      />

      <PageContent narrow>
        <h2>Документи</h2>
        {documents.length > 0 ? (
          <DocList items={documents} />
        ) : (
          <ul>
            <li>Статут організації</li>
            <li>Рішення про реєстрацію</li>
            <li>Кодекс Честі</li>
            <li>Положення про Суд Честі</li>
            <li>Положення про членство</li>
            <li>Річний звіт 2024</li>
            <li>Фінансова звітність</li>
          </ul>
        )}

        {media.length > 0 && (
          <>
            <h2>Медіа</h2>
            <DocList items={media} />
          </>
        )}

        {press_kit.length > 0 && (
          <>
            <h2>Прес-кіт</h2>
            <DocList items={press_kit} />
          </>
        )}

        {documents.length === 0 && (
          <p>
            <em>
              Для отримання документів зверніться до адміністрації:{' '}
              <a href={`mailto:${org.organization_contact_email}`} className="text-bronze hover:underline">
                {org.organization_contact_email}
              </a>
            </em>
          </p>
        )}

        <hr />

        <h2>Реквізити організації</h2>

        <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-sm mt-4">
          <dt className="text-muted-500">Отримувач</dt>
          <dd className="font-medium">{org.organization_name}</dd>

          {org.organization_edrpou && (
            <>
              <dt className="text-muted-500">ЄДРПОУ</dt>
              <dd className="font-mono">{org.organization_edrpou}</dd>
            </>
          )}

          {org.organization_address && (
            <>
              <dt className="text-muted-500">Адреса організації</dt>
              <dd>{org.organization_address}</dd>
            </>
          )}

          {org.organization_bank_iban && (
            <>
              <dt className="text-muted-500">Рахунок (IBAN)</dt>
              <dd className="font-mono break-all">{org.organization_bank_iban}</dd>
            </>
          )}

          <dt className="text-muted-500">Валюта</dt>
          <dd>980 — Гривня (UAH)</dd>

          {org.organization_bank_name && (
            <>
              <dt className="text-muted-500">Банк отримувача</dt>
              <dd>{org.organization_bank_name}</dd>
            </>
          )}

          {org.organization_bank_mfo && (
            <>
              <dt className="text-muted-500">МФО</dt>
              <dd className="font-mono">{org.organization_bank_mfo}</dd>
            </>
          )}

          {org.organization_bank_address && (
            <>
              <dt className="text-muted-500">Адреса банку</dt>
              <dd>{org.organization_bank_address}</dd>
            </>
          )}
        </dl>
      </PageContent>

      <section className="section cta-section-support">
        <Scaffold>
          <div className="col-span-8">
            <h2 className="cta-title">Хочете підтримати конкретний напрям?</h2>
            <p className="cta-desc">
              Обирайте ціль у розділі &quot;Підтримати&quot; або напишіть нам з темою &quot;Цільова підтримка&quot;.
            </p>
            <CtaGroup>
              <HeavyCta href="/support" variant="primary">
                ПІДТРИМАТИ
              </HeavyCta>
              <HeavyCta href="/offer" variant="outline">
                ПУБЛІЧНА ОФЕРТА
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
