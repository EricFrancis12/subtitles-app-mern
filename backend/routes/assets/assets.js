import fs, { existsSync } from 'fs';
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import express from 'express';
export const router = express.Router();



router.get('/:folderName/:fileName', (req, res) => {
    const filePath = path.resolve(__dirname, `../../../frontend/src/assets/${req.params.folderName}/${req.params.fileName}`);

    console.log(filePath);
    console.log(existsSync(filePath));

    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ success: false, message: 'File not found' });
    }
});
