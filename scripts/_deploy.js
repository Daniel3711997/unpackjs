if (process.env.TEST) {
    console.log('Successfully built the application') || process.exit(0);
}

const { NodeSSH } = require('node-ssh');

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

        console.log('Removing the old temporary plugin folder');

        // Delete the old temporary directory if exists
        await ssh.execCommand(`rm -rf ${pluginPath}_temporary`, {
            cwd: process.env.REMOTE_PATH,
        });

        console.log('Creating a new temporary plugin folder and copying the plugin files');

        // Upload the build folder to the server
        await ssh.putDirectory(process.cwd(), `${pluginPath}_temporary`, {
            concurrency: 4,
            recursive: true,
        });

        console.log('Removing the old plugin folder before renaming the temporary folder to the plugin folder');

        // Delete the old build folder
        await ssh.execCommand(`rm -rf ${pluginPath}`, {
            cwd: process.env.REMOTE_PATH,
        });

        console.log('Renaming the temporary folder to the plugin folder after removing the old plugin folder');

        // Rename the temporary build folder to the correct name
        await ssh.execCommand(`mv ${pluginPath}_temporary ${pluginPath}`, {
            cwd: process.env.REMOTE_PATH,
        });
    })
    .catch(error => {
        throw new Error(`An error occurred while deploying the plugin: ${error.message}`); // Throw the error to the app console
    });
