-- Add ticket pricing fields to events table
ALTER TABLE "events" ADD COLUMN "requires_ticket_purchase" boolean DEFAULT false;
ALTER TABLE "events" ADD COLUMN "ticket_price_points" integer;
ALTER TABLE "events" ADD COLUMN "ticket_price_uah" integer;
ALTER TABLE "events" ADD COLUMN "ticket_quantity" integer;

-- Add ticket tracking fields to event_rsvps table
ALTER TABLE "event_rsvps" ADD COLUMN "ticket_purchased" boolean DEFAULT false;
ALTER TABLE "event_rsvps" ADD COLUMN "order_id" uuid REFERENCES "orders"("id");

-- Add index for order lookups
CREATE INDEX IF NOT EXISTS "event_rsvps_order_idx" ON "event_rsvps" ("order_id");
