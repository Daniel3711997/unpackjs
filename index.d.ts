// noinspection JSUnusedGlobalSymbols

import type { Runtime, Server } from './src/runtime';

declare global {
    interface Window {
        appServer: Server;
        appRuntime: Runtime;
    }
    namespace NodeJS {
        interface ProcessEnv {
            readonly NODE_ENV: 'development' | 'production';
        }
    }
}
