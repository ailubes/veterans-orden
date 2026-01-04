'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { SectionCard } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

export default function MediaPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ДЛЯ ПРЕСИ"
        title="МЕДІА ТА ПРЕС-КІТ"
        description="Офіційна інформація для журналістів, партнерів і публічних комунікацій."
      />

      <PageContent narrow>
        <p>
          Ця сторінка створена для того, щоб будь-яка публікація про Орден Ветеранів була точною, коректною і не шкодила людям. Ми відкриті до комунікації, але працюємо в реальності, де безпека та приватність — не дрібниця.
        </p>

        <h2>Короткий опис для ЗМІ:</h2>

        <p style={{ padding: '1.5rem', background: 'var(--bg-elevated)', border: '2px solid var(--border-color)' }}>
          <strong>Орден Ветеранів</strong> — громадська організація, що поєднує спільноту підтримки та дисципліноване ядро дії. Основні напрямки: адаптація ветеранів, правовий захист, психологічна підтримка, наставництво, громадянські кампанії та взаємодопомога. Управління побудоване на Тріаді та внутрішніх процедурах, включно із Судом Честі.
        </p>

        <h2>Що ми просимо враховувати:</h2>

        <ul>
          <li>Не розкривати персональні дані ветеранів без їхньої згоди.</li>
          <li>Узгоджувати публікацію фото/відео з людьми на матеріалах.</li>
          <li>Не публікувати деталі, які можуть створити ризики безпеці.</li>
        </ul>

        <h2>Матеріали для завантаження:</h2>

        <ul>
          <li>Логотипи (PNG/SVG)</li>
          <li>Бренд-гайд (PDF)</li>
          <li>Офіційні фото (за наявності)</li>
          <li>Контакти для медіа</li>
        </ul>

        <p style={{ opacity: 0.7, fontStyle: 'italic' }}>
          Матеріали будуть додані після завершення організаційного етапу.
        </p>
      </PageContent>

      <section className="section">
        <Scaffold>
          <div className="col-span-8">
            <SectionCard
              title="Контакт для медіа"
              subtitle="// ПРЕС-СЛУЖБА"
              variant="dark"
            >
              <p style={{ marginBottom: '1rem' }}>
                Email: <a href="mailto:media@veterans-orden.org" style={{ color: 'var(--bronze)', textDecoration: 'underline' }}>media@veterans-orden.org</a>
              </p>
              <p style={{ opacity: 0.7, fontSize: '14px' }}>
                Ми відповідаємо на медіа-запити протягом 24-48 годин.
              </p>
            </SectionCard>
          </div>
        </Scaffold>
      </section>

      <section className="section cta-section-support">
        <Scaffold>
          <div className="col-span-8">
            <h2 className="cta-title">Запит для інтерв'ю або коментаря?</h2>
            <p className="cta-desc">
              Надішліть звернення з темою "Медіа" — ми відповімо і запропонуємо формат.
            </p>
            <CtaGroup>
              <HeavyCta href="/contacts" variant="primary">
                КОНТАКТИ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
