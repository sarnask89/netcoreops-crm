ALTER TABLE "customer_devices" ADD COLUMN "import_external_id" varchar(80);--> statement-breakpoint
ALTER TABLE "customer_devices" ADD COLUMN "import_issues" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "customer_devices" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "customer_devices" ADD COLUMN "archive_reason" text;--> statement-breakpoint
ALTER TABLE "customer_services" ADD COLUMN "import_issues" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "customer_services" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "customer_services" ADD COLUMN "archive_reason" text;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "import_external_id" varchar(80);--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "import_issues" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "archived_at" timestamp;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "archive_reason" text;