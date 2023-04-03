const fs = require('node:fs');
const path = require('node:path');

const chalk = require('chalk');

const config = require('../app.config.js');
const swcDirectory = path.join(__dirname, '..', '.swc');

if (fs.existsSync(swcDirectory)) {
    fs.rmSync(swcDirectory, {
        recursive: true,
    });
}

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

console.log(chalk.magenta('Workspace cleared successfully!'));
console.log();
