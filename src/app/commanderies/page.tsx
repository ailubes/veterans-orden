'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

export default function CommanderiesPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// РЕГІОНАЛЬНА СТРУКТУРА"
        title="ОСЕРЕДКИ (КОМАНДЕРІЇ)"
        description="Масштабування без хаосу: структура, яка працює в кожному місті."
      />

      <PageContent narrow>
        <p>
          Орден Ветеранів створює осередки там, де є люди, готові взяти відповідальність. Осередок — це не "чат у месенджері". Це <strong>локальна точка сили</strong>, яка має:
        </p>

        <ul>
          <li>координатора,</li>
          <li>перелік задач,</li>
          <li>регулярні зустрічі/події,</li>
          <li>зв'язок із центральними напрямами,</li>
          <li>зрозумілу звітність.</li>
        </ul>

        <p>
          Ми називаємо осередки <strong>Командеріями</strong>, щоб підкреслити головне: це про дисципліну та порядок, а не про формальність.
        </p>

        <h2>Навіщо потрібні осередки:</h2>

        <ol>
          <li>Щоб допомога була поруч, а не "десь у столиці".</li>
          <li>Щоб ветерани бачили людей, яким можна довіряти.</li>
          <li>Щоб ініціативи не зависали — а виконувались локально.</li>
          <li>Щоб будувати мережу, де кожен відчуває себе частиною системи.</li>
        </ol>

        <h2>Мінімальний стандарт Командерії (MVP):</h2>

        <ul>
          <li>1 координатор і 2–5 активних людей;</li>
          <li>1 регулярна зустріч (онлайн/офлайн) на місяць;</li>
          <li>1 локальна дія на місяць (подія, підтримка, ініціатива);</li>
          <li>базова звітність: "що зробили / що плануємо / що потрібно".</li>
        </ul>

        <h2>Як створити осередок:</h2>

        <ol>
          <li>Подати заявку "Створення Командерії".</li>
          <li>Коротка співбесіда з Віце-президентом або координатором напрямів.</li>
          <li>Узгодження рамок: цілі, люди, процеси.</li>
          <li>Запуск MVP на 60 днів.</li>
          <li>Після підтвердження ефективності — офіційна інтеграція.</li>
        </ol>
      </PageContent>

      <section className="section cta-section-support">
        <Scaffold>
          <div className="col-span-8">
            <h2 className="cta-title">Хочете створити Командерію у своєму місті?</h2>
            <p className="cta-desc">
              Напишіть нам з темою "Осередок / Командерія".
            </p>
            <CtaGroup>
              <HeavyCta href="/contacts" variant="primary">
                ЗВ'ЯЗАТИСЯ
              </HeavyCta>
              <HeavyCta href="/join" variant="outline">
                ПРИЄДНАТИСЯ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
