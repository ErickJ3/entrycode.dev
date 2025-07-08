import { z } from 'zod'

export const environmentSchema = z.enum(['test', 'development', 'production'])

export const sharedConfigSchema = z.object({
  env: environmentSchema,
  port: z.coerce.number().default(3333),
  app: z
    .object({
      name: z.string().default('EntryCode API'),
      version: z.string().default('1.0'),
      description: z
        .string()
        .default('The EntryCode api make for devs to devs'),
    })
    .default({}),
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
  }

  const result = sharedConfigSchema.safeParse(config)

  if (!result.success) {
    throw new Error(`Configuration validation failed: ${result.error.message}`)
  }

  return result.data
}
