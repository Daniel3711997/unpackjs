const fs = require('fs');
const path = require('path');
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

fs.writeFileSync(path.join(config.outputPath, '.htaccess'), 'Require all granted');
