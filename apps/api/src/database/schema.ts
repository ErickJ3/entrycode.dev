import {
  pgTable,
  varchar,
  integer,
  timestamp,
  text,
  boolean,
  jsonb,
  serial,
  unique,
  index,
  uuid,
} from 'drizzle-orm/pg-core'
import { v7 as uuidv7 } from 'uuid'

export const repositoriesTable = pgTable(
  'repositories',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    name: varchar('name', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 255 }).notNull().unique(),
    description: text('description'),
    language: varchar('language', { length: 100 }),
    stars: integer('stars').notNull().default(0),
    url: varchar('url', { length: 500 }).notNull(),
    owner: varchar('owner', { length: 255 }).notNull(),
    repo: varchar('repo', { length: 255 }).notNull(),
    labels: jsonb('labels').$type<string[]>().default([]),
    lastActivity: timestamp('last_activity', { withTimezone: true }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('repositories_stars_idx').on(table.stars),
    index('repositories_language_idx').on(table.language),
    index('repositories_owner_repo_idx').on(table.owner, table.repo),
  ],
)

export const issuesTable = pgTable(
  'issues',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    githubId: varchar('github_id').notNull().unique(),
    number: integer('number').notNull(),
    title: varchar('title', { length: 500 }).notNull(),
    state: varchar('state', { length: 20 }).notNull().default('open'),
    url: varchar('url', { length: 500 }).notNull(),
    repositoryId: uuid('repository_id')
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: 'cascade' }),
    comments: integer('comments').notNull().default(0),
    isGoodFirstIssue: boolean('is_good_first_issue').notNull().default(false),
    githubCreatedAt: timestamp('github_created_at', {
      withTimezone: true,
    }).notNull(),
    githubUpdatedAt: timestamp('github_updated_at', {
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('issues_repository_id_idx').on(table.repositoryId),
    index('issues_state_idx').on(table.state),
    index('issues_is_good_first_issue_idx').on(table.isGoodFirstIssue),
    index('issues_github_created_at_idx').on(table.githubCreatedAt),
  ],
)

export const syncHistoryTable = pgTable(
  'sync_history',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    repositoryId: uuid('repository_id')
      .notNull()
      .references(() => repositoriesTable.id, { onDelete: 'cascade' }),
    syncType: varchar('sync_type', { length: 50 }).notNull(), // 'full', 'incremental', 'issues_only'
    status: varchar('status', { length: 20 }).notNull(), // 'pending', 'running', 'completed', 'failed'
    issuesFound: integer('issues_found').default(0),
    issuesProcessed: integer('issues_processed').default(0),
    errorMessage: text('error_message'),
    startedAt: timestamp('started_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    duration: integer('duration'), // in seconds
  },
  (table) => [
    index('sync_history_repository_id_idx').on(table.repositoryId),
    index('sync_history_status_idx').on(table.status),
    index('sync_history_started_at_idx').on(table.startedAt),
    index('sync_history_sync_type_idx').on(table.syncType),
    index('sync_history_repository_id_started_at_idx').on(
      table.repositoryId,
      table.startedAt,
    ),
  ],
)

export const statisticsTable = pgTable(
  'statistics',
  {
    id: uuid('id').primaryKey().$defaultFn(uuidv7),
    totalRepositories: integer('total_repositories').notNull().default(0),
    totalIssues: integer('total_issues').notNull().default(0),
    totalOpenIssues: integer('total_open_issues').notNull().default(0),
    totalGoodFirstIssues: integer('total_good_first_issues')
      .notNull()
      .default(0),
    topLanguages: jsonb('top_languages')
      .$type<{ language: string; count: number }[]>()
      .default([]),
    topTopics: jsonb('top_topics')
      .$type<{ topic: string; count: number }[]>()
      .default([]),
    lastUpdated: timestamp('last_updated', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index('statistics_last_updated_idx').on(table.lastUpdated)],
)

export type Repository = typeof repositoriesTable.$inferSelect
export type NewRepository = typeof repositoriesTable.$inferInsert
export type Issue = typeof issuesTable.$inferSelect
export type NewIssue = typeof issuesTable.$inferInsert
export type SyncHistory = typeof syncHistoryTable.$inferSelect
export type NewSyncHistory = typeof syncHistoryTable.$inferInsert
export type Statistics = typeof statisticsTable.$inferSelect
export type NewStatistics = typeof statisticsTable.$inferInsert
