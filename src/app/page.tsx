'use client';

import Link from 'next/link';
import { PageWrapper, Scaffold } from '@/components/layout/skeleton-grid';
import { NavigationNew } from '@/components/layout/navigation-new';
import { FooterNew } from '@/components/layout/footer-new';
import { HeroNew } from '@/components/sections/hero-new';
import { SectionCard, SectionCardGrid } from '@/components/ui/section-card';
import { HeavyCta, CtaGroup } from '@/components/ui/heavy-cta';
import { getFeaturedArticles } from '@/data/news';

/**
 * Homepage - Order of Veterans
 *
 * Brotherhood-first framing with Business Incubator as primary focus.
 */

const COMPARISON_PAIRS = [
  {
    not: 'Орден не роздає гуманітарну допомогу.',
    but: '→ Орден – спільнота, яка прийде на допомогу!',
  },
  {
    not: 'Орден не пропонує телефони юристів чи психологів.',
    but: '→ Орден – підставить плече та захистить від свавілля!',
  },
  {
    not: 'Орден - не Якудза.',
    but: '→ Але Орден – організація з жорсткою ієрархією та відданістю членів.',
  },
  {
    not: 'Орден – не Тріади.',
    but: '→ Але Орден - це розповсюджена мережа осередків.',
  },
  {
    not: 'Орден – не Коза Ностра.',
    but: '→ Але Орден - це родина, де внутрішні правила важливіші за зовнішні.',
  },
  {
    not: 'Хто може стати членом Ордену?',
    but: 'Військовий, ветеран, член родини Воїна, або просто патріот, який підтримує Ідею Ордену та прийме Присягу Ордену.',
  },
];

