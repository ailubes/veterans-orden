'use client';

import Link from 'next/link';
import { PageWrapper, Scaffold } from '@/components/layout/skeleton-grid';
import { NavigationNew } from '@/components/layout/navigation-new';
import { FooterNew } from '@/components/layout/footer-new';
import { HeroNew } from '@/components/sections/hero-new';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';
import { ImpactSlider } from '@/components/sections/impact-slider';
import { getFeaturedArticles } from '@/data/news';

/**
 * Homepage - Order of Veterans
 *
 * Matching docs/index.html reference design with all sections
 */
export default function HomePage() {
  return (
    <PageWrapper>
      <NavigationNew />

      {/* Hero Section */}
      <HeroNew />

      {/* Stats Section - Matching docs/index.html */}
      <section className="stats-section">
        <Scaffold>
          <div className="col-span-4 stat-card">
            <span className="mono">НАПРЯМИ_ПІДТРИМКИ</span>
            <span className="stat-value">06</span>
            <p className="stat-desc">адаптація, право, психологія, наставництво, спільнота, адвокація</p>
          </div>
          <div className="col-span-4 stat-card stat-card--accent">
            <span className="mono">ПОРЯДОК_ВСЕРЕДИНІ</span>
            <span className="stat-value">СУД</span>
            <p className="stat-desc">Суд Честі — механізм вирішення спорів і захисту репутації</p>
          </div>
          <div className="col-span-4 stat-card">
            <span className="mono">ПРИНЦИП</span>
            <span className="stat-value">ЧЕСТЬ</span>
            <p className="stat-desc">законність, дисципліна, братерство, відповідальність</p>
          </div>
        </Scaffold>
      </section>

      {/* Impact Slider Section */}
      <ImpactSlider />

      {/* About Section - 3 Cards */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// ХТО МИ</span>
            <h2 className="section-title">Орден Ветеранів — структура, яка живе довго</h2>
            <p className="section-desc">
              Ми будуємо спільноту підтримки та елітне ядро Ордену. В основі — честь, дисципліна і взаємодопомога.
              Управління здійснюється через Тріаду, а внутрішні спори вирішуються Судом Честі.
            </p>
          </div>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              <SectionCard
                title="СПІЛЬНОТА"
                subtitle="// ВІДКРИТИЙ ФОРМАТ"
                href="/join"
              >
                Відкрите громадське крило: участь у подіях, підтримка ініціатив, волонтерство, навчання, взаємодопомога.
                <div className="pill" style={{ marginTop: '1rem' }}>Вступ: заява + символ організації</div>
              </SectionCard>
              <SectionCard
                title="ОРДЕН"
                subtitle="// ЯДРО"
                href="/join/procedure"
                variant="dark"
              >
                Дисципліноване ядро: операційна дія, координація, безпека, підтримка спільноти, виконання місій.
                <div className="pill" style={{ marginTop: '1rem' }}>Вступ: запрошення + випробування + посвята</div>
              </SectionCard>
              <SectionCard
                title="СУД ЧЕСТІ"
                subtitle="// АРБІТРАЖ"
                href="/honor-court"
              >
                Внутрішній арбітраж: примирення, дисциплінарні рішення, захист честі та репутації, порядок замість хаосу.
                <div className="pill" style={{ marginTop: '1rem' }}>Принцип: "спочатку діалог"</div>
              </SectionCard>
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      {/* Directions Section - 6 Programs */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// НАПРЯМИ РОБОТИ</span>
            <h2 className="section-title">Що ми робимо</h2>
          </div>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              <SectionCard
                title="АДАПТАЦІЯ"
                subtitle="// НАПРЯМ"
                href="/directions"
                variant="dark"
              >
                Підтримка переходу до цивільного життя, наставництво, спільнота контактів, супровід.
              </SectionCard>
              <SectionCard
                title="ПРАВОВИЙ ЗАХИСТ"
                subtitle="// НАПРЯМ"
                href="/directions"
                variant="dark"
              >
                Консультації, звернення, супровід кейсів, захист прав ветеранів і родин.
              </SectionCard>
              <SectionCard
                title="ПСИХОЛОГІЧНА ПІДТРИМКА"
                subtitle="// НАПРЯМ"
                href="/directions"
                variant="dark"
              >
                Скринінг, перенаправлення до фахівців, групи підтримки, кризові контакти.
              </SectionCard>
              <SectionCard
                title="ОСВІТА & НАСТАВНИЦТВО"
                subtitle="// НАПРЯМ"
                href="/directions"
                variant="dark"
              >
                Навчальні події, тренінги, розвиток лідерів, робота "мислителів".
              </SectionCard>
              <SectionCard
                title="ГРОМАДЯНСЬКІ КАМПАНІЇ"
                subtitle="// НАПРЯМ"
                href="/directions"
                variant="dark"
              >
                Адвокація, публічні звернення, комунікаційні кампанії, контроль виконання рішень.
              </SectionCard>
              <SectionCard
                title="ВЗАЄМОДОПОМОГА"
                subtitle="// НАПРЯМ"
                href="/directions"
                variant="dark"
              >
                Підтримка побратимів, волонтерські місії, координація ресурсів, партнерства.
              </SectionCard>
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      {/* News Section */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <div className="news-section-header">
              <div>
                <span className="mono section-kicker">// НОВИНИ</span>
                <h2 className="section-title">Останні оновлення</h2>
              </div>
              <Link href="/news" className="news-all-link">
                ВСІ НОВИНИ →
              </Link>
            </div>
          </div>
          <div className="col-span-full">
            <div className="news-grid">
              {getFeaturedArticles(3).map((article, index) => (
                <Link
                  key={article.slug}
                  href={`/news/${article.slug}`}
                  className={`news-card ${index === 0 ? 'news-card--featured' : ''}`}
                >
                  <span className="news-card-category">{article.category}</span>
                  <h3 className="news-card-title">{article.title}</h3>
                  <p className="news-card-excerpt">{article.excerpt}</p>
                  <div className="news-card-footer">
                    <span className="news-card-date">{article.date}</span>
                    <span className="news-card-read">ЧИТАТИ →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Scaffold>
      </section>

      {/* Join CTA Section */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// CTA</span>
            <h2 className="section-title">Долучайся до Ордену Ветеранів</h2>
            <p className="section-desc">
              Є два шляхи: Спільнота (відкрита) та Орден (за запрошенням). Обери формат участі — і ми зв'яжемось з тобою.
            </p>
          </div>
          <div className="col-span-full" style={{ marginTop: '1rem' }}>
            <CtaGroup>
              <HeavyCta href="/join" variant="primary" size="lg">
                ПОДАТИ ЗАЯВУ (СПІЛЬНОТА)
              </HeavyCta>
              <HeavyCta href="/join/procedure" variant="outline" size="lg">
                ЗАПИТ НА ЗАПРОШЕННЯ (ОРДЕН)
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>

      {/* Support CTA Section */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// ПІДТРИМКА</span>
            <h2 className="section-title">Підтримати діяльність</h2>
            <p className="section-desc">
              Підтримка Ордену Ветеранів — це внесок у конкретну систему: підтримку ветеранів, адаптацію, захист прав, психологічні маршрути та громадянські ініціативи.
            </p>
          </div>
          <div className="col-span-full" style={{ marginTop: '1rem' }}>
            <CtaGroup>
              <HeavyCta href="/support" variant="primary" size="lg">
                ЗРОБИТИ ВНЕСОК
              </HeavyCta>
              <HeavyCta href="/documents" variant="outline" size="lg">
                ПЕРЕГЛЯНУТИ ДОКУМЕНТИ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>

      {/* Help CTA Section */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// ДОПОМОГА</span>
            <h2 className="section-title">Потрібна допомога?</h2>
            <p className="section-desc">
              Залиш заявку — ми відповімо та зорієнтуємо: адаптація, правовий захист, психологічна підтримка або перенаправлення до партнерів.
            </p>
          </div>
          <div className="col-span-full" style={{ marginTop: '1rem' }}>
            <CtaGroup>
              <HeavyCta href="/help-request" variant="primary" size="lg">
                ЗАЛИШИТИ ЗАЯВКУ
              </HeavyCta>
              <HeavyCta href="/contacts" variant="outline" size="lg">
                КОНТАКТИ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>

      {/* Documents Section */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// ДОКУМЕНТИ</span>
            <h2 className="section-title">Статут, неприбутковість, звіти</h2>
            <p className="section-desc">
              Тут розміщуються офіційні документи: статут, рішення про неприбутковість, політики, звіти та реквізити.
            </p>
          </div>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              <SectionCard
                title="СТАТУТ"
                subtitle="// ДОКУМЕНТ"
                href="/documents"
                variant="dark"
              >
                Офіційний установчий документ організації (PDF).
              </SectionCard>
              <SectionCard
                title="НЕПРИБУТКОВІСТЬ"
                subtitle="// ДОКУМЕНТ"
                href="/documents"
                variant="dark"
              >
                Підтвердження включення до Реєстру неприбуткових установ та організацій (PDF).
              </SectionCard>
              <SectionCard
                title="ЗВІТНІСТЬ"
                subtitle="// ДОКУМЕНТ"
                href="/transparency"
                variant="dark"
              >
                Публічні звіти, прозорість, цілі зборів (за наявності).
              </SectionCard>
            </SectionCardGrid>
          </div>
        </Scaffold>
      </section>

      {/* Contact Section */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// КОНТАКТИ</span>
            <h2 className="section-title">Зв'язатися з нами</h2>
            <p className="section-desc">
              Напишіть нам для участі, запиту допомоги, партнерства, медіа-запитів або пропозицій проєктів.
            </p>
          </div>
          <div className="col-span-full" style={{ marginTop: '1rem' }}>
            <CtaGroup>
              <HeavyCta href="/contacts" variant="primary" size="lg">
                КОНТАКТИ
              </HeavyCta>
              <HeavyCta href="/faq" variant="outline" size="lg">
                FAQ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>

      <FooterNew />
    </PageWrapper>
  );
}
