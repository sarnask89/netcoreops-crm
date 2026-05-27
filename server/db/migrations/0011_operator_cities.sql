CREATE TABLE IF NOT EXISTS "operator_cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "operator_cities_name_unique" UNIQUE("name")
);

GRANT ALL ON TABLE operator_cities TO netcoreops;
GRANT USAGE ON SEQUENCE operator_cities_id_seq TO netcoreops;
