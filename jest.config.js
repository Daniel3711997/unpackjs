'use strict';

const path = require('node:path');

const config = require('./app.config');
const tsconfig = require('./tsconfig.json');

const swcOptions = config.swcRCConfig(false, 'typescript').options;

/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    moduleDirectories: ['node_modules', 'src'],
    cacheDirectory: path.join(config.cacheDirectory, 'tools', 'jest'),
    transform: config.useSWC
        ? {
              '^.+\\.(t|j)sx?$': [
                  '@swc/jest',
                  {
                      ...swcOptions,
                      jsc: {
                          ...swcOptions.jsc,
                          experimental: undefined,
                      },
                  },
              ],
          }
        : {
              '^.+\\.(t|j)sx?$': [
                  'ts-jest',
                  {
                      // https://kulshekhar.github.io/ts-jest/docs/getting-started/options/isolatedModules
                      isolatedModules: false,
                      tsconfig: {
                          ...tsconfig.compilerOptions,
                          jsx: 'react-jsx',
                      },
                  },
              ],
          },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^.+\\.module\\.(css|scss)$': 'identity-obj-proxy',
        '^.+\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js',
        '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i': `<rootDir>/__mocks__/fileMock.js`,
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    transformIgnorePatterns: ['^.+\\.module\\.(css|scss)$', '/node_modules/'],
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/build_temporary/', '<rootDir>/build/', '<rootDir>/app/'],
};
