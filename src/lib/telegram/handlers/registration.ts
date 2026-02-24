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

        // Check if phone already registered
        const existing = await getUserByPhone(phone);
        if (existing) {
          // Offer to link instead
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

        // Check if email already registered
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
        // TODO: send actual email; for now show in chat (dev mode)
        await ctx.reply(msg.regEmailSent(text), {
          parse_mode: 'HTML',
          reply_markup: cancelKeyboard(),
        });
        // Show code in test mode
        await ctx.reply(msg.regEmailCodeHint(code), { parse_mode: 'HTML' });

        session.regData = { ...session.regData, email: text };
        session.state = 'reg:await_email_code';
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

        // Fetch oblasts and store in session for stable numbering
        const oblasts = await getOblasts();
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

        // Match by number (1-based) or by name (case-insensitive)
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
          await ctx.reply(msg.error, { parse_mode: 'HTML' });
          session.state = undefined;
          return;
        }

        // Award referral points if applicable
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
    await ctx.answerCallbackQuery();
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
