CREATE TABLE "access_profile_device_bindings" (
	"id" serial PRIMARY KEY NOT NULL,
	"profile_id" integer NOT NULL,
	"model_id" integer,
	"equipment_id" uuid,
	"management_protocol" varchar(30) DEFAULT 'ssh' NOT NULL,
	"config_template" text,
	"config_payload" jsonb,
	"priority" integer DEFAULT 100 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "access_profile_device_bindings_target_check" CHECK ("access_profile_device_bindings"."model_id" is not null or "access_profile_device_bindings"."equipment_id" is not null)
);
--> statement-breakpoint
CREATE TABLE "automation_scripts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"scope" varchar(50) DEFAULT 'DEVICE' NOT NULL,
	"trigger_type" varchar(50) DEFAULT 'MANUAL' NOT NULL,
	"script_language" varchar(50) DEFAULT 'bash' NOT NULL,
	"script_body" text NOT NULL,
	"profile_id" integer,
	"equipment_id" uuid,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"timeout_seconds" integer DEFAULT 60 NOT NULL,
	"last_run_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "automation_scripts_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "first_name" varchar(120);--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "last_name" varchar(120);--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "pesel" varchar(11);--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "identity_document_number" varchar(50);--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "company_name" varchar(255);--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "regon" varchar(14);--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "krs" varchar(20);--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "representative_name" varchar(255);--> statement-breakpoint
ALTER TABLE "network_equipment" ADD COLUMN "hostname" varchar(255);--> statement-breakpoint
ALTER TABLE "network_equipment" ADD COLUMN "management_ip" varchar(45);--> statement-breakpoint
ALTER TABLE "network_equipment" ADD COLUMN "management_port" integer;--> statement-breakpoint
ALTER TABLE "network_equipment" ADD COLUMN "management_protocol" varchar(30);--> statement-breakpoint
ALTER TABLE "access_profile_device_bindings" ADD CONSTRAINT "access_profile_device_bindings_profile_id_access_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."access_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_profile_device_bindings" ADD CONSTRAINT "access_profile_device_bindings_model_id_device_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."device_models"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "access_profile_device_bindings" ADD CONSTRAINT "access_profile_device_bindings_equipment_id_network_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."network_equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_scripts" ADD CONSTRAINT "automation_scripts_profile_id_access_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."access_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automation_scripts" ADD CONSTRAINT "automation_scripts_equipment_id_network_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."network_equipment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "access_profile_bindings_profile_model_idx" ON "access_profile_device_bindings" USING btree ("profile_id","model_id");--> statement-breakpoint
CREATE UNIQUE INDEX "access_profile_bindings_profile_equipment_idx" ON "access_profile_device_bindings" USING btree ("profile_id","equipment_id");--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_pesel_unique" UNIQUE("pesel");--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_regon_unique" UNIQUE("regon");--> statement-breakpoint
ALTER TABLE "network_equipment" ADD CONSTRAINT "network_equipment_hostname_unique" UNIQUE("hostname");--> statement-breakpoint
ALTER TABLE "network_equipment" ADD CONSTRAINT "network_equipment_management_ip_unique" UNIQUE("management_ip");