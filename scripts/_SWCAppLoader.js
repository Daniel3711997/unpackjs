const fs = require('node:fs');
const path = require('node:path');

const config = require('../config/app.config.js');
const pack = require('../package.json');
const tsconfig = require('../tsconfig.json');

const shouldEnableSWC = 'true' === process.env.SWC;

config.useSWC = shouldEnableSWC;
pack.scripts.build = shouldEnableSWC ? 'tsc && encore production' : 'encore production';
tsconfig.compilerOptions = {
    ...tsconfig.compilerOptions,
    downlevelIteration: !shouldEnableSWC,
    target: shouldEnableSWC ? 'ESNext' : 'ES5',
    ...(shouldEnableSWC ? { tsBuildInfoFile: path.join(config.cacheDirectory, 'typescript', '.tsbuildinfo') } : {}),
};

fs.writeFileSync(path.join(__dirname, '..', 'package.json'), JSON.stringify(pack, null, 4));
fs.writeFileSync(path.join(__dirname, '..', 'app.config.js'), JSON.stringify(config, null, 4));
fs.writeFileSync(path.join(__dirname, '..', 'tsconfig.json'), JSON.stringify(tsconfig, null, 4));
