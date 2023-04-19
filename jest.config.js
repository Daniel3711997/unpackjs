'use strict';

const path = require('node:path');

const config = require('./app.config');
const tsconfig = require('./tsconfig.json');

const swcOptions = config.swcRCConfig(false, 'typescript').options;

/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jest-environment-jsdom',

    moduleDirectories: ['node_modules', 'src'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

    cacheDirectory: path.join(config.cacheDirectory, 'tools', 'jest'),
    transformIgnorePatterns: ['^.+\\.module\\.(css|scss)$', '/node_modules/'],

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
                      /**
                       * Enable type checking for all files
                       * https://kulshekhar.github.io/ts-jest/docs/getting-started/options/isolatedModules
                       */
                      isolatedModules: false,

                      tsconfig: {
                          ...tsconfig.compilerOptions,
                          jsx: 'react-jsx',
                      },
                  },
              ],
          },

    testPathIgnorePatterns: [
        '<rootDir>/app/',
        '<rootDir>/build/',
        '<rootDir>/node_modules/',
        '<rootDir>/build_temporary/',
    ],

    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^.+\\.module\\.(css|scss)$': 'identity-obj-proxy',
        '^.+\\.(css|scss)$': '<rootDir>/__mocks__/styleMock.js',
        '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i': `<rootDir>/__mocks__/fileMock.js`,
    },
};
