const config = require('./app.config');

const swcOptions = config.swcRCConfig(false, 'typescript').options;

module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    moduleDirectories: ['node_modules', 'src'],
    transform: {
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
