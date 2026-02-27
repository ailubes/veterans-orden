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
  searchKatottgSettlements,
} from '../db';
import { msg } from '../messages';
import {
  cancelKeyboard,
  mainMenuKeyboard,
} from '../keyboards';
import { InlineKeyboard } from 'grammy';

type BotContext = Context & { session: BotSession };

// Shared helper: complete registration after settlement is resolved (or skipped)
async function finishRegistration(ctx: BotContext, session: BotSession, _opts: Record<string, never>) {
  const fromUser = ctx.from!;
  const regData = session.regData;

  // Lock state to prevent duplicate submissions
  session.state = 'reg:creating';

  const newUser = await createUserFromTelegram({
    telegramId: fromUser.id,
    telegramUsername: fromUser.username,
    telegramFirstName: fromUser.first_name,
    phone: regData?.phone || '',
    email: regData?.email || '',
    firstName: regData?.firstName || '',
    lastName: regData?.lastName || '',
    oblastId: regData?.oblastId,
    settlementName: regData?.katottgSettlementName,
    katottgCode: regData?.katottgCode,
    hromadaName: regData?.katottgHromadaName,
    raionName: regData?.katottgRaionName,
    oblastNameKatottg: regData?.katottgOblastName,
    referrerId: session.referrerId,
  });

  if (!newUser) {
    // Allow retry from settlement search
    session.state = 'reg:await_settlement_search';
    await ctx.reply(msg.error, { parse_mode: 'HTML' });
    return;
  }

  if ('emailExists' in newUser) {
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
}

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

        // Store both id (for DB) and name (for KATOTTG search filtering)
        session.regData = { ...session.regData, oblastId: matched.id, oblastName: matched.name };
        session.state = 'reg:await_settlement_search';

        await ctx.reply(msg.regAskSettlementSearch(matched.name), {
          parse_mode: 'HTML',
          reply_markup: cancelKeyboard(),
        });
        break;
      }

      case 'reg:await_settlement_search': {
        // "0" = skip settlement selection
        if (text === '0') {
          await finishRegistration(ctx, session, {});
          return;
        }

        if (!text || text.length < 2) {
          await ctx.reply(
            `⚠️ Введіть щонайменше 2 символи для пошуку або <code>0</code> щоб пропустити.`,
            { parse_mode: 'HTML', reply_markup: cancelKeyboard() }
          );
          return;
        }

        const oblastName = session.regData?.oblastName || '';
        const results = await searchKatottgSettlements(text, oblastName);

        if (results.length === 0) {
          await ctx.reply(msg.regSettlementNotFound(text), {
            parse_mode: 'HTML',
            reply_markup: cancelKeyboard(),
          });
          return;
        }

        // Map to session-friendly format
        session.regData = {
          ...session.regData,
          settlementResults: results.map((r) => ({
            code: r.code,
            name: r.name,
            hromadaName: r.hromada_name,
            raionName: r.raion_name,
            oblastName: r.oblast_name,
          })),
        };
        session.state = 'reg:await_settlement_choice';

        await ctx.reply(
          msg.regSettlementResults(results.map((r) => ({ name: r.name, hromadaName: r.hromada_name }))),
          { parse_mode: 'HTML', reply_markup: cancelKeyboard() }
        );
        break;
      }

      case 'reg:await_settlement_choice': {
        const results = session.regData?.settlementResults || [];
        const num = parseInt(text, 10);

        // Valid number → pick from list
        if (!isNaN(num) && num >= 1 && num <= results.length) {
          const chosen = results[num - 1];
          session.regData = {
            ...session.regData,
            katottgCode: chosen.code,
            katottgSettlementName: chosen.name,
            katottgHromadaName: chosen.hromadaName || undefined,
            katottgRaionName: chosen.raionName || undefined,
            katottgOblastName: chosen.oblastName || undefined,
          };
          await ctx.reply(msg.regSettlementChosen(chosen.name, chosen.hromadaName), {
            parse_mode: 'HTML',
          });
          await finishRegistration(ctx, session, {});
          return;
        }

        // "0" = skip
        if (text === '0') {
          await finishRegistration(ctx, session, {});
          return;
        }

        // Otherwise treat as a new search query
        if (text.length >= 2) {
          const oblastName = session.regData?.oblastName || '';
          const newResults = await searchKatottgSettlements(text, oblastName);

          if (newResults.length === 0) {
            await ctx.reply(msg.regSettlementNotFound(text), {
              parse_mode: 'HTML',
              reply_markup: cancelKeyboard(),
            });
            return;
          }

          session.regData = {
            ...session.regData,
            settlementResults: newResults.map((r) => ({
              code: r.code,
              name: r.name,
              hromadaName: r.hromada_name,
              raionName: r.raion_name,
              oblastName: r.oblast_name,
            })),
          };
          // Stay in reg:await_settlement_choice after a new search
          await ctx.reply(
            msg.regSettlementResults(newResults.map((r) => ({ name: r.name, hromadaName: r.hromada_name }))),
            { parse_mode: 'HTML', reply_markup: cancelKeyboard() }
          );
          return;
        }

        await ctx.reply(
          `⚠️ Введіть номер зі списку або нову назву для пошуку. Введіть <code>0</code> щоб пропустити.`,
          { parse_mode: 'HTML', reply_markup: cancelKeyboard() }
        );
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
