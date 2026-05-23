CREATE TABLE "ftth_olts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"network_equipment_id" uuid NOT NULL,
	"vendor" varchar(80) DEFAULT 'Dasan' NOT NULL,
	"model" varchar(120),
	"management_vlan_id" integer DEFAULT 400 NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ftth_olts_network_equipment_id_unique" UNIQUE("network_equipment_id")
);
--> statement-breakpoint
CREATE TABLE "ftth_onu_ip_hosts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"onu_id" uuid NOT NULL,
	"host_id" varchar(32) NOT NULL,
	"ip_option" varchar(80),
	"mac_address" varchar(17),
	"current_ip" varchar(45),
	"current_mask" varchar(45),
	"current_gateway" varchar(45),
	"primary_dns" varchar(45),
	"secondary_dns" varchar(45),
	"host_name" varchar(255),
	"last_seen_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ftth_onu_macs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"onu_id" uuid NOT NULL,
	"mac_address" varchar(17) NOT NULL,
	"vlan_id" integer,
	"gem_id" varchar(32),
	"source_command" varchar(120) NOT NULL,
	"status" varchar(50) DEFAULT 'dynamic' NOT NULL,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ftth_onus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pon_port_id" uuid NOT NULL,
	"network_equipment_id" uuid,
	"onu_identifier" varchar(32) NOT NULL,
	"serial_number" varchar(100),
	"status" varchar(50) DEFAULT 'UNKNOWN' NOT NULL,
	"signal_rx" varchar(50),
	"transparent_candidate" boolean DEFAULT false NOT NULL,
	"last_seen_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ftth_pon_ports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"olt_id" uuid NOT NULL,
	"port_code" varchar(32) NOT NULL,
	"label" varchar(160),
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ftth_transparent_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"onu_id" uuid NOT NULL,
	"mac_address" varchar(17) NOT NULL,
	"link_type" varchar(60) NOT NULL,
	"customer_device_id" uuid,
	"backbone_equipment_id" uuid,
	"confidence" integer DEFAULT 100 NOT NULL,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ip_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"network_id" uuid,
	"ip_address" varchar(45) NOT NULL,
	"assignment_type" varchar(50) DEFAULT 'UNASSIGNED' NOT NULL,
	"customer_device_id" uuid,
	"equipment_id" uuid,
	"import_run_id" uuid,
	"source" varchar(80) DEFAULT 'manual' NOT NULL,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "ip_networks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(128) NOT NULL,
	"cidr" varchar(64) NOT NULL,
	"gateway" varchar(45),
	"vlan_id" integer,
	"owner_node_id" uuid,
	"owner_equipment_id" uuid,
	"status" varchar(50) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ip_networks_name_unique" UNIQUE("name"),
	CONSTRAINT "ip_networks_cidr_unique" UNIQUE("cidr")
);
--> statement-breakpoint
CREATE TABLE "mac_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mac_address" varchar(17) NOT NULL,
	"owner_type" varchar(50) DEFAULT 'UNKNOWN' NOT NULL,
	"customer_device_id" uuid,
	"equipment_id" uuid,
	"import_run_id" uuid,
	"source" varchar(80) DEFAULT 'manual' NOT NULL,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mac_addresses_mac_address_unique" UNIQUE("mac_address")
);
--> statement-breakpoint
ALTER TABLE "customer_devices" ADD COLUMN "ftth_onu_id" uuid;--> statement-breakpoint
ALTER TABLE "ftth_olts" ADD CONSTRAINT "ftth_olts_network_equipment_id_network_equipment_id_fk" FOREIGN KEY ("network_equipment_id") REFERENCES "public"."network_equipment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ftth_onu_ip_hosts" ADD CONSTRAINT "ftth_onu_ip_hosts_onu_id_ftth_onus_id_fk" FOREIGN KEY ("onu_id") REFERENCES "public"."ftth_onus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ftth_onu_macs" ADD CONSTRAINT "ftth_onu_macs_onu_id_ftth_onus_id_fk" FOREIGN KEY ("onu_id") REFERENCES "public"."ftth_onus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ftth_onus" ADD CONSTRAINT "ftth_onus_pon_port_id_ftth_pon_ports_id_fk" FOREIGN KEY ("pon_port_id") REFERENCES "public"."ftth_pon_ports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ftth_onus" ADD CONSTRAINT "ftth_onus_network_equipment_id_network_equipment_id_fk" FOREIGN KEY ("network_equipment_id") REFERENCES "public"."network_equipment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ftth_pon_ports" ADD CONSTRAINT "ftth_pon_ports_olt_id_ftth_olts_id_fk" FOREIGN KEY ("olt_id") REFERENCES "public"."ftth_olts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ftth_transparent_links" ADD CONSTRAINT "ftth_transparent_links_onu_id_ftth_onus_id_fk" FOREIGN KEY ("onu_id") REFERENCES "public"."ftth_onus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ftth_transparent_links" ADD CONSTRAINT "ftth_transparent_links_customer_device_id_customer_devices_id_fk" FOREIGN KEY ("customer_device_id") REFERENCES "public"."customer_devices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ftth_transparent_links" ADD CONSTRAINT "ftth_transparent_links_backbone_equipment_id_network_equipment_id_fk" FOREIGN KEY ("backbone_equipment_id") REFERENCES "public"."network_equipment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ip_addresses" ADD CONSTRAINT "ip_addresses_network_id_ip_networks_id_fk" FOREIGN KEY ("network_id") REFERENCES "public"."ip_networks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ip_addresses" ADD CONSTRAINT "ip_addresses_customer_device_id_customer_devices_id_fk" FOREIGN KEY ("customer_device_id") REFERENCES "public"."customer_devices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ip_addresses" ADD CONSTRAINT "ip_addresses_equipment_id_network_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."network_equipment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ip_addresses" ADD CONSTRAINT "ip_addresses_import_run_id_import_runs_id_fk" FOREIGN KEY ("import_run_id") REFERENCES "public"."import_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ip_networks" ADD CONSTRAINT "ip_networks_owner_node_id_network_nodes_id_fk" FOREIGN KEY ("owner_node_id") REFERENCES "public"."network_nodes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ip_networks" ADD CONSTRAINT "ip_networks_owner_equipment_id_network_equipment_id_fk" FOREIGN KEY ("owner_equipment_id") REFERENCES "public"."network_equipment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mac_addresses" ADD CONSTRAINT "mac_addresses_customer_device_id_customer_devices_id_fk" FOREIGN KEY ("customer_device_id") REFERENCES "public"."customer_devices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mac_addresses" ADD CONSTRAINT "mac_addresses_equipment_id_network_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."network_equipment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mac_addresses" ADD CONSTRAINT "mac_addresses_import_run_id_import_runs_id_fk" FOREIGN KEY ("import_run_id") REFERENCES "public"."import_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ftth_onu_ip_hosts_onu_host_idx" ON "ftth_onu_ip_hosts" USING btree ("onu_id","host_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ftth_onu_macs_onu_mac_idx" ON "ftth_onu_macs" USING btree ("onu_id","mac_address");--> statement-breakpoint
CREATE UNIQUE INDEX "ftth_onus_pon_identifier_idx" ON "ftth_onus" USING btree ("pon_port_id","onu_identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "ftth_onus_serial_idx" ON "ftth_onus" USING btree ("serial_number");--> statement-breakpoint
CREATE UNIQUE INDEX "ftth_pon_ports_olt_port_idx" ON "ftth_pon_ports" USING btree ("olt_id","port_code");--> statement-breakpoint
CREATE UNIQUE INDEX "ftth_transparent_links_onu_mac_idx" ON "ftth_transparent_links" USING btree ("onu_id","mac_address");--> statement-breakpoint
CREATE UNIQUE INDEX "ip_addresses_network_ip_idx" ON "ip_addresses" USING btree ("network_id","ip_address");--> statement-breakpoint
ALTER TABLE "customer_devices" ADD CONSTRAINT "customer_devices_ftth_onu_id_ftth_onus_id_fk" FOREIGN KEY ("ftth_onu_id") REFERENCES "public"."ftth_onus"("id") ON DELETE set null ON UPDATE no action;