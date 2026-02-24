import { InlineKeyboard, Keyboard } from 'grammy';

export function registerOrLinkKeyboard() {
  return new InlineKeyboard()
    .text('📝 Зареєструватись', 'register')
    .text('🔗 Прив\'язати акаунт', 'link:start')
    .row()
    .text('ℹ️ Довідка', 'help');
}

export function linkMethodsKeyboard() {
  return new InlineKeyboard()
    .text('✉️ Email', 'link:email')
    .text('📱 Телефон', 'link:phone')
    .row()
    .text('🔢 Код з сайту', 'link:code')
    .row()
    .text('↩️ Скасувати', 'cancel');
}

export function mainMenuKeyboard() {
  return new InlineKeyboard()
    .text('📊 Моя статистика', 'menu:stats')
    .text('👥 Реферали', 'menu:referrals')
    .row()
    .text('🗳️ Голосування', 'menu:votes')
    .text('🔗 Запросити', 'menu:invite')
    .row()
    .text('⚙️ Налаштування', 'menu:settings');
}

export function shareContactKeyboard() {
  return new Keyboard()
    .requestContact('📱 Поділитись номером телефону')
    .resized()
    .oneTime();
}

export function oblastKeyboard(oblasts: Array<{ id: string; name_uk: string }>) {
  const keyboard = new InlineKeyboard();
  oblasts.forEach((oblast, idx) => {
    keyboard.text(oblast.name_uk, `oblast:${oblast.id}`);
    if ((idx + 1) % 2 === 0) keyboard.row();
  });
  keyboard.row().text('↩️ Скасувати', 'cancel');
  return keyboard;
}

export function voteListKeyboard(votes: Array<{ id: string; title: string }>) {
  const keyboard = new InlineKeyboard();
  votes.forEach((vote) => {
    keyboard.text(`🗳️ ${vote.title.slice(0, 40)}`, `vote_open:${vote.id}`).row();
  });
  keyboard.text('↩️ Назад', 'menu:main');
  return keyboard;
}

export function voteKeyboard(voteId: string, options: Array<{ id: string; text: string }>) {
  const keyboard = new InlineKeyboard();
  options.forEach((opt) => {
    keyboard.text(opt.text.slice(0, 40), `vote:${voteId}:${opt.id}`).row();
  });
  keyboard.text('↩️ Скасувати', 'cancel');
  return keyboard;
}

export function eventRsvpKeyboard(eventId: string) {
  return new InlineKeyboard()
    .text('✅ Піду', `rsvp:${eventId}:going`)
    .text('🤔 Можливо', `rsvp:${eventId}:maybe`)
    .text('❌ Не піду', `rsvp:${eventId}:not_going`);
}

export function notificationsKeyboard(enabled: boolean) {
  return new InlineKeyboard()
    .text(enabled ? '🔕 Вимкнути сповіщення' : '🔔 Увімкнути сповіщення', 'notif:toggle')
    .row()
    .text('↩️ Назад', 'menu:main');
}

export function cancelKeyboard() {
  return new InlineKeyboard().text('↩️ Скасувати', 'cancel');
}

export function linkSuccessKeyboard() {
  return new InlineKeyboard()
    .text('📊 Моя статистика', 'menu:stats')
    .text('🏠 Головне меню', 'menu:main');
}
