/** @type {import('jest').Config} */
module.exports = {
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/tests"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.json",
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/client/src/$1",
    "^@shared/(.*)$": "<rootDir>/shared/$1",
    "^@assets/(.*)$": "<rootDir>/attached_assets/$1",
    "\\.css$": "identity-obj-proxy",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  testMatch: [
    "**/tests/**/*.test.+(ts|tsx|js)",
    "**/__tests__/**/*.+(ts|tsx|js)",
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/tests/e2e/",
    "**/*.spec.ts",
    "**/playwright*",
    "**/test-results/",
    "**/coverage/"
  ],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "server/**/*.{js,ts}",
    "client/src/**/*.{js,ts,tsx}",
    "!**/node_modules/**",
    "!**/vendor/**",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  verbose: true,
  moduleDirectories: ["node_modules", "<rootDir>"],
  watchPathIgnorePatterns: ["node_modules"],
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};
