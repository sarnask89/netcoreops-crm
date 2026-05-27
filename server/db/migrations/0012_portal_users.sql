CREATE TABLE IF NOT EXISTS "portal_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"login" varchar(120) NOT NULL,
	"password_hash" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "portal_users_customer_id_unique" UNIQUE("customer_id"),
	CONSTRAINT "portal_users_login_unique" UNIQUE("login")
);

ALTER TABLE "portal_users" ADD CONSTRAINT "portal_users_customer_id_customers_id_fk"
  FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'netcoreops') THEN
    GRANT ALL ON TABLE portal_users TO netcoreops;
  END IF;
END $$;
