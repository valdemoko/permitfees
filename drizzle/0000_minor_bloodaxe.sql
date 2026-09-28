CREATE TYPE "public"."authority_kind" AS ENUM('city', 'county', 'state', 'other');--> statement-breakpoint
CREATE TYPE "public"."department_kind" AS ENUM('building', 'planning', 'fire', 'health', 'utilities', 'other');--> statement-breakpoint
CREATE TYPE "public"."fee_component_type" AS ENUM('base', 'plan_review', 'technology', 'inspection', 'surcharge', 'state_surcharge', 'other');--> statement-breakpoint
CREATE TYPE "public"."fee_rule_status" AS ENUM('draft', 'active', 'superseded', 'archived');--> statement-breakpoint
CREATE TYPE "public"."fee_type" AS ENUM('flat', 'percent', 'per_thousand', 'tiered_marginal', 'tiered_table', 'per_unit');--> statement-breakpoint
CREATE TYPE "public"."jurisdiction_type" AS ENUM('city', 'county', 'town', 'village', 'borough', 'special_district');--> statement-breakpoint
CREATE TYPE "public"."occupancy_class" AS ENUM('residential', 'commercial', 'industrial', 'mixed', 'other');--> statement-breakpoint
CREATE TYPE "public"."permit_applicability" AS ENUM('residential', 'commercial', 'both');--> statement-breakpoint
CREATE TYPE "public"."permit_category" AS ENUM('structural', 'electrical', 'plumbing', 'mechanical', 'fire', 'zoning', 'site', 'other');--> statement-breakpoint
CREATE TYPE "public"."publish_status" AS ENUM('draft', 'published', 'hidden');--> statement-breakpoint
CREATE TYPE "public"."requirement_type" AS ENUM('document', 'inspection', 'license', 'bond', 'insurance', 'zoning_review', 'hoa_review', 'energy_code', 'other');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('municipal_website', 'municipal_code', 'ordinance', 'fee_schedule_pdf', 'state_agency', 'county_website', 'official_calculator', 'permit_portal', 'other');--> statement-breakpoint
CREATE TYPE "public"."verification_entity_type" AS ENUM('source', 'fee_schedule', 'fee_rule', 'requirement', 'jurisdiction_profile', 'permit_page');--> statement-breakpoint
CREATE TYPE "public"."verification_method" AS ENUM('manual_review', 'official_pdf_review', 'official_portal_check', 'phone', 'email');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('unverified', 'verified', 'needs_review', 'outdated', 'disputed');--> statement-breakpoint
CREATE TABLE "counties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state_id" uuid NOT NULL,
	"slug" varchar(96) NOT NULL,
	"name" varchar(160) NOT NULL,
	"fips_code" varchar(5),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jurisdiction_id" uuid NOT NULL,
	"kind" "department_kind" NOT NULL,
	"name" varchar(200) NOT NULL,
	"phone" varchar(40),
	"email" varchar(200),
	"url" text,
	"address_line" varchar(240),
	"hours" varchar(240),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fee_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fee_schedule_id" uuid,
	"jurisdiction_id" uuid NOT NULL,
	"permit_type_id" uuid NOT NULL,
	"project_type_id" uuid,
	"source_id" uuid,
	"code" varchar(80) NOT NULL,
	"label" varchar(240) NOT NULL,
	"description" text,
	"component_type" "fee_component_type" NOT NULL,
	"fee_type" "fee_type" NOT NULL,
	"config" jsonb NOT NULL,
	"conditions" jsonb,
	"minimum_cents" integer,
	"maximum_cents" integer,
	"priority" integer DEFAULT 100 NOT NULL,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"status" "fee_rule_status" DEFAULT 'active' NOT NULL,
	"last_verified_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fee_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jurisdiction_id" uuid NOT NULL,
	"source_id" uuid,
	"title" varchar(300) NOT NULL,
	"official_url" text,
	"effective_from" date NOT NULL,
	"effective_to" date,
	"status" "fee_rule_status" DEFAULT 'active' NOT NULL,
	"last_verified_at" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jurisdiction_permit_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jurisdiction_id" uuid NOT NULL,
	"permit_type_id" uuid NOT NULL,
	"project_type_id" uuid,
	"scope_key" varchar(200) NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" varchar(240),
	"intro" text,
	"local_summary" text,
	"not_included" text,
	"worked_example" jsonb,
	"faqs" jsonb,
	"seo_title" varchar(200),
	"seo_description" text,
	"publish_status" "publish_status" DEFAULT 'draft' NOT NULL,
	"noindex" boolean DEFAULT true NOT NULL,
	"last_reviewed_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jurisdiction_permit_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jurisdiction_id" uuid NOT NULL,
	"permit_type_id" uuid NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"local_name" varchar(200),
	"official_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jurisdiction_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jurisdiction_id" uuid NOT NULL,
	"headline" varchar(300),
	"summary" text,
	"local_context" text,
	"valuation_basis" text,
	"not_included" text,
	"seo_title" varchar(200),
	"seo_description" text,
	"publish_status" "publish_status" DEFAULT 'draft' NOT NULL,
	"noindex" boolean DEFAULT true NOT NULL,
	"last_reviewed_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jurisdictions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state_id" uuid NOT NULL,
	"county_id" uuid,
	"type" "jurisdiction_type" NOT NULL,
	"slug" varchar(96) NOT NULL,
	"name" varchar(160) NOT NULL,
	"official_name" varchar(200),
	"website_url" text,
	"permit_portal_url" text,
	"timezone" varchar(64),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permit_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jurisdiction_id" uuid NOT NULL,
	"permit_type_id" uuid NOT NULL,
	"project_type_id" uuid,
	"requirement_type" "requirement_type" NOT NULL,
	"title" varchar(240) NOT NULL,
	"description" text,
	"is_mandatory" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 100 NOT NULL,
	"source_id" uuid,
	"last_verified_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permit_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(64) NOT NULL,
	"slug" varchar(96) NOT NULL,
	"name" varchar(160) NOT NULL,
	"category" "permit_category" NOT NULL,
	"applies_to" "permit_applicability" DEFAULT 'both' NOT NULL,
	"summary" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(64) NOT NULL,
	"slug" varchar(96) NOT NULL,
	"name" varchar(160) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"content_hash" varchar(80) NOT NULL,
	"storage_ref" text,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"jurisdiction_id" uuid,
	"title" varchar(300) NOT NULL,
	"url" text NOT NULL,
	"source_type" "source_type" NOT NULL,
	"issuing_authority" varchar(240) NOT NULL,
	"authority_kind" "authority_kind" NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	"document_date" date,
	"effective_from" date,
	"retrieved_at" date NOT NULL,
	"last_verified_at" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(2) NOT NULL,
	"slug" varchar(96) NOT NULL,
	"name" varchar(96) NOT NULL,
	"fips_code" varchar(2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "verification_entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"status" "verification_status" NOT NULL,
	"method" "verification_method" NOT NULL,
	"verified_at" date NOT NULL,
	"verified_by" varchar(120),
	"source_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "counties" ADD CONSTRAINT "counties_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_jurisdiction_id_jurisdictions_id_fk" FOREIGN KEY ("jurisdiction_id") REFERENCES "public"."jurisdictions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_rules" ADD CONSTRAINT "fee_rules_fee_schedule_id_fee_schedules_id_fk" FOREIGN KEY ("fee_schedule_id") REFERENCES "public"."fee_schedules"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_rules" ADD CONSTRAINT "fee_rules_jurisdiction_id_jurisdictions_id_fk" FOREIGN KEY ("jurisdiction_id") REFERENCES "public"."jurisdictions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_rules" ADD CONSTRAINT "fee_rules_permit_type_id_permit_types_id_fk" FOREIGN KEY ("permit_type_id") REFERENCES "public"."permit_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_rules" ADD CONSTRAINT "fee_rules_project_type_id_project_types_id_fk" FOREIGN KEY ("project_type_id") REFERENCES "public"."project_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_rules" ADD CONSTRAINT "fee_rules_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_schedules" ADD CONSTRAINT "fee_schedules_jurisdiction_id_jurisdictions_id_fk" FOREIGN KEY ("jurisdiction_id") REFERENCES "public"."jurisdictions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fee_schedules" ADD CONSTRAINT "fee_schedules_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jurisdiction_permit_pages" ADD CONSTRAINT "jurisdiction_permit_pages_jurisdiction_id_jurisdictions_id_fk" FOREIGN KEY ("jurisdiction_id") REFERENCES "public"."jurisdictions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jurisdiction_permit_pages" ADD CONSTRAINT "jurisdiction_permit_pages_permit_type_id_permit_types_id_fk" FOREIGN KEY ("permit_type_id") REFERENCES "public"."permit_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jurisdiction_permit_pages" ADD CONSTRAINT "jurisdiction_permit_pages_project_type_id_project_types_id_fk" FOREIGN KEY ("project_type_id") REFERENCES "public"."project_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jurisdiction_permit_types" ADD CONSTRAINT "jurisdiction_permit_types_jurisdiction_id_jurisdictions_id_fk" FOREIGN KEY ("jurisdiction_id") REFERENCES "public"."jurisdictions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jurisdiction_permit_types" ADD CONSTRAINT "jurisdiction_permit_types_permit_type_id_permit_types_id_fk" FOREIGN KEY ("permit_type_id") REFERENCES "public"."permit_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jurisdiction_profiles" ADD CONSTRAINT "jurisdiction_profiles_jurisdiction_id_jurisdictions_id_fk" FOREIGN KEY ("jurisdiction_id") REFERENCES "public"."jurisdictions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jurisdictions" ADD CONSTRAINT "jurisdictions_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jurisdictions" ADD CONSTRAINT "jurisdictions_county_id_counties_id_fk" FOREIGN KEY ("county_id") REFERENCES "public"."counties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permit_requirements" ADD CONSTRAINT "permit_requirements_jurisdiction_id_jurisdictions_id_fk" FOREIGN KEY ("jurisdiction_id") REFERENCES "public"."jurisdictions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permit_requirements" ADD CONSTRAINT "permit_requirements_permit_type_id_permit_types_id_fk" FOREIGN KEY ("permit_type_id") REFERENCES "public"."permit_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permit_requirements" ADD CONSTRAINT "permit_requirements_project_type_id_project_types_id_fk" FOREIGN KEY ("project_type_id") REFERENCES "public"."project_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permit_requirements" ADD CONSTRAINT "permit_requirements_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_snapshots" ADD CONSTRAINT "source_snapshots_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sources" ADD CONSTRAINT "sources_jurisdiction_id_jurisdictions_id_fk" FOREIGN KEY ("jurisdiction_id") REFERENCES "public"."jurisdictions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_records" ADD CONSTRAINT "verification_records_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "counties_state_slug_uq" ON "counties" USING btree ("state_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "departments_jurisdiction_kind_uq" ON "departments" USING btree ("jurisdiction_id","kind");--> statement-breakpoint
CREATE UNIQUE INDEX "fee_rules_identity_uq" ON "fee_rules" USING btree ("jurisdiction_id","permit_type_id","code","effective_from");--> statement-breakpoint
CREATE INDEX "fee_rules_lookup_idx" ON "fee_rules" USING btree ("jurisdiction_id","permit_type_id","status");--> statement-breakpoint
CREATE INDEX "fee_rules_window_idx" ON "fee_rules" USING btree ("effective_from","effective_to");--> statement-breakpoint
CREATE INDEX "fee_rules_schedule_idx" ON "fee_rules" USING btree ("fee_schedule_id");--> statement-breakpoint
CREATE INDEX "fee_schedules_jurisdiction_idx" ON "fee_schedules" USING btree ("jurisdiction_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "jurisdiction_permit_pages_scope_uq" ON "jurisdiction_permit_pages" USING btree ("jurisdiction_id","scope_key");--> statement-breakpoint
CREATE UNIQUE INDEX "jurisdiction_permit_pages_slug_uq" ON "jurisdiction_permit_pages" USING btree ("jurisdiction_id","slug");--> statement-breakpoint
CREATE INDEX "jurisdiction_permit_pages_publish_idx" ON "jurisdiction_permit_pages" USING btree ("publish_status","noindex");--> statement-breakpoint
CREATE UNIQUE INDEX "jurisdiction_permit_types_uq" ON "jurisdiction_permit_types" USING btree ("jurisdiction_id","permit_type_id");--> statement-breakpoint
CREATE UNIQUE INDEX "jurisdiction_profiles_jurisdiction_uq" ON "jurisdiction_profiles" USING btree ("jurisdiction_id");--> statement-breakpoint
CREATE INDEX "jurisdiction_profiles_publish_idx" ON "jurisdiction_profiles" USING btree ("publish_status","noindex");--> statement-breakpoint
CREATE UNIQUE INDEX "jurisdictions_state_slug_uq" ON "jurisdictions" USING btree ("state_id","slug");--> statement-breakpoint
CREATE INDEX "jurisdictions_state_type_idx" ON "jurisdictions" USING btree ("state_id","type");--> statement-breakpoint
CREATE INDEX "permit_requirements_lookup_idx" ON "permit_requirements" USING btree ("jurisdiction_id","permit_type_id");--> statement-breakpoint
CREATE INDEX "permit_requirements_type_idx" ON "permit_requirements" USING btree ("requirement_type");--> statement-breakpoint
CREATE UNIQUE INDEX "permit_types_key_uq" ON "permit_types" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "permit_types_slug_uq" ON "permit_types" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "project_types_key_uq" ON "project_types" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "project_types_slug_uq" ON "project_types" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "source_snapshots_source_hash_uq" ON "source_snapshots" USING btree ("source_id","content_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "sources_url_uq" ON "sources" USING btree ("url");--> statement-breakpoint
CREATE INDEX "sources_jurisdiction_idx" ON "sources" USING btree ("jurisdiction_id");--> statement-breakpoint
CREATE UNIQUE INDEX "states_code_uq" ON "states" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "states_slug_uq" ON "states" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "verification_records_entity_idx" ON "verification_records" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "verification_records_verified_at_idx" ON "verification_records" USING btree ("verified_at");