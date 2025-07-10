import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
import { createSharedConfig } from '~/modules/shared/config/util/shared.config'

const config = createSharedConfig()

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.username,
  password: config.database.password,
  database: config.database.name,
})

export const db = drizzle(pool, { schema })
