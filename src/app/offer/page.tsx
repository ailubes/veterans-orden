import type { Metadata } from 'next';
import { PageLayout, PageHeader, PageContent } from '@/components/layout/page-layout';
import { Scaffold } from '@/components/layout/skeleton-grid';
import { Breadcrumb } from '@/components/ui/breadcrumb';

export const metadata: Metadata = {
  title: 'Договір публічної оферти — Орден Ветеранів',
  description:
    'Договір публічної оферти на надання послуг з членства в Громадській організації «Орден Ветеранів».',
};

export default function OfferPage() {
  return (
    <PageLayout>
      {/* Breadcrumb */}
      <section className="section-sm">
        <Scaffold>
          <div className="col-span-full">
            <Breadcrumb
              items={[
                { label: 'Головна', href: '/' },
                { label: 'Публічна оферта' },
              ]}
            />
          </div>
        </Scaffold>
      </section>

      <PageHeader
        subtitle="// ЮРИДИЧНИЙ ДОКУМЕНТ"
        title="ДОГОВІР ПУБЛІЧНОЇ ОФЕРТИ"
        description="Цей документ є публічною офертою на надання послуг з членства в Громадській організації «Орден Ветеранів»."
      />

      <PageContent narrow>
        <div className="space-y-10 font-mono text-sm leading-relaxed">

          {/* 1. Загальні положення */}
          <section>
            <h2 className="font-syne font-bold text-base uppercase mb-4 text-bronze">
              1. Загальні положення
            </h2>
            <p className="mb-3">
              1.1. Громадська організація «Орден Ветеранів» (далі — Організація) пропонує
              необмеженому колу осіб укласти договір про членство на умовах, визначених
              цим документом (далі — Оферта).
            </p>
            <p className="mb-3">
              1.2. Цей документ є публічною офертою відповідно до статей 633, 641
              Цивільного кодексу України. Акцептом оферти вважається здійснення оплати
              членського внеску на платіжній сторінці за адресою{' '}
              <a href="https://ordenv.org/pay" className="text-bronze hover:underline">
                ordenv.org/pay
              </a>.
            </p>
            <p className="mb-3">
              1.3. Оферта набирає чинності з моменту її розміщення на сайті{' '}
              <a href="https://ordenv.org" className="text-bronze hover:underline">
                ordenv.org
              </a>{' '}
              і діє до її відкликання Організацією.
            </p>
            <p>
              1.4. Організація залишає за собою право вносити зміни до Оферти без
              попереднього повідомлення. Поточна редакція завжди доступна за адресою{' '}
              <a href="https://ordenv.org/offer" className="text-bronze hover:underline">
                ordenv.org/offer
              </a>.
            </p>
          </section>

          {/* 2. Предмет договору */}
          <section>
            <h2 className="font-syne font-bold text-base uppercase mb-4 text-bronze">
              2. Предмет договору
            </h2>
            <p className="mb-3">
              2.1. Організація надає Члену доступ до членських послуг (далі — Послуги),
              що включають:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-3">
              <li>доступ до закритого членського простору (особистий кабінет);</li>
              <li>участь у голосуваннях та прийнятті рішень спільноти;</li>
              <li>участь у заходах, челенджах та програмах Організації;</li>
              <li>доступ до ресурсів для ветеранів (юридична допомога, зайнятість, підтримка);</li>
              <li>нарахування балів активності та прогресія у членстві.</li>
            </ul>
            <p>
              2.2. Обсяг Послуг визначається обраним рівнем членства та може бути
              розширений відповідно до умов програми.
            </p>
          </section>

          {/* 3. Вартість та порядок оплати */}
          <section>
            <h2 className="font-syne font-bold text-base uppercase mb-4 text-bronze">
              3. Вартість послуг та порядок оплати
            </h2>
            <p className="mb-3">
              3.1. Членські внески встановлюються відповідно до обраного рівня членства:
            </p>
            <div className="overflow-x-auto mb-3">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-line">
                    <th className="text-left py-2 pr-4">Рівень</th>
                    <th className="text-right py-2 pr-4">Місячний внесок</th>
                    <th className="text-right py-2">Річний внесок</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  <tr>
                    <td className="py-2 pr-4">Базовий</td>
                    <td className="text-right py-2 pr-4">49 грн / міс</td>
                    <td className="text-right py-2">490 грн / рік</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Підтримка</td>
                    <td className="text-right py-2 pr-4">100 грн / міс</td>
                    <td className="text-right py-2">1 000 грн / рік</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Підтримка+</td>
                    <td className="text-right py-2 pr-4">200 грн / міс</td>
                    <td className="text-right py-2">2 000 грн / рік</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Меценат</td>
                    <td className="text-right py-2 pr-4">500 грн / міс</td>
                    <td className="text-right py-2">5 000 грн / рік</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mb-3">
              3.2. Оплата здійснюється у гривнях (UAH) через платіжну систему HUTKO
              (Fondy) з використанням банківської картки, Google Pay або Apple Pay.
            </p>
            <p className="mb-3">
              3.3. При виборі місячного членства — оплата здійснюється щомісяця
              у автоматичному режимі (рекурентне списання). При виборі річного
              членства — одноразово за 12 місяців наперед.
            </p>
            <p>
              3.4. Членство активується одразу після підтвердження платежу системою.
              У разі відмови в платежі доступ до членських Послуг не надається.
            </p>
          </section>

          {/* 4. Права та обов'язки */}
          <section>
            <h2 className="font-syne font-bold text-base uppercase mb-4 text-bronze">
              4. Права та обов'язки сторін
            </h2>
            <p className="mb-2 font-bold">Організація зобов'язується:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
              <li>надавати доступ до Послуг відповідно до обраного рівня членства;</li>
              <li>забезпечувати конфіденційність персональних даних Члена;</li>
              <li>повідомляти про суттєві зміни в умовах Послуг;</li>
              <li>розглядати звернення Членів у розумні терміни.</li>
            </ul>
            <p className="mb-2 font-bold">Член зобов'язується:</p>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
              <li>своєчасно сплачувати членські внески;</li>
              <li>дотримуватись статуту та кодексу Організації;</li>
              <li>надавати достовірні персональні дані при реєстрації;</li>
              <li>не передавати доступ до особистого кабінету третім особам.</li>
            </ul>
            <p className="mb-2 font-bold">Член має право:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>користуватися всіма Послугами відповідно до свого рівня;</li>
              <li>змінити рівень членства у будь-який час;</li>
              <li>відмовитись від членства та припинити рекурентні платежі;</li>
              <li>звертатись до Організації з питань якості Послуг.</li>
            </ul>
          </section>

          {/* 5. Повернення коштів */}
          <section>
            <h2 className="font-syne font-bold text-base uppercase mb-4 text-bronze">
              5. Повернення коштів
            </h2>
            <p className="mb-3">
              5.1. Після активації членства та надання доступу до членських Послуг
              повернення коштів не здійснюється, оскільки послуга вважається наданою.
            </p>
            <p className="mb-3">
              5.2. Виняток: якщо технічна несправність унеможливила доступ до Послуг
              протягом більш ніж 72 годин з моменту оплати — Член має право вимагати
              повного або часткового повернення коштів, звернувшись на{' '}
              <a href="mailto:info@ordenv.org" className="text-bronze hover:underline">
                info@ordenv.org
              </a>.
            </p>
            <p className="mb-3">
              5.3. Для відмови від рекурентних платежів необхідно звернутись на
              адресу{' '}
              <a href="mailto:info@ordenv.org" className="text-bronze hover:underline">
                info@ordenv.org
              </a>{' '}
              не пізніше ніж за 3 дні до наступного списання. Членство зберігається
              до кінця оплаченого періоду.
            </p>
            <p>
              5.4. Повернення здійснюється на картку, з якої було здійснено оплату,
              протягом 5–10 робочих днів.
            </p>
          </section>

          {/* 6. Відповідальність */}
          <section>
            <h2 className="font-syne font-bold text-base uppercase mb-4 text-bronze">
              6. Відповідальність сторін
            </h2>
            <p className="mb-3">
              6.1. Організація не несе відповідальності за перебої в роботі,
              спричинені форс-мажорними обставинами, діями третіх осіб або
              технічними проблемами платіжної системи.
            </p>
            <p className="mb-3">
              6.2. Організація не несе відповідальності за наслідки використання
              Послуг, якщо Член надав недостовірні персональні дані.
            </p>
            <p>
              6.3. У разі порушення Членом статуту Організації або цієї Оферти —
              Організація має право призупинити або припинити членство без
              повернення коштів.
            </p>
          </section>

          {/* 7. Конфіденційність */}
          <section>
            <h2 className="font-syne font-bold text-base uppercase mb-4 text-bronze">
              7. Конфіденційність
            </h2>
            <p className="mb-3">
              7.1. Організація обробляє персональні дані відповідно до Закону
              України «Про захист персональних даних» та Політики конфіденційності,
              розміщеної на сайті.
            </p>
            <p className="mb-3">
              7.2. Дані платіжної картки не зберігаються Організацією — вони
              обробляються безпосередньо платіжною системою HUTKO (Fondy) відповідно
              до стандарту PCI DSS.
            </p>
            <p>
              7.3. Організація не передає персональні дані Членів третім особам,
              крім випадків, передбачених законодавством України.
            </p>
          </section>

          {/* 8. Строк дії */}
          <section>
            <h2 className="font-syne font-bold text-base uppercase mb-4 text-bronze">
              8. Строк дії договору
            </h2>
            <p className="mb-3">
              8.1. Договір набирає чинності з моменту акцепту (здійснення першого
              платежу) і діє протягом усього строку членства.
            </p>
            <p className="mb-3">
              8.2. Договір автоматично продовжується на наступний оплачений
              період при успішному рекурентному списанні.
            </p>
            <p>
              8.3. Договір припиняється: за ініціативою Члена (відмова від
              членства), у разі несплати внеску після пільгового терміну, або
              за рішенням Організації у разі порушення умов.
            </p>
          </section>

          {/* 9. Реквізити */}
          <section>
            <h2 className="font-syne font-bold text-base uppercase mb-4 text-bronze">
              9. Реквізити організації
            </h2>
            <div className="space-y-1">
              <p><span className="text-muted-500">Повна назва:</span> Громадська організація «Орден Ветеранів»</p>
              <p><span className="text-muted-500">Скорочена назва:</span> ГО «Орден Ветеранів»</p>
              <p>
                <span className="text-muted-500">Вебсайт:</span>{' '}
                <a href="https://ordenv.org" className="text-bronze hover:underline">
                  ordenv.org
                </a>
              </p>
              <p>
                <span className="text-muted-500">Email:</span>{' '}
                <a href="mailto:info@ordenv.org" className="text-bronze hover:underline">
                  info@ordenv.org
                </a>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-line">
              <p className="font-bold mb-4">Банківські реквізити</p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-xs">
                <dt className="text-muted-500">Отримувач</dt>
                <dd>ГО «ОРДЕН ВЕТЕРАНІВ»</dd>

                <dt className="text-muted-500">ЄДРПОУ</dt>
                <dd className="font-mono">14282829</dd>

                <dt className="text-muted-500">Рахунок (IBAN)</dt>
                <dd className="font-mono break-all">UA383348510000000026007327586</dd>

                <dt className="text-muted-500">Валюта</dt>
                <dd>980 — Гривня (UAH)</dd>

                <dt className="text-muted-500">Банк отримувача</dt>
                <dd>АТ «ПЕРШИЙ УКРАЇНСЬКИЙ МІЖНАРОДНИЙ БАНК»</dd>

                <dt className="text-muted-500">МФО</dt>
                <dd className="font-mono">334851</dd>

                <dt className="text-muted-500">Адреса банку</dt>
                <dd>04070, Україна, м. Київ, вул. Андріївська, 4</dd>
              </dl>
            </div>

            <p className="mt-6 text-xs text-muted-500">
              Редакція від 27 лютого 2026 р. Усі попередні редакції втрачають чинність.
            </p>
          </section>

        </div>
      </PageContent>
    </PageLayout>
  );
}
