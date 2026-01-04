'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';

export default function PresidentPage() {
  return (
    <PageLayout>
      <PageHeader
        subtitle="// ТРІАДА УПРАВЛІННЯ"
        title="ПРЕЗИДЕНТ ОРДЕНУ ВЕТЕРАНІВ"
        description="Виконавча відповідальність. Представництво. Легітимність рішень."
      />

      <PageContent narrow>
        <p>
          Президент — це людина, яка несе <strong>персональну відповідальність</strong> за те, щоб організація була живою, законною та ефективною. Це не "титул" і не "роль для фото". Це функція, яка тримає систему в цілості: від репутації до управлінської дисципліни.
        </p>

        <h2>Президент:</h2>

        <ul>
          <li>представляє організацію у взаємодії з партнерами, державними структурами, медіа та громадськістю;</li>
          <li>забезпечує виконання ухвалених рішень та контроль ключових процесів;</li>
          <li>відповідає за дотримання принципів Ордену та стратегічної лінії;</li>
          <li>гарантує, що організація діє <strong>в межах права</strong> і не підставляє людей.</li>
        </ul>

        <p>
          У Ордені не існує "культу особи". Президент — частина Тріади, яка працює лише тоді, коли є баланс: виконавча воля, операційна дисципліна і стратегічне мислення.
        </p>
      </PageContent>

      <section className="section cta-section-support">
        <Scaffold>
          <div className="col-span-8">
            <h2 className="cta-title">Хочете поставити питання Президенту?</h2>
            <p className="cta-desc">
              Зверніться через форму контактів або офіційний email організації.
            </p>
            <CtaGroup>
              <HeavyCta href="/contacts" variant="primary">
                КОНТАКТИ
              </HeavyCta>
              <HeavyCta href="/governance" variant="outline">
                ← НАЗАД ДО УПРАВЛІННЯ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>
    </PageLayout>
  );
}
