import { Bot, Context } from 'grammy';
import type { BotSession } from '../bot';
import { normalizePhone } from '../utils';
import { getUserByPhone, linkTelegramToUser } from '../db';
import { msg } from '../messages';
import { mainMenuKeyboard, registerOrLinkKeyboard } from '../keyboards';

type BotContext = Context & { session: BotSession };

export function registerContactHandler(bot: Bot<BotContext>) {
  bot.on('message:contact', async (ctx) => {
    const session = ctx.session;
    const contact = ctx.message.contact;
    const fromUser = ctx.from;

    // Only process contact from the user themselves
    if (contact.user_id !== fromUser.id) {
      await ctx.reply('⚠️ Будь ласка, поділіться власним контактом.', {
        reply_markup: { remove_keyboard: true },
      });
      return;
    }

    const phone = normalizePhone(contact.phone_number);
    if (!phone) {
      await ctx.reply(msg.regPhoneInvalid, {
        parse_mode: 'HTML',
        reply_markup: { remove_keyboard: true },
      });
      return;
    }

    // If user is mid-registration at phone step
    if (session.state === 'reg:await_phone') {
      session.regData = { ...session.regData, phone };
      session.state = 'reg:await_email';
      await ctx.reply(msg.regAskEmail(phone), {
        parse_mode: 'HTML',
        reply_markup: { remove_keyboard: true },
      });
      return;
    }

    // If user is mid-linking at phone step
    if (session.state === 'link:await_phone') {
      const user = await getUserByPhone(phone);
      if (!user) {
        await ctx.reply(msg.linkNotFound, {
          parse_mode: 'HTML',
          reply_markup: { remove_keyboard: true, ...registerOrLinkKeyboard() },
        });
        session.state = undefined;
        return;
      }

      const success = await linkTelegramToUser(
        user.id,
        fromUser.id,
        fromUser.username,
        fromUser.first_name
      );

      if (success) {
        session.userId = user.id;
        session.state = undefined;
        await ctx.reply(msg.linkSuccess(user.first_name), {
          parse_mode: 'HTML',
          reply_markup: { remove_keyboard: true },
        });
        await ctx.reply('Головне меню:', { reply_markup: mainMenuKeyboard() });
      } else {
        await ctx.reply(msg.error, {
          parse_mode: 'HTML',
          reply_markup: { remove_keyboard: true },
        });
      }
      return;
    }

    // Otherwise — try to look up and link
    const user = await getUserByPhone(phone);
    if (!user) {
      await ctx.reply(
        `📱 Телефон <code>${phone}</code> не знайдено в системі.\n\nБажаєте зареєструватись?`,
        {
          parse_mode: 'HTML',
          reply_markup: registerOrLinkKeyboard(),
        }
      );
      return;
    }

    if (user.telegram_id && user.telegram_id !== fromUser.id) {
      await ctx.reply(msg.linkAlreadyLinked(`${user.first_name} ${user.last_name}`), {
        parse_mode: 'HTML',
        reply_markup: { remove_keyboard: true },
      });
      return;
    }

    const success = await linkTelegramToUser(
      user.id,
      fromUser.id,
      fromUser.username,
      fromUser.first_name
    );

    await ctx.reply(
      success ? msg.linkSuccess(user.first_name) : msg.error,
      {
        parse_mode: 'HTML',
        reply_markup: { remove_keyboard: true },
      }
    );

    if (success) {
      session.userId = user.id;
    }
  });
}
