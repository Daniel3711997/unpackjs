const path = require('node:path');

const { NodeSSH } = require('node-ssh');

if (process.env.TEST) {
    console.log('Successfully built the application') || process.exit(0);
}

const ssh = new NodeSSH();

const requiredEnvironmentVariables = ['HOST', 'USER', 'REMOTE_PATH', 'PLUGIN_NAME', 'PRIVATE_KEY_PATH'];

if (requiredEnvironmentVariables.some(variable => !process.env[variable])) {
    throw new Error('Missing required environment variables');
}

ssh.connect({
    host: process.env.HOST,
    username: process.env.USER,
    privateKeyPath: process.env.PRIVATE_KEY_PATH,
})
    .then(async () => {
        const pluginPath = `${process.env.REMOTE_PATH}/${process.env.PLUGIN_NAME}`;

        console.log('Creating a temporary plugin folder and copying the plugin files');

        await ssh.putDirectory(process.cwd(), `${pluginPath}_temporary`, {
            concurrency: 4,
            recursive: true,
            validate: function (itemPath) {
                return 'node_modules' !== path.basename(itemPath);
            },
        });

        console.log('Renaming the obsolete plugin folder before renaming the temporary folder to the plugin folder');

        await ssh.execCommand(`mv ${pluginPath} ${pluginPath}_obsolete`, {
            cwd: process.env.REMOTE_PATH,
        });

        console.log('Renaming the temporary folder to the plugin folder after renaming the obsolete plugin folder');

        await ssh.execCommand(`mv ${pluginPath}_temporary ${pluginPath}`, {
            cwd: process.env.REMOTE_PATH,
        });

        console.log('Removing the obsolete plugin folder before renaming the temporary folder to the plugin folder');

        await ssh.execCommand(`rm -rf ${pluginPath}_obsolete`, {
            cwd: process.env.REMOTE_PATH,
        });

        console.log('Executing the database migrations');

        await ssh.execCommand(`wp unpack migrate`, {
            cwd: `${process.env.REMOTE_PATH}/../../`,
        });

        console.log('Executing the database seeds');

        await ssh.execCommand(`wp unpack seed`, {
            cwd: `${process.env.REMOTE_PATH}/../../`,
        });

        console.log('Successfully deployed the plugin to the server and executed the database migrations & seeds');
    })
    .catch(error => {
        throw new Error(`An error occurred while deploying the plugin: ${error.message}`); // Throw the error to the app console
    });
