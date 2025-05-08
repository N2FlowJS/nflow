import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  testMatch: ["**/__tests__/**/*.test.ts", "**/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/"],

}

export default createJestConfig(config)