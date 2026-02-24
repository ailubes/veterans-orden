import { Bot, Context } from 'grammy';
import type { BotSession } from '../bot';
import {
  normalizePhone,
  validateEmail,
  generateCode,
  storeVerificationCode,
  verifyCode,
} from '../utils';
import {
  getUserByPhone,
  getUserByEmail,
  createUserFromTelegram,
  linkTelegramToUser,
  awardReferralPoints,
  getOblasts,
} from '../db';
import { msg } from '../messages';
import {
  cancelKeyboard,
  mainMenuKeyboard,
} from '../keyboards';
import { InlineKeyboard } from 'grammy';

type BotContext = Context & { session: BotSession };

// Handle incoming text messages during registration flow
export function registerRegistrationHandler(bot: Bot<BotContext>) {
  bot.on('message:text', async (ctx, next) => {
    const session = ctx.session;
    if (!session.state || !session.state.startsWith('reg:')) {
      await next();
      return;
    }

    const text = ctx.message.text.trim();

    switch (session.state) {
      case 'reg:await_phone': {
        const phone = normalizePhone(text);
        if (!phone) {
          await ctx.reply(msg.regPhoneInvalid, { parse_mode: 'HTML' });
          return;
        }

        const existing = await getUserByPhone(phone);
        if (existing) {
          await ctx.reply(msg.regPhoneExists(phone), {
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔗 Прив\'язати', callback_data: `link_existing:${existing.id}` }],
                [{ text: '↩️ Скасувати', callback_data: 'cancel' }],
              ],
            },
          });
          return;
        }

        // Update state BEFORE replies so it persists even if reply fails
        session.regData = { ...session.regData, phone };
        session.state = 'reg:await_email';
        await ctx.reply(msg.regAskEmail(phone), {
          parse_mode: 'HTML',
          reply_markup: cancelKeyboard(),
        });
        break;
      }

      case 'reg:await_email': {
        if (!validateEmail(text)) {
          await ctx.reply(msg.regEmailInvalid, { parse_mode: 'HTML' });
          return;
        }

        const existing = await getUserByEmail(text);
        if (existing) {
          await ctx.reply(
            `⚠️ Email вже зареєстровано. Прив'яжіть через /link або використайте інший email.`,
            { parse_mode: 'HTML', reply_markup: cancelKeyboard() }
          );
          return;
        }

        const code = generateCode(6);
        storeVerificationCode(text, code);
        console.log(`[TG REG] Email OTP for ${text}: ${code}`);

        // Update state BEFORE replies
        session.regData = { ...session.regData, email: text };
        session.state = 'reg:await_email_code';

        await ctx.reply(msg.regEmailSent(text), {
          parse_mode: 'HTML',
          reply_markup: cancelKeyboard(),
        });
        await ctx.reply(msg.regEmailCodeHint(code), { parse_mode: 'HTML' });
        break;
      }

      case 'reg:await_email_code': {
        const email = session.regData?.email;
        if (!email) {
          session.state = undefined;
          await ctx.reply(msg.error, { parse_mode: 'HTML' });
          return;
        }

        if (!verifyCode(email, text)) {
          await ctx.reply(msg.regCodeInvalid, {
            parse_mode: 'HTML',
            reply_markup: cancelKeyboard(),
          });
          return;
        }

        // Update state BEFORE reply
        session.state = 'reg:await_name';
        await ctx.reply(msg.regAskName, {
          parse_mode: 'HTML',
          reply_markup: cancelKeyboard(),
        });
        break;
      }

      case 'reg:await_name': {
        const parts = text.split(/\s+/).filter(Boolean);
        if (parts.length < 2) {
          await ctx.reply(msg.regNameInvalid, {
            parse_mode: 'HTML',
            reply_markup: cancelKeyboard(),
          });
          return;
        }

        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ');

        const oblasts = await getOblasts();

        // Update state BEFORE reply
        session.regData = { ...session.regData, firstName, lastName, oblastList: oblasts };
        session.state = 'reg:await_oblast';

        await ctx.reply(msg.regAskOblast(oblasts), {
          parse_mode: 'HTML',
          reply_markup: cancelKeyboard(),
        });
        break;
      }

      case 'reg:await_oblast': {
        const oblasts = session.regData?.oblastList || [];
        if (!oblasts.length) {
          session.state = undefined;
          await ctx.reply(msg.error, { parse_mode: 'HTML' });
          return;
        }

        const num = parseInt(text, 10);
        let matched: { id: string; name: string } | undefined;

        if (!isNaN(num) && num >= 1 && num <= oblasts.length) {
          matched = oblasts[num - 1];
        } else {
          const lower = text.toLowerCase();
          matched = oblasts.find((o) => o.name.toLowerCase().includes(lower));
        }

        if (!matched) {
          await ctx.reply(msg.regOblastInvalid, {
            parse_mode: 'HTML',
            reply_markup: cancelKeyboard(),
          });
          return;
        }

        // Update state BEFORE reply
        session.regData = { ...session.regData, oblastId: matched.id };
        session.state = 'reg:await_settlement';

        await ctx.reply(
          `✅ Обрано: <b>${matched.name}</b>\n\n${msg.regAskSettlement}`,
          { parse_mode: 'HTML', reply_markup: cancelKeyboard() }
        );
        break;
      }

      case 'reg:await_settlement': {
        if (!text || text.length < 2) {
          await ctx.reply(msg.regSettlementInvalid, {
            parse_mode: 'HTML',
            reply_markup: cancelKeyboard(),
          });
          return;
        }

        const fromUser = ctx.from;
        const regData = session.regData;

        // Clear state BEFORE the async DB call so no duplicate registrations on retry
        session.state = 'reg:creating';
        session.regData = { ...session.regData, settlementName: text };

        const newUser = await createUserFromTelegram({
          telegramId: fromUser.id,
          telegramUsername: fromUser.username,
          telegramFirstName: fromUser.first_name,
          phone: regData?.phone || '',
          email: regData?.email || '',
          firstName: regData?.firstName || '',
          lastName: regData?.lastName || '',
          oblastId: regData?.oblastId,
          settlementName: text,
          referrerId: session.referrerId,
        });

        if (!newUser) {
          session.state = 'reg:await_settlement'; // allow retry
          await ctx.reply(msg.error, { parse_mode: 'HTML' });
          return;
        }

        if ('emailExists' in newUser) {
          // Email already registered — offer to link instead
          session.state = undefined;
          session.regData = undefined;
          await ctx.reply(
            `⚠️ Email <code>${regData?.email}</code> вже зареєстровано в системі.\n\n` +
            `Скористайтесь командою /link щоб прив'язати ваш існуючий акаунт до Telegram.`,
            { parse_mode: 'HTML', reply_markup: mainMenuKeyboard() }
          );
          return;
        }

        if (session.referrerId) {
          await awardReferralPoints(session.referrerId, newUser.id);
        }

        session.state = undefined;
        session.userId = newUser.id;
        session.regData = undefined;

        await ctx.reply(msg.regComplete(newUser.first_name), {
          parse_mode: 'HTML',
          reply_markup: mainMenuKeyboard(),
        });
        break;
      }
    }
  });

  // Handle link_existing (phone already in DB → offer to link)
  bot.callbackQuery(/^link_existing:(.+)$/, async (ctx) => {
    ctx.answerCallbackQuery().catch(() => {});
    const session = ctx.session;
    const userId = ctx.match[1];
    const fromUser = ctx.from;

    const success = await linkTelegramToUser(
      userId,
      fromUser.id,
      fromUser.username,
      fromUser.first_name
    );

    if (success) {
      session.userId = userId;
      session.state = undefined;
      await ctx.editMessageText(msg.linkSuccess(fromUser.first_name), {
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard(),
      });
    } else {
      await ctx.editMessageText(msg.error, { parse_mode: 'HTML' });
    }
  });
}
