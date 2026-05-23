CREATE TABLE "customer_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"equipment_id" uuid,
	"onu_equipment_id" uuid,
	"hostname" varchar(255) NOT NULL,
	"ip_address" varchar(45),
	"mac_address" varchar(17),
	"login" varchar(120),
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"ip_network_name" varchar(128),
	"dhcp_server" varchar(128),
	"dhcp_interface" varchar(128),
	"olt_port" varchar(32),
	"onu_id" varchar(32),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_devices_mac_address_unique" UNIQUE("mac_address")
);
--> statement-breakpoint
CREATE TABLE "diagnostic_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_device_id" uuid,
	"equipment_id" uuid,
	"driver_code" varchar(60) NOT NULL,
	"run_type" varchar(60) NOT NULL,
	"target" varchar(255),
	"success" boolean DEFAULT false NOT NULL,
	"result" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "import_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipment_id" uuid,
	"driver_code" varchar(60) NOT NULL,
	"import_type" varchar(60) NOT NULL,
	"mode" varchar(30) DEFAULT 'preview' NOT NULL,
	"success" boolean DEFAULT false NOT NULL,
	"summary" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "management_drivers" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(60) NOT NULL,
	"label" varchar(160) NOT NULL,
	"transport" varchar(50) NOT NULL,
	"capabilities" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "management_drivers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"customer_device_id" uuid,
	"tariff_id" integer NOT NULL,
	"start_date" date DEFAULT now() NOT NULL,
	"end_date" date,
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"billing_period" varchar(30) DEFAULT 'monthly' NOT NULL,
	"price_override_net" numeric(12, 2),
	"discount_percent" numeric(5, 2) DEFAULT '0' NOT NULL,
	"activation_fee" numeric(12, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tariffs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"service_type" varchar(50) DEFAULT 'internet' NOT NULL,
	"default_net_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"vat_rate" numeric(5, 2) DEFAULT '23' NOT NULL,
	"download_mbps" integer,
	"upload_mbps" integer,
	"queue_name" varchar(128),
	"iptv_package_code" varchar(128),
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tariffs_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "access_profiles" ALTER COLUMN "download_speed_mbps" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "access_profiles" ALTER COLUMN "upload_speed_mbps" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "access_profiles" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "access_profiles" ADD COLUMN "default_protocol" varchar(30) DEFAULT 'ssh' NOT NULL;--> statement-breakpoint
ALTER TABLE "access_profiles" ADD COLUMN "default_port" integer;--> statement-breakpoint
ALTER TABLE "access_profiles" ADD COLUMN "username" varchar(120);--> statement-breakpoint
ALTER TABLE "access_profiles" ADD COLUMN "password_encrypted" text;--> statement-breakpoint
ALTER TABLE "access_profiles" ADD COLUMN "snmp_community_encrypted" text;--> statement-breakpoint
ALTER TABLE "access_profiles" ADD COLUMN "api_base_url" text;--> statement-breakpoint
ALTER TABLE "access_profiles" ADD COLUMN "api_token_encrypted" text;--> statement-breakpoint
ALTER TABLE "access_profiles" ADD COLUMN "ssh_key_encrypted" text;--> statement-breakpoint
ALTER TABLE "access_profiles" ADD COLUMN "extra_config" jsonb;--> statement-breakpoint
ALTER TABLE "access_profiles" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "access_profiles" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "network_equipment" ADD COLUMN "access_profile_id" integer;--> statement-breakpoint
ALTER TABLE "network_equipment" ADD COLUMN "management_driver_id" integer;--> statement-breakpoint
ALTER TABLE "network_equipment" ADD COLUMN "parent_equipment_id" uuid;--> statement-breakpoint
ALTER TABLE "network_equipment" ADD COLUMN "login_url" text;--> statement-breakpoint
ALTER TABLE "network_equipment" ADD COLUMN "bridge_mode" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "network_equipment" ADD COLUMN "onu_port" varchar(32);--> statement-breakpoint
ALTER TABLE "network_equipment" ADD COLUMN "onu_id" varchar(32);--> statement-breakpoint
ALTER TABLE "network_equipment" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "network_equipment" ADD COLUMN "last_seen_at" timestamp;--> statement-breakpoint
ALTER TABLE "network_equipment" ADD COLUMN "is_online" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "customer_devices" ADD CONSTRAINT "customer_devices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_devices" ADD CONSTRAINT "customer_devices_equipment_id_network_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."network_equipment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_devices" ADD CONSTRAINT "customer_devices_onu_equipment_id_network_equipment_id_fk" FOREIGN KEY ("onu_equipment_id") REFERENCES "public"."network_equipment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_runs" ADD CONSTRAINT "diagnostic_runs_customer_device_id_customer_devices_id_fk" FOREIGN KEY ("customer_device_id") REFERENCES "public"."customer_devices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_runs" ADD CONSTRAINT "diagnostic_runs_equipment_id_network_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."network_equipment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "import_runs" ADD CONSTRAINT "import_runs_equipment_id_network_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."network_equipment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_customer_device_id_customer_devices_id_fk" FOREIGN KEY ("customer_device_id") REFERENCES "public"."customer_devices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tariff_id_tariffs_id_fk" FOREIGN KEY ("tariff_id") REFERENCES "public"."tariffs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_equipment" ADD CONSTRAINT "network_equipment_access_profile_id_access_profiles_id_fk" FOREIGN KEY ("access_profile_id") REFERENCES "public"."access_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_equipment" ADD CONSTRAINT "network_equipment_management_driver_id_management_drivers_id_fk" FOREIGN KEY ("management_driver_id") REFERENCES "public"."management_drivers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_equipment" ADD CONSTRAINT "network_equipment_parent_equipment_id_network_equipment_id_fk" FOREIGN KEY ("parent_equipment_id") REFERENCES "public"."network_equipment"("id") ON DELETE set null ON UPDATE no action;