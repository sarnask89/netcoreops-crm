CREATE TABLE "automation_variable_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"variable_name" varchar(80) NOT NULL,
	"label" varchar(160),
	"source_type" varchar(30) DEFAULT 'DATABASE' NOT NULL,
	"table_name" varchar(80),
	"row_lookup_column" varchar(80),
	"row_lookup_value" varchar(255),
	"field_name" varchar(80),
	"static_value" text,
	"fallback_value" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "automation_variable_definitions_variable_name_unique" UNIQUE("variable_name")
);
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "billing_teryt_area_id" integer;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "billing_simc_locality_id" integer;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "billing_street_id" integer;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "billing_building_number" varchar(30);--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "billing_apartment_number" varchar(30);--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_billing_teryt_area_id_teryt_areas_id_fk" FOREIGN KEY ("billing_teryt_area_id") REFERENCES "public"."teryt_areas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_billing_simc_locality_id_simc_localities_id_fk" FOREIGN KEY ("billing_simc_locality_id") REFERENCES "public"."simc_localities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_billing_street_id_ulic_streets_id_fk" FOREIGN KEY ("billing_street_id") REFERENCES "public"."ulic_streets"("id") ON DELETE set null ON UPDATE no action;