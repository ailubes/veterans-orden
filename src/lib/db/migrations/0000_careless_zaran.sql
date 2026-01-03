CREATE TYPE "public"."advancement_mode" AS ENUM('automatic', 'approval_required');--> statement-breakpoint
CREATE TYPE "public"."advancement_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."advancement_trigger" AS ENUM('contribution', 'referral_count', 'tree_count', 'helped_advance', 'manual');--> statement-breakpoint
CREATE TYPE "public"."article_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."audience_type" AS ENUM('all', 'members', 'leaders', 'admins');--> statement-breakpoint
CREATE TYPE "public"."challenge_goal_type" AS ENUM('referrals', 'tasks', 'events', 'votes', 'points');--> statement-breakpoint
CREATE TYPE "public"."challenge_status" AS ENUM('upcoming', 'active', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."challenge_type" AS ENUM('weekly', 'monthly', 'special');--> statement-breakpoint
CREATE TYPE "public"."email_send_status" AS ENUM('pending', 'sent', 'failed', 'bounced');--> statement-breakpoint
CREATE TYPE "public"."event_scope" AS ENUM('national', 'regional', 'local');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('meeting', 'rally', 'training', 'social', 'online', 'other');--> statement-breakpoint
CREATE TYPE "public"."membership_role" AS ENUM('supporter', 'candidate', 'member', 'honorary_member', 'network_leader', 'regional_leader', 'national_leader', 'network_guide');--> statement-breakpoint
CREATE TYPE "public"."membership_tier" AS ENUM('free', 'basic_49', 'supporter_100', 'supporter_200', 'patron_500');--> statement-breakpoint
CREATE TYPE "public"."news_category" AS ENUM('announcement', 'update', 'success_story', 'media', 'education');--> statement-breakpoint
CREATE TYPE "public"."news_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('system', 'vote', 'event', 'task', 'achievement', 'news', 'referral');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('liqpay', 'monobank', 'manual');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('membership', 'donation', 'event');--> statement-breakpoint
CREATE TYPE "public"."points_transaction_type" AS ENUM('earn_task', 'earn_event', 'earn_vote', 'earn_referral', 'earn_daily_login', 'earn_content', 'earn_challenge', 'earn_admin', 'spend_marketplace', 'spend_event', 'expire_annual', 'refund');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('draft', 'active', 'out_of_stock', 'discontinued');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('physical', 'digital', 'event_ticket');--> statement-breakpoint
CREATE TYPE "public"."rsvp_status" AS ENUM('going', 'maybe', 'not_going');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('none', 'news_editor', 'admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('open', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."task_type" AS ENUM('recruitment', 'outreach', 'event_support', 'content', 'administrative', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('free_viewer', 'prospect', 'silent_member', 'full_member', 'group_leader', 'regional_leader', 'news_editor', 'admin', 'super_admin');--> statement-breakpoint
CREATE TYPE "public"."user_sex" AS ENUM('male', 'female', 'not_specified');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('pending', 'active', 'suspended', 'churned', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."verification_method" AS ENUM('none', 'email', 'phone', 'bankid', 'diia', 'manual');--> statement-breakpoint
CREATE TYPE "public"."vote_scope" AS ENUM('national', 'regional', 'group');--> statement-breakpoint
CREATE TYPE "public"."vote_status" AS ENUM('draft', 'active', 'closed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."vote_transparency" AS ENUM('anonymous', 'public');--> statement-breakpoint
CREATE TYPE "public"."vote_type" AS ENUM('binary', 'multiple_choice', 'ranked', 'approval');--> statement-breakpoint
CREATE TABLE "advancement_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"requested_role" "membership_role" NOT NULL,
	"current_role" "membership_role" NOT NULL,
	"requested_at" timestamp DEFAULT now(),
	"status" "advancement_request_status" DEFAULT 'pending',
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"rejection_reason" text
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid,
	"old_data" jsonb,
	"new_data" jsonb,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name_uk" varchar(100) NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"description_uk" text,
	"description_en" text,
	"icon_url" text,
	"category" varchar(50) DEFAULT 'challenge',
	"rarity" varchar(20) DEFAULT 'common',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "challenge_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"progress" integer DEFAULT 0,
	"completed_at" timestamp,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"reward_claimed" boolean DEFAULT false,
	"final_rank" integer
);
--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" "challenge_type" DEFAULT 'weekly' NOT NULL,
	"goal_type" "challenge_goal_type" NOT NULL,
	"goal_target" integer NOT NULL,
	"points" integer DEFAULT 0,
	"badge_id" varchar(50),
	"is_competitive" boolean DEFAULT false,
	"max_winners" integer DEFAULT 1,
	"image_url" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" "challenge_status" DEFAULT 'upcoming' NOT NULL,
	"created_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commanderies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar(20) NOT NULL,
	"parent_code" varchar(20),
	"leader_id" uuid,
	"member_count" integer DEFAULT 0,
	"group_count" integer DEFAULT 0,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "commanderies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "email_send_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_key" varchar(100) NOT NULL,
	"template_version" integer,
	"recipient_email" varchar(255) NOT NULL,
	"recipient_user_id" uuid,
	"subject" varchar(255) NOT NULL,
	"variables_used" jsonb,
	"status" "email_send_status" DEFAULT 'pending' NOT NULL,
	"provider_message_id" varchar(255),
	"error_message" text,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "email_template_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"subject" varchar(255) NOT NULL,
	"html_content" text NOT NULL,
	"text_content" text,
	"changed_by_id" uuid,
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"change_reason" text
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_key" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"subject" varchar(255) NOT NULL,
	"html_content" text NOT NULL,
	"text_content" text,
	"available_variables" jsonb DEFAULT '[]'::jsonb,
	"variable_descriptions" jsonb DEFAULT '{}'::jsonb,
	"preview_data" jsonb DEFAULT '{}'::jsonb,
	"is_active" boolean DEFAULT true,
	"version" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"last_sent_at" timestamp,
	CONSTRAINT "email_templates_template_key_unique" UNIQUE("template_key")
);
--> statement-breakpoint
CREATE TABLE "event_rsvps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "rsvp_status" NOT NULL,
	"responded_at" timestamp DEFAULT now() NOT NULL,
	"attended_at" timestamp,
	"ticket_purchased" boolean DEFAULT false,
	"order_id" uuid
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" "event_type" DEFAULT 'meeting' NOT NULL,
	"scope" "event_scope" DEFAULT 'local' NOT NULL,
	"is_online" boolean DEFAULT false,
	"location" jsonb,
	"online_url" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"timezone" varchar(50) DEFAULT 'Europe/Kyiv',
	"organizer_id" uuid NOT NULL,
	"oblast_id" uuid,
	"group_id" uuid,
	"max_attendees" integer,
	"rsvp_deadline" timestamp,
	"requires_ticket_purchase" boolean DEFAULT false,
	"ticket_price_points" integer,
	"ticket_price_uah" integer,
	"ticket_quantity" integer,
	"going_count" integer DEFAULT 0,
	"maybe_count" integer DEFAULT 0,
	"status" "event_status" DEFAULT 'draft' NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"oblast_id" uuid NOT NULL,
	"commandery_id" uuid,
	"city_id" varchar(50),
	"leader_id" uuid,
	"member_count" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "help_article_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"user_id" uuid,
	"is_helpful" boolean NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "help_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"video_url" text,
	"keywords" jsonb DEFAULT '[]'::jsonb,
	"audience" "audience_type" DEFAULT 'all',
	"meta_title" varchar(70),
	"meta_description" varchar(160),
	"view_count" integer DEFAULT 0,
	"helpful_count" integer DEFAULT 0,
	"not_helpful_count" integer DEFAULT 0,
	"status" "article_status" DEFAULT 'draft',
	"published_at" timestamp,
	"author_id" uuid NOT NULL,
	"related_article_ids" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "help_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "help_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_uk" varchar(100) NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"parent_id" uuid,
	"order" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "help_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "help_tooltips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_slug" varchar(100) NOT NULL,
	"element_id" varchar(100) NOT NULL,
	"content" text NOT NULL,
	"article_id" uuid,
	"audience" "audience_type" DEFAULT 'all',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "katottg" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(19) NOT NULL,
	"category" varchar(1) NOT NULL,
	"name" varchar(255) NOT NULL,
	"level" integer NOT NULL,
	"oblast_code" varchar(19),
	"raion_code" varchar(19),
	"hromada_code" varchar(19),
	"oblast_name" varchar(255),
	"raion_name" varchar(255),
	"hromada_name" varchar(255),
	"full_path" text,
	"name_normalized" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "katottg_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "katottg_categories" (
	"code" varchar(1) PRIMARY KEY NOT NULL,
	"name_uk" varchar(100) NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"description_uk" varchar(255),
	"level" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"featured_image_url" text,
	"images" jsonb DEFAULT '[]'::jsonb,
	"video_url" text,
	"category" "news_category" DEFAULT 'update' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_public" boolean DEFAULT true,
	"is_pinned" boolean DEFAULT false,
	"author_id" uuid NOT NULL,
	"status" "news_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp,
	"view_count" integer DEFAULT 0,
	"meta_title" varchar(70),
	"meta_description" varchar(160),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "news_category_meta" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"name_uk" varchar(100) NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(50),
	"color" varchar(20),
	"order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"reference_type" varchar(50),
	"reference_id" uuid,
	"data" jsonb,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"channels" jsonb DEFAULT '["in_app"]'::jsonb,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oblasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"code" varchar(10) NOT NULL,
	"leader_id" uuid,
	"member_count" integer DEFAULT 0,
	"group_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oblasts_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price_points" integer NOT NULL,
	"price_uah" integer,
	"product_name" varchar(255) NOT NULL,
	"product_type" "product_type" NOT NULL,
	"variant" jsonb,
	"download_url" text,
	"download_count" integer DEFAULT 0,
	"download_expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" varchar(20) NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"total_points" integer NOT NULL,
	"total_uah" integer DEFAULT 0,
	"requires_shipping" boolean DEFAULT false,
	"shipping_address" jsonb,
	"nova_poshta_city" varchar(100),
	"nova_poshta_city_ref" varchar(50),
	"nova_poshta_branch" varchar(100),
	"nova_poshta_branch_ref" varchar(50),
	"tracking_number" varchar(100),
	"shipped_at" timestamp,
	"delivered_at" timestamp,
	"customer_notes" text,
	"admin_notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"cancelled_at" timestamp,
	"refunded_at" timestamp,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "organization_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" uuid,
	CONSTRAINT "organization_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "payment_type" NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'UAH',
	"membership_tier" "membership_tier",
	"period_start" timestamp,
	"period_end" timestamp,
	"provider" "payment_provider" NOT NULL,
	"provider_transaction_id" varchar(255),
	"provider_data" jsonb,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "points_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "points_transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"earned_year" integer,
	"expires_at" timestamp,
	"reference_type" varchar(50),
	"reference_id" uuid,
	"description" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by_id" uuid
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"name_uk" varchar(255) NOT NULL,
	"description" text,
	"description_uk" text,
	"slug" varchar(255) NOT NULL,
	"type" "product_type" NOT NULL,
	"status" "product_status" DEFAULT 'draft' NOT NULL,
	"price_points" integer NOT NULL,
	"price_uah" integer,
	"stock_quantity" integer,
	"max_per_user" integer DEFAULT 1,
	"image_url" text,
	"images" jsonb,
	"requires_shipping" boolean DEFAULT false,
	"weight" integer,
	"dimensions" jsonb,
	"digital_asset_url" text,
	"download_limit" integer,
	"required_level" integer DEFAULT 1,
	"required_role" varchar(50),
	"available_from" timestamp,
	"available_until" timestamp,
	"featured" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"tags" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by_id" uuid,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "role_advancements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"from_role" "membership_role" NOT NULL,
	"to_role" "membership_role" NOT NULL,
	"advanced_at" timestamp DEFAULT now(),
	"advanced_by" uuid,
	"trigger_type" "advancement_trigger" NOT NULL,
	"trigger_data" jsonb DEFAULT '{}'::jsonb,
	"approved_by" uuid,
	"approved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "role_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "membership_role" NOT NULL,
	"role_level" integer NOT NULL,
	"display_name_uk" varchar(100) NOT NULL,
	"description_uk" text,
	"requires_contribution" boolean DEFAULT false,
	"min_contribution_amount" integer,
	"min_direct_referrals" integer DEFAULT 0,
	"min_direct_referrals_at_role" "membership_role",
	"min_total_referrals" integer DEFAULT 0,
	"min_helped_advance" integer DEFAULT 0,
	"helped_advance_from_role" "membership_role",
	"helped_advance_to_role" "membership_role",
	"privileges" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "role_requirements_role_unique" UNIQUE("role")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" "task_type" DEFAULT 'other' NOT NULL,
	"assignee_id" uuid,
	"assignee_type" varchar(20) DEFAULT 'individual',
	"group_id" uuid,
	"oblast_id" uuid,
	"status" "task_status" DEFAULT 'open' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"due_date" timestamp,
	"completed_at" timestamp,
	"points" integer DEFAULT 0,
	"requires_proof" boolean DEFAULT false,
	"proof_url" text,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"achievement_id" varchar(50) NOT NULL,
	"earned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_location_changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"previous_katottg_code" varchar(19),
	"previous_settlement_name" varchar(255),
	"previous_hromada_name" varchar(255),
	"previous_raion_name" varchar(255),
	"previous_oblast_name" varchar(255),
	"new_katottg_code" varchar(19),
	"new_settlement_name" varchar(255),
	"new_hromada_name" varchar(255),
	"new_raion_name" varchar(255),
	"new_oblast_name" varchar(255),
	"change_reason" varchar(100),
	"changed_by" uuid,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_referral_stats" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"direct_supporters" integer DEFAULT 0,
	"direct_candidates" integer DEFAULT 0,
	"direct_members" integer DEFAULT 0,
	"direct_honorary_members" integer DEFAULT 0,
	"direct_network_leaders" integer DEFAULT 0,
	"direct_regional_leaders" integer DEFAULT 0,
	"direct_national_leaders" integer DEFAULT 0,
	"direct_network_guides" integer DEFAULT 0,
	"total_tree_count" integer DEFAULT 0,
	"helped_to_candidate" integer DEFAULT 0,
	"helped_to_member" integer DEFAULT 0,
	"helped_to_honorary" integer DEFAULT 0,
	"helped_to_leader" integer DEFAULT 0,
	"helped_to_regional" integer DEFAULT 0,
	"helped_to_national" integer DEFAULT 0,
	"helped_to_guide" integer DEFAULT 0,
	"last_calculated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vote_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"option_id" uuid NOT NULL,
	"ranked_choices" jsonb,
	"casted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"patronymic" varchar(100),
	"date_of_birth" timestamp,
	"avatar_url" text,
	"sex" "user_sex" DEFAULT 'not_specified',
	"role" "user_role" DEFAULT 'prospect' NOT NULL,
	"status" "user_status" DEFAULT 'pending' NOT NULL,
	"membership_role" "membership_role" DEFAULT 'supporter',
	"staff_role" "staff_role" DEFAULT 'none',
	"role_advanced_at" timestamp,
	"total_referral_count" integer DEFAULT 0,
	"is_email_verified" boolean DEFAULT false,
	"is_phone_verified" boolean DEFAULT false,
	"is_identity_verified" boolean DEFAULT false,
	"verification_method" "verification_method" DEFAULT 'none',
	"oblast_id" uuid,
	"commandery_id" uuid,
	"group_id" uuid,
	"city" varchar(100),
	"katottg_code" varchar(19),
	"settlement_name" varchar(255),
	"hromada_name" varchar(255),
	"raion_name" varchar(255),
	"oblast_name_katottg" varchar(255),
	"location_last_changed_at" timestamp,
	"street_address" varchar(255),
	"postal_code" varchar(10),
	"nova_poshta_city" varchar(100),
	"nova_poshta_city_ref" varchar(50),
	"nova_poshta_branch" varchar(100),
	"nova_poshta_branch_ref" varchar(50),
	"member_since" timestamp,
	"membership_tier" "membership_tier" DEFAULT 'free',
	"membership_paid_until" timestamp,
	"referred_by_id" uuid,
	"referral_code" varchar(20) NOT NULL,
	"referral_count" integer DEFAULT 0,
	"points" integer DEFAULT 0,
	"level" integer DEFAULT 1,
	"current_year_points" integer DEFAULT 0,
	"last_login_at" timestamp,
	"login_streak" integer DEFAULT 0,
	"language" varchar(5) DEFAULT 'uk',
	"notification_preferences" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_active_at" timestamp,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "vote_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vote_id" uuid NOT NULL,
	"text" varchar(500) NOT NULL,
	"description" text,
	"order" integer DEFAULT 0,
	"vote_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"type" "vote_type" DEFAULT 'binary' NOT NULL,
	"transparency" "vote_transparency" DEFAULT 'anonymous' NOT NULL,
	"scope" "vote_scope" DEFAULT 'national' NOT NULL,
	"quorum_required" integer,
	"majority_required" integer DEFAULT 50,
	"eligible_roles" jsonb DEFAULT '["full_member"]'::jsonb,
	"eligible_oblasts" jsonb,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"total_votes" integer DEFAULT 0,
	"status" "vote_status" DEFAULT 'draft' NOT NULL,
	"created_by_id" uuid NOT NULL,
	"oblast_id" uuid,
	"group_id" uuid,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "advancement_requests" ADD CONSTRAINT "advancement_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advancement_requests" ADD CONSTRAINT "advancement_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_send_log" ADD CONSTRAINT "email_send_log_recipient_user_id_users_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_template_history" ADD CONSTRAINT "email_template_history_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_template_history" ADD CONSTRAINT "email_template_history_changed_by_id_users_id_fk" FOREIGN KEY ("changed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_rsvps" ADD CONSTRAINT "event_rsvps_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_oblast_id_oblasts_id_fk" FOREIGN KEY ("oblast_id") REFERENCES "public"."oblasts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_oblast_id_oblasts_id_fk" FOREIGN KEY ("oblast_id") REFERENCES "public"."oblasts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_commandery_id_commanderies_id_fk" FOREIGN KEY ("commandery_id") REFERENCES "public"."commanderies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "help_article_feedback" ADD CONSTRAINT "help_article_feedback_article_id_help_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."help_articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "help_article_feedback" ADD CONSTRAINT "help_article_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_category_id_help_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."help_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "help_articles" ADD CONSTRAINT "help_articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "help_tooltips" ADD CONSTRAINT "help_tooltips_article_id_help_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."help_articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_transactions" ADD CONSTRAINT "points_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_transactions" ADD CONSTRAINT "points_transactions_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_advancements" ADD CONSTRAINT "role_advancements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_advancements" ADD CONSTRAINT "role_advancements_advanced_by_users_id_fk" FOREIGN KEY ("advanced_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_advancements" ADD CONSTRAINT "role_advancements_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_oblast_id_oblasts_id_fk" FOREIGN KEY ("oblast_id") REFERENCES "public"."oblasts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_location_changes" ADD CONSTRAINT "user_location_changes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_location_changes" ADD CONSTRAINT "user_location_changes_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_referral_stats" ADD CONSTRAINT "user_referral_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_votes" ADD CONSTRAINT "user_votes_vote_id_votes_id_fk" FOREIGN KEY ("vote_id") REFERENCES "public"."votes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_votes" ADD CONSTRAINT "user_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_votes" ADD CONSTRAINT "user_votes_option_id_vote_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."vote_options"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_oblast_id_oblasts_id_fk" FOREIGN KEY ("oblast_id") REFERENCES "public"."oblasts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_commandery_id_commanderies_id_fk" FOREIGN KEY ("commandery_id") REFERENCES "public"."commanderies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vote_options" ADD CONSTRAINT "vote_options_vote_id_votes_id_fk" FOREIGN KEY ("vote_id") REFERENCES "public"."votes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_oblast_id_oblasts_id_fk" FOREIGN KEY ("oblast_id") REFERENCES "public"."oblasts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "advancement_requests_user_idx" ON "advancement_requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "advancement_requests_status_idx" ON "advancement_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "advancement_requests_requested_at_idx" ON "advancement_requests" USING btree ("requested_at");--> statement-breakpoint
CREATE INDEX "audit_log_user_idx" ON "audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_log_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "badges_category_idx" ON "badges" USING btree ("category");--> statement-breakpoint
CREATE INDEX "badges_rarity_idx" ON "badges" USING btree ("rarity");--> statement-breakpoint
CREATE UNIQUE INDEX "challenge_participants_unique" ON "challenge_participants" USING btree ("challenge_id","user_id");--> statement-breakpoint
CREATE INDEX "challenge_participants_challenge_idx" ON "challenge_participants" USING btree ("challenge_id");--> statement-breakpoint
CREATE INDEX "challenge_participants_user_idx" ON "challenge_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "challenges_status_idx" ON "challenges" USING btree ("status");--> statement-breakpoint
CREATE INDEX "challenges_start_date_idx" ON "challenges" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "challenges_is_competitive_idx" ON "challenges" USING btree ("is_competitive");--> statement-breakpoint
CREATE INDEX "challenges_created_by_idx" ON "challenges" USING btree ("created_by_id");--> statement-breakpoint
CREATE UNIQUE INDEX "commanderies_code_idx" ON "commanderies" USING btree ("code");--> statement-breakpoint
CREATE INDEX "commanderies_type_idx" ON "commanderies" USING btree ("type");--> statement-breakpoint
CREATE INDEX "commanderies_parent_code_idx" ON "commanderies" USING btree ("parent_code");--> statement-breakpoint
CREATE INDEX "email_send_log_template_idx" ON "email_send_log" USING btree ("template_key");--> statement-breakpoint
CREATE INDEX "email_send_log_recipient_idx" ON "email_send_log" USING btree ("recipient_email");--> statement-breakpoint
CREATE INDEX "email_send_log_user_idx" ON "email_send_log" USING btree ("recipient_user_id");--> statement-breakpoint
CREATE INDEX "email_send_log_sent_at_idx" ON "email_send_log" USING btree ("sent_at");--> statement-breakpoint
CREATE INDEX "email_send_log_status_idx" ON "email_send_log" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_template_history_template_idx" ON "email_template_history" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "email_template_history_version_idx" ON "email_template_history" USING btree ("template_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "email_templates_key_idx" ON "email_templates" USING btree ("template_key");--> statement-breakpoint
CREATE INDEX "email_templates_active_idx" ON "email_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "email_templates_updated_at_idx" ON "email_templates" USING btree ("updated_at");--> statement-breakpoint
CREATE UNIQUE INDEX "event_rsvps_event_user_idx" ON "event_rsvps" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "event_rsvps_event_idx" ON "event_rsvps" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_rsvps_user_idx" ON "event_rsvps" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "events_start_date_idx" ON "events" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "events_status_idx" ON "events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "events_oblast_idx" ON "events" USING btree ("oblast_id");--> statement-breakpoint
CREATE INDEX "events_organizer_idx" ON "events" USING btree ("organizer_id");--> statement-breakpoint
CREATE INDEX "groups_oblast_idx" ON "groups" USING btree ("oblast_id");--> statement-breakpoint
CREATE INDEX "groups_commandery_idx" ON "groups" USING btree ("commandery_id");--> statement-breakpoint
CREATE INDEX "help_article_feedback_article_idx" ON "help_article_feedback" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "help_article_feedback_user_idx" ON "help_article_feedback" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "help_articles_slug_idx" ON "help_articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "help_articles_category_idx" ON "help_articles" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "help_articles_status_idx" ON "help_articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "help_articles_author_idx" ON "help_articles" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "help_articles_audience_idx" ON "help_articles" USING btree ("audience");--> statement-breakpoint
CREATE UNIQUE INDEX "help_categories_slug_idx" ON "help_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "help_categories_parent_idx" ON "help_categories" USING btree ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "help_tooltips_page_element_idx" ON "help_tooltips" USING btree ("page_slug","element_id");--> statement-breakpoint
CREATE INDEX "help_tooltips_article_idx" ON "help_tooltips" USING btree ("article_id");--> statement-breakpoint
CREATE UNIQUE INDEX "katottg_code_idx" ON "katottg" USING btree ("code");--> statement-breakpoint
CREATE INDEX "katottg_category_idx" ON "katottg" USING btree ("category");--> statement-breakpoint
CREATE INDEX "katottg_level_idx" ON "katottg" USING btree ("level");--> statement-breakpoint
CREATE INDEX "katottg_oblast_code_idx" ON "katottg" USING btree ("oblast_code");--> statement-breakpoint
CREATE INDEX "katottg_raion_code_idx" ON "katottg" USING btree ("raion_code");--> statement-breakpoint
CREATE INDEX "katottg_hromada_code_idx" ON "katottg" USING btree ("hromada_code");--> statement-breakpoint
CREATE INDEX "katottg_name_normalized_idx" ON "katottg" USING btree ("name_normalized");--> statement-breakpoint
CREATE UNIQUE INDEX "news_articles_slug_idx" ON "news_articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "news_articles_status_idx" ON "news_articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "news_articles_published_at_idx" ON "news_articles" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "news_articles_category_idx" ON "news_articles" USING btree ("category");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_user_unread_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_product_idx" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "orders_user_idx" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_settings_key_idx" ON "organization_settings" USING btree ("key");--> statement-breakpoint
CREATE INDEX "payments_user_idx" ON "payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "payments_status_idx" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "payments_provider_tx_idx" ON "payments" USING btree ("provider_transaction_id");--> statement-breakpoint
CREATE INDEX "points_transactions_user_idx" ON "points_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "points_transactions_type_idx" ON "points_transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "points_transactions_year_idx" ON "points_transactions" USING btree ("earned_year");--> statement-breakpoint
CREATE INDEX "points_transactions_created_at_idx" ON "points_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "products_type_idx" ON "products" USING btree ("type");--> statement-breakpoint
CREATE INDEX "products_status_idx" ON "products" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_featured_idx" ON "products" USING btree ("featured");--> statement-breakpoint
CREATE INDEX "role_advancements_user_idx" ON "role_advancements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "role_advancements_advanced_by_idx" ON "role_advancements" USING btree ("advanced_by");--> statement-breakpoint
CREATE INDEX "role_advancements_to_role_idx" ON "role_advancements" USING btree ("to_role");--> statement-breakpoint
CREATE INDEX "role_advancements_advanced_at_idx" ON "role_advancements" USING btree ("advanced_at");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_assignee_idx" ON "tasks" USING btree ("assignee_id");--> statement-breakpoint
CREATE INDEX "tasks_due_date_idx" ON "tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "user_achievements_user_idx" ON "user_achievements" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_achievements_unique" ON "user_achievements" USING btree ("user_id","achievement_id");--> statement-breakpoint
CREATE INDEX "location_changes_user_idx" ON "user_location_changes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "location_changes_created_at_idx" ON "user_location_changes" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "location_changes_user_date_idx" ON "user_location_changes" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_votes_vote_user_idx" ON "user_votes" USING btree ("vote_id","user_id");--> statement-breakpoint
CREATE INDEX "user_votes_vote_idx" ON "user_votes" USING btree ("vote_id");--> statement-breakpoint
CREATE INDEX "user_votes_user_idx" ON "user_votes" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerk_id_idx" ON "users" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_referral_code_idx" ON "users" USING btree ("referral_code");--> statement-breakpoint
CREATE INDEX "users_oblast_idx" ON "users" USING btree ("oblast_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_status_idx" ON "users" USING btree ("status");--> statement-breakpoint
CREATE INDEX "users_katottg_code_idx" ON "users" USING btree ("katottg_code");--> statement-breakpoint
CREATE INDEX "vote_options_vote_idx" ON "vote_options" USING btree ("vote_id");--> statement-breakpoint
CREATE INDEX "votes_status_idx" ON "votes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "votes_end_date_idx" ON "votes" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "votes_scope_idx" ON "votes" USING btree ("scope");