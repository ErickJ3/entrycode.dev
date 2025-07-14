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
          fc.constant(faker.string.uuid()),
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
            triggerSecret,
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
              triggerSecret,
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
              triggerSecret: faker.string.uuid(),
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
        fc.constant(faker.string.uuid()),
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
          triggerSecret,
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
          process.env.TRIGGER_SECRET = triggerSecret

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
          expect(config.triggerSecret).toBe(triggerSecret)
        },
      )

      fc.assert(property)
    })

    it('should create valid config with mock variables', () => {
      const mockEnvVars = {
        NODE_ENV: 'development',
        PORT: '3333',
        APP_NAME: 'Entrycode',
        APP_VERSION: '0.0.1',
        APP_DESCRIPTION:
          'Entrycode platform API, here you will find all the endpoints needed to interact with the platform',
        DATABASE_USERNAME: 'entry',
        DATABASE_PASSWORD: 'code',
        DATABASE_PORT: '5454',
        DATABASE_NAME: 'entrycode.dev',
        DATABASE_HOST: '0.0.0.0',
        REDIS_HOST: '0.0.0.0',
        REDIS_PORT: '6060',
        REDIS_PASSWORD: 'redis-password',
        GITHUB_TOKEN: 'ghp_token',
        TRIGGER_SECRET: '7fd4cae3-9c88-4894-9121-115640a2d072',
      }

      Object.entries(mockEnvVars).forEach(([key, value]) => {
        process.env[key] = value
      })

      const config = createSharedConfig()

      expect(config.env).toBe('development')
      expect(config.port).toBe(3333)
      expect(config.app.name).toBe('Entrycode')
      expect(config.app.version).toBe('0.0.1')
      expect(config.app.description).toBe(
        'Entrycode platform API, here you will find all the endpoints needed to interact with the platform',
      )
      expect(config.database.username).toBe('entry')
      expect(config.database.password).toBe('code')
      expect(config.database.port).toBe(5454)
      expect(config.database.name).toBe('entrycode.dev')
      expect(config.database.host).toBe('0.0.0.0')
      expect(config.redis.host).toBe('0.0.0.0')
      expect(config.redis.port).toBe(6060)
      expect(config.redis.password).toBe('redis-password')
      expect(config.githubToken).toBe('ghp_token')
      expect(config.triggerSecret).toBe('7fd4cae3-9c88-4894-9121-115640a2d072')
    })

    it('should handle missing optional redis password', () => {
      const mockEnvVars = {
        NODE_ENV: 'development',
        PORT: '3333',
        APP_NAME: 'Entrycode',
        APP_VERSION: '0.0.1',
        APP_DESCRIPTION: 'Entrycode platform API',
        DATABASE_USERNAME: 'entry',
        DATABASE_PASSWORD: 'code',
        DATABASE_PORT: '5454',
        DATABASE_NAME: 'entrycode.dev',
        DATABASE_HOST: '0.0.0.0',
        REDIS_HOST: '0.0.0.0',
        REDIS_PORT: '6060',
        GITHUB_TOKEN: 'ghp_token',
        TRIGGER_SECRET: '7fd4cae3-9c88-4894-9121-115640a2d072',
      }

      Object.entries(mockEnvVars).forEach(([key, value]) => {
        process.env[key] = value
      })

      delete process.env.REDIS_PASSWORD

      const config = createSharedConfig()

      expect(config.redis.password).toBeUndefined()
    })

    it('should throw error when required environment variables are missing', () => {
      process.env = {}

      expect(() => createSharedConfig()).toThrow(
        'Configuration validation failed:',
      )
    })
  })
})
