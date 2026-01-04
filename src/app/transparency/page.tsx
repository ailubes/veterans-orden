'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

export default function TransparencyPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ЗВІТНІСТЬ"
        title="ПРОЗОРІСТЬ ТА ЗВІТНІСТЬ"
        description="Довіра — це не слова. Довіра — це механіка."
      />

      <PageContent narrow>
        <p>
          Орден Ветеранів будує роботу так, щоб будь-яка підтримка мала зрозумілий сенс і контроль. Ми усвідомлюємо: люди втомилися від "фондів без результату" і організацій, де гроші зникають у тумані. Тому наша позиція проста: <strong>прозорість має бути правилом, а не обіцянкою</strong>.
        </p>

        <h2>Ми публікуємо:</h2>

        <ul>
          <li><strong>цілі зборів</strong> (на що саме потрібні кошти / ресурси);</li>
          <li><strong>підтвердження юридичного статусу</strong> (статут, неприбутковість, реквізити);</li>
          <li><strong>звітність за програмами</strong> (у міру можливостей і без порушення безпеки людей);</li>
          <li><strong>партнерства та джерела підтримки</strong> — коли це можливо публічно.</li>
        </ul>

        <h2>Як ми звітуємо:</h2>

        <p>Ми використовуємо кілька рівнів звітності:</p>

        <ol>
          <li><strong>Публічний рівень</strong> — короткі звіти на сайті (цілі, виконання, результати).</li>
          <li><strong>Партнерський рівень</strong> — деталізовані звіти для донорів/партнерів (за домовленістю).</li>
          <li><strong>Внутрішній рівень</strong> — контроль витрат і рішень у межах Тріади та внутрішніх процедур.</li>
        </ol>

        <h2>Важливий баланс:</h2>

        <p>Ми не публікуємо дані, які можуть:</p>

        <ul>
          <li>нашкодити ветеранам або їхнім родинам,</li>
          <li>розкрити чутливу інформацію,</li>
          <li>створити ризики безпеці.</li>
        </ul>

        <p>
          Прозорість не повинна ставати "вітриною", яка шкодить людям. Ми тримаємо баланс: <strong>звітність — так, небезпека — ні</strong>.
        </p>
      </PageContent>

      <section className="section cta-section-support">
        <Scaffold>
          <div className="col-span-8">
            <h2 className="cta-title">Хочете підтримати конкретний напрям?</h2>
            <p className="cta-desc">
              Обирайте ціль у розділі "Підтримати" або напишіть нам з темою "Цільова підтримка".
            </p>
            <CtaGroup>
              <HeavyCta href="/support" variant="primary">
                ПІДТРИМАТИ
              </HeavyCta>
              <HeavyCta href="/documents" variant="outline">
                ДОКУМЕНТИ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
