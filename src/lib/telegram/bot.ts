import { Bot, session, Context } from 'grammy';
import { registerCommandHandlers } from './handlers/commands';
import { registerCallbackHandlers } from './handlers/callbacks';
import { registerRegistrationHandler } from './handlers/registration';
import { registerContactHandler } from './handlers/contacts';

export interface SettlementResult {
  code: string;
  name: string;
  hromadaName: string | null;
  raionName: string | null;
  oblastName: string | null;
}

export interface BotSession {
  userId?: string;
  referrerId?: string;
  state?: string;
  regData?: {
    phone?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    oblastId?: string;
    oblastName?: string;
    oblastList?: Array<{ id: string; name: string }>;
    // KATOTTG settlement search results (shown as numbered list)
    settlementResults?: SettlementResult[];
    // Chosen KATOTTG entry
    katottgCode?: string;
    katottgSettlementName?: string;
    katottgHromadaName?: string;
    katottgRaionName?: string;
    katottgOblastName?: string;
  };
}

export type MyContext = Context & { session: BotSession };

// In-memory session store (safe since PM2 process persists)
const sessionData = new Map<number, BotSession>();

const token = process.env.TELEGRAM_BOT_TOKEN || 'placeholder_token';
export const bot = new Bot<MyContext>(token);

// Session middleware using in-memory Map
bot.use(
  session<BotSession, MyContext>({
    initial: () => ({}),
    storage: {
      read: async (key) => sessionData.get(Number(key)) ?? {},
      write: async (key, value) => { sessionData.set(Number(key), value); },
      delete: async (key) => { sessionData.delete(Number(key)); },
    },
  })
);

// Error handler
bot.catch((err) => {
  console.error('[TG Bot Error]', err.error, 'update:', JSON.stringify(err.ctx?.update));
});

// Register all handlers — order matters: callbacks first, then text handlers
registerCallbackHandlers(bot);
registerRegistrationHandler(bot);
registerContactHandler(bot);
registerCommandHandlers(bot);
