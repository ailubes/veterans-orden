'use client';

import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export default function JoinPage() {
  return (
    <PageLayout>
      {/* Breadcrumb */}
      <section className="section-sm">
        <Scaffold>
          <div className="col-span-full">
            <Breadcrumb
              items={[
                { label: 'Головна', href: '/' },
                { label: 'Приєднатися' },
              ]}
            />
          </div>
        </Scaffold>
      </section>

      <PageHeader
        subtitle="// ДОЛУЧИТИСЯ"
        title="ПРИЄДНАТИСЯ ДО ОРДЕНУ"
        description="Два формати участі: відкрита Спільнота або закрите ядро Ордену. Обери свій шлях."
      />

      <PageContent narrow>
        <p>
          Орден Ветеранів — це не просто організація, а братерство з чіткою структурою, правилами та місією.
          Ми пропонуємо два формати участі, щоб кожен міг знайти своє місце.
        </p>
      </PageContent>

      {/* Two Membership Options */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <div className="join-options-grid">
              {/* Option 1: Community */}
              <div className="join-option">
                <div className="join-option-header">
                  <span className="join-option-label">// ФОРМАТ 1</span>
                  <h3 className="join-option-title">СПІЛЬНОТА</h3>
                  <span className="join-option-badge">ВІДКРИТА</span>
                </div>
                <div className="join-option-body">
                  <p className="join-option-desc">
                    Для тих, хто хоче бути поруч: підтримувати, волонтерити, долучатись до подій та ініціатив.
                  </p>
                  <ul className="join-option-list">
                    <li>Участь у відкритих подіях</li>
                    <li>Доступ до спільноти контактів</li>
                    <li>Волонтерські можливості</li>
                    <li>Інформаційна підтримка</li>
                  </ul>
                  <div className="join-option-requirements">
                    <span className="join-option-req-label">Вимоги:</span>
                    <p>Заява + базова верифікація</p>
                  </div>
                </div>
                <div className="join-option-footer">
                  <HeavyCta href="/sign-up" variant="outline" size="lg" className="join-option-cta">
                    ПОДАТИ ЗАЯВУ
                  </HeavyCta>
                </div>
              </div>

              {/* Option 2: Order */}
              <div className="join-option join-option--dark">
                <div className="join-option-header">
                  <span className="join-option-label">// ФОРМАТ 2</span>
                  <h3 className="join-option-title">ОРДЕН</h3>
                  <span className="join-option-badge join-option-badge--bronze">ЯДРО</span>
                </div>
                <div className="join-option-body">
                  <p className="join-option-desc">
                    Для тих, хто готовий до дисципліни, місій, внутрішніх правил та служіння структурі.
                  </p>
                  <ul className="join-option-list">
                    <li>Повний доступ до ресурсів Ордену</li>
                    <li>Участь у внутрішніх місіях</li>
                    <li>Голос у прийнятті рішень</li>
                    <li>Захист та підтримка братерства</li>
                  </ul>
                  <div className="join-option-requirements">
                    <span className="join-option-req-label">Вимоги:</span>
                    <p>Запрошення або процедура відбору + випробування + Присяга</p>
                  </div>
                </div>
                <div className="join-option-footer">
                  <HeavyCta href="/join/procedure" variant="primary" size="lg" className="join-option-cta">
                    ДІЗНАТИСЯ ПРОЦЕДУРУ
                  </HeavyCta>
                </div>
              </div>
            </div>
          </div>
        </Scaffold>
      </section>

      {/* Why join */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// ЧОМУ ОРДЕН</span>
            <h2 className="section-title">Що дає членство</h2>
          </div>
          <div className="col-span-8">
            <div className="page-content">
              <p>
                <strong>Братерство.</strong> Не абстрактне "ком'юніті", а реальні люди, які прийдуть на допомогу.
                Ті, хто розуміє без зайвих пояснень.
              </p>
              <p>
                <strong>Ресурси.</strong> Доступ до мережі контактів, експертизи, можливостей.
                Від юридичних консультацій до допомоги з працевлаштуванням.
              </p>
              <p>
                <strong>Вплив.</strong> Можливість впливати на систему через колективну дію.
                Голос, який чують, бо за ним стоїть структура.
              </p>
              <p>
                <strong>Сенс.</strong> Місія, яка виходить за межі особистого.
                Служіння чомусь більшому, ніж ти сам.
              </p>
            </div>
          </div>
        </Scaffold>
      </section>

      {/* FAQ-like section */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// ПИТАННЯ</span>
            <h2 className="section-title">Часті запитання</h2>
          </div>
          <div className="col-span-8">
            <div className="page-content">
              <p>
                <strong>Хто може приєднатися?</strong><br />
                Військовий, ветеран, член родини Воїна, або Патріот, який підтримує Ідею Ордену та готовий прийняти Присягу.
              </p>
              <p>
                <strong>Чи потрібно платити внески?</strong><br />
                Членство у Спільноті безкоштовне. Для членів Ордену передбачені символічні внески на підтримку діяльності.
              </p>
              <p>
                <strong>Скільки часу займає процедура?</strong><br />
                Для Спільноти — кілька днів на верифікацію. Для Ордену — від кількох тижнів до місяців, залежно від процедури відбору.
              </p>
            </div>
          </div>
        </Scaffold>
      </section>

      {/* Final CTA */}
      <section className="section-lg cta-section-join">
        <Scaffold>
          <div className="col-span-8 col-start-3" style={{ textAlign: 'center' }}>
            <h2 className="cta-title">Готовий долучитися?</h2>
            <p className="cta-desc">
              Обери свій формат участі та зроби перший крок.
            </p>
            <CtaGroup align="center">
              <HeavyCta href="/sign-up" variant="primary" size="lg">
                ЗАРЕЄСТРУВАТИСЯ
              </HeavyCta>
              <HeavyCta href="/contacts" variant="outline" size="lg">
                ЗАДАТИ ПИТАННЯ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>

      <style jsx>{`
        .join-options-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 768px) {
          .join-options-grid {
            grid-template-columns: 1fr;
          }
        }

        .join-option {
          display: flex;
          flex-direction: column;
          background: var(--panel-900);
          border: 1px solid var(--line);
          border-radius: var(--radius);
          overflow: hidden;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }

        .join-option:hover {
          border-color: var(--bronze);
          transform: translateY(-4px);
        }

        .join-option--dark {
          background: linear-gradient(180deg, var(--panel-850) 0%, var(--bg-950) 100%);
          border-color: var(--bronze);
        }

        .join-option-header {
          padding: 2rem 2rem 1.5rem;
          border-bottom: 1px solid var(--line);
          position: relative;
        }

        .join-option-label {
          display: block;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--bronze);
          margin-bottom: 0.75rem;
        }

        .join-option-title {
          font-family: 'Inter', sans-serif;
          font-size: 1.75rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: var(--text-100);
          margin: 0;
        }

        .join-option-badge {
          display: inline-block;
          margin-top: 0.75rem;
          padding: 0.35rem 0.75rem;
          background: var(--panel-850);
          border: 1px solid var(--line);
          border-radius: 999px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--text-200);
        }

        .join-option-badge--bronze {
          background: rgba(181, 121, 58, 0.15);
          border-color: var(--bronze);
          color: var(--bronze);
        }

        .join-option-body {
          flex: 1;
          padding: 1.5rem 2rem;
        }

        .join-option-desc {
          font-size: 1rem;
          line-height: 1.6;
          color: var(--text-200);
          margin-bottom: 1.5rem;
        }

        .join-option-list {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem 0;
        }

        .join-option-list li {
          position: relative;
          padding-left: 1.25rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: var(--text-200);
        }

        .join-option-list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.5em;
          width: 6px;
          height: 6px;
          background: var(--bronze);
        }

        .join-option-requirements {
          padding-top: 1rem;
          border-top: 1px solid var(--line);
        }

        .join-option-req-label {
          display: block;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--muted-500);
          margin-bottom: 0.25rem;
        }

        .join-option-requirements p {
          font-size: 0.85rem;
          color: var(--text-100);
          margin: 0;
        }

        .join-option-footer {
          padding: 1.5rem 2rem 2rem;
        }

        .join-option-footer :global(.heavy-cta) {
          width: 100%;
          justify-content: center;
        }
      `}</style>
    </PageLayout>
  );
}
