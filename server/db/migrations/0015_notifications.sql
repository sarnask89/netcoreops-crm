CREATE TABLE IF NOT EXISTS "smtp_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"host" varchar(255) NOT NULL,
	"port" integer DEFAULT 587 NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(512) NOT NULL,
	"from_name" varchar(255),
	"from_email" varchar(255) NOT NULL,
	"encryption" varchar(20) DEFAULT 'tls' NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"code" varchar(64) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"body_html" text NOT NULL,
	"variables" jsonb DEFAULT '[]',
	"smtp_config_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_templates_name_unique" UNIQUE("name"),
	CONSTRAINT "email_templates_code_unique" UNIQUE("code")
);

CREATE TABLE IF NOT EXISTS "notification_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(128) NOT NULL,
	"event_type" varchar(64) NOT NULL,
	"template_id" integer,
	"recipients" jsonb DEFAULT '[]' NOT NULL,
	"conditions" jsonb DEFAULT '{}',
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "email_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"to" varchar(255) NOT NULL,
	"from_email" varchar(255) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"body_excerpt" varchar(500),
	"template_id" integer,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"error" text,
	"related_entity_type" varchar(50),
	"related_entity_id" varchar(64),
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_smtp_config_id_smtp_configs_id_fk" FOREIGN KEY ("smtp_config_id") REFERENCES "public"."smtp_configs"("id") ON DELETE set null;
ALTER TABLE "notification_rules" ADD CONSTRAINT "notification_rules_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE set null;
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_template_id_email_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."email_templates"("id") ON DELETE set null;

CREATE INDEX IF NOT EXISTS "email_logs_status_idx" ON "email_logs" ("status");
CREATE INDEX IF NOT EXISTS "email_logs_entity_idx" ON "email_logs" ("related_entity_type", "related_entity_id");
CREATE INDEX IF NOT EXISTS "notification_rules_event_idx" ON "notification_rules" ("event_type");
