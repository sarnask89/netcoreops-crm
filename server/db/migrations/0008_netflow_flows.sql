CREATE TABLE "netflow_raw_flows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exporter_address" varchar(45) NOT NULL,
	"exporter_port" integer NOT NULL,
	"version" integer NOT NULL,
	"source_id" integer NOT NULL,
	"sequence" double precision DEFAULT 0 NOT NULL,
	"exported_at" timestamp NOT NULL,
	"first_seen_at" timestamp,
	"last_seen_at" timestamp,
	"src_ip" varchar(45),
	"dst_ip" varchar(45),
	"src_port" integer,
	"dst_port" integer,
	"protocol" integer,
	"tcp_flags" integer,
	"tos" integer,
	"bytes" double precision DEFAULT 0 NOT NULL,
	"packets" double precision DEFAULT 0 NOT NULL,
	"input_if_index" integer,
	"output_if_index" integer,
	"src_mac" varchar(17),
	"dst_mac" varchar(17),
	"nat_src_ip" varchar(45),
	"nat_dst_ip" varchar(45),
	"nat_src_port" integer,
	"nat_dst_port" integer,
	"flow_direction" varchar(16) DEFAULT 'unknown' NOT NULL,
	"local_ip" varchar(45),
	"remote_ip" varchar(45),
	"user_key" varchar(160) DEFAULT 'unknown' NOT NULL,
	"customer_device_id" uuid,
	"customer_id" uuid,
	"confidence" varchar(32) DEFAULT 'unknown' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "netflow_flow_rollups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bucket" timestamp NOT NULL,
	"bucket_seconds" integer NOT NULL,
	"exporter_address" varchar(45) NOT NULL,
	"scope" varchar(32) NOT NULL,
	"if_index" integer,
	"user_key" varchar(160),
	"customer_device_id" uuid,
	"customer_id" uuid,
	"local_ip" varchar(45),
	"direction" varchar(16) NOT NULL,
	"bytes" double precision DEFAULT 0 NOT NULL,
	"packets" double precision DEFAULT 0 NOT NULL,
	"flows" double precision DEFAULT 0 NOT NULL,
	"bps" double precision DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "netflow_collector_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exporter_address" varchar(45) NOT NULL,
	"version" integer NOT NULL,
	"source_id" integer NOT NULL,
	"template_id" integer NOT NULL,
	"fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"refreshed_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "netflow_exporter_health" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exporter_address" varchar(45) NOT NULL,
	"version" integer NOT NULL,
	"source_id" integer NOT NULL,
	"packet_count" double precision DEFAULT 0 NOT NULL,
	"flow_records" double precision DEFAULT 0 NOT NULL,
	"unknown_template_records" double precision DEFAULT 0 NOT NULL,
	"sequence_gaps" double precision DEFAULT 0 NOT NULL,
	"templates_refreshed" double precision DEFAULT 0 NOT NULL,
	"last_sequence" double precision DEFAULT 0 NOT NULL,
	"last_packet_at" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "netflow_raw_flows" ADD CONSTRAINT "netflow_raw_flows_customer_device_id_customer_devices_id_fk" FOREIGN KEY ("customer_device_id") REFERENCES "public"."customer_devices"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "netflow_raw_flows" ADD CONSTRAINT "netflow_raw_flows_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "netflow_flow_rollups" ADD CONSTRAINT "netflow_flow_rollups_customer_device_id_customer_devices_id_fk" FOREIGN KEY ("customer_device_id") REFERENCES "public"."customer_devices"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "netflow_flow_rollups" ADD CONSTRAINT "netflow_flow_rollups_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "netflow_raw_flows_exported_idx" ON "netflow_raw_flows" USING btree ("exported_at");
--> statement-breakpoint
CREATE INDEX "netflow_raw_flows_user_idx" ON "netflow_raw_flows" USING btree ("user_key","exported_at");
--> statement-breakpoint
CREATE INDEX "netflow_flow_rollups_bucket_idx" ON "netflow_flow_rollups" USING btree ("bucket","bucket_seconds","scope");
--> statement-breakpoint
CREATE INDEX "netflow_exporter_health_lookup_idx" ON "netflow_exporter_health" USING btree ("exporter_address","version","source_id");
