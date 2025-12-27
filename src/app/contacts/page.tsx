import Link from 'next/link';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { SkeletonGrid } from '@/components/layout/skeleton-grid';
import { GrainOverlay } from '@/components/layout/grain-overlay';
import { PageHeader } from '@/components/layout/page-header';

const contacts = [
  {
    type: 'EMAIL',
    value: 'info@freepeople.org.ua',
    href: 'mailto:info@freepeople.org.ua',
    description: 'Для загальних питань та пропозицій',
  },
  {
    type: 'ТЕЛЕФОН',
    value: '+38 097 782 6978',
    href: 'tel:+380977826978',
    description: 'Пн-Пт, 10:00-18:00',
  },
  {
    type: 'TELEGRAM',
    value: '@merezha_vilnyh',
    href: 'https://t.me/merezha_vilnyh',
    description: 'Офіційний канал Мережі',
  },
];

const socials = [
  {
    name: 'YouTube',
    handle: '@ZBROIOVYILOBIST',
    href: 'https://www.youtube.com/@ZBROIOVYILOBIST',
    description: 'Збройовий Лобіст — щотижневі випуски',
  },
  {
    name: 'Facebook',
    handle: 'Мережа Вільних Людей',
    href: 'https://www.facebook.com/freepeople.org.ua',
    description: 'Новини та обговорення',
  },
  {
    name: 'Instagram',
    handle: '@freepeople.ua',
    href: 'https://www.instagram.com/freepeople.ua',
    description: 'Візуальний контент та stories',
  },
];

export default function ContactsPage() {
  return (
    <div
      style={{
        backgroundColor: 'var(--canvas)',
        color: 'var(--timber-dark)',
        fontFamily: "'Space Mono', monospace",
        minHeight: '100vh',
      }}
    >
      <GrainOverlay />
      <SkeletonGrid>
        <Navigation />
        <PageHeader
          label="ЗВ'ЯЗОК"
          title="КОНТАКТИ"
          description="Маєте питання або пропозиції? Зв'яжіться з нами зручним для вас способом."
        />

        {/* Contact Cards */}
        <div
          style={{
            gridColumn: '2 / 5',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            background: 'var(--grid-line)',
            border: '1px solid var(--grid-line)',
            marginBottom: '80px',
          }}
        >
          {contacts.map((contact) => (
            <a
              key={contact.type}
              href={contact.href}
              style={{
                background: 'var(--canvas)',
                padding: '50px 40px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                transition: 'background 0.3s ease',
              }}
            >
              <p className="label" style={{ marginBottom: '20px' }}>{contact.type}</p>
              <p
                className="syne"
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  marginBottom: '15px',
                  color: 'var(--accent)',
                }}
              >
                {contact.value}
              </p>
              <p style={{ fontSize: '13px', opacity: 0.6 }}>{contact.description}</p>
            </a>
          ))}
        </div>

        {/* Address */}
        <div
          style={{
            gridColumn: '2 / 5',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1px',
            background: 'var(--grid-line)',
            border: '1px solid var(--grid-line)',
            marginBottom: '80px',
          }}
        >
          <div
            style={{
              background: 'var(--timber-dark)',
              color: 'var(--grain)',
              padding: '60px',
              position: 'relative',
            }}
          >
            <div className="joint joint-tl" />
            <div className="joint joint-bl" />
            <p className="label" style={{ color: 'var(--accent)', marginBottom: '30px' }}>
              ЮРИДИЧНА АДРЕСА
            </p>
            <p className="syne" style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1.3 }}>
              Київська обл.,<br />
              Бучанський р-н,<br />
              с. Петропавлівська Борщагівка
            </p>
          </div>
          <div style={{ background: 'var(--canvas)', padding: '60px' }}>
            <p className="label" style={{ marginBottom: '30px' }}>ПРИМІТКА</p>
            <p style={{ fontSize: '16px', lineHeight: 1.8, marginBottom: '20px' }}>
              Мережа Вільних Людей — це передусім онлайн-спільнота. Ми працюємо
              дистанційно та проводимо регулярні офлайн-зустрічі у різних містах України.
            </p>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>
              Для участі в офлайн-заходах слідкуйте за анонсами в наших соціальних мережах.
            </p>
          </div>
        </div>

        {/* Social Media */}
        <div
          style={{
            gridColumn: '2 / 5',
            marginBottom: '80px',
          }}
        >
          <p className="label" style={{ marginBottom: '40px' }}>СОЦІАЛЬНІ МЕРЕЖІ</p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '30px',
            }}
          >
            {socials.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '30px',
                  border: '1px solid var(--grid-line)',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                }}
              >
                <p className="syne" style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>
                  {social.name}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--accent)', marginBottom: '10px' }}>
                  {social.handle}
                </p>
                <p style={{ fontSize: '13px', opacity: 0.6 }}>{social.description}</p>
              </a>
            ))}
          </div>
        </div>

        {/* FAQ Teaser */}
        <div
          style={{
            gridColumn: '2 / 5',
            padding: '60px',
            background: 'rgba(212, 93, 58, 0.1)',
            border: '1px solid var(--grid-line)',
            marginBottom: '80px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <p className="label" style={{ marginBottom: '15px' }}>ЧАСТІ ЗАПИТАННЯ</p>
            <h3 className="syne" style={{ fontSize: '28px', fontWeight: 700 }}>
              Маєте питання про Мережу?
            </h3>
            <p style={{ fontSize: '14px', opacity: 0.7, marginTop: '10px' }}>
              Перегляньте відповіді на найпоширеніші запитання
            </p>
          </div>
          <Link href="/faq" className="btn btn-outline" style={{ padding: '15px 30px' }}>
            ПЕРЕГЛЯНУТИ FAQ
          </Link>
        </div>

        {/* Join CTA */}
        <div
          style={{
            gridColumn: '2 / 5',
            textAlign: 'center',
            padding: '60px 0',
            borderTop: '1px solid var(--grid-line)',
            marginBottom: '80px',
          }}
        >
          <h2 className="syne" style={{ fontSize: '36px', fontWeight: 700, marginBottom: '20px' }}>
            ГОТОВІ ПРИЄДНАТИСЬ?
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.7, marginBottom: '30px' }}>
            Станьте частиною руху за права громадян
          </p>
          <Link href="/sign-up" className="btn" style={{ padding: '20px 50px' }}>
            ВСТУПИТИ ДО МЕРЕЖІ →
          </Link>
        </div>

        <Footer />
      </SkeletonGrid>
    </div>
  );
}
