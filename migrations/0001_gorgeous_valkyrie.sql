CREATE TABLE "contact_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"requester_id" integer NOT NULL,
	"seller_id" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp,
	"contact_method" text NOT NULL,
	"message" text NOT NULL,
	"meeting_location" text,
	"preferred_time" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sid" text PRIMARY KEY NOT NULL,
	"sess" json NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_popularity" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"total_views" integer DEFAULT 0 NOT NULL,
	"unique_views" integer DEFAULT 0 NOT NULL,
	"views_today" integer DEFAULT 0 NOT NULL,
	"views_this_week" integer DEFAULT 0 NOT NULL,
	"views_this_month" integer DEFAULT 0 NOT NULL,
	"last_viewed_at" timestamp,
	"popularity_score" double precision DEFAULT 0 NOT NULL,
	"trending_factor" double precision DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ticket_popularity_ticket_id_unique" UNIQUE("ticket_id")
);
--> statement-breakpoint
CREATE TABLE "ticket_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"ticket_id" integer NOT NULL,
	"viewed_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"session_id" text,
	"referrer" text
);
--> statement-breakpoint
CREATE TABLE "user_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"ticket_id" integer,
	"feedback_type" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "disputes" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "events" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "transactions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "disputes" CASCADE;--> statement-breakpoint
DROP TABLE "events" CASCADE;--> statement-breakpoint
DROP TABLE "transactions" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_username_unique";--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "section" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "event_title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "event_description" text;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "venue" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "venue_address" text;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "event_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "category" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "event_image_url" text;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "trending" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "country" text DEFAULT 'US' NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "postal_code" text;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "is_transferrable" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "transfer_method" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "additional_info" text;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "show_contact_info" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "event_timezone" text DEFAULT 'UTC';--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "age_restriction" text;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "view_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "contact_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "is_featured" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "boost_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "availability_status" text DEFAULT 'available';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "whatsapp" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "instagram" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_picture" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "preferred_contact_method" text DEFAULT 'email';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "country" text DEFAULT 'US' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "timezone" text DEFAULT 'UTC';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "language" text DEFAULT 'en';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_status" text DEFAULT 'unverified';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "government_id_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_admin" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "trust_score" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "verification_level" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "response_rate" double precision DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avg_response_time" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_flags" text DEFAULT '{}';--> statement-breakpoint
CREATE INDEX "contact_requests_ticket_id_idx" ON "contact_requests" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "contact_requests_requester_id_idx" ON "contact_requests" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "contact_requests_seller_id_idx" ON "contact_requests" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "contact_requests_status_idx" ON "contact_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "contact_requests_created_at_idx" ON "contact_requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "session" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "ticket_popularity_ticket_id_idx" ON "ticket_popularity" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "ticket_popularity_score_idx" ON "ticket_popularity" USING btree ("popularity_score");--> statement-breakpoint
CREATE INDEX "ticket_popularity_trending_idx" ON "ticket_popularity" USING btree ("trending_factor");--> statement-breakpoint
CREATE INDEX "ticket_popularity_updated_at_idx" ON "ticket_popularity" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "ticket_views_user_id_idx" ON "ticket_views" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ticket_views_ticket_id_idx" ON "ticket_views" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "ticket_views_viewed_at_idx" ON "ticket_views" USING btree ("viewed_at");--> statement-breakpoint
CREATE INDEX "ticket_views_ip_idx" ON "ticket_views" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "ticket_views_session_idx" ON "ticket_views" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "ticket_views_unique_idx" ON "ticket_views" USING btree ("ticket_id","user_id","ip_address");--> statement-breakpoint
CREATE INDEX "user_feedback_user_id_idx" ON "user_feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_feedback_ticket_id_idx" ON "user_feedback" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "user_feedback_status_idx" ON "user_feedback" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_feedback_created_at_idx" ON "user_feedback" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tickets_seller_id_idx" ON "tickets" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "tickets_title_idx" ON "tickets" USING btree ("title");--> statement-breakpoint
CREATE INDEX "tickets_event_title_idx" ON "tickets" USING btree ("event_title");--> statement-breakpoint
CREATE INDEX "tickets_category_idx" ON "tickets" USING btree ("category");--> statement-breakpoint
CREATE INDEX "tickets_event_date_idx" ON "tickets" USING btree ("event_date");--> statement-breakpoint
CREATE INDEX "tickets_status_idx" ON "tickets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tickets_city_idx" ON "tickets" USING btree ("city");--> statement-breakpoint
CREATE INDEX "tickets_country_idx" ON "tickets" USING btree ("country");--> statement-breakpoint
CREATE INDEX "tickets_created_at_idx" ON "tickets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tickets_trending_idx" ON "tickets" USING btree ("trending");--> statement-breakpoint
CREATE INDEX "tickets_location_idx" ON "tickets" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_country_idx" ON "users" USING btree ("country");--> statement-breakpoint
CREATE INDEX "users_verification_idx" ON "users" USING btree ("verification_status");--> statement-breakpoint
ALTER TABLE "tickets" DROP COLUMN "event_id";--> statement-breakpoint
ALTER TABLE "tickets" DROP COLUMN "original_price";--> statement-breakpoint
ALTER TABLE "tickets" DROP COLUMN "selling_price";--> statement-breakpoint
ALTER TABLE "tickets" DROP COLUMN "verified";--> statement-breakpoint
ALTER TABLE "tickets" DROP COLUMN "verification_code";--> statement-breakpoint
ALTER TABLE "tickets" DROP COLUMN "qr_code";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "username";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "rating";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "ratings_count";