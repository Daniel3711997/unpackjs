const fs = require('node:fs');

const chalk = require('chalk');

const config = require('../app.config.js');

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
