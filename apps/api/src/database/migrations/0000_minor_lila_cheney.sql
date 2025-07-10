CREATE TABLE "issues" (
	"id" uuid PRIMARY KEY NOT NULL,
	"github_id" varchar NOT NULL,
	"number" integer NOT NULL,
	"title" varchar(500) NOT NULL,
	"state" varchar(20) DEFAULT 'open' NOT NULL,
	"url" varchar(500) NOT NULL,
	"repository_id" uuid NOT NULL,
	"comments" integer DEFAULT 0 NOT NULL,
	"is_good_first_issue" boolean DEFAULT false NOT NULL,
	"github_created_at" timestamp with time zone NOT NULL,
	"github_updated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "issues_github_id_unique" UNIQUE("github_id")
);
--> statement-breakpoint
CREATE TABLE "repositories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"description" text,
	"language" varchar(100),
	"stars" integer DEFAULT 0 NOT NULL,
	"url" varchar(500) NOT NULL,
	"owner" varchar(255) NOT NULL,
	"repo" varchar(255) NOT NULL,
	"labels" jsonb DEFAULT '[]'::jsonb,
	"last_activity" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "repositories_full_name_unique" UNIQUE("full_name")
);
--> statement-breakpoint
CREATE TABLE "statistics" (
	"id" uuid PRIMARY KEY NOT NULL,
	"total_repositories" integer DEFAULT 0 NOT NULL,
	"total_issues" integer DEFAULT 0 NOT NULL,
	"total_open_issues" integer DEFAULT 0 NOT NULL,
	"total_good_first_issues" integer DEFAULT 0 NOT NULL,
	"top_languages" jsonb DEFAULT '[]'::jsonb,
	"top_topics" jsonb DEFAULT '[]'::jsonb,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sync_history" (
	"id" uuid PRIMARY KEY NOT NULL,
	"repository_id" uuid NOT NULL,
	"sync_type" varchar(50) NOT NULL,
	"status" varchar(20) NOT NULL,
	"issues_found" integer DEFAULT 0,
	"issues_processed" integer DEFAULT 0,
	"error_message" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"duration" integer
);
--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sync_history" ADD CONSTRAINT "sync_history_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "issues_repository_id_idx" ON "issues" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "issues_state_idx" ON "issues" USING btree ("state");--> statement-breakpoint
CREATE INDEX "issues_is_good_first_issue_idx" ON "issues" USING btree ("is_good_first_issue");--> statement-breakpoint
CREATE INDEX "issues_github_created_at_idx" ON "issues" USING btree ("github_created_at");--> statement-breakpoint
CREATE INDEX "repositories_stars_idx" ON "repositories" USING btree ("stars");--> statement-breakpoint
CREATE INDEX "repositories_language_idx" ON "repositories" USING btree ("language");--> statement-breakpoint
CREATE INDEX "repositories_owner_repo_idx" ON "repositories" USING btree ("owner","repo");--> statement-breakpoint
CREATE INDEX "statistics_last_updated_idx" ON "statistics" USING btree ("last_updated");--> statement-breakpoint
CREATE INDEX "sync_history_repository_id_idx" ON "sync_history" USING btree ("repository_id");--> statement-breakpoint
CREATE INDEX "sync_history_status_idx" ON "sync_history" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sync_history_started_at_idx" ON "sync_history" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "sync_history_sync_type_idx" ON "sync_history" USING btree ("sync_type");--> statement-breakpoint
CREATE INDEX "sync_history_repository_id_started_at_idx" ON "sync_history" USING btree ("repository_id","started_at");