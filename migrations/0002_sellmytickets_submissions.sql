CREATE TABLE "sellmytickets_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"dashboard_code" text NOT NULL,
	"seller_name" text NOT NULL,
	"seller_email" text NOT NULL,
	"event_name" text NOT NULL,
	"venue" text,
	"event_date" timestamp,
	"quantity" integer DEFAULT 1 NOT NULL,
	"target_price_cents" integer NOT NULL,
	"minimum_price_cents" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"files" json DEFAULT '[]'::json NOT NULL,
	"marketplaces" json DEFAULT '[]'::json NOT NULL,
	"status" text DEFAULT 'uploaded' NOT NULL,
	"verification_status" text DEFAULT 'pending' NOT NULL,
	"payout_status" text DEFAULT 'not_started' NOT NULL,
	"bank_account_holder" text,
	"bank_last4" text,
	"routing_last4" text,
	"sold_marketplace" text,
	"sold_at" timestamp,
	"payout_eta" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sellmytickets_submissions_dashboard_code_unique" UNIQUE("dashboard_code")
);
--> statement-breakpoint
CREATE INDEX "sellmytickets_dashboard_code_idx" ON "sellmytickets_submissions" USING btree ("dashboard_code");--> statement-breakpoint
CREATE INDEX "sellmytickets_seller_email_idx" ON "sellmytickets_submissions" USING btree ("seller_email");--> statement-breakpoint
CREATE INDEX "sellmytickets_status_idx" ON "sellmytickets_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sellmytickets_created_at_idx" ON "sellmytickets_submissions" USING btree ("created_at");
