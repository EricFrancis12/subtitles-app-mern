import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';

import express from 'express';
export const router = express.Router();

import { Leopard } from '@picovoice/leopard-node';
const handle = new Leopard(process.env.PICOVOICE_API_KEY);

import auth from '../../middleware/auth/auth.js';
import useBody from '../../middleware/format/useBody.js';
import { upload, handleMulterErrors } from '../../middleware/upload/upload.js';
import subtitlesData from '../../../frontend/src/config/subtitlesData.example.json' assert { type: 'json' };



router.post('/transcribe', auth, upload.single('videoFile'), async (req, res) => {
    try {
        // const subtitlesData = handle.processFile(req.tmpFilePath);
        console.log(subtitlesData);
        res.status(200).json({ success: true, subtitlesData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error transcribing video' });
    }

    if (fs.existsSync(req.tmpFilePath)) {
        console.log(`deleting tmp video: ${req.tmpFilePath}`);
        fs.unlinkSync(req.tmpFilePath);
    }
});
router.use(handleMulterErrors);

// router.post('/encode', auth, (req, res, next) => useBody(req, res, next, ['subtitlesFileData']), upload.single('videoFile'), async (req, res) => {
//     try {
//         // encode video route
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false, message: 'Error encoding video' });
//     }
// });
