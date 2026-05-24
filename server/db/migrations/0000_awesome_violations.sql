CREATE TABLE "access_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"technology_type_id" integer,
	"download_speed_mbps" integer NOT NULL,
	"upload_speed_mbps" integer NOT NULL,
	"is_symmetric" boolean DEFAULT false NOT NULL,
	CONSTRAINT "access_profiles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "customer_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"profile_id" integer NOT NULL,
	"equipment_id" uuid,
	"service_teryt_area_id" integer,
	"service_simc_locality_id" integer,
	"service_street_id" integer,
	"service_building_number" varchar(30),
	"service_apartment_number" varchar(30),
	"activation_date" timestamp,
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	CONSTRAINT "customer_services_equipment_id_unique" UNIQUE("equipment_id")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"customer_type" varchar(50) NOT NULL,
	"tax_id" varchar(50),
	"contact_email" varchar(255),
	"contact_phone" varchar(50),
	"billing_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_tax_id_unique" UNIQUE("tax_id")
);
--> statement-breakpoint
CREATE TABLE "device_models" (
	"id" serial PRIMARY KEY NOT NULL,
	"type_id" integer NOT NULL,
	"manufacturer" varchar(100) NOT NULL,
	"model_name" varchar(100) NOT NULL,
	"technology_type_id" integer,
	"ports_upstream" integer DEFAULT 0 NOT NULL,
	"ports_downstream" integer DEFAULT 0 NOT NULL,
	"power_consumption_watt" double precision,
	"throughput_capabilities" jsonb
);
--> statement-breakpoint
CREATE TABLE "device_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"description" text,
	CONSTRAINT "device_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "network_equipment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_id" varchar(100) NOT NULL,
	"model_id" integer NOT NULL,
	"node_id" uuid,
	"mac_address" varchar(17),
	"serial_number" varchar(100),
	"equipment_role" varchar(50) NOT NULL,
	"status" varchar(50) DEFAULT 'IN_USE' NOT NULL,
	CONSTRAINT "network_equipment_inventory_id_unique" UNIQUE("inventory_id"),
	CONSTRAINT "network_equipment_mac_address_unique" UNIQUE("mac_address"),
	CONSTRAINT "network_equipment_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "network_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_id" varchar(100) NOT NULL,
	"node_start_id" uuid NOT NULL,
	"node_end_id" uuid NOT NULL,
	"medium_type_id" integer,
	"fiber_count" integer,
	"length_meters" double precision,
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	CONSTRAINT "network_lines_inventory_id_unique" UNIQUE("inventory_id")
);
--> statement-breakpoint
CREATE TABLE "network_nodes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inventory_id" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"node_type" varchar(50) NOT NULL,
	"medium_type_id" integer,
	"teryt_area_id" integer,
	"simc_locality_id" integer,
	"street_id" integer,
	"building_number" varchar(30),
	"latitude" double precision,
	"longitude" double precision,
	"status" varchar(50) DEFAULT 'PLANNED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "network_nodes_inventory_id_unique" UNIQUE("inventory_id")
);
--> statement-breakpoint
CREATE TABLE "simc_localities" (
	"id" serial PRIMARY KEY NOT NULL,
	"simc_code" varchar(7) NOT NULL,
	"teryt_area_id" integer,
	"name" varchar(255) NOT NULL,
	"locality_type" varchar(120),
	"imported_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "simc_localities_simc_code_unique" UNIQUE("simc_code"),
	CONSTRAINT "simc_localities_code_check" CHECK ("simc_localities"."simc_code" ~ '^[0-9]{7}$')
);
--> statement-breakpoint
CREATE TABLE "teryt_areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"teryt_code" varchar(7) NOT NULL,
	"name" varchar(255) NOT NULL,
	"area_type" varchar(100),
	"voivodeship" varchar(120),
	"county" varchar(120),
	"commune" varchar(120),
	"imported_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "teryt_areas_teryt_code_unique" UNIQUE("teryt_code"),
	CONSTRAINT "teryt_areas_code_check" CHECK ("teryt_areas"."teryt_code" ~ '^[0-9]{7}$')
);
--> statement-breakpoint
CREATE TABLE "uke_medium_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"label" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"imported_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uke_medium_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "uke_technology_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"label" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"imported_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uke_technology_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "ulic_streets" (
	"id" serial PRIMARY KEY NOT NULL,
	"ulic_code" varchar(7) NOT NULL,
	"simc_locality_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"street_type" varchar(80),
	"imported_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ulic_streets_code_check" CHECK ("ulic_streets"."ulic_code" ~ '^[0-9]{5,7}$')
);
--> statement-breakpoint
ALTER TABLE "access_profiles" ADD CONSTRAINT "access_profiles_technology_type_id_uke_technology_types_id_fk" FOREIGN KEY ("technology_type_id") REFERENCES "public"."uke_technology_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_services" ADD CONSTRAINT "customer_services_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_services" ADD CONSTRAINT "customer_services_profile_id_access_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."access_profiles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_services" ADD CONSTRAINT "customer_services_equipment_id_network_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."network_equipment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_services" ADD CONSTRAINT "customer_services_service_teryt_area_id_teryt_areas_id_fk" FOREIGN KEY ("service_teryt_area_id") REFERENCES "public"."teryt_areas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_services" ADD CONSTRAINT "customer_services_service_simc_locality_id_simc_localities_id_fk" FOREIGN KEY ("service_simc_locality_id") REFERENCES "public"."simc_localities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_services" ADD CONSTRAINT "customer_services_service_street_id_ulic_streets_id_fk" FOREIGN KEY ("service_street_id") REFERENCES "public"."ulic_streets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_models" ADD CONSTRAINT "device_models_type_id_device_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."device_types"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_models" ADD CONSTRAINT "device_models_technology_type_id_uke_technology_types_id_fk" FOREIGN KEY ("technology_type_id") REFERENCES "public"."uke_technology_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_equipment" ADD CONSTRAINT "network_equipment_model_id_device_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."device_models"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_equipment" ADD CONSTRAINT "network_equipment_node_id_network_nodes_id_fk" FOREIGN KEY ("node_id") REFERENCES "public"."network_nodes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_lines" ADD CONSTRAINT "network_lines_node_start_id_network_nodes_id_fk" FOREIGN KEY ("node_start_id") REFERENCES "public"."network_nodes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_lines" ADD CONSTRAINT "network_lines_node_end_id_network_nodes_id_fk" FOREIGN KEY ("node_end_id") REFERENCES "public"."network_nodes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_lines" ADD CONSTRAINT "network_lines_medium_type_id_uke_medium_types_id_fk" FOREIGN KEY ("medium_type_id") REFERENCES "public"."uke_medium_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_nodes" ADD CONSTRAINT "network_nodes_medium_type_id_uke_medium_types_id_fk" FOREIGN KEY ("medium_type_id") REFERENCES "public"."uke_medium_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_nodes" ADD CONSTRAINT "network_nodes_teryt_area_id_teryt_areas_id_fk" FOREIGN KEY ("teryt_area_id") REFERENCES "public"."teryt_areas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_nodes" ADD CONSTRAINT "network_nodes_simc_locality_id_simc_localities_id_fk" FOREIGN KEY ("simc_locality_id") REFERENCES "public"."simc_localities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "network_nodes" ADD CONSTRAINT "network_nodes_street_id_ulic_streets_id_fk" FOREIGN KEY ("street_id") REFERENCES "public"."ulic_streets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "simc_localities" ADD CONSTRAINT "simc_localities_teryt_area_id_teryt_areas_id_fk" FOREIGN KEY ("teryt_area_id") REFERENCES "public"."teryt_areas"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulic_streets" ADD CONSTRAINT "ulic_streets_simc_locality_id_simc_localities_id_fk" FOREIGN KEY ("simc_locality_id") REFERENCES "public"."simc_localities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "device_models_manufacturer_model_idx" ON "device_models" USING btree ("manufacturer","model_name");--> statement-breakpoint
CREATE UNIQUE INDEX "ulic_streets_simc_code_idx" ON "ulic_streets" USING btree ("simc_locality_id","ulic_code");