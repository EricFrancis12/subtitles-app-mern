const crypto = require('crypto');
const fs = require('fs');
const path = require('path');



(function () {
    const parentFolderName = path.dirname(__dirname).split('\\').pop();

    const defaultEnvVariables = [
        `APP_NAME=${parentFolderName}`,
        `PROTOCOL__=http://`,
        `DOMAIN= #leave blank for running locally`,
        `PORT= #leave blank for running locally`,
        `BACKEND_PORT=3001`,
        `FRONTEND_PORT=3000`,
        ``,
        `MONGODB_URI= #leave blank for running locally`,
        `MONGODB_URI_LOCAL=mongodb://127.0.0.1/${parentFolderName}`,
        `COOKIE_SECRET=${crypto.randomUUID()}`,
        `BREVO_API_KEY=REPLACE`
    ];

    const dirsToMake = [
        '../tmp'
    ];

    const txtFilesToWrite = [
        { file: '../.env', data: defaultEnvVariables.join('\n') }
    ];



    dirsToMake.forEach(dir => {
        makeDirectory(dir);
    });

    txtFilesToWrite.forEach(item => {
        writeTxtFile(item.file, item.data);
    });

    function makeDirectory(dir) {
        const dirPath = path.resolve(__dirname, dir);
        if (!fs.existsSync(dirPath)) {
            try {
                fs.mkdirSync(dirPath);
            } catch (err) {
                console.error(`Unable to create directory: ${dirPath}`);
            }
        }
    }

    function writeTxtFile(file, data) {
        const filePath = path.resolve(__dirname, file);
        if (!fs.existsSync(filePath)) {
            try {
                fs.writeFileSync(filePath, data, { encoding: 'utf8' });
            } catch (err) {
                console.error(`Unable to write file: ${filePath}`);
            }
        }
    }
})();
