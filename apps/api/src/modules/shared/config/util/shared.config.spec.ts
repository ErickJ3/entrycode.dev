import { faker } from '@faker-js/faker'
import * as fc from 'fast-check'
import {
  createSharedConfig,
  environmentSchema,
  sharedConfigSchema,
} from './shared.config'

describe('SharedConfig', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('environmentSchema', () => {
    it('should validate valid environments', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('test', 'development', 'production'),
          (validEnv) => {
            expect(() => environmentSchema.parse(validEnv)).not.toThrow()
          },
        ),
      )
    })

    it('should throw an error if NODE_ENV is invalid', () => {
      process.env.NODE_ENV = 'invalid_env'
      process.env.PORT = '3000'
      process.env.APP_NAME = 'Test App'
      process.env.APP_VERSION = '1.0.0'
      process.env.APP_DESCRIPTION = 'Test Description'

      expect(() => createSharedConfig()).toThrow(
        'Configuration validation failed:',
      )
    })

    it('should reject invalid environments', () => {
      fc.assert(
        fc.property(
          fc
            .string({ minLength: 1 })
            .filter(
              (s) => s !== 'test' && s !== 'development' && s !== 'production',
            ),
          (invalidEnv) => {
            expect(() => environmentSchema.parse(invalidEnv)).toThrow()
          },
        ),
      )
    })
  })

  describe('sharedConfigSchema', () => {
    it('should validate valid config with random data', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('test', 'development', 'production'),
          fc.integer({ min: 1000, max: 65535 }),
          fc.constant(faker.word.words({ count: { min: 1, max: 3 } })),
          fc.constant(faker.system.semver()),
          fc.constant(faker.lorem.sentence()),
          fc.constant(faker.internet.username()),
          fc.constant(faker.internet.domainName()),
          fc.integer({ min: 1000, max: 65535 }),
          fc.constant(faker.internet.password()),
          fc.constant(faker.database.mongodbObjectId()),
          fc.constant(faker.internet.domainName()),
          fc.integer({ min: 1000, max: 65535 }),
          fc.option(fc.constant(faker.internet.password()), { nil: undefined }),
          fc.constant(faker.internet.password()),
          (
            env,
            port,
            appName,
            appVersion,
            appDescription,
            dbUsername,
            dbHost,
            dbPort,
            dbPassword,
            dbName,
            redisHost,
            redisPort,
            redisPassword,
            githubToken,
          ) => {
            const validConfig = {
              env,
              port,
              app: {
                name: appName,
                version: appVersion,
                description: appDescription,
              },
              database: {
                username: dbUsername,
                host: dbHost,
                port: dbPort,
                password: dbPassword,
                name: dbName,
              },
              redis: {
                host: redisHost,
                port: redisPort,
                password: redisPassword,
              },
              githubToken,
            }
            expect(() => sharedConfigSchema.parse(validConfig)).not.toThrow()
          },
        ),
      )
    })

    it('should coerce port string to number', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('test', 'development', 'production'),
          fc.integer({ min: 1000, max: 65535 }),
          (env, randomPort) => {
            const config = {
              env: env,
              port: randomPort.toString(),
              app: {
                name: faker.word.words({ count: { min: 1, max: 3 } }),
                version: faker.system.semver(),
                description: faker.lorem.sentence(),
              },
              database: {
                username: faker.internet.username(),
                host: faker.internet.domainName(),
                port: faker.internet.port(),
                password: faker.internet.password(),
                name: faker.database.mongodbObjectId(),
              },
              redis: {
                host: faker.internet.domainName(),
                port: faker.internet.port(),
                password: faker.internet.password(),
              },
              githubToken: faker.internet.password(),
            }

            const result = sharedConfigSchema.parse(config)
            expect(result.port).toBe(randomPort)
          },
        ),
      )
    })
  })

  describe('createSharedConfig', () => {
    it('should create valid config from environment variables', () => {
      const property = fc.property(
        fc.constantFrom('test', 'development', 'production'),
        fc.integer({ min: 1000, max: 65535 }),
        fc.constant(faker.word.words({ count: { min: 1, max: 3 } })),
        fc.constant(faker.system.semver()),
        fc.constant(faker.lorem.sentence()),
        fc.constant(faker.internet.username()),
        fc.constant(faker.internet.domainName()),
        fc.integer({ min: 1000, max: 65535 }),
        fc.constant(faker.internet.password()),
        fc.constant(faker.database.mongodbObjectId()),
        fc.constant(faker.internet.domainName()),
        fc.integer({ min: 1000, max: 65535 }),
        fc.option(fc.constant(faker.internet.password()), { nil: undefined }),
        fc.constant(faker.internet.password()),
        (
          nodeEnv,
          port,
          appName,
          appVersion,
          appDescription,
          dbUsername,
          dbHost,
          dbPort,
          dbPassword,
          dbName,
          redisHost,
          redisPort,
          redisPassword,
          githubToken,
        ) => {
          process.env.NODE_ENV = nodeEnv
          process.env.PORT = port.toString()
          process.env.APP_NAME = appName
          process.env.APP_VERSION = appVersion
          process.env.APP_DESCRIPTION = appDescription
          process.env.DATABASE_USERNAME = dbUsername
          process.env.DATABASE_HOST = dbHost
          process.env.DATABASE_PORT = dbPort.toString()
          process.env.DATABASE_PASSWORD = dbPassword
          process.env.DATABASE_NAME = dbName
          process.env.REDIS_HOST = redisHost
          process.env.REDIS_PORT = redisPort.toString()
          process.env.REDIS_PASSWORD = redisPassword || undefined
          process.env.GITHUB_TOKEN = githubToken

          const config = createSharedConfig()

          expect(config.env).toBe(nodeEnv)
          expect(config.port).toBe(port)
          expect(config.app.name).toBe(appName)
          expect(config.app.version).toBe(appVersion)
          expect(config.app.description).toBe(appDescription)
          expect(config.database.username).toBe(dbUsername)
          expect(config.database.host).toBe(dbHost)
          expect(config.database.port).toBe(dbPort)
          expect(config.database.password).toBe(dbPassword)
          expect(config.database.name).toBe(dbName)
          expect(config.redis.host).toBe(redisHost)
          expect(config.redis.port).toBe(redisPort)
          expect(config.redis.password).toBe(redisPassword)
          expect(config.githubToken).toBe(githubToken)
        },
      )

      fc.assert(property)
    })
  })
})
