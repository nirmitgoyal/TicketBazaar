module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/**/*.test.ts'
  ],
  testTimeout: 5000,
  passWithNoTests: true,
  silent: true
};