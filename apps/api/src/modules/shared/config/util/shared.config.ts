import { z } from 'zod'

export const environmentSchema = z.enum(['test', 'development', 'production'])

export const sharedConfigSchema = z.object({
  env: environmentSchema,
  port: z.coerce.number(),
  app: z.object({
    name: z.string(),
    version: z.string(),
    description: z.string(),
  }),
  database: z.object({
    username: z.string(),
    host: z.string(),
    port: z.coerce.number(),
    password: z.string(),
    name: z.string(),
  }),
  redis: z.object({
    host: z.string(),
    port: z.coerce.number(),
    password: z.string().optional(),
  }),
  githubToken: z.string(),
  triggerSecret: z.string(),
})

export type Environment = z.infer<typeof environmentSchema>
export type SharedConfig = z.infer<typeof sharedConfigSchema>

export const createSharedConfig = (): SharedConfig => {
  const config = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    app: {
      name: process.env.APP_NAME,
      version: process.env.APP_VERSION,
      description: process.env.APP_DESCRIPTION,
    },
    database: {
      username: process.env.DATABASE_USERNAME,
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      password: process.env.DATABASE_PASSWORD,
      name: process.env.DATABASE_NAME,
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD,
    },
    githubToken: process.env.GITHUB_TOKEN,
    triggerSecret: process.env.TRIGGER_SECRET,
  }

  const result = sharedConfigSchema.safeParse(config)

  if (!result.success) {
    throw new Error(`Configuration validation failed: ${result.error.message}`)
  }

  return result.data
}
