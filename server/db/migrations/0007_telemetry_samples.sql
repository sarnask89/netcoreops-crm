CREATE TABLE "netflow_interface_samples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipment_id" uuid,
	"exporter_address" varchar(45) NOT NULL,
	"version" integer NOT NULL,
	"if_index" integer,
	"interface_name" varchar(128),
	"role" varchar(32) DEFAULT 'unknown' NOT NULL,
	"source_interface" varchar(128),
	"direction" varchar(16) NOT NULL,
	"bytes" double precision DEFAULT 0 NOT NULL,
	"packets" double precision DEFAULT 0 NOT NULL,
	"records" double precision DEFAULT 0 NOT NULL,
	"bps" double precision DEFAULT 0 NOT NULL,
	"speed_bps" double precision,
	"sample_window_seconds" double precision DEFAULT 10 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dhcp_active_user_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"equipment_id" uuid NOT NULL,
	"inventory_id" varchar(100) NOT NULL,
	"total_leases" integer DEFAULT 0 NOT NULL,
	"candidate_leases" integer DEFAULT 0 NOT NULL,
	"active_users" integer DEFAULT 0 NOT NULL,
	"joined_users" integer DEFAULT 0 NOT NULL,
	"left_users" integer DEFAULT 0 NOT NULL,
	"active_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"evidence_counts" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dhcp_active_user_scope_counts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_id" uuid NOT NULL,
	"scope" varchar(32) NOT NULL,
	"name" varchar(160) NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "netflow_interface_samples" ADD CONSTRAINT "netflow_interface_samples_equipment_id_network_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."network_equipment"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dhcp_active_user_snapshots" ADD CONSTRAINT "dhcp_active_user_snapshots_equipment_id_network_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."network_equipment"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dhcp_active_user_scope_counts" ADD CONSTRAINT "dhcp_active_user_scope_counts_snapshot_id_dhcp_active_user_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."dhcp_active_user_snapshots"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "netflow_interface_samples_created_at_idx" ON "netflow_interface_samples" ("created_at");
--> statement-breakpoint
CREATE INDEX "netflow_interface_samples_exporter_if_idx" ON "netflow_interface_samples" ("exporter_address","if_index","created_at");
--> statement-breakpoint
CREATE INDEX "dhcp_active_user_snapshots_created_at_idx" ON "dhcp_active_user_snapshots" ("created_at");
--> statement-breakpoint
CREATE INDEX "dhcp_active_user_scope_counts_snapshot_scope_idx" ON "dhcp_active_user_scope_counts" ("snapshot_id","scope");
