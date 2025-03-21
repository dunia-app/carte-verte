const { createDefaultPreset } = require('ts-jest')

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  setupFilesAfterEnv: ['<rootDir>/dist/src/tests/setup.js'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.[jt]s?(x)'],
  transform: {
    ...createDefaultPreset().transform,
  },
  testPathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/dist',
    '<rootDir>/node_modules',
    '<rootDir>/fresh_build',

    // TODO : Empty this list of folders with test files failing
    '<rootDir>/src/libs/ddd/domain/base-classes/__tests__',
    '<rootDir>/src/modules/card/commands/block-lost-card/__tests__',
    '<rootDir>/src/modules/card/commands/block-stolen-card/__tests__',
    '<rootDir>/src/modules/message/application/event-handlers/__tests__',
    '<rootDir>/src/modules/message/application/transport-handlers/__tests__',
    '<rootDir>/src/modules/message/domain/entities/__tests__',
    '<rootDir>/src/modules/organization/commands/accept-cgu/__tests__',
    '<rootDir>/src/modules/organization/commands/create-employee/__tests__',
    '<rootDir>/src/modules/organization/commands/freeze-employee/__tests__',
    '<rootDir>/src/modules/organization/commands/remove-organization-admin/__tests__',
    '<rootDir>/src/modules/organization/commands/unfreeze-employee/__tests__',
    '<rootDir>/src/modules/organization/commands/update-organization-admin-password/__tests__',
    '<rootDir>/src/modules/transaction/application/webhook-handlers/__tests__',
    '<rootDir>/src/modules/transaction/commands/create-meal-ticket-command/__tests__',
    '<rootDir>/src/modules/transaction/commands/generate-meal-ticket-command-pdf/__tests__',
    '<rootDir>/src/modules/transaction/commands/pay-meal-ticket-command/__tests__',
    '<rootDir>/src/modules/transaction/commands/validate-meal-ticket-command/__tests__',
    '<rootDir>/src/modules/transaction/commands/create-meal-ticket-command-by-file/__tests__',
    '<rootDir>/src/modules/merchant/commands/match-merchant-organization/__tests__',
    '<rootDir>/src/libs/ddd/infrastructure/message-emitter/__tests__',
    '<rootDir>/src/infrastructure/cloud-storage/__tests__',
  ],
}
