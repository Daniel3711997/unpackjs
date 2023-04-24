const fs = require('node:fs');
const path = require('node:path');

const chalk = require('chalk');

const config = require('../app.config.js');
const pack = require('../package.json');
const tsconfig = require('../tsconfig.json');

const shouldEnableSWC = 'true' === process.env.SWC;

// const swcDirectory = path.join(__dirname, '..', '.swc');

pack.scripts.build = shouldEnableSWC ? 'tsc && npm run build-application' : 'npm run build-application';
pack.scripts['build-action'] = shouldEnableSWC ? 'tsc && npm run build-application' : 'npm run build-application';
tsconfig.compilerOptions = {
    ...tsconfig.compilerOptions,
    tsBuildInfoFile: shouldEnableSWC ? 'cache/typescript/.tsbuildinfo' : undefined,
};

// if (fs.existsSync(swcDirectory)) {
//     fs.rmSync(swcDirectory, {
//         recursive: true,
//     });
// }

if (fs.existsSync(config.outputPath)) {
    fs.rmSync(config.outputPath, {
        recursive: true,
    });
}

if (fs.existsSync(config.cacheDirectory)) {
    fs.rmSync(config.cacheDirectory, {
        recursive: true,
    });
}

fs.writeFileSync(path.join(__dirname, '..', 'package.json'), JSON.stringify(pack, null, 4));
fs.writeFileSync(path.join(__dirname, '..', 'tsconfig.json'), JSON.stringify(tsconfig, null, 4));

console.log(chalk.magenta(`SWC ${shouldEnableSWC ? 'enabled' : 'disabled'} successfully!`));
console.log();

console.log(`Run ${chalk.yellow('npm start')} to start the development server`);
console.log(`Run ${chalk.yellow('npm run build')} to build the project for production`);
console.log();

console.log(
    `In ${chalk.yellow('app.config.js')} change the ${chalk.yellow('useSWC')} directive to ${chalk.yellow(
        shouldEnableSWC.toString()
    )}`
);
console.log();
