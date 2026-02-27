// Ukrainian message templates for every bot screen/state

export const msg = {
  // Welcome / start
  welcome: (firstName: string) =>
    `👋 Вітаємо в офіційному боті <b>Ордену Ветеранів</b>, ${firstName}!\n\n` +
    `Тут ви можете:\n` +
    `• Зв'язати Telegram з особистим кабінетом\n` +
    `• Отримувати сповіщення про голосування, події та новини\n` +
    `• Голосувати та переглядати статистику прямо в боті\n\n` +
    `Оберіть дію:`,

  welcomeLinked: (firstName: string) =>
    `👋 З поверненням, ${firstName}!\n\n` +
    `Ваш акаунт вже прив'язаний. Що бажаєте зробити?`,

  // Registration
  regAskPhone:
    `📱 <b>Реєстрація в Ордені Ветеранів</b>\n\n` +
    `Для реєстрації потрібен ваш номер телефону (для верифікації).\n\n` +
    `Натисніть кнопку нижче або введіть номер у форматі <code>+380XXXXXXXXX</code>:`,

  regAskEmail: (phone: string) =>
    `✅ Телефон <code>${phone}</code> прийнято.\n\n` +
    `Тепер введіть вашу <b>електронну пошту</b>:`,

  regEmailSent: (email: string) =>
    `📧 Ми надіслали код підтвердження на <code>${email}</code>.\n\n` +
    `Введіть 6-значний код:`,

  regEmailCodeHint: (code: string) =>
    `ℹ️ (Тестовий режим) Ваш код: <code>${code}</code>`,

  regAskName:
    `✅ Email підтверджено!\n\n` +
    `Введіть ваше <b>ім'я та прізвище</b> (наприклад: <i>Іван Петренко</i>):`,

  regAskOblast: (oblasts: Array<{ id: string; name: string }>) => {
    const list = oblasts.map((o, i) => `${i + 1}. ${o.name}`).join('\n');
    return `🗺️ <b>Оберіть вашу область</b>\n\nВведіть номер зі списку:\n\n${list}`;
  },

  regOblastInvalid: `❌ Область не знайдено. Введіть число від 1 до 25:`,

  regAskSettlementSearch: (oblastName: string) =>
    `📍 <b>Населений пункт</b> — ${oblastName}\n\n` +
    `Введіть назву або частину назви вашого міста, села або смт:\n\n` +
    `<i>💡 Підказка: достатньо 3–4 літери — наприклад <code>Бори</code> знайде Бориспіль</i>`,

  regSettlementResults: (results: Array<{ name: string; hromadaName: string | null }>) => {
    const list = results
      .map((r, i) => `${i + 1}. <b>${r.name}</b>${r.hromadaName ? ` (${r.hromadaName} громада)` : ''}`)
      .join('\n');
    return (
      `🔍 Знайдено ${results.length} результат(ів):\n\n${list}\n\n` +
      `Введіть <b>номер</b> для вибору або нову назву для повторного пошуку:`
    );
  },

  regSettlementNotFound: (query: string) =>
    `❌ За запитом «<b>${query}</b>» нічого не знайдено.\n\n` +
    `Спробуйте:\n` +
    `• Скоротити назву (наприклад: <code>Київ</code> замість <code>Київський</code>)\n` +
    `• Перевірити правопис\n` +
    `• Введіть <code>0</code> щоб пропустити вибір пункту`,

  regSettlementChosen: (name: string, hromadaName: string | null) =>
    `✅ Обрано: <b>${name}</b>${hromadaName ? ` (${hromadaName} громада)` : ''}`,

  regSettlementInvalid: `❌ Назва населеного пункту не може бути порожньою. Спробуйте ще раз:`,

  regComplete: (firstName: string) =>
    `🎉 <b>Вітаємо, ${firstName}!</b>\n\n` +
    `Вашу заявку на членство прийнято. Адміністратор розгляне її найближчим часом.\n\n` +
    `Слідкуйте за оновленнями тут або на <a href="https://ordenv.org">ordenv.org</a>`,

  regPhoneInvalid:
    `❌ Неправильний формат номера.\n` +
    `Введіть у форматі: <code>+380XXXXXXXXX</code> або <code>0XXXXXXXXX</code>`,

  regEmailInvalid: `❌ Некоректна email адреса. Спробуйте ще раз:`,

  regCodeInvalid: `❌ Невірний або застарілий код. Спробуйте ще раз:`,

  regNameInvalid: `❌ Будь ласка, введіть ім'я та прізвище (щонайменше 2 слова):`,

  regPhoneExists: (phone: string) =>
    `⚠️ Телефон <code>${phone}</code> вже зареєстровано в системі.\n\n` +
    `Бажаєте прив'язати цей акаунт до Telegram?`,

  // Linking
  linkAskMethod:
    `🔗 <b>Прив'язка акаунту</b>\n\n` +
    `Оберіть спосіб підтвердження:`,

  linkAskEmail: `✉️ Введіть email адресу вашого акаунту:`,

  linkAskPhone: `📱 Введіть телефон вашого акаунту або поділіться контактом:`,

  linkAskCode:
    `🔢 Введіть 6-значний код з особистого кабінету (ordenv.org → Профіль → Telegram):`,

  linkSuccess: (firstName: string) =>
    `✅ <b>Акаунт прив'язано!</b>\n\n` +
    `Вітаємо, ${firstName}! Тепер ви отримуватимете сповіщення тут.\n\n` +
    `Введіть /mystats щоб переглянути статистику.`,

  linkNotFound:
    `❌ Акаунт з такими даними не знайдено.\n\n` +
    `Перевірте правильність введених даних або зареєструйтесь:`,

  linkCodeExpired:
    `❌ Код застарів або вже використаний.\n\n` +
    `Згенеруйте новий код на <a href="https://ordenv.org/dashboard">ordenv.org</a>`,

  linkAlreadyLinked: (name: string) =>
    `ℹ️ Ваш Telegram вже прив'язано до акаунту <b>${name}</b>.`,

  // Stats
  stats: (params: {
    firstName: string;
    lastName: string;
    role: string;
    tier: string;
    status: string;
    points: number;
    referrals: number;
  }) =>
    `📊 <b>Ваша статистика</b>\n\n` +
    `👤 ${params.firstName} ${params.lastName}\n` +
    `🏅 Роль: ${params.role}\n` +
    `💎 Рівень: ${params.tier}\n` +
    `🔵 Статус: ${params.status}\n` +
    `⭐ Балів: ${params.points}\n` +
    `👥 Рефералів: ${params.referrals}`,

  // Referrals
  referralList: (referrals: Array<{ first_name: string; last_name: string; status: string; created_at: string }>) => {
    if (!referrals.length) return `👥 У вас ще немає рефералів.\n\nЗапросіть знайомих за вашим посиланням!`;
    const list = referrals
      .map((r, i) => `${i + 1}. ${r.first_name} ${r.last_name} — ${r.status}`)
      .join('\n');
    return `👥 <b>Ваші реферали (${referrals.length}):</b>\n\n${list}`;
  },

  inviteLink: (userId: string, botUsername: string) =>
    `🔗 <b>Ваше реферальне посилання:</b>\n\n` +
    `<code>https://t.me/${botUsername}?start=ref_${userId}</code>\n\n` +
    `Поділіться з ветеранами — отримайте +25 балів за кожного!\n\n` +
    `Або пряме посилання на сайт:\n` +
    `<code>https://ordenv.org/join?ref=${userId}</code>`,

  // Voting
  voteList: (count: number) =>
    count === 0
      ? `🗳️ Зараз активних голосувань немає.`
      : `🗳️ <b>Активні голосування (${count}):</b>\n\nОберіть голосування нижче:`,

  voteDetails: (vote: { title: string; description?: string; ends_at: string }) =>
    `🗳️ <b>${vote.title}</b>\n\n` +
    (vote.description ? `${vote.description}\n\n` : '') +
    `⏰ Завершується: ${new Date(vote.ends_at).toLocaleDateString('uk-UA')}`,

  voteSuccess: `✅ Ваш голос враховано! (+5 балів)`,

  voteAlreadyVoted: `⚠️ Ви вже голосували в цьому голосуванні.`,

  voteError: `❌ Помилка при голосуванні. Спробуйте пізніше.`,

  // Settings
  settings: (notificationsEnabled: boolean) =>
    `⚙️ <b>Налаштування</b>\n\n` +
    `🔔 Сповіщення: ${notificationsEnabled ? '✅ Увімкнено' : '❌ Вимкнено'}\n\n` +
    `Керуйте налаштуваннями:`,

  notificationsEnabled: `✅ Сповіщення увімкнено.`,
  notificationsDisabled: `🔕 Сповіщення вимкнено. Ви більше не отримуватимете повідомлень.`,

  // Help
  help:
    `ℹ️ <b>Довідка — Бот Ордену Ветеранів</b>\n\n` +
    `<b>Команди:</b>\n` +
    `/start — Головне меню\n` +
    `/link — Прив'язати акаунт\n` +
    `/mystats — Моя статистика\n` +
    `/referrals — Мої реферали\n` +
    `/invite — Реферальне посилання\n` +
    `/settings — Налаштування\n` +
    `/help — Ця довідка\n\n` +
    `🌐 Сайт: <a href="https://ordenv.org">ordenv.org</a>`,

  // Errors
  notLinked:
    `⚠️ Ваш акаунт не прив'язано до Telegram.\n\n` +
    `Натисніть /link для прив'язки або /start для реєстрації.`,

  error: `❌ Виникла помилка. Спробуйте ще раз або зверніться до підтримки.`,

  cancelled: `↩️ Дію скасовано.`,
};
