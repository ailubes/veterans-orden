import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateReferralCode } from '@/lib/utils';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET environment variable');
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const eventType = evt.type;

  // Handle user.created
  if (eventType === 'user.created') {
    const { id, email_addresses, phone_numbers, first_name, last_name, image_url } = evt.data;

    const email = email_addresses?.[0]?.email_address ?? '';
    const phone = phone_numbers?.[0]?.phone_number ?? null;

    try {
      await db.insert(users).values({
        clerkId: id,
        email,
        phone,
        firstName: first_name ?? '',
        lastName: last_name ?? '',
        avatarUrl: image_url ?? null,
        role: 'prospect',
        status: 'pending',
        referralCode: generateReferralCode(),
        isEmailVerified: email_addresses?.[0]?.verification?.status === 'verified',
        isPhoneVerified: phone_numbers?.[0]?.verification?.status === 'verified',
      });

      console.log(`User created: ${id}`);
    } catch (error) {
      console.error('Error creating user:', error);
      return new Response('Error creating user', { status: 500 });
    }
  }

  // Handle user.updated
  if (eventType === 'user.updated') {
    const { id, email_addresses, phone_numbers, first_name, last_name, image_url } = evt.data;

    const email = email_addresses?.[0]?.email_address;
    const phone = phone_numbers?.[0]?.phone_number;

    try {
      await db
        .update(users)
        .set({
          email: email ?? undefined,
          phone: phone ?? undefined,
          firstName: first_name ?? undefined,
          lastName: last_name ?? undefined,
          avatarUrl: image_url ?? undefined,
          isEmailVerified: email_addresses?.[0]?.verification?.status === 'verified',
          isPhoneVerified: phone_numbers?.[0]?.verification?.status === 'verified',
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, id));

      console.log(`User updated: ${id}`);
    } catch (error) {
      console.error('Error updating user:', error);
      return new Response('Error updating user', { status: 500 });
    }
  }

  // Handle user.deleted
  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    if (id) {
      try {
        await db
          .update(users)
          .set({
            status: 'deleted',
            updatedAt: new Date(),
          })
          .where(eq(users.clerkId, id));

        console.log(`User deleted (soft): ${id}`);
      } catch (error) {
        console.error('Error deleting user:', error);
        return new Response('Error deleting user', { status: 500 });
      }
    }
  }

  return new Response('OK', { status: 200 });
}
