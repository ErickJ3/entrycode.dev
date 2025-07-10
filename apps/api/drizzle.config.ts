import "dotenv/config"
import { defineConfig } from 'drizzle-kit'
import { createSharedConfig } from 'src/modules/shared/config/util/shared.config'

const config = createSharedConfig()

export default defineConfig({
  out: './src/database/migrations',
  schema: './src/database/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: config.database.host,
    port: config.database.port,
    user: config.database.username,
    password: config.database.password,
    database: config.database.name,
    ssl: false,
  },
  verbose: true,
  strict: true,
})