export default function HomePage() {
  return (
    <PageWrapper>
      <NavigationNew />

      {/* Hero Section */}
      <HeroNew />

      {/* Stats Section */}
      <section className="stats-section">
        <Scaffold>
          <div className="col-span-4 stat-card">
            <span className="mono">НАПРЯМИ_ПІДТРИМКИ</span>
            <span className="stat-value">03</span>
            <p className="stat-desc">бізнес-інкубатор, розбудова спільноти, внутрішній порядок</p>
          </div>
          <div className="col-span-4 stat-card stat-card--accent">
            <span className="mono">ПОРЯДОК_ВСЕРЕДИНІ</span>
            <span className="stat-value">НАРАДА</span>
            <p className="stat-desc">Нарада — механізм вирішення спорів і захисту честі братерства</p>
          </div>
          <div className="col-span-4 stat-card">
            <span className="mono">ПРИНЦИП</span>
            <span className="stat-value">ЧЕСТЬ</span>
            <p className="stat-desc">законність, дисципліна, братерство, відповідальність</p>
          </div>
        </Scaffold>
      </section>

      {/* Comparison Module — What the Order is NOT and IS */}
      <section style={{
        background: 'var(--bg-950)',
        borderTop: '1px solid var(--bronze)',
        borderBottom: '1px solid var(--bronze)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Grid lines overlay */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(90deg, var(--line) 1px, transparent 1px), linear-gradient(var(--line) 1px, transparent 1px)',
          backgroundSize: '80px 80px', opacity: 0.3,
        }} />
        {/* Corner joints */}
        <div aria-hidden style={{ position: 'absolute', top: 8, left: 8, width: 6, height: 6, background: 'var(--bronze)' }} />
        <div aria-hidden style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, background: 'var(--bronze)' }} />
        <div aria-hidden style={{ position: 'absolute', bottom: 8, left: 8, width: 6, height: 6, background: 'var(--bronze)' }} />
        <div aria-hidden style={{ position: 'absolute', bottom: 8, right: 8, width: 6, height: 6, background: 'var(--bronze)' }} />

        <Scaffold>
          {/* Header */}
          <div className="col-span-full" style={{ paddingTop: '3rem' }}>
            <span className="mono section-kicker" style={{ color: 'var(--bronze)' }}>// ЩО ТАКЕ ОРДЕН</span>
            <h2 className="section-title" style={{ color: 'var(--text-100)' }}>Не те, що ти думаєш — краще</h2>
          </div>

          {/* Rows */}
          <div className="col-span-full" style={{ paddingBottom: '3rem' }}>
            {COMPARISON_PAIRS.map((pair, i) => (
              <div
                key={i}
                className="comparison-row"
                style={{
                  borderBottom: i < COMPARISON_PAIRS.length - 1 ? '1px solid var(--line)' : 'none',
                  padding: '2rem 0',
                  position: 'relative',
                }}
              >
                {/* Number badge */}
                <span style={{
                  position: 'absolute', top: '2rem', right: 0,
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '0.7rem', fontWeight: 900,
                  background: 'var(--bronze)', color: 'var(--bg-950)',
                  padding: '2px 8px', borderRadius: '999px',
                  letterSpacing: '0.12em',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>

                {/* NOT text with bronze strike bar */}
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem', maxWidth: '85%' }}>
                  <p style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 'clamp(1.3rem, 3vw, 2rem)',
                    fontWeight: 900, letterSpacing: '-0.02em',
                    textTransform: 'uppercase', lineHeight: 1.15,
                    color: 'var(--muted-500)',
                    margin: 0, paddingRight: '3rem',
                  }}>
                    {pair.not}
                  </p>
                  {/* Bronze strikethrough bar */}
                  <span aria-hidden style={{
                    position: 'absolute',
                    left: 0, right: '3rem', top: '50%',
                    height: 3, background: 'var(--bronze)',
                    transform: 'translateY(-50%) rotate(-0.5deg)',
                    opacity: 0.85,
                  }} />
                </div>

                {/* Bronze divider line */}
                <div style={{ width: 48, height: 3, background: 'var(--bronze)', marginBottom: '0.75rem', opacity: 0.6 }} />

                {/* IS affirmation */}
                <p style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
                  fontWeight: 500, lineHeight: 1.65,
                  color: 'var(--text-100)',
                  margin: 0,
                  maxWidth: '72ch',
                }}>
                  {pair.but}
                </p>
              </div>
            ))}
          </div>
        </Scaffold>
      </section>

      {/* 3 CTA Buttons */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full" style={{ textAlign: 'center' }}>
            <CtaGroup align="center">
              <HeavyCta href="/join" variant="primary" size="lg">
                СТАТИ УЧАСНИКОМ
              </HeavyCta>
              <HeavyCta href="/support" variant="secondary" size="lg">
                ПІДТРИМАТИ
              </HeavyCta>
              <HeavyCta href="/help-request" variant="outline" size="lg">
                ПОТРЕБУЮ ДОПОМОГИ
              </HeavyCta>
            </CtaGroup>
          </div>
        </Scaffold>
      </section>

      {/* Business Incubator Section — Main Direction */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// НАПРЯМИ РОБОТИ</span>
            <h2 className="section-title">Головний напрямок — Бізнес-інкубатор</h2>
            <p className="section-desc">
              Ми не готуємо ветеранів до роботи на «дядю». Наш фокус — ветеран як власник власної справи.
              Ми трансформуємо бойовий досвід у бізнес, відповідальність і економічну самостійність.
              Орден уже має успішні приклади ветеранських бізнесів, які працюють і розвиваються.
              Це не теорія — це практика.
            </p>
          </div>
          <div className="col-span-full">
            <SectionCardGrid columns={3}>
              <SectionCard
                title="СТАРТАПИ"
                subtitle="// НАПРЯМ"
                href="/directions"
                variant="dark"
              >
                Орден розробляє та пропонує життєздатні бізнес-моделі, перевірені реальним досвідом.
              </SectionCard>
              <SectionCard
                title="НАВЧАННЯ"
                subtitle="// НАПРЯМ"
                href="/directions"
                variant="dark"
              >
                Орден проводить навчання та дає прикладні знання для створення та управління власним бізнесом.
              </SectionCard>
              <SectionCard
                title="ЛОКАЦІЇ"
                subtitle="// НАПРЯМ"
                href="/directions"
                variant="dark"
              >
                Орден допоможе з пошуком приміщень та землі для старту.
              </SectionCard>
              <SectionCard
                title="ФІНАНСУВАННЯ"
                subtitle="// НАПРЯМ"
                href="/directions"
                variant="dark"
              >
                Орден допоможе у пошуку грантів і підготовці заявок.
              </SectionCard>
              <SectionCard
                title="СУПРОВІД"
                subtitle="// НАПРЯМ"
                href="/directions"
                variant="dark"
              >
                Підтримуємо на ключових етапах. Ми не няньки, але підставляємо плече, коли це справді потрібно.
              </SectionCard>
            </SectionCardGrid>
          </div>
          <div className="col-span-full" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '1.1rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
            }}>
              Ветерани змогли захистити країну. Ветерани мають право на гідне життя.
            </p>
          </div>
        </Scaffold>
      </section>

      {/* Who We Are — 3 Cards */}
      <section className="section">
        <Scaffold>
          <div className="col-span-full">
            <span className="mono section-kicker">// ХТО МИ</span>
            <h2 className="section-title">Орден Ветеранів — структура, яка живе довго</h2>
            <p className="section-desc">
              Ми будуємо спільноту підтримки та елітне ядро Ордену. В основі — честь, дисципліна і взаємодопомога.
              Внутрішні спори вирішуються Нарадою.
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
                title="НАРАДА"
                subtitle="// ВНУТРІШНІЙ ПОРЯДОК"
                href="/governance"
              >
                Внутрішній механізм вирішення спорів та захисту честі. Нарада утримує спільноту від руйнування зсередини та приймає стратегічні рішення.
                <div className="pill" style={{ marginTop: '1rem' }}>Принцип: "спочатку діалог"</div>
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
