CREATE TABLE "auth_groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(80) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text,
	"is_admin" boolean DEFAULT false NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_groups_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "auth_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(120) NOT NULL,
	"display_name" varchar(160) NOT NULL,
	"email" varchar(255),
	"password_hash" text NOT NULL,
	"group_id" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "auth_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "auth_users" ADD CONSTRAINT "auth_users_group_id_auth_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."auth_groups"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "auth_groups" ("code", "name", "description", "is_admin", "permissions")
VALUES
	('admins', 'Administratorzy', 'Pełny dostęp do NetCoreOps.', true, '[]'::jsonb),
	('operators', 'Operatorzy', 'Dostęp operacyjny bez zarządzania użytkownikami.', false, '["dashboard","network","network.ftth","network.imports","crm","billing","automation","system","pit","settings","settings.security"]'::jsonb)
ON CONFLICT ("code") DO NOTHING;
