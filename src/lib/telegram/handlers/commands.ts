import { Bot, Context } from 'grammy';
import type { BotSession } from '../bot';
import {
  getUserByTelegramId,
  getUserStats,
  getReferrals,
  createBotAdminClient,
} from '../db';
import { msg } from '../messages';
import {
  registerOrLinkKeyboard,
  mainMenuKeyboard,
  linkMethodsKeyboard,
  notificationsKeyboard,
} from '../keyboards';

type BotContext = Context & { session: BotSession };

export function registerCommandHandlers(bot: Bot<BotContext>) {
  // /start [ref_<userId>]
  bot.command('start', async (ctx) => {
    const fromUser = ctx.from;
    if (!fromUser) return;

    const session = ctx.session;
    const payload = ctx.match || '';

    if (payload.startsWith('ref_')) {
      session.referrerId = payload.replace('ref_', '');
    }

    const user = await getUserByTelegramId(fromUser.id);

    if (user) {
      session.userId = user.id;
      await ctx.reply(msg.welcomeLinked(user.first_name), {
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard(),
      });
    } else {
      await ctx.reply(msg.welcome(fromUser.first_name || 'друже'), {
        parse_mode: 'HTML',
        reply_markup: registerOrLinkKeyboard(),
      });
    }
  });

  // /link
  bot.command('link', async (ctx) => {
    const fromUser = ctx.from;
    if (!fromUser) return;

    const session = ctx.session;
    const user = await getUserByTelegramId(fromUser.id);

    if (user) {
      session.userId = user.id;
      await ctx.reply(msg.linkAlreadyLinked(`${user.first_name} ${user.last_name}`), {
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard(),
      });
      return;
    }

    await ctx.reply(msg.linkAskMethod, {
      parse_mode: 'HTML',
      reply_markup: linkMethodsKeyboard(),
    });
  });

  // /mystats
  bot.command('mystats', async (ctx) => {
    const fromUser = ctx.from;
    if (!fromUser) return;

    const session = ctx.session;
    let userId = session.userId;

    if (!userId) {
      const user = await getUserByTelegramId(fromUser.id);
      if (user) { userId = user.id; session.userId = userId; }
    }

    if (!userId) {
      await ctx.reply(msg.notLinked, { parse_mode: 'HTML', reply_markup: registerOrLinkKeyboard() });
      return;
    }

    const { user, referralCount, totalPoints } = await getUserStats(userId);
    if (!user) {
      await ctx.reply(msg.notLinked, { parse_mode: 'HTML', reply_markup: registerOrLinkKeyboard() });
      return;
    }

    await ctx.reply(
      msg.stats({
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        tier: user.membership_tier,
        status: user.status,
        points: totalPoints,
        referrals: referralCount,
      }),
      { parse_mode: 'HTML', reply_markup: mainMenuKeyboard() }
    );
  });

  // /referrals
  bot.command('referrals', async (ctx) => {
    const fromUser = ctx.from;
    if (!fromUser) return;

    const session = ctx.session;
    let userId = session.userId;

    if (!userId) {
      const user = await getUserByTelegramId(fromUser.id);
      if (user) { userId = user.id; session.userId = userId; }
    }

    if (!userId) {
      await ctx.reply(msg.notLinked, { parse_mode: 'HTML', reply_markup: registerOrLinkKeyboard() });
      return;
    }

    const referrals = await getReferrals(userId);
    await ctx.reply(msg.referralList(referrals), {
      parse_mode: 'HTML',
      reply_markup: mainMenuKeyboard(),
    });
  });

  // /invite
  bot.command('invite', async (ctx) => {
    const fromUser = ctx.from;
    if (!fromUser) return;

    const session = ctx.session;
    let userId = session.userId;

    if (!userId) {
      const user = await getUserByTelegramId(fromUser.id);
      if (user) { userId = user.id; session.userId = userId; }
    }

    if (!userId) {
      await ctx.reply(msg.notLinked, { parse_mode: 'HTML', reply_markup: registerOrLinkKeyboard() });
      return;
    }

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'Orden_of_veterans_bot';
    await ctx.reply(msg.inviteLink(userId, botUsername), {
      parse_mode: 'HTML',
      reply_markup: mainMenuKeyboard(),
    });
  });

  // /settings
  bot.command('settings', async (ctx) => {
    const fromUser = ctx.from;
    if (!fromUser) return;

    const session = ctx.session;
    let userId = session.userId;

    if (!userId) {
      const user = await getUserByTelegramId(fromUser.id);
      if (user) { userId = user.id; session.userId = userId; }
    }

    if (!userId) {
      await ctx.reply(msg.notLinked, { parse_mode: 'HTML', reply_markup: registerOrLinkKeyboard() });
      return;
    }

    const supabase = createBotAdminClient();
    const { data: user } = await supabase
      .from('users')
      .select('telegram_notifications_enabled')
      .eq('id', userId)
      .single();

    const enabled = user?.telegram_notifications_enabled ?? true;
    await ctx.reply(msg.settings(enabled), {
      parse_mode: 'HTML',
      reply_markup: notificationsKeyboard(enabled),
    });
  });

  // /help
  bot.command('help', async (ctx) => {
    await ctx.reply(msg.help, {
      parse_mode: 'HTML',
      reply_markup: mainMenuKeyboard(),
    });
  });
}
