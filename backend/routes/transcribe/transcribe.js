const fs = require('fs');

const express = require('express');
const router = express.Router();

const { Leopard } = require('@picovoice/leopard-node');
const handle = new Leopard(process.env.PICOVOICE_API_KEY);

const auth = require('../../middleware/auth/auth');
const { upload, handleMulterErrors } = require('../../middleware/upload/upload');



router.post('/', auth, upload.single('videoFile'), async (req, res) => {
    try {
        // const subtitlesData = handle.processFile(req.tmpFilePath);
        const subtitlesData = require('../../../frontend/src/config/subtitlesData.example.json'); // un-comment this to use example data, for development
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



module.exports = router;
