import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  testMatch: ["**/__tests__/**/*.test.ts", "**/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/"],

}

export default createJestConfig(config)