const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const config = require('../app.config');

const temporaryDirectory = config.outputPath + '_temporary';

if (fs.existsSync(temporaryDirectory)) {
    if (fs.existsSync(config.outputPath)) {
        fs.rmSync(config.outputPath, {
            recursive: true,
        });
    }

    fs.renameSync(temporaryDirectory, config.outputPath);
}

fs.writeFileSync(
    path.join(config.outputPath, '.htaccess'),
    `<IfModule mod_authz_host.c>
    Require all granted
</IfModule>

<IfModule !mod_authz_host.c>
    Order Allow,Deny
    Allow from all
</IfModule>
`
);

console.log();
console.log(chalk.magenta('Project built successfully!'));
