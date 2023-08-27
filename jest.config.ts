const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig');

export default {
  clearMocks: true,
  coverageDirectory: "coverage",
  moduleDirectories: [
    "node_modules",
    "src"
  ],
  moduleFileExtensions: [
    "js",
    "json",
    "jsx",
    "ts",
    "tsx",
    "node"
  ],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths , { prefix: '<rootDir>/src' } ),
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[tj]s?(x)"
  ],
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  "transform": {
    "^.+\\.(ts|tsx)$": "ts-jest"
  },
};
