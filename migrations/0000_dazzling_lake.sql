CREATE TABLE "disputes" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" integer NOT NULL,
	"reason" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"venue" text NOT NULL,
	"date" timestamp NOT NULL,
	"category" text NOT NULL,
	"image_url" text,
	"trending" boolean DEFAULT false,
	"selling_fast" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"seller_id" integer NOT NULL,
	"section" text NOT NULL,
	"row" text,
	"seat" text,
	"original_price" double precision NOT NULL,
	"selling_price" double precision NOT NULL,
	"quantity" integer NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"verification_code" text,
	"qr_code" text
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"buyer_id" integer NOT NULL,
	"seller_id" integer NOT NULL,
	"amount" double precision NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"google_id" text,
	"rating" double precision DEFAULT 0,
	"ratings_count" integer DEFAULT 0,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
