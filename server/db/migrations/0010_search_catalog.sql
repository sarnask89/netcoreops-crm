CREATE TABLE "search_catalog" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(255) NOT NULL,
	"suffix" varchar(100),
	"icon" varchar(100),
	"to" varchar(255) NOT NULL,
	"target" varchar(20),
	"aliases" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "search_catalog" ("label", "suffix", "icon", "to", "target", "aliases", "sort_order") VALUES
	('@ Definicje zmiennych automatyzacji', 'Funkcja', 'i-lucide-braces', '/automation/definitions', NULL, 'automatyzacja,automation,definicje,zmienne,variables,template,render', 10),
	('@ Skrypty automatyzacji', 'Funkcja', 'i-lucide-file-terminal', '/automation/scripts', NULL, 'automatyzacja,automation,skrypty,scripts,commands,konfiguracja', 20),
	('@ Eksport PIT CSV', 'Funkcja', 'i-lucide-download', '/api/pit/export', '_blank', 'pit,uke,csv,eksport,export', 30),
	('@ Słowniki UKE', 'Słownik', 'i-lucide-book-open', '/system/dictionaries', NULL, 'slowniki,słowniki,uke,teryt,simc,ulic,dictionary,dictionaries', 40),
	('@ Walidacja PIT', 'Funkcja', 'i-lucide-shield-check', '/pit/validation', NULL, 'pit,uke,walidacja,validation,validate', 50),
	('@ Klienci CRM', 'Trasa', 'i-lucide-user-round', '/crm/customers', NULL, 'crm,klienci,customers,abonenci,adresy', 60),
	('@ Urządzenia klienta', 'Trasa', 'i-lucide-router', '/crm/customer-devices', NULL, 'crm,cpe,onu,customer devices,urzadzenia klienta,urządzenia klienta', 70),
	('@ Urządzenia sieciowe', 'Trasa', 'i-lucide-server', '/network/equipment', NULL, 'network,sieć,siec,equipment,urzadzenia,urządzenia,mikrotik,dasan', 80),
	('@ Profile dostępowe', 'Trasa', 'i-lucide-sliders-horizontal', '/network/access-profiles', NULL, 'profile,access profiles,dostęp,dostep,credentials', 90),
	('@ Generator modułów', 'Narzędzie', 'i-lucide-blocks', '/tools/module-generator', NULL, 'generator,module generator,moduly,moduły,tools,narzędzia,narzedzia', 100);
