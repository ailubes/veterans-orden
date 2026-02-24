import { Bot, Context } from 'grammy';
import type { BotSession } from '../bot';
import {
  getUserByTelegramId,
  getUserByEmail,
  getUserByPhone,
  linkTelegramToUser,
  getUserStats,
  getReferrals,
  getActiveVotes,
  castVote,
  createBotAdminClient,
} from '../db';
import { normalizePhone, verifyLinkCode } from '../utils';
import { msg } from '../messages';
import {
  mainMenuKeyboard,
  registerOrLinkKeyboard,
  linkMethodsKeyboard,
  notificationsKeyboard,
  voteListKeyboard,
  voteKeyboard,
  cancelKeyboard,
  shareContactKeyboard,
  linkSuccessKeyboard,
} from '../keyboards';

type BotContext = Context & { session: BotSession };

export function registerCallbackHandlers(bot: Bot<BotContext>) {
  // Cancel any ongoing flow
  bot.callbackQuery('cancel', async (ctx) => {
    ctx.answerCallbackQuery().catch(() => {});
    const session = ctx.session;
    session.state = undefined;
    session.regData = undefined;
    await ctx.editMessageText(msg.cancelled, { parse_mode: 'HTML' });
  });

  // Help inline button
  bot.callbackQuery('help', async (ctx) => {
    ctx.answerCallbackQuery().catch(() => {});
    await ctx.editMessageText(msg.help, {
      parse_mode: 'HTML',
      reply_markup: mainMenuKeyboard(),
    });
  });

  // Register flow start
  bot.callbackQuery('register', async (ctx) => {
    ctx.answerCallbackQuery().catch(() => {});
    const session = ctx.session;
    session.state = 'reg:await_phone';
    session.regData = {};

    await ctx.editMessageText(msg.regAskPhone, {
      parse_mode: 'HTML',
      reply_markup: cancelKeyboard(),
    });

    // Send share contact keyboard as separate message
    await ctx.reply('або натисніть кнопку:', {
      reply_markup: shareContactKeyboard(),
    });
  });

  // Link: show method options
  bot.callbackQuery('link:start', async (ctx) => {
    ctx.answerCallbackQuery().catch(() => {});
    await ctx.editMessageText(msg.linkAskMethod, {
      parse_mode: 'HTML',
      reply_markup: linkMethodsKeyboard(),
    });
  });

  // Link via email
  bot.callbackQuery('link:email', async (ctx) => {
    ctx.answerCallbackQuery().catch(() => {});
    const session = ctx.session;
    session.state = 'link:await_email';
    await ctx.editMessageText(msg.linkAskEmail, {
      parse_mode: 'HTML',
      reply_markup: cancelKeyboard(),
    });
  });

  // Link via phone
  bot.callbackQuery('link:phone', async (ctx) => {
    ctx.answerCallbackQuery().catch(() => {});
    const session = ctx.session;
    session.state = 'link:await_phone';
    await ctx.editMessageText(msg.linkAskPhone, {
      parse_mode: 'HTML',
      reply_markup: cancelKeyboard(),
    });
    await ctx.reply('або натисніть кнопку:', {
      reply_markup: shareContactKeyboard(),
    });
  });

  // Link via code from website
  bot.callbackQuery('link:code', async (ctx) => {
    ctx.answerCallbackQuery().catch(() => {});
    const session = ctx.session;
    session.state = 'link:await_code';
    await ctx.editMessageText(msg.linkAskCode, {
      parse_mode: 'HTML',
      reply_markup: cancelKeyboard(),
    });
  });

  // Main menu navigation
  bot.callbackQuery('menu:main', async (ctx) => {
    ctx.answerCallbackQuery().catch(() => {});
    const session = ctx.session;
    const fromUser = ctx.from;

    let userId = session.userId;
    if (!userId) {
      const user = await getUserByTelegramId(fromUser.id);
      if (user) { userId = user.id; session.userId = userId; }
    }

    if (!userId) {
      await ctx.editMessageText(msg.welcome(fromUser.first_name || 'друже'), {
        parse_mode: 'HTML',
        reply_markup: registerOrLinkKeyboard(),
      });
      return;
    }

    await ctx.editMessageText(msg.welcomeLinked(fromUser.first_name || ''), {
      parse_mode: 'HTML',
      reply_markup: mainMenuKeyboard(),
    });
  });

  bot.callbackQuery('menu:stats', async (ctx) => {
    ctx.answerCallbackQuery().catch(() => {});
    const session = ctx.session;
    const fromUser = ctx.from;

    let userId = session.userId;
    if (!userId) {
      const user = await getUserByTelegramId(fromUser.id);
      if (user) { userId = user.id; session.userId = userId; }
    }

    if (!userId) {
      await ctx.editMessageText(msg.notLinked, {
        parse_mode: 'HTML',
        reply_markup: registerOrLinkKeyboard(),
      });
      return;
    }

    const { user, referralCount, totalPoints } = await getUserStats(userId);
    if (!user) {
      await ctx.editMessageText(msg.notLinked, {
        parse_mode: 'HTML',
        reply_markup: registerOrLinkKeyboard(),
      });
      return;
    }

    await ctx.editMessageText(
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

  bot.callbackQuery('menu:referrals', async (ctx) => {
    ctx.answerCallbackQuery().catch(() => {});
    const session = ctx.session;
    const fromUser = ctx.from;

    let userId = session.userId;
    if (!userId) {
      const user = await getUserByTelegramId(fromUser.id);
      if (user) { userId = user.id; session.userId = userId; }
    }

    if (!userId) {
      await ctx.editMessageText(msg.notLinked, {
        parse_mode: 'HTML',
        reply_markup: registerOrLinkKeyboard(),
      });
      return;
    }

    const referrals = await getReferrals(userId);
    await ctx.editMessageText(msg.referralList(referrals), {
      parse_mode: 'HTML',
      reply_markup: mainMenuKeyboard(),
    });
  });

  bot.callbackQuery('menu:invite', async (ctx) => {
    ctx.answerCallbackQuery().catch(() => {});
    const session = ctx.session;
    const fromUser = ctx.from;

    let userId = session.userId;
    if (!userId) {
      const user = await getUserByTelegramId(fromUser.id);
      if (user) { userId = user.id; session.userId = userId; }
    }

    if (!userId) {
      await ctx.editMessageText(msg.notLinked, {
        parse_mode: 'HTML',
        reply_markup: registerOrLinkKeyboard(),
      });
      return;
    }

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'Orden_of_veterans_bot';
    await ctx.editMessageText(msg.inviteLink(userId, botUsername), {
      parse_mode: 'HTML',
      reply_markup: mainMenuKeyboard(),
    });
  });

  bot.callbackQuery('menu:votes', async (ctx) => {
    ctx.answerCallbackQuery().catch(() => {});
    const session = ctx.session;
    const fromUser = ctx.from;

    let userId = session.userId;
    if (!userId) {
      const user = await getUserByTelegramId(fromUser.id);
      if (user) { userId = user.id; session.userId = userId; }
    }

    if (!userId) {
      await ctx.editMessageText(msg.notLinked, {
        parse_mode: 'HTML',
        reply_markup: registerOrLinkKeyboard(),
      });
      return;
    }

    const votes = await getActiveVotes();
    await ctx.editMessageText(msg.voteList(votes.length), {
      parse_mode: 'HTML',
      reply_markup: voteListKeyboard(votes),
    });
  });

  bot.callbackQuery('menu:settings', async (ctx) => {
    ctx.answerCallbackQuery().catch(() => {});
    const session = ctx.session;
    const fromUser = ctx.from;

    let userId = session.userId;
    if (!userId) {
      const user = await getUserByTelegramId(fromUser.id);
      if (user) { userId = user.id; session.userId = userId; }
    }

    if (!userId) {
      await ctx.editMessageText(msg.notLinked, {
        parse_mode: 'HTML',
        reply_markup: registerOrLinkKeyboard(),
      });
      return;
    }

    const supabase = createBotAdminClient();
    const { data: user } = await supabase
      .from('users')
      .select('telegram_notifications_enabled')
      .eq('id', userId)
      .single();

    const enabled = user?.telegram_notifications_enabled ?? true;
    await ctx.editMessageText(msg.settings(enabled), {
      parse_mode: 'HTML',
      reply_markup: notificationsKeyboard(enabled),
    });
  });

  // Notifications toggle
  bot.callbackQuery('notif:toggle', async (ctx) => {
    ctx.answerCallbackQuery().catch(() => {});
    const session = ctx.session;
    const fromUser = ctx.from;

    let userId = session.userId;
    if (!userId) {
      const user = await getUserByTelegramId(fromUser.id);
      if (user) { userId = user.id; session.userId = userId; }
    }

    if (!userId) {
      await ctx.editMessageText(msg.notLinked, { parse_mode: 'HTML' });
      return;
    }

    const supabase = createBotAdminClient();
    const { data: user } = await supabase
      .from('users')
      .select('telegram_notifications_enabled')
      .eq('id', userId)
      .single();

    const currentEnabled = user?.telegram_notifications_enabled ?? true;
    const newEnabled = !currentEnabled;

    await supabase
      .from('users')
      .update({ telegram_notifications_enabled: newEnabled })
      .eq('id', userId);

    const replyText = newEnabled ? msg.notificationsEnabled : msg.notificationsDisabled;
    await ctx.editMessageText(
      msg.settings(newEnabled) + '\n\n' + replyText,
      {
        parse_mode: 'HTML',
        reply_markup: notificationsKeyboard(newEnabled),
      }
    );
  });

  // Vote: open details
  bot.callbackQuery(/^vote_open:(.+)$/, async (ctx) => {
    ctx.answerCallbackQuery().catch(() => {});
    const voteId = ctx.match[1];

    const supabase = createBotAdminClient();
    const { data: vote } = await supabase
      .from('votes')
      .select('id, title, description, ends_at, options:vote_options(id, text)')
      .eq('id', voteId)
      .single();

    if (!vote) {
      await ctx.editMessageText(msg.error, { parse_mode: 'HTML' });
      return;
    }

    await ctx.editMessageText(msg.voteDetails(vote), {
      parse_mode: 'HTML',
      reply_markup: voteKeyboard(voteId, vote.options || []),
    });
  });

  // Vote: cast vote
  bot.callbackQuery(/^vote:([^:]+):(.+)$/, async (ctx) => {
    ctx.answerCallbackQuery().catch(() => {});
    const session = ctx.session;
    const fromUser = ctx.from;
    const voteId = ctx.match[1];
    const optionId = ctx.match[2];

    let userId = session.userId;
    if (!userId) {
      const user = await getUserByTelegramId(fromUser.id);
      if (user) { userId = user.id; session.userId = userId; }
    }

    if (!userId) {
      await ctx.editMessageText(msg.notLinked, {
        parse_mode: 'HTML',
        reply_markup: registerOrLinkKeyboard(),
      });
      return;
    }

    const result = await castVote(userId, voteId, optionId);

    if (result.success) {
      await ctx.editMessageText(msg.voteSuccess, {
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard(),
      });
    } else if (result.reason === 'already_voted') {
      await ctx.editMessageText(msg.voteAlreadyVoted, {
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard(),
      });
    } else {
      await ctx.editMessageText(msg.voteError, {
        parse_mode: 'HTML',
        reply_markup: mainMenuKeyboard(),
      });
    }
  });

  // Handle text input for link flows
  bot.on('message:text', async (ctx, next) => {
    const session = ctx.session;
    const fromUser = ctx.from;
    const text = ctx.message.text.trim();

    if (session.state === 'link:await_email') {
      const user = await getUserByEmail(text);
      if (!user) {
        await ctx.reply(msg.linkNotFound, {
          parse_mode: 'HTML',
          reply_markup: registerOrLinkKeyboard(),
        });
        session.state = undefined;
        return;
      }

      if (user.telegram_id && user.telegram_id !== fromUser.id) {
        await ctx.reply(msg.linkAlreadyLinked(`${user.first_name} ${user.last_name}`), {
          parse_mode: 'HTML',
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
          reply_markup: mainMenuKeyboard(),
        });
      } else {
        await ctx.reply(msg.error, { parse_mode: 'HTML' });
      }
      return;
    }

    if (session.state === 'link:await_phone') {
      const phone = normalizePhone(text);
      if (!phone) {
        await ctx.reply(msg.regPhoneInvalid, { parse_mode: 'HTML' });
        return;
      }

      const user = await getUserByPhone(phone);
      if (!user) {
        await ctx.reply(msg.linkNotFound, {
          parse_mode: 'HTML',
          reply_markup: registerOrLinkKeyboard(),
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
          reply_markup: mainMenuKeyboard(),
        });
      } else {
        await ctx.reply(msg.error, { parse_mode: 'HTML' });
      }
      return;
    }

    if (session.state === 'link:await_code') {
      const userId = verifyLinkCode(text);
      if (!userId) {
        await ctx.reply(msg.linkCodeExpired, {
          parse_mode: 'HTML',
          reply_markup: cancelKeyboard(),
        });
        return;
      }

      const success = await linkTelegramToUser(
        userId,
        fromUser.id,
        fromUser.username,
        fromUser.first_name
      );

      if (success) {
        session.userId = userId;
        session.state = undefined;

        const supabase = createBotAdminClient();
        const { data: user } = await supabase
          .from('users')
          .select('first_name')
          .eq('id', userId)
          .single();

        await ctx.reply(msg.linkSuccess(user?.first_name || 'друже'), {
          parse_mode: 'HTML',
          reply_markup: mainMenuKeyboard(),
        });
      } else {
        await ctx.reply(msg.error, { parse_mode: 'HTML' });
      }
      return;
    }

    // Pass to next handler (e.g., registration)
    await next();
  });
}
