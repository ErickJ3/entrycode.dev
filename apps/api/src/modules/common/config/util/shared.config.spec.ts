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
      const envGenerator = fc.constantFrom('test', 'development', 'production')
      const portGenerator = fc.integer({ min: 1, max: 65535 })
      const appNameGenerator = fc.string({ minLength: 1, maxLength: 50 })
      const appVersionGenerator = fc.string({ minLength: 1, maxLength: 20 })
      const appDescriptionGenerator = fc.string({
        minLength: 1,
        maxLength: 100,
      })

      fc.assert(
        fc.property(
          envGenerator,
          portGenerator,
          appNameGenerator,
          appVersionGenerator,
          appDescriptionGenerator,
          (env, port, name, version, description) => {
            const validConfig = {
              env: env,
              port: port,
              app: {
                name: name,
                version: version,
                description: description,
              },
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
          fc.integer({ min: 1, max: 65535 }),
          (env, randomPort) => {
            const config = {
              env: env,
              port: randomPort.toString(),
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
        fc.integer({ min: 1, max: 65535 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (nodeEnv, port, appName, appVersion, appDescription) => {
          process.env.NODE_ENV = nodeEnv
          process.env.PORT = port.toString()
          process.env.APP_NAME = appName
          process.env.APP_VERSION = appVersion
          process.env.APP_DESCRIPTION = appDescription

          const config = createSharedConfig()

          expect(config.env).toBe(nodeEnv)
          expect(config.port).toBe(port)
          expect(config.app.name).toBe(appName)
          expect(config.app.version).toBe(appVersion)
          expect(config.app.description).toBe(appDescription)
        },
      )

      fc.assert(property)
    })
  })
})
